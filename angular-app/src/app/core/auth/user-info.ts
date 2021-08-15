export interface UserInfo {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
}

export type UserInfoKey = Pick<UserInfo, 'userId' | 'identityProvider'>;
