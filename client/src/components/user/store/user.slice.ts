import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import CryptoJS from 'crypto-js';

// -------------------- Types --------------------
export interface UserObject {
  id: string;
  fullName: string;
  email: string;
  image?: string;
  level?: number;
  achievementsCount?: number;
  weeklyGiftsCount?: number;
  avatarUrl?: string;
  xp?: number;
}

interface UserState {
  currentUser: UserObject | null;
  token: string | null;
  syncKey: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  token: null,
  syncKey: null,
  loading: false,
  error: null,
};

const HOST_SERVER_ADDRESS = (typeof process !== 'undefined' && process.env?.HOST_SERVER_ADDRESS) || 'http://localhost:3000';
const API_BASE_URL = `${HOST_SERVER_ADDRESS}/api`;

const getClientSecret = () => {
  return (typeof process !== 'undefined' && process.env && process.env.JWT_SECRET) || 'test-secret';
};

const getSignedHeaders = (body: any) => {
  const secret = getClientSecret();
  const bodyStr = typeof body === 'string' ? body : (body ? JSON.stringify(body) : '');
  const nonce = Math.random().toString(36).substring(7);
  const timestamp = Date.now().toString();
  const message = nonce + timestamp + bodyStr;
  const signature = CryptoJS.HmacSHA256(message, secret).toString();
  return {
    'Content-Type': 'application/json',
    'x-client-signature': signature,
    'x-client-nonce': nonce,
    'x-client-timestamp': timestamp,
  };
};

export interface AuthResponse {
  token: string;
  user: UserObject;
  syncKey: string;
}

// -------------------- Async Thunks --------------------

// Normal login
export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('user/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid credentials');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

// OAuth callback login
export const loginCallback = createAsyncThunk<
  AuthResponse,
  { code: string },
  { rejectValue: string }
>('user/loginCallback', async ({ code }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/callback?code=${code}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OAuth callback failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth callback failed');
  }
});

// OAuth login with provider token
export const loginWithProviderToken = createAsyncThunk<
  AuthResponse,
  { provider: string; token: string },
  { rejectValue: string }
>('user/loginWithProviderToken', async ({ provider, token }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/provider-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, token }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OAuth login failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth login failed');
  }
});

// OAuth authorization code exchange
export const exchangeAuthorizationCode = createAsyncThunk<
  AuthResponse,
  { provider: 'google' | 'github' | 'x'; code: string; codeVerifier: string; redirectUri: string },
  { rejectValue: string }
>('user/exchangeAuthorizationCode', async ({ provider, code, codeVerifier, redirectUri }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/oauth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeVerifier, redirectUri }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'OAuth exchange failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth exchange failed');
  }
});

// Twitter login
export const loginWithTwitter = createAsyncThunk<
  AuthResponse,
  { url: string },
  { rejectValue: string }
>('user/loginWithTwitter', async ({ url }, { rejectWithValue }) => {
  try {
    // The URL contains the token and user data from the backend
    const decodedUrl = decodeURIComponent(url);
    const params = new URLSearchParams(decodedUrl.split('?')[1]);
    const token = params.get('token');
    const syncKey = params.get('syncKey');
    const user = JSON.parse(params.get('user') || '{}');

    if (!token || !user || !syncKey) {
      throw new Error('Invalid Twitter login data');
    }

    // Ensure the user object has the fullName property
    if (user.name && !user.fullName) {
      user.fullName = user.name;
    }

    return { token, user, syncKey };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Twitter login failed');
  }
});

// Register
export const registerUser = createAsyncThunk<
  AuthResponse,
  { fullName: string; email: string; password: string },
  { rejectValue: string }
>('user/register', async ({ fullName, email, password }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

// Request password reset
export const requestPasswordReset = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>('user/requestPasswordReset', async ({ email }, { rejectWithValue }) => {
  try {
    const body = JSON.stringify({ email });
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: getSignedHeaders(body),
      body,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset request failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Password reset request failed');
  }
});

// Reset password
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>('user/resetPassword', async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    const body = JSON.stringify({ token, password: newPassword });
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getSignedHeaders(body),
      body,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Password reset failed');
  }
});

