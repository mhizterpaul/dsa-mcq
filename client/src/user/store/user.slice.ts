import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './primitives/User';

interface UserState {
  currentUser: User | null;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
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

const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
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

const logout = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/auth/signout`, {
    method: 'POST',
  });
};

const loginWithOAuth = async (provider: 'github' | 'google' | 'x'): Promise<void> => {
  window.location.href = `${API_BASE_URL}/auth/signin/${provider}`;
};

const requestVerificationCode = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to request verification code');
  }
};

const verifyCode = async (token: string): Promise<void> => {
    // This function is no longer needed, as the reset link will take the user to a page
    // that calls resetPassword directly.
    console.warn("verifyCode is deprecated");
};

const resetPassword = async (token: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to reset password');
  }
};
 

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { username: string; password: string },
  { rejectValue: string }
>('user/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    return await login(username, password);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

// OAuth login: provider + token
export const loginWithOAuth = createAsyncThunk<
  { user: User; token: string },
  { provider: 'github' | 'gmail' | 'x'; oauthToken: string },
  { rejectValue: string }
>('user/loginWithOAuth', async ({ provider, oauthToken }, { rejectWithValue }) => {
  try {
    return await loginWithOAuth(provider, oauthToken);
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth login failed');
  }
});

// Register user
export const registerUser = createAsyncThunk<
  { user: User; token: string },
  { username: string; email: string; password: string },
  { rejectValue: string }
>('user/register', async ({ username, email, password }, { rejectWithValue }) => {
  try {
    return await register(username, email, password);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

// Request verification code
export const requestVerificationCode = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
  'user/requestVerificationCode',
  async ({ email }, { rejectWithValue }) => {
    try {
      await requestVerificationCode(email);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send verification code');
    }
  }
);

// Verify code
export const verifyCode = createAsyncThunk<void, { email: string; code: string }, { rejectValue: string }>(
  'user/verifyCode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      await verifyCode(email, code);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Code verification failed');
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk<void, { email: string; newPassword: string }, { rejectValue: string }>(
  'user/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      await resetPassword(email, newPassword);
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
    setCurrentUser: (state, action: PayloadAction<{ id: string; username: string; email: string }>) => {
      const { id, username, email } = action.payload;
      state.currentUser = new User(id, username, email);
    },
    updatePreference: (state, action: PayloadAction<'easy' | 'medium' | 'hard'>) => {
      if (state.currentUser) {
        state.currentUser.updatePreference(action.payload);
      }
    },
    updateMasteryLevel: (state, action: PayloadAction<{ categoryId: string; score: number }>) => {
      if (state.currentUser) {
        const { categoryId, score } = action.payload;
        state.currentUser.updateMasteryLevel(categoryId, score);
      }
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

    // Login (OAuth)
    builder.addCase(loginWithOAuth.pending, setLoading);
    builder.addCase(loginWithOAuth.fulfilled, (state, action) => {
      setSuccess(state);
      state.currentUser = action.payload.user;
    });
    builder.addCase(loginWithOAuth.rejected, setError);

    // Register
    builder.addCase(registerUser.pending, setLoading);
    builder.addCase(registerUser.fulfilled, (state, action) => {
      setSuccess(state);
      state.currentUser = action.payload.user;
    });
    builder.addCase(registerUser.rejected, setError);

    // Request Verification Code
    builder.addCase(requestVerificationCode.pending, setLoading);
    builder.addCase(requestVerificationCode.fulfilled, setSuccess);
    builder.addCase(requestVerificationCode.rejected, setError);

    // Verify Code
    builder.addCase(verifyCode.pending, setLoading);
    builder.addCase(verifyCode.fulfilled, setSuccess);
    builder.addCase(verifyCode.rejected, setError);

    // Reset Password
    builder.addCase(resetPassword.pending, setLoading);
    builder.addCase(resetPassword.fulfilled, setSuccess);
    builder.addCase(resetPassword.rejected, setError);
  },
});

export const { setCurrentUser, updatePreference, updateMasteryLevel, logout } = userSlice.actions;
export default userSlice.reducer;
