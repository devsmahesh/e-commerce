import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'
import { tokenManager } from '@/lib/token'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      
      // Store tokens in cookies via tokenManager
      tokenManager.setTokens(action.payload.accessToken, action.payload.refreshToken)
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      
      // Update tokens in cookies via tokenManager
      tokenManager.setTokens(action.payload.accessToken, action.payload.refreshToken)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      
      // Clear tokens from cookies via tokenManager
      tokenManager.clearTokens()
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    initializeAuth: (state) => {
      // Initialize auth state from cookies via tokenManager
      const accessToken = tokenManager.getAccessToken()
      const refreshToken = tokenManager.getRefreshToken()
      if (accessToken && refreshToken) {
        state.accessToken = accessToken
        state.refreshToken = refreshToken
        // Note: User data should be fetched separately
      }
    },
  },
})

export const { setCredentials, setTokens, logout, updateUser, initializeAuth } = authSlice.actions
export default authSlice.reducer

