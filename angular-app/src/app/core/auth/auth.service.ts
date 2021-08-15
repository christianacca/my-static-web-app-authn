import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {UserInfo} from './user-info';
import {first, map, shareReplay, startWith, tap} from "rxjs/operators";
import {AuthConfig} from './auth-config';
import {AuthEvent} from './auth-event';
import {StorageService} from './storage.service';

interface AuthResponseData {
  clientPrincipal?: UserInfo;
}

/** 
 * Options that control the sign-in behaviour
 */
export interface SignInOptions {
  /** 
   * The identity provider to sign-in with (defaults to `AuthConfig.defaultIdentityProviderKey`)
   */
  identityProvider?: string;
  /** 
   * The client-side url to redirect to after the user has been authenticated 
   */
  redirectUrl?: string;
  /** 
   * Is this a sign-up request or no? (defaults to `false`) 
   */
  isSignUp?: boolean;
}

const storageKeyPrefix = 'angular_swa_auth';
const signingUpFlagKey = `${storageKeyPrefix}_signing_up`;

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
  
  protected events = new Subject<AuthEvent>();
  events$ = this.events.asObservable();
  
  constructor(private httpClient: HttpClient, private config: AuthConfig, private storage: StorageService) {
    
    this.userLoaded$ = this.httpClient.get<AuthResponseData>('/.auth/me').pipe(
      map(resp => resp.clientPrincipal ?? undefined),
      tap(user => {
        if (user) {
          this.publishAuthenticatedSuccessEvents(user);
        }
      }),
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

    await this.login({ redirectUrl: targetUrl });
    return false;
  }

  /**
   * Trigger the login flow, redirecting the browser to the identity provider
   * @param options The options that control the sign-in behaviour
   */
  async login(options: SignInOptions = {}) {
    const idp = options.identityProvider ?? await this.currentIdentityProvider$.pipe(first()).toPromise();
    const redirectUrl = options.redirectUrl ? window.location.origin + options.redirectUrl : undefined;
    const loginUrl = `${window.location.origin}/.auth/login/${idp}`;
    window.location.href = redirectUrl ? `${loginUrl}?post_login_redirect_uri=${redirectUrl}` : loginUrl;

    if (options.isSignUp) {
      this.setSigningUpFlag();
    }
  }

  /**
   * Trigger the logout flow. This is a no-op when the user is not already authenticated
   * @param redirectUrl The url to redirect to after the user has been logged out
   * @returns {boolean} false when the user is not already authenticated, true otherwise
   */
  async logout(redirectUrl?: string): Promise<boolean> {
    const user = await this.userLoaded$.toPromise();
    if (!user) { return false; }

    const logoutUrl = `${window.location.origin}/.auth/logout`;
    window.location.href = redirectUrl ? `${logoutUrl}?post_logout_redirect_uri=${redirectUrl}` : logoutUrl;

    this.events.next(AuthEvent.signOut(user));
    
    return true;
  }
  
  protected setSigningUpFlag() {
    this.storage.setItem(signingUpFlagKey, '1');
  }

  protected popSigningUpFlag() {
    return !!this.storage.popItem(signingUpFlagKey)
  }

  private publishAuthenticatedSuccessEvents(user: UserInfo) {
    this.events.next(AuthEvent.signIn(user));
    if (this.popSigningUpFlag()) {
      this.events.next(AuthEvent.signUp(user));
    }
  }
}
