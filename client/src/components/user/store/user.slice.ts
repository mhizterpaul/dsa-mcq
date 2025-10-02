import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Plain interface for the user object
export interface UserObject {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface UserState {
  currentUser: UserObject | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

//
// Async Thunks
//

// Email/password login

// TODO: This should be loaded from environment variables
const API_BASE_URL = 'http://localhost:3000/api';

// This response type should be shared with the server.
export interface AuthResponse {
  token: string;
  user: UserObject;
}


export const loginUser = createAsyncThunk<
  AuthResponse,
  { username: string; password: string },
  { rejectValue: string }
>('user/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
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
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OAuth login failed');
    }
    const data: AuthResponse = await response.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth login failed');
  }
});

// Register user
export const registerUser = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string },
  { rejectValue: string }
>('user/register', async ({ username, email, password }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, email, password }),
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

// Request verification code
export const requestVerificationCodeAPI = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
  'user/requestVerificationCode',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to request verification code');
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send verification code');
    }
  }
);

// Logout user
export const logoutUserAPI = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(`${API_BASE_URL}/auth/signout`, {
        method: 'POST',
      });
    } catch (err: any) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

// Verify code
export const verifyCodeAPI = createAsyncThunk<void, { email: string; code: string }, { rejectValue: string }>(
  'user/verifyCode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      // This function is no longer needed, as the reset link will take the user to a page
      // that calls resetPassword directly.
      console.warn("verifyCode is deprecated");
    } catch (err: any) {
      return rejectWithValue(err.message || 'Code verification failed');
    }
  }
);

// Reset password
export const resetPasswordAPI = createAsyncThunk<void, { email: string; newPassword: string }, { rejectValue: string }>(
  'user/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed');
    }
  }
);

//
// Slice
//

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserObject>) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: UserState) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state: UserState, action: any) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    };
    const setSuccess = (state: UserState) => {
      state.loading = false;
      state.error = null;
    };

    // Login (email/password)
    builder.addCase(loginUser.pending, setLoading);
    builder.addCase(loginUser.fulfilled, (state, action) => {
        setSuccess(state);
        state.currentUser = action.payload.user;
    });
    builder.addCase(loginUser.rejected, setError);

    // Login (OAuth with provider token)
    builder.addCase(loginWithProviderToken.pending, setLoading);
    builder.addCase(loginWithProviderToken.fulfilled, (state, action) => {
        setSuccess(state);
        state.currentUser = action.payload.user;
        // In a real app, you would also store the session token from action.payload.token
    });
    builder.addCase(loginWithProviderToken.rejected, setError);

    // Register
    builder.addCase(registerUser.pending, setLoading);
    builder.addCase(registerUser.fulfilled, (state, action) => {
        setSuccess(state);
        state.currentUser = action.payload.user;
    });
    builder.addCase(registerUser.rejected, setError);

    // Request Verification Code
    builder.addCase(requestVerificationCodeAPI.pending, setLoading);
    builder.addCase(requestVerificationCodeAPI.fulfilled, setSuccess);
    builder.addCase(requestVerificationCodeAPI.rejected, setError);

    // Verify Code
    builder.addCase(verifyCodeAPI.pending, setLoading);
    builder.addCase(verifyCodeAPI.fulfilled, setSuccess);
    builder.addCase(verifyCodeAPI.rejected, setError);

    // Reset Password
    builder.addCase(resetPasswordAPI.pending, setLoading);
    builder.addCase(resetPasswordAPI.fulfilled, setSuccess);
    builder.addCase(resetPasswordAPI.rejected, setError);

    // Logout
    builder.addCase(logoutUserAPI.pending, setLoading);
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      setSuccess(state);
      state.currentUser = null;
    });
    builder.addCase(logoutUserAPI.rejected, setError);
  },
});

export const { setCurrentUser, logout } = userSlice.actions;
export default userSlice.reducer;
