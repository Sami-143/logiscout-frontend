/**
 * API Service
 * Handles all HTTP requests to the backend.
 * Auth tokens are stored in httpOnly cookies (managed by the backend).
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { createLogger } from "@/lib/logger"

const log = createLogger("api")

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with every request
})

// Request interceptor — log outgoing calls
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  log.debug({ method: config.method?.toUpperCase(), url: config.url }, "API request")
  return config
})

// Response interceptor to handle errors and log
api.interceptors.response.use(
  (response) => {
    log.debug(
      { method: response.config.method?.toUpperCase(), url: response.config.url, status: response.status },
      "API response"
    )
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url
    log.error({ status, url, message: error.message }, "API error")

    // Handle 401 Unauthorized — redirect to login
    if (status === 401) {
      // Only redirect if not already on the home/login page
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        log.warn("Session expired, redirecting to login")
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  token?: string
}

export interface UserData {
  id: string
  name: string
  email: string
  provider: string
  provider_id?: string
  company?: string
  role?: string
  team_size?: string
  use_case?: string
  industry?: string
  notification_preferences?: string[]
  onboarding_completed?: boolean
  created_at: string
}

export interface DashboardData {
  user: UserData
  stats: {
    total_logs: number
    active_incidents: number
    resolved_today: number
    avg_resolution_time: string
    logs_by_level?: {
      info: number
      warning: number
      error: number
      critical: number
    }
    recent_incidents?: Array<{
      id: string
      title: string
      status: string
      severity: string
      created_at: string
    }>
    system_health?: {
      api_server: string
      database: string
      cache: string
      queue: string
    }
  }
}

// ============================================
// Auth API
// ============================================

export const authAPI = {
  /**
   * Sign up with email and password (sends OTP, does NOT authenticate yet)
   */
  signup: async (data: {
    name: string
    email: string
    password: string
    company?: string
  }): Promise<ApiResponse<{ email: string }>> => {
    const response = await api.post("/api/auth/signup", data)
    return response.data
  },

  /**
   * Sign in with email and password
   */
  login: async (data: {
    email: string
    password: string
  }): Promise<ApiResponse<UserData>> => {
    const response = await api.post("/api/auth/login", data)
    return response.data
  },

  /**
   * Get Google OAuth redirect URL
   */
  getGoogleAuthUrl: async (): Promise<ApiResponse<{ redirect_url: string }>> => {
    const response = await api.get("/api/auth/google")
    return response.data
  },

  /**
   * Get GitHub OAuth redirect URL
   */
  getGithubAuthUrl: async (): Promise<ApiResponse<{ redirect_url: string }>> => {
    const response = await api.get("/api/auth/github")
    return response.data
  },

  /**
   * Exchange OAuth code for token (for client-side OAuth flow)
   */
  exchangeGoogleCode: async (code: string): Promise<ApiResponse<UserData>> => {
    const response = await api.post("/api/auth/google/token", { code })
    return response.data
  },

  /**
   * Exchange GitHub code for token (for client-side OAuth flow)
   */
  exchangeGithubCode: async (code: string): Promise<ApiResponse<UserData>> => {
    const response = await api.post("/api/auth/github/token", { code })
    return response.data
  },

  /**
   * Get current user info (validates cookie session)
   */
  getCurrentUser: async (): Promise<ApiResponse<UserData>> => {
    const response = await api.get("/api/auth/me")
    return response.data
  },

  /**
   * Logout (clears httpOnly cookie on the server)
   */
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post("/api/auth/logout")
    return response.data
  },

  /**
   * Verify OTP code to complete signup
   */
  verifyOtp: async (data: {
    email: string
    otp: string
  }): Promise<ApiResponse<UserData>> => {
    const response = await api.post("/api/auth/verify-otp", data)
    return response.data
  },

  /**
   * Resend OTP code
   */
  resendOtp: async (email: string): Promise<ApiResponse> => {
    const response = await api.post("/api/auth/resend-otp", { email })
    return response.data
  },

  /**
   * Exchange a JWT (from OAuth redirect fragment) for an httpOnly cookie session
   */
  exchangeSession: async (token: string): Promise<ApiResponse<UserData>> => {
    const response = await api.post("/api/auth/session", { token })
    return response.data
  },
}

