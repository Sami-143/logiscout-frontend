"use client"

/**
 * OAuth Callback Handler
 * Handles OAuth redirect callbacks from Google and GitHub
 */

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/lib/store/hooks"
import { checkSession } from "@/lib/store/authSlice"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { createLogger } from "@/lib/logger"

const log = createLogger("OAuthCallback")

export function OAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  useEffect(() => {
    const provider = searchParams.get("provider")
    const error = searchParams.get("error")

    if (error) {
      log.warn({ provider, error }, "OAuth callback error")
      toast({
        title: "Authentication Error",
        description: `Failed to sign in with ${provider}: ${error}`,
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Cookie-based flow: backend sets httpOnly cookie on OAuth redirect.
    // Verify session with the backend and update Redux state.
    dispatch(checkSession())
      .unwrap()
      .then(() => {
        log.info({ provider }, "OAuth sign-in successful")
        toast({
          title: "Signed in",
          description: `Successfully signed in with ${provider}`,
        })
        router.push("/dashboard")
      })
      .catch(() => {
        log.warn({ provider }, "OAuth session check failed")
        // No active session — go home
        router.push("/")
      })
  }, [searchParams, dispatch, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="w-12 h-12 mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
