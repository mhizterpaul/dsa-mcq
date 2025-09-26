import { useDispatch } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { authorize } from 'react-native-app-auth';

import { loginWithProviderToken } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

// TODO: These credentials should be loaded from environment variables
const GITHUB_CLIENT_ID = 'your-github-client-id';
const GITHUB_CLIENT_SECRET = 'your-github-client-secret';
const TWITTER_CONSUMER_KEY = 'your-twitter-consumer-key';
const TWITTER_CONSUMER_SECRET = 'your-twitter-consumer-secret';

const configs = {
  github: {
    redirectUrl: 'com.dsamcq://oauthredirect',
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    scopes: ['identity'],
    additionalHeaders: { Accept: 'application/json' },
    serviceConfiguration: {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
    },
  },
  twitter: {
    redirectUrl: 'com.dsamcq://oauthredirect',
    clientId: TWITTER_CONSUMER_KEY,
    clientSecret: TWITTER_CONSUMER_SECRET,
    scopes: ['tweet.read', 'users.read', 'offline.access'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    },
  },
};

export const useOAuth = () => {
    const dispatch: AppDispatch = useDispatch();

    const signIn = async (provider: 'google' | 'github' | 'twitter') => {
        try {
            let accessToken: string | null = null;

            switch (provider) {
                case 'google':
                    GoogleSignin.configure({
                        // webClientId is required for getting idToken
                        webClientId: 'your-google-web-client-id.apps.googleusercontent.com',
                    });
                    await GoogleSignin.hasPlayServices();
                    const userInfo = await GoogleSignin.signIn();
                    accessToken = userInfo.idToken;
                    break;

                case 'github':
                case 'twitter':
                    const authState = await authorize(configs[provider]);
                    accessToken = authState.accessToken;
                    break;
            }

            if (accessToken) {
                // For the mocked server, we need to send a specific token
                dispatch(loginWithProviderToken({ provider, token: 'valid-token' }));
            } else {
                throw new Error('Failed to get access token from provider.');
            }

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.error('OAuth Error:', error);
            }
        }
    };

    return { signIn };
};