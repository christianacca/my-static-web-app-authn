import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {EMPTY, Observable} from "rxjs";
import { UserInfo } from '../model';
import {first, map, mergeMapTo, shareReplay, tap} from "rxjs/operators";

interface AuthResponseData {
  clientPrincipal?: UserInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser$: Observable<UserInfo>;
  currentIdentityProvider$: Observable<string>;
  defaultIdentityProvider = 'github';
  
  constructor(private httpClient: HttpClient) {
    this.currentUser$ = this.httpClient.get<AuthResponseData>('/.auth/me').pipe(
        map(resp => resp.clientPrincipal),
        shareReplay({ bufferSize: 1, refCount: false })
    );
    this.currentIdentityProvider$ = this.currentUser$.pipe(
        map(user => user?.identityProvider ?? this.defaultIdentityProvider),
        shareReplay({ bufferSize: 1, refCount: false })
    );
  }
  
  async login(redirectUrl?: string) {
    const idp = await this.currentIdentityProvider$.pipe(first()).toPromise();
    await this.loginTo(idp, redirectUrl);
  }

  async loginTo(identityProvider: string, redirectUrl?: string) {
    const loginBaseUrl = window.location.origin + `/.auth/login/${identityProvider}`;
    const loginUrl = redirectUrl ? `${loginBaseUrl}?post_login_redirect_uri=${redirectUrl}` : loginBaseUrl;
    window.location.href = loginUrl;
  }
}
