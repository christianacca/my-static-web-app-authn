import {UserInfo} from "./user-info";

export type AuthEventType = 'login' | 'sign-up' | 'logout'

export abstract class AuthEvent {
    type: AuthEventType;
    user: UserInfo;
    
    static login(user: UserInfo): AuthEvent {
        return {
            type: 'login',
            user
        };
    }
    
    static signUp(user: UserInfo): AuthEvent {
        return {
            type: 'sign-up',
            user
        };
    }
    
    static logout(user: UserInfo): AuthEvent {
        return {
            type: 'logout',
            user
        };
    }
}