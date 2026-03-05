"use client"

/**
 * OAuth Callback Page
 * Handles OAuth redirects from Google and GitHub
 */

import { Suspense } from "react"
import { OAuthCallback } from "@/components/auth/oauth-callback"
import { Spinner } from "@/components/ui/spinner"

export default function CallbackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Spinner className="w-12 h-12 mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  )
}