// ============================================
// Onboarding API
// ============================================

export interface OnboardingData {
  company?: string
  role?: string
  team_size?: string
  use_case?: string
  industry?: string
  notification_preferences?: string[]
  project_name?: string
  project_description?: string
  invited_emails?: string[]
}

export interface OnboardingResponse {
  user: UserData
  project?: { id: string; name: string } | null
  token?: { id: string; token: string } | null
}

export const onboardingAPI = {
  /** Complete the onboarding wizard */
  complete: async (data: OnboardingData): Promise<ApiResponse<OnboardingResponse>> => {
    const response = await api.post("/api/auth/onboarding", data)
    return response.data
  },
}

// ============================================
// Dashboard API
// ============================================

export const dashboardAPI = {
  /**
   * Get dashboard data (requires authentication)
   */
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get("/api/dashboard")
    return response.data
  },

  /**
   * Get user profile (requires authentication)
   */
  getProfile: async (): Promise<ApiResponse<UserData>> => {
    const response = await api.get("/api/profile")
    return response.data
  },
}

// ============================================
// Project API Types
// ============================================

export interface ProjectData {
  id: string
  name: string
  description: string
  language: "python" | "nodejs"
  owner_id: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
  token_count: number
  webhook_base_url: string | null
}

export interface TokenData {
  id: string
  project_id: string
  label: string
  token_masked: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

export interface TokenCreatedData extends TokenData {
  token: string // Full plain-text token — shown ONLY at creation
}

// ============================================
// Project API
// ============================================

export const projectAPI = {
  /** Create a new project */
  create: async (data: {
    name: string
    description?: string
    language?: "python" | "nodejs"
  }): Promise<ApiResponse<ProjectData>> => {
    const response = await api.post("/api/projects", data)
    return response.data
  },

  /** List all projects for the current user */
  list: async (): Promise<ApiResponse<ProjectData[]>> => {
    const response = await api.get("/api/projects")
    return response.data
  },

  /** Get a single project */
  get: async (projectId: string): Promise<ApiResponse<ProjectData>> => {
    const response = await api.get(`/api/projects/${projectId}`)
    return response.data
  },

  /** Update a project */
  update: async (
    projectId: string,
    data: { name?: string; description?: string; status?: string; webhook_base_url?: string }
  ): Promise<ApiResponse<ProjectData>> => {
    const response = await api.patch(`/api/projects/${projectId}`, data)
    return response.data
  },

  /** Delete a project and all its tokens */
  delete: async (projectId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/api/projects/${projectId}`)
    return response.data
  },

  // Token Management
  /** Generate a new API token */
  createToken: async (
    projectId: string,
    data: { label?: string }
  ): Promise<ApiResponse<TokenCreatedData>> => {
    const response = await api.post(`/api/projects/${projectId}/tokens`, data)
    return response.data
  },

  /** List all tokens (masked) */
  listTokens: async (
    projectId: string
  ): Promise<ApiResponse<TokenData[]>> => {
    const response = await api.get(`/api/projects/${projectId}/tokens`)
    return response.data
  },

  /** Revoke a token */
  deleteToken: async (
    projectId: string,
    tokenId: string
  ): Promise<ApiResponse> => {
    const response = await api.delete(
      `/api/projects/${projectId}/tokens/${tokenId}`
    )
    return response.data
  },

  /** Disable a token (must disable before generating a new one) */
  disableToken: async (
    projectId: string,
    tokenId: string
  ): Promise<ApiResponse> => {
    const response = await api.patch(
      `/api/projects/${projectId}/tokens/${tokenId}/disable`
    )
    return response.data
  },
}

// ============================================
// Utility API
// ============================================

export const utilityAPI = {
  /**
   * Health check
   */
  healthCheck: async (): Promise<ApiResponse> => {
    const response = await api.get("/api/health")
    return response.data
  },
}

export default api
