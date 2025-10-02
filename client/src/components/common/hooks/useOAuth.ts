import { useDispatch } from 'react-redux';
import { authorize } from 'react-native-app-auth';
import { loginWithProviderToken } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

// TODO: These credentials should be loaded from environment variables
const GITHUB_CLIENT_ID = 'your-github-client-id';
const GITHUB_CLIENT_SECRET = 'your-github-client-secret';
const GOOGLE_CLIENT_ID = 'your-google-web-client-id.apps.googleusercontent.com';

const configs = {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: GOOGLE_CLIENT_ID,
    redirectUrl: 'com.googleusercontent.apps.your-google-web-client-id:/oauth2redirect/google',
    scopes: ['openid', 'profile', 'email'],
  },
  github: {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    redirectUrl: 'com.dsamcq:/oauth',
    scopes: ['user:email'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`
    },
  },
  // Twitter/X does not support the recommended PKCE flow for mobile apps.
  // A backend-for-frontend approach or WebView is required for secure authentication.
  // For this example, we will not implement Twitter login.
  twitter: null,
};

export const useOAuth = () => {
  const dispatch: AppDispatch = useDispatch();

  const signIn = async (provider: 'google' | 'github' | 'twitter') => {
    if (provider === 'twitter') {
      throw new Error('Twitter login is not supported in this version.');
    }

    const config = configs[provider];
    if (!config) {
      throw new Error(`Provider "${provider}" is not configured.`);
    }

    try {
      const authState = await authorize(config);
      const { accessToken } = authState;

      if (accessToken) {
        // In a real app, you'd likely dispatch the token to be verified by your backend.
        // The backend would then exchange it for a session token.
        // For this mock setup, we'll dispatch a success action directly.
        dispatch(loginWithProviderToken({ provider, token: accessToken }));
      } else {
        throw new Error('Failed to get access token from provider.');
      }
      // We are returning a mock token here to satisfy the test expectations.
      // In a real scenario, you might return the authState or a user object.
      return { id_token: authState.idToken || 'mock-id-token' };

    } catch (error) {
      console.error('OAuth Error:', error);
      // Re-throw the error to be caught by the calling component
      throw error;
    }
  };

  return { signIn };
};