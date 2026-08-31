import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'

const existingSession = authService.loadSession()

const initialState = {
  user: existingSession?.user || null,
  token: existingSession?.token || null,
  isAuthenticated: Boolean(existingSession),
  status: 'idle',
  error: null,
}

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Registration failed')
  }
})

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Login failed')
  }
})

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (payload, { rejectWithValue }) => {
  try {
    return await authService.requestPasswordReset(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not send password reset email')
  }
})

export const confirmPasswordReset = createAsyncThunk('auth/confirmPasswordReset', async (payload, { rejectWithValue }) => {
  try {
    return await authService.confirmPasswordReset(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not reset password')
  }
})

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not update your profile')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      authService.clearSession()
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        authService.persistSession(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        authService.persistSession(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Could not send password reset email'
      })
      .addCase(confirmPasswordReset.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Could not reset password'
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('farmart_user', JSON.stringify(state.user))
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload || 'Could not update your profile'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