// Logout
export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>('user/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Logout failed');
  }
});

// Fetch profile picture
export const fetchProfilePicture = createAsyncThunk<
  { imageUrl: string },
  void,
  { rejectValue: string }
>('user/fetchProfilePicture', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile picture');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch profile picture');
  }
});

export const fetchUserProfile = createAsyncThunk<
  UserObject,
  void,
  { rejectValue: string }
>('user/fetchProfile', async (_, { dispatch, rejectWithValue, signal }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile-summary`, {
      method: 'GET',
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      // Dispatch logoutUser on failure to clear the session
      dispatch(logoutUser());
      const errorData = await response.json();
      // It's good practice to reject with a serializable object
      return rejectWithValue(errorData.message || 'Failed to fetch user profile');
    }
    const data = await response.json();
    return data.user;
  } catch (err: any) {
    // Also dispatch logoutUser in case of network errors
    dispatch(logoutUser());
    return rejectWithValue(err.message || 'Failed to fetch user profile');
  }
});

// -------------------- Slice --------------------
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserObject>) => {
      state.currentUser = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
        state.token = action.payload;
    },
    setSyncKey: (state, action: PayloadAction<string>) => {
        state.syncKey = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: UserState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: UserState, action: any) => {
      state.loading = false;
      state.error = action.payload || action.error.message || 'An error occurred';
    };

    const setSuccess = (state: UserState, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.syncKey = action.payload.syncKey;
    };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, setSuccess)
      .addCase(loginUser.rejected, setError)

      .addCase(loginCallback.pending, setLoading)
      .addCase(loginCallback.fulfilled, setSuccess)
      .addCase(loginCallback.rejected, setError)

      .addCase(loginWithProviderToken.pending, setLoading)
      .addCase(loginWithProviderToken.fulfilled, setSuccess)
      .addCase(loginWithProviderToken.rejected, setError)

      .addCase(exchangeAuthorizationCode.pending, setLoading)
      .addCase(exchangeAuthorizationCode.fulfilled, setSuccess)
      .addCase(exchangeAuthorizationCode.rejected, setError)

      .addCase(loginWithTwitter.pending, setLoading)
      .addCase(loginWithTwitter.fulfilled, setSuccess)
      .addCase(loginWithTwitter.rejected, setError)

      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, setSuccess)
      .addCase(registerUser.rejected, setError)

      .addCase(requestPasswordReset.pending, setLoading)
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, setError)

      .addCase(resetPassword.pending, setLoading)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, setError)

      .addCase(logoutUser.pending, setLoading)
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.currentUser = null;
        state.token = null;
        state.syncKey = null;
      })
      .addCase(logoutUser.rejected, setError)

      .addCase(fetchProfilePicture.pending, setLoading)
      .addCase(fetchProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (state.currentUser) {
          state.currentUser.image = action.payload.imageUrl;
        }
      })
      .addCase(fetchProfilePicture.rejected, setError)

      .addCase(fetchUserProfile.pending, setLoading)
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'An error occurred';
        state.currentUser = null;
      });
  },
});

export const { setCurrentUser, setToken, setSyncKey, clearAuthError } = userSlice.actions;

// Password reset token verification thunk calling /api/auth/verify-reset-token
export const verifyCode = createAsyncThunk<
  { token: string },
  { email: string; code: string },
  { rejectValue: string }
>('user/verifyCode', async ({ email, code }, { rejectWithValue }) => {
  try {
    const body = JSON.stringify({ token: code });
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
      method: 'POST',
      headers: getSignedHeaders(body),
      body,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid or expired code');
    }
    const data = await response.json();
    return { token: data.token || code };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Verification failed');
  }
});

// Resend verification code thunk using api request reset endpoint
export const requestVerificationCode = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>('user/requestVerificationCode', async ({ email }, { rejectWithValue }) => {
  try {
    const body = JSON.stringify({ email });
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: getSignedHeaders(body),
      body,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request code');
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to request code');
  }
});

export default userSlice.reducer;
