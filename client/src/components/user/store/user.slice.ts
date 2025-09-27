import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Define a plain object type for the user, matching the API response
export interface PlainUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface UserState {
  currentUser: PlainUser | null;
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
  user: PlainUser;
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
    }

    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

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
    // Ensure we return plain JSON
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'OAuth login failed');
  }
});

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

    // Ensure we return plain JSON
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
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
      state.error = action.payload || (action.error.message || 'An error occurred');
    };
    const setSuccess = (state: UserState, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.error = null;
      // Store the plain user object, not a class instance
      state.currentUser = action.payload.user;
    };

    builder.addCase(loginUser.pending, setLoading);
    builder.addCase(loginUser.fulfilled, setSuccess);
    builder.addCase(loginUser.rejected, setError);

    builder.addCase(loginWithProviderToken.pending, setLoading);
    builder.addCase(loginWithProviderToken.fulfilled, setSuccess);
    builder.addCase(loginWithProviderToken.rejected, setError);

    builder.addCase(registerUser.pending, setLoading);
    builder.addCase(registerUser.fulfilled, setSuccess);
    builder.addCase(registerUser.rejected, setError);
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;