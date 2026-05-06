"use client"

import { Suspense } from "react"
import { ResetPasswordNew } from "@/components/auth/reset-password-new"

export default function ResetPasswordNewPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <ResetPasswordNew />
    </Suspense>
  )
}