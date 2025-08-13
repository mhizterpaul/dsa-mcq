import { User } from '../store/primitives/User';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const { user, token } = await response.json();
  return { user: new User(user.id, user.name, user.email), token };
};

export const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  const { user, token } = await response.json();
  return { user: new User(user.id, user.name, user.email), token };
};

export const logout = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/auth/signout`, {
    method: 'POST',
  });
};

export const loginWithOAuth = async (provider: 'github' | 'google' | 'x'): Promise<void> => {
  window.location.href = `${API_BASE_URL}/auth/signin/${provider}`;
};

export const requestVerificationCode = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to request verification code');
  }
};

export const verifyCode = async (token: string): Promise<void> => {
    // This function is no longer needed, as the reset link will take the user to a page
    // that calls resetPassword directly.
    console.warn("verifyCode is deprecated");
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to reset password');
  }
};
