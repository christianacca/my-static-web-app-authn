import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of, Subject} from "rxjs";
import {UserInfo} from './user-info';
import {first, map, mergeMap, shareReplay, tap} from "rxjs/operators";
import {AuthConfig} from './auth-config';
import {AuthEvent} from './auth-event';
import {StorageService} from './storage.service';
import {IdentityProviderSelectorService} from './identity-provider-selector.service';

interface AuthResponseData {
  clientPrincipal?: UserInfo;
}

/** 
 * Options that control the login behaviour
 */
export interface LoginOptions {
  /** 
   * The identity provider to login with.
   * Defaults to the first entry in `AuthConfig.identityProviders`. This can be customized by
   * registering your own `IdentityProviderSelectorService`
   * @example
   * ```ts
   * // app.module...
   * imports: [
   *   AuthModule.forRoot({ 
   *     identityProviderSelectorType: YourIdentityProviderSelectorService
   *   })
   * ]
   * ```
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
   * The identity providers available to login with. 
   * Note: This is just a convenient alias of `AuthConfig.identityProviders`
   */
  readonly identityProviders = this.config.identityProviders;
  
  protected sessionEvents = new Subject<AuthEvent>();
  /**
   * Authentication session events as they occur
   */
  sessionEvents$ = this.sessionEvents.asObservable();
  
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
  
  constructor(
    private httpClient: HttpClient, 
    private config: AuthConfig, 
    private storage: StorageService, 
    private idpSelectorService: IdentityProviderSelectorService) {
    
    this.userLoaded$ = this.httpClient.get<AuthResponseData>('/.auth/me').pipe(
      map(resp => resp.clientPrincipal ?? undefined),
      tap(user => {
        if (user) {
          this.publishAuthenticatedSuccessEvents(user);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.isAuthenticated$ = this.userLoaded$.pipe(
      map(user => !!user),
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
   * Trigger the login flow, redirecting the browser to the identity provider.
   * @param options The options that control the login behaviour
   * @returns {boolean} false when the identity provider to login with is not selected, true otherwise
   */
  async login(options: LoginOptions = {}) : Promise<boolean> {
    const idp = options.identityProvider ?? await this.selectIdentityProvider().toPromise();
    
    if (!idp) {
      return false;
    }
    
    const redirectUrl = options.redirectUrl ? window.location.origin + options.redirectUrl : undefined;
    const idpUrl = `${window.location.origin}/.auth/login/${idp}`;
    this.redirectToIdentityProvider(redirectUrl ? `${idpUrl}?post_login_redirect_uri=${redirectUrl}` : idpUrl);

    if (options.isSignUp) {
      this.setSigningUpFlag();
    }
    
    return true;
  }

  /**
   * Trigger the logout flow. This is a no-op when the user is not already authenticated
   * @param redirectUrl The url to redirect to after the user has been logged out
   * @returns {boolean} false when the user is not already authenticated, true otherwise
   */
  async logout(redirectUrl?: string): Promise<boolean> {
    const user = await this.userLoaded$.toPromise();
    if (!user) { return false; }

    const idpUrl = `${window.location.origin}/.auth/logout`;
    this.redirectToIdentityProvider(redirectUrl ? `${idpUrl}?post_logout_redirect_uri=${redirectUrl}` : idpUrl);

    this.sessionEvents.next(AuthEvent.logout(user));
    
    return true;
  }

  protected redirectToIdentityProvider(url: string) {
    window.location.href = url;
  }

  protected setSigningUpFlag() {
    this.storage.setItem(signingUpFlagKey, '1');
  }

  protected popSigningUpFlag() {
    return !!this.storage.popItem(signingUpFlagKey)
  }

  private publishAuthenticatedSuccessEvents(user: UserInfo) {
    this.sessionEvents.next(AuthEvent.login(user));
    if (this.popSigningUpFlag()) {
      this.sessionEvents.next(AuthEvent.signUp(user));
    }
  }
  
  private selectIdentityProvider(): Observable<string | undefined> {
    const currentIdp$ = this.userLoaded$.pipe(map(user => user?.identityProvider));
    return currentIdp$.pipe(
      mergeMap(idp => idp ? of(idp) : this.idpSelectorService.selectIdentityProvider())
    );
  }
}
