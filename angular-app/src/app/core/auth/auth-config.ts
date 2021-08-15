import {builtInIdentityProviders, IdentityProvider} from './identity-provider';
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthConfig {
    availableIdentityProviders = Object.values(builtInIdentityProviders);
    defaultIdentityProviderKey = builtInIdentityProviders.github.key;
    sendEventsToApi = false;
    eventsApiUrl = '/api/authevents';
    
    with(values: Partial<AuthConfig>) {
        return {
            ...this,
            ...values,
            availableIdentityProviders: values.availableIdentityProviders ?? this.availableIdentityProviders,
            defaultIdentityProviderKey: values.defaultIdentityProviderKey ?? this.defaultIdentityProviderKey
        };
    }
    
    static defaults = new AuthConfig();
}