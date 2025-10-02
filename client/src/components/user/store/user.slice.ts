import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// -------------------- Types --------------------
export interface UserObject {
  id: string;
  fullName: string;
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

const API_BASE_URL = 'http://localhost:3000/api';

export interface AuthResponse {
  token: string;
  user: UserObject;
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
      body: JSON.stringify({ name: fullName, email, password }),
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
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword }),
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

// -------------------- Slice --------------------
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserObject>) => {
      state.currentUser = action.payload;
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
      // ⚠️ persist token securely if needed
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
      .addCase(fetchProfilePicture.rejected, setError);
  },
});

export const { setCurrentUser, clearAuthError } = userSlice.actions;
export default userSlice.reducer;
