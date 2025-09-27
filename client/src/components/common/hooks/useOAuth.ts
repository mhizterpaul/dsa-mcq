import { useDispatch } from 'react-redux';
import { authorize, AuthConfiguration } from 'react-native-app-auth';

import { loginWithProviderToken } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

// TODO: These should be loaded from environment variables
const configs: Record<string, AuthConfiguration> = {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUrl: 'com.yourapp:/oauth2redirect/google',
    scopes: ['openid', 'profile', 'email'],
  },
  // Github and Twitter would be configured here as well
};

export const useOAuth = () => {
  const dispatch: AppDispatch = useDispatch();

  const signIn = async (provider: 'google' | 'github' | 'twitter') => {
    const config = configs[provider];
    if (!config) {
      throw new Error(`OAuth provider '${provider}' is not configured.`);
    }

    try {
      const authState = await authorize(config);
      if (authState.accessToken) {
        dispatch(loginWithProviderToken({ provider, token: authState.accessToken }));
      } else {
        throw new Error('OAuth login failed: No access token received.');
      }
    } catch (error) {
      console.error(error);
      throw new Error('OAuth sign-in failed');
    }
  };

  const signOut = async (provider: 'google' | 'github' | 'twitter') => {
    // This is a placeholder for a real sign-out implementation
    console.log(`Signing out from ${provider}`);
  };

  return { signIn, signOut };
};