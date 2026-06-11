import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const getLocalToken = (key: string) => {
  const item = localStorage.getItem(key);
  if (!item || item === 'undefined' || item === 'null') return null;
  return item;
};

const initialAccess = getLocalToken('access');
const initialRefresh = getLocalToken('refresh');

const initialState: AuthState = {
  access: initialAccess,
  refresh: initialRefresh,
  user: null,
  isAuthenticated: !!initialAccess,
  isAdmin: false,
  status: 'idle',
  error: null,
};

export const fetchUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();
    const token = state.auth.access;
    if (!token) return rejectWithValue('Aucun token disponible.');

    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    try {
      const res = await fetch(`${base}/api/auth/users/me/`, {
        headers: { 'Authorization': `JWT ${token}` }
      });
      if (!res.ok) throw new Error('Erreur récupération profil');
      const data = await res.json();
      return data as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ access: string; refresh: string }>) {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.isAuthenticated = true;
      localStorage.setItem('access', action.payload.access);
      localStorage.setItem('refresh', action.payload.refresh);
    },
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAdmin = action.payload.is_staff;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Erreur inconnue';
      });
  },
});

export const { setTokens, logout } = authSlice.actions;
export default authSlice.reducer;