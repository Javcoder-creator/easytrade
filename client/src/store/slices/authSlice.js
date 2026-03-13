import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Xato yuz berdi');
  }
});

export const getMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout(state) {
      state.user = null;
      // Faqat auth bilan bog'liq kalitlarni tozalash (boshqa localStorage ma'lumotlari saqlanadi)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError(state) { state.error = null; },
    setInitialized(state) { state.initialized = true; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; })
      .addCase(login.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getMe.fulfilled, (s, a) => { s.user = a.payload; s.initialized = true; })
      .addCase(getMe.rejected,  (s)    => { s.initialized = true; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
