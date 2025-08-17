import { useDispatch } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import OAuthManager from 'react-native-oauth';

import { loginWithProviderToken } from '../../user/store/user.slice';
import { AppDispatch } from '../../mediator/store';

// TODO: These credentials should be loaded from environment variables
const GITHUB_CLIENT_ID = 'your-github-client-id';
const GITHUB_CLIENT_SECRET = 'your-github-client-secret';
const TWITTER_CONSUMER_KEY = 'your-twitter-consumer-key';
const TWITTER_CONSUMER_SECRET = 'your-twitter-consumer-secret';

const manager = new OAuthManager('dsamcq');
manager.configure({
    github: {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
    },
    twitter: {
        consumer_key: TWITTER_CONSUMER_KEY,
        consumer_secret: TWITTER_CONSUMER_SECRET,
    }
});


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
                    const githubResponse = await manager.authorize('github');
                    accessToken = githubResponse?.response?.credentials?.accessToken;
                    break;

                case 'twitter':
                    const twitterResponse = await manager.authorize('twitter');
                    accessToken = twitterResponse?.response?.credentials?.accessToken;
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
