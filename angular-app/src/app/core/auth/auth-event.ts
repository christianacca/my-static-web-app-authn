import {ClientPrincipal} from './client-principal';

export type AuthEventType = 'login' | 'sign-up' | 'logout'

export abstract class AuthEvent {
    type: AuthEventType;
    user: ClientPrincipal;
    
    static login(user: ClientPrincipal): AuthEvent {
        return {
            type: 'login',
            user
        };
    }
    
    static signUp(user: ClientPrincipal): AuthEvent {
        return {
            type: 'sign-up',
            user
        };
    }
    
    static logout(user: ClientPrincipal): AuthEvent {
        return {
            type: 'logout',
            user
        };
    }
}