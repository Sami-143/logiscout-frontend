"use client"

import { Suspense } from "react"
import { VerifyOTP } from "@/components/auth/verify-otp"

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTP />
    </Suspense>
  )
}
