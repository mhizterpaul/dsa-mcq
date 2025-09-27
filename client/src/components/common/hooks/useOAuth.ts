import { useDispatch } from 'react-redux';
import { authorize } from 'react-native-app-auth';
import { loginWithProviderToken } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

// TODO: These credentials should be loaded from environment variables
const GITHUB_CLIENT_ID = 'your-github-client-id';
const GITHUB_CLIENT_SECRET = 'your-github-client-secret';
const GOOGLE_WEB_CLIENT_ID = 'your-google-web-client-id.apps.googleusercontent.com';

const configs = {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUrl: 'com.googleusercontent.apps.your-google-web-client-id:/oauth2redirect/google',
    scopes: ['openid', 'profile', 'email'],
  },
  github: {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    redirectUrl: 'io.dsa-mcq.app://oauth-callback/github',
    scopes: ['identity', 'user:email'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`
    },
  },
  twitter: {
    // Twitter has been deprecated from the project due to API costs
    // and is no longer supported.
  },
};

export const useOAuth = () => {
  const dispatch: AppDispatch = useDispatch();

  const signIn = async (provider: 'google' | 'github') => {
    try {
      const config = configs[provider];
      if (!config) {
        throw new Error(`Provider "${provider}" is not supported.`);
      }

      const { accessToken } = await authorize(config);

      if (accessToken) {
        // For the mocked server, we need to send a specific token
        dispatch(loginWithProviderToken({ provider, token: 'valid-token' }));
      } else {
        throw new Error('Failed to get access token from provider.');
      }
    } catch (error) {
      console.error('OAuth Error:', error);
      // Re-throw the error to be caught by the component
      throw error;
    }
  };

  return { signIn };
};