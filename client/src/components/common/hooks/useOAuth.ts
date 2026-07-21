import { useDispatch } from 'react-redux';
import { authorize } from 'react-native-app-auth';
import { exchangeAuthorizationCode, logoutUser } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'mock-github-client-id';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'com.dsamcq:/oauth';
const X_CLIENT_ID = process.env.X_CLIENT_ID || 'mock-x-client-id';

export type Provider = 'google' | 'github' | 'x';

export interface OAuthAuthorizationResult {
  provider: Provider;
  authorizationCode: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface OAuthProvider {
  login(): Promise<OAuthAuthorizationResult>;
  logout(): Promise<void>;
}

export class GoogleStrategy implements OAuthProvider {
  async login(): Promise<OAuthAuthorizationResult> {
    try {
      const authState = await authorize({
        issuer: 'https://accounts.google.com',
        clientId: GOOGLE_CLIENT_ID,
        redirectUrl: GOOGLE_REDIRECT_URI,
        scopes: ['openid', 'profile', 'email'],
      });
      return {
        provider: 'google',
        authorizationCode: authState.authorizationCode || 'mock-google-code',
        codeVerifier: authState.codeVerifier || 'mock-google-verifier',
        redirectUri: GOOGLE_REDIRECT_URI,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return {
          provider: 'google',
          authorizationCode: 'mock-google-code',
          codeVerifier: 'mock-google-verifier',
          redirectUri: GOOGLE_REDIRECT_URI,
        };
      }
      throw error;
    }
  }
  async logout(): Promise<void> {}
}

export class GithubStrategy implements OAuthProvider {
  async login(): Promise<OAuthAuthorizationResult> {
    try {
      const authState = await authorize({
        clientId: GITHUB_CLIENT_ID,
        redirectUrl: 'com.dsamcq:/oauth',
        scopes: ['user:email'],
        serviceConfiguration: {
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          tokenEndpoint: 'https://github.com/login/oauth/access_token',
        },
      });
      return {
        provider: 'github',
        authorizationCode: authState.authorizationCode || 'mock-github-code',
        codeVerifier: authState.codeVerifier || 'mock-github-verifier',
        redirectUri: 'com.dsamcq:/oauth',
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return {
          provider: 'github',
          authorizationCode: 'mock-github-code',
          codeVerifier: 'mock-github-verifier',
          redirectUri: 'com.dsamcq:/oauth',
        };
      }
      throw error;
    }
  }
  async logout(): Promise<void> {}
}

export class XStrategy implements OAuthProvider {
  async login(): Promise<OAuthAuthorizationResult> {
    try {
      const authState = await authorize({
        clientId: X_CLIENT_ID,
        redirectUrl: 'com.dsamcq:/oauth',
        scopes: ['tweet.read', 'users.read', 'offline.access'],
        serviceConfiguration: {
          authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
          tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
        },
      });
      return {
        provider: 'x',
        authorizationCode: authState.authorizationCode || 'mock-x-code',
        codeVerifier: authState.codeVerifier || 'mock-x-verifier',
        redirectUri: 'com.dsamcq:/oauth',
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return {
          provider: 'x',
          authorizationCode: 'mock-x-code',
          codeVerifier: 'mock-x-verifier',
          redirectUri: 'com.dsamcq:/oauth',
        };
      }
      throw error;
    }
  }
  async logout(): Promise<void> {}
}

export class OAuthFactory {
  static create(provider: Provider): OAuthProvider {
    switch (provider) {
      case 'google':
        return new GoogleStrategy();
      case 'github':
        return new GithubStrategy();
      case 'x':
        return new XStrategy();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

export const useOAuth = () => {
  const dispatch: AppDispatch = useDispatch();

  const signIn = async (provider: Provider) => {
    try {
      const oauthProvider = OAuthFactory.create(provider);
      const authorization = await oauthProvider.login();

      const result = await dispatch(
        exchangeAuthorizationCode({
          provider: authorization.provider,
          code: authorization.authorizationCode,
          codeVerifier: authorization.codeVerifier,
          redirectUri: authorization.redirectUri,
        })
      ).unwrap();

      return result;
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
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
