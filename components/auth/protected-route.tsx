"use client"

/**
 * Protected Route Wrapper
 * Redirects to home if user is not authenticated.
 * Session is verified via httpOnly cookie (calls /api/auth/me).
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { checkSession } from "@/lib/store/authSlice"
import { Spinner } from "@/components/ui/spinner"
import { createLogger } from "@/lib/logger"

const log = createLogger("ProtectedRoute")

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, sessionChecked } = useAppSelector((state) => state.auth)

  // Verify session from cookie on mount
  useEffect(() => {
    if (!sessionChecked) {
      dispatch(checkSession())
    }
  }, [sessionChecked, dispatch])

  // Redirect unauthenticated users after session check completes
  useEffect(() => {
    if (sessionChecked && !isLoading && !isAuthenticated) {
      log.info("Unauthenticated user redirected to home")
      router.push("/")
    }
  }, [isAuthenticated, isLoading, sessionChecked, router])

  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
