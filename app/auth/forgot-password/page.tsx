"use client"

import { Suspense } from "react"
import { ForgotPassword } from "@/components/auth/forgot-password"

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <ForgotPassword />
    </Suspense>
  )
}
