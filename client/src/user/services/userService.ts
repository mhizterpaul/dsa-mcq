import { User } from '../store/primitives/User';

// Mock AuthServer API
const FAKE_JWT_TOKEN = 'fake-jwt-token';

export const login = async (username: string, password: string):Promise<{ user: User, token: string }> => {
    console.log(`Attempting to log in user: ${username}`);
    // In a real app, this would be an API call to the AuthServer.
    // We'll simulate a successful login.
    if (password === 'password') {
        const user = new User('1', username, `${username}@example.com`);
        return Promise.resolve({ user, token: FAKE_JWT_TOKEN });
    } else {
        return Promise.reject(new Error('Invalid credentials'));
    }
};

export const register = async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    console.log(`Attempting to register user: ${username}`);
    // In a real app, this would be an API call to the AuthServer.
    // We'll simulate a successful registration.
    const user = new User(String(Math.random()), username, email);
    return Promise.resolve({ user, token: FAKE_JWT_TOKEN });
};

export const logout = async (): Promise<void> => {
    console.log('Logging out user');
    // In a real app, this might involve invalidating a token on the server.
    return Promise.resolve();
};

// Mock OAuth login
export const loginWithOAuth = async (
  provider: 'github' | 'gmail' | 'x',
  oauthToken: string
): Promise<{ user: User; token: string }> => {
  console.log(`OAuth login with provider: ${provider}, token: ${oauthToken}`);
  // Simulate successful OAuth login
  const user = new User('2', `${provider}_user`, `${provider}_user@example.com`);
  return Promise.resolve({ user, token: FAKE_JWT_TOKEN });
};

// Mock request verification code
export const requestVerificationCode = async (email: string): Promise<void> => {
  console.log(`Requesting verification code for: ${email}`);
  // Simulate sending code
  return Promise.resolve();
};

// Mock verify code
export const verifyCode = async (email: string, code: string): Promise<void> => {
  console.log(`Verifying code ${code} for email: ${email}`);
  // Simulate verification
  if (code === '123456') {
    return Promise.resolve();
  } else {
    return Promise.reject(new Error('Invalid verification code'));
  }
};

// Mock reset password
export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  console.log(`Resetting password for: ${email}`);
  // Simulate password reset
  if (newPassword.length >= 6) {
    return Promise.resolve();
  } else {
    return Promise.reject(new Error('Password too short'));
  }
};
 