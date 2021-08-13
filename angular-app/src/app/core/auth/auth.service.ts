import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserInfo} from './user-info';
import {first, map, shareReplay, startWith} from "rxjs/operators";
import {AuthConfig} from './auth-config';

interface AuthResponseData {
  clientPrincipal?: UserInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * The identity providers to list as available to sign-in with 
   */
  availableIdentityProviders = this.config.availableIdentityProviders;
  /**
   * Return the current identity provider (idp) - the idp that was used to successfully authenticate with or
   * the default idp before authentication
   */
  currentIdentityProvider$: Observable<string>;
  /**
   * The identity provider to sign-in with by default
   */
  defaultIdentityProviderKey = this.config.defaultIdentityProviderKey;
  /**
   * Return whether the user is authenticated.
   *
   * This status will NOT be re-evaluated if the `userLoaded$`'s
   * authenticated session expires
   *
   */
  isAuthenticated$: Observable<boolean>;
  /**
   * An event that will emit user details is fetched from the api. The value emitted will
   * be undefined when the user is not authenticated
   *
   * Late subscribers will receive the last value emitted.
   *
   */
  userLoaded$: Observable<UserInfo | undefined>;
  
  constructor(private httpClient: HttpClient, private config: AuthConfig) {
    this.userLoaded$ = this.httpClient.get<AuthResponseData>('/.auth/me').pipe(
        map(resp => resp.clientPrincipal ?? undefined),
        shareReplay({ bufferSize: 1, refCount: false })
    );
    this.currentIdentityProvider$ = this.userLoaded$.pipe(
        map(user => user?.identityProvider ?? this.defaultIdentityProviderKey),
        startWith(this.defaultIdentityProviderKey),
        shareReplay({ bufferSize: 1, refCount: false })
    );
    this.isAuthenticated$ = this.userLoaded$.pipe(
        map(user => !!user),
        startWith(false),
        shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  /**
   * Ensure that login has already occurred and therefore the user object is loaded.
   * Where login has not already occurred, then initiate the login flow.
   *
   * IMPORTANT: when login has not already occurred, the browser will be redirected to the IDP
   *
   * @param targetUrl The client-side url to redirect to after the user has been authenticated
   * @returns `true` when login has already occurred, `false` otherwise
   * @see `login`
   */
  async ensureLoggedIn(targetUrl?: string): Promise<boolean> {
    const user = await this.userLoaded$.pipe(first()).toPromise();
    if (user) {
      return true;
    }

    await this.login(targetUrl);
    return false;
  }

  /**
   * Trigger the login flow, redirecting the browser to the current identity provider
   * @param redirectUrl The client-side url to redirect to after the user has been authenticated
   * @see `currentIdentityProvider$`
   */
  async login(redirectUrl?: string) {
    const idp = await this.currentIdentityProvider$.pipe(first()).toPromise();
    await this.loginTo(idp, redirectUrl);
  }

  /**
   * Trigger the login flow, redirecting the browser to the identity provider
   * @param identityProvider The identity provider to sign-in with
   * @param redirectUrl The client-side url to redirect to after the user has been authenticated 
   */
  async loginTo(identityProvider: string, redirectUrl?: string) {
    const loginBaseUrl = `${window.location.origin}/.auth/login/${identityProvider}`;
    redirectUrl = redirectUrl ? window.location.origin + redirectUrl : undefined;
    const loginUrl = redirectUrl ? `${loginBaseUrl}?post_login_redirect_uri=${redirectUrl}` : loginBaseUrl;
    window.location.href = loginUrl;
  }
}
