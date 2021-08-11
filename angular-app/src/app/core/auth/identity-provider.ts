export interface IdentityProvider {
    key: string;
    name: string;
}

export const builtInIdentityProviders = {
    twitter: {key: 'twitter', name: 'twitter'},
    github: {key: 'github', name: 'github'},
    azureActiveDirectory: {key: 'aad', name: 'Azure Active Directory'}
};