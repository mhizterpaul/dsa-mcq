import { useDispatch } from 'react-redux';
import { exchangeAuthorizationCode, logoutUser } from '../../user/store/user.slice';
import { AppDispatch } from '../../../store';

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
    return {
      provider: 'google',
      authorizationCode: 'web-google-auth-code',
      codeVerifier: 'web-google-code-verifier',
      redirectUri: (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/auth/callback',
    };
  }
  async logout(): Promise<void> {}
}

export class GithubStrategy implements OAuthProvider {
  async login(): Promise<OAuthAuthorizationResult> {
    return {
      provider: 'github',
      authorizationCode: 'web-github-auth-code',
      codeVerifier: 'web-github-code-verifier',
      redirectUri: (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/auth/callback',
    };
  }
  async logout(): Promise<void> {}
}

export class XStrategy implements OAuthProvider {
  async login(): Promise<OAuthAuthorizationResult> {
    return {
      provider: 'x',
      authorizationCode: 'web-x-auth-code',
      codeVerifier: 'web-x-code-verifier',
      redirectUri: (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/auth/callback',
    };
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
      console.error(`Web ${provider} sign-in failed:`, error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Web OAuth sign-out failed:', error);
      throw error;
    }
  };

  return { signIn, signOut };
};
