/**
 * Auth Slice
 * Manages authentication state in Redux.
 * Tokens are stored in httpOnly cookies (managed by the backend).
 * User data is cached in localStorage for quick UI rendering.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { authAPI, dashboardAPI, UserData, ApiResponse } from "../api"
import { AxiosError } from "axios"
import { createLogger } from "@/lib/logger"

const log = createLogger("authSlice")

// ============================================
// Types
// ============================================

interface AuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionChecked: boolean
  error: string | null
}

interface SignUpData {
  name: string
  email: string
  password: string
  company?: string
}

interface SignInData {
  email: string
  password: string
}

// ============================================
// Initial State
// ============================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sessionChecked: false,
  error: null,
}

// Pre-load cached user data for instant UI (will be verified by checkSession)
if (typeof window !== "undefined") {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    try {
      initialState.user = JSON.parse(userStr)
      initialState.isAuthenticated = true
    } catch {
      localStorage.removeItem("user")
    }
  }
}

// ============================================
// Async Thunks
// ============================================

/**
 * Check if the user has a valid session (cookie-based)
 * Calls /api/auth/me to verify the httpOnly cookie
 */
export const checkSession = createAsyncThunk<
  ApiResponse<UserData>,
  void,
  { rejectValue: string }
>(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser()
      log.info("Session check success")
      return response
    } catch (error) {
      log.info("No active session")
      return rejectWithValue("No active session")
    }
  }
)

/**
 * Sign up with email and password — sends OTP, does not authenticate yet.
 */
export const signUp = createAsyncThunk<
  ApiResponse<{ email: string }>,
  SignUpData,
  { rejectValue: string }
>(
  "auth/signUp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(data)
      log.info({ email: data.email }, "Signup OTP sent")
      return response
    } catch (error) {
      const axiosError = error as AxiosError<any>
      const detail = axiosError.response?.data?.detail
      const message =
        (typeof detail === "object" ? detail?.message : detail) ||
        axiosError.response?.data?.message ||
        "Sign up failed"
      log.warn({ email: data.email, message }, "Signup failed")
      return rejectWithValue(message)
    }
  }
)

/**
 * Verify OTP to complete signup
 */
export const verifyOtp = createAsyncThunk<
  ApiResponse<UserData>,
  { email: string; otp: string },
  { rejectValue: string }
>(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOtp(data)
      log.info({ email: data.email }, "OTP verified, user authenticated")
      return response
    } catch (error) {
      const axiosError = error as AxiosError<any>
      const detail = axiosError.response?.data?.detail
      const message =
        (typeof detail === "object" ? detail?.message : detail) ||
        axiosError.response?.data?.message ||
        "Verification failed"
      log.warn({ email: data.email, message }, "OTP verification failed")
      return rejectWithValue(message)
    }
  }
)

/**
 * Sign in with email and password
 */
export const signIn = createAsyncThunk<
  ApiResponse<UserData>,
  SignInData,
  { rejectValue: string }
>(
  "auth/signIn",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(data)
      log.info({ email: data.email }, "User signed in")
      return response
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const message = axiosError.response?.data?.message || "Sign in failed"
      log.warn({ email: data.email, message }, "Sign in failed")
      return rejectWithValue(message)
    }
  }
)

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = createAsyncThunk<
  { redirect_url: string },
  void,
  { rejectValue: string }
>(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getGoogleAuthUrl()
      if (response.data?.redirect_url) {
        log.info("Redirecting to Google OAuth")
        // Redirect to Google OAuth
        window.location.href = response.data.redirect_url
        return response.data
      }
      return rejectWithValue("No redirect URL received")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const message = axiosError.response?.data?.message || "Google sign in failed"
      return rejectWithValue(message)
    }
  }
)

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGithub = createAsyncThunk<
  { redirect_url: string },
  void,
  { rejectValue: string }
>(
  "auth/signInWithGithub",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getGithubAuthUrl()
      if (response.data?.redirect_url) {
        log.info("Redirecting to GitHub OAuth")
        // Redirect to GitHub OAuth
        window.location.href = response.data.redirect_url
        return response.data
      }
      return rejectWithValue("No redirect URL received")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const message = axiosError.response?.data?.message || "GitHub sign in failed"
      return rejectWithValue(message)
    }
  }
)

/**
 * Fetch current user dashboard data
 */
export const fetchDashboard = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: string }
>(
  "auth/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getDashboard()
      return response
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const message = axiosError.response?.data?.message || "Failed to fetch dashboard"
      return rejectWithValue(message)
    }
  }
)

/**
 * Logout — calls backend to clear the httpOnly cookie
 */
export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  "auth/logoutAsync",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      log.info("User logged out")
    } catch (error) {
      log.error("Logout failed")
      return rejectWithValue("Logout failed")
    }
  }
)

// ============================================
// Auth Slice
// ============================================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set authentication after OAuth redirect
     * (cookie is already set by the backend)
     */
    setAuthFromOAuth: (
      state,
      action: PayloadAction<{ user: UserData }>
    ) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      }
    },

    /**
     * Logout user (synchronous state clear)
     */
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
      }
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Check Session
    builder
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.sessionChecked = true
        state.user = action.payload.data || null
        state.isAuthenticated = !!action.payload.data
        state.error = null

        if (action.payload.data && typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.data))
        }
      })
      .addCase(checkSession.rejected, (state) => {
        state.isLoading = false
        state.sessionChecked = true
        state.user = null
        state.isAuthenticated = false

        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
        }
      })

    // Sign Up (sends OTP — does NOT authenticate)
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
        // User is NOT authenticated yet — they need to verify OTP
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Sign up failed"
      })

    // Verify OTP (completes signup and authenticates)
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data || null
        state.isAuthenticated = !!action.payload.data
        state.error = null

        if (action.payload.data && typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.data))
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Verification failed"
      })

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data || null
        state.isAuthenticated = !!action.payload.data
        state.error = null

        if (action.payload.data && typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.data))
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Sign in failed"
      })

    // Google OAuth
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithGoogle.fulfilled, (state) => {
        state.isLoading = true
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Google sign in failed"
      })

    // GitHub OAuth
    builder
      .addCase(signInWithGithub.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithGithub.fulfilled, (state) => {
        state.isLoading = true
      })
      .addCase(signInWithGithub.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "GitHub sign in failed"
      })

    // Fetch Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.data?.user) {
          state.user = action.payload.data.user
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(action.payload.data.user))
          }
        }
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Failed to fetch dashboard"
      })

    // Logout Async
    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
        }
      })
  },
})

export const { setAuthFromOAuth, logout, clearError } = authSlice.actions
export default authSlice.reducer
