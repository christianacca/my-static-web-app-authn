import { Injectable } from '@angular/core';
import {AuthConfig, IdentityProviderSelectorService } from './core';
import {Observable, of} from "rxjs";

@Injectable()
export class IdentityProviderPromptService implements IdentityProviderSelectorService {

  constructor(private config: AuthConfig) { }

  selectIdentityProvider(): Observable<string | undefined> {
    const idp = this.config.identityProviders[0];
    const ok = idp && confirm(`Sign-in with ${idp.name}`);
    return of(ok ? idp.key : undefined);
  }
}
