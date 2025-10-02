import { useDispatch } from 'react-redux';
import { authorize, AuthConfiguration } from 'react-native-app-auth';
import { loginWithProviderToken, logoutUser } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

// ✅ Provider configs from env vars
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const configs: Record<'google' | 'github' | 'twitter', AuthConfiguration | null> = {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: GOOGLE_CLIENT_ID,
    redirectUrl: GOOGLE_REDIRECT_URI,
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
      revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
    },
  },
  // 🚫 Not supported — requires BFF/WebView fallback
  twitter: null,
};

export const useOAuth = () => {
  const dispatch: AppDispatch = useDispatch();

  const signIn = async (provider: 'google' | 'github' | 'twitter') => {
    if (provider === 'twitter') {
      throw new Error('Twitter login is not supported in this client.');
    }

    const config = configs[provider];
    if (!config) {
      throw new Error(`OAuth provider "${provider}" is not configured.`);
    }

    try {
      // 1. Run client-side OAuth
      const authState = await authorize(config);
      if (!authState.accessToken) {
        throw new Error('OAuth login failed: no access token.');
      }

      // 2. Forward token to backend via slice thunk
      const result = await dispatch(
        loginWithProviderToken({ provider, token: authState.accessToken })
      ).unwrap();

      return {
        ...result,
        accessToken: authState.accessToken,
        idToken: authState.idToken || null,
      };
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('OAuth sign-out failed:', error);
      throw error;
    }
  };

  return { signIn, signOut };
};
