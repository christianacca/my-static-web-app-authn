import {builtInIdentityProviders, IdentityProvider} from './identity-provider';
import {Injectable, Type} from "@angular/core";
import {IdentityProviderSelectorService} from "./identity-provider-selector.service";

@Injectable({
    providedIn: 'root'
})
export class AuthConfig {
    /** 
     * The identity providers available to sign-in with. Defaults to the list of managed idp
     * @see {builtInIdentityProviders}
     */
    identityProviders = Object.values(builtInIdentityProviders);
    /** 
     * The service that will select the identity provider to sign-in with. Defaults to
     * a service that will select the first entry from `identityProviders`
     */
    identityProviderSelectorType?: Type<IdentityProviderSelectorService>;
    /**
     * Api endpoint to send authentication session events 
     */
    sessionEventsApiUrl = '/api/authevents';
    /** 
     * Send authentication session events to api? Defaults to `false` 
     */
    sendSessionEventsToApi = false;
    
    with(values: Partial<AuthConfig>) {
        return {
            ...this,
            ...values,
            availableIdentityProviders: values.identityProviders ?? this.identityProviders
        };
    }
    
    static defaults = new AuthConfig();
}