import {UserInfo} from "./user-info";

export type AuthEventType = 'sign-in' | 'sign-up' | 'sign-out'

export abstract class AuthEvent {
    type: AuthEventType;
    user: UserInfo;
    
    static signIn(user: UserInfo): AuthEvent {
        return {
            type: 'sign-in',
            user
        };
    }
    
    static signUp(user: UserInfo): AuthEvent {
        return {
            type: 'sign-up',
            user
        };
    }
    
    static signOut(user: UserInfo): AuthEvent {
        return {
            type: 'sign-out',
            user
        };
    }
}