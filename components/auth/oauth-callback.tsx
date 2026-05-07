"use client"

/**
 * OAuth Callback Handler
 * Handles OAuth redirect callbacks from Google and GitHub.
 * Reads the one-time JWT from the query string, exchanges it for an
 * httpOnly cookie session via XHR, clears the URL, and redirects.
 */

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/lib/store/hooks"
import { setAuthFromOAuth } from "@/lib/store/authSlice"
import { authAPI } from "@/lib/api"
import { notify } from "@/lib/notify"
import { Spinner } from "@/components/ui/spinner"
import { createLogger } from "@/lib/logger"

const log = createLogger("OAuthCallback")

export function OAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const handled = useRef(false)

  useEffect(() => {
    // Prevent double-execution in React StrictMode
    if (handled.current) return
    handled.current = true

    const provider = searchParams.get("provider")
    const error = searchParams.get("error")
    const token = searchParams.get("token")

    // Clear token from the URL immediately for security
    if (token && typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("token")
      window.history.replaceState(null, "", url.pathname + url.search)
    }

    if (error) {
      log.warn({ provider, error }, "OAuth callback error")
      notify.error("Sign-in failed", `Failed to sign in with ${provider}: ${error}`)
      router.push("/")
      return
    }

    if (!token) {
      log.warn({ provider }, "No token in OAuth callback")
      notify.error("Sign-in failed", "No authentication token received. Please try again.")
      router.push("/")
      return
    }

    // Exchange the JWT for an httpOnly cookie session via XHR
    authAPI
      .exchangeSession(token)
      .then((response) => {
        if (response.success && response.data) {
          dispatch(setAuthFromOAuth({ user: response.data }))
          log.info({ provider }, "OAuth sign-in successful")
          notify.success("Signed in", `Welcome back via ${provider}.`)
          router.push("/dashboard")
        } else {
          log.warn({ provider }, "Session exchange returned no data")
          router.push("/")
        }
      })
      .catch(() => {
        log.warn({ provider }, "Session exchange failed")
        notify.error("Sign-in failed", "Failed to complete sign in. Please try again.")
        router.push("/")
      })
  }, [searchParams, dispatch, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="w-12 h-12 mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
