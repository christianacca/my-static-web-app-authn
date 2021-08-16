import {forwardRef, Injectable} from '@angular/core';
import {AuthConfig} from './auth-config';
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
  useClass: forwardRef(() => FirstIdentityProviderSelectorService)
})
export abstract class IdentityProviderSelectorService {
  abstract selectIdentityProvider(): Observable<string | undefined>;
}

@Injectable()
export class FirstIdentityProviderSelectorService implements IdentityProviderSelectorService {

  constructor(private config: AuthConfig) { }
  
  selectIdentityProvider(): Observable<string | undefined> {
    return of(this.config.identityProviders[0]?.key);
  }
}
