"use client"

import { SignIn } from "@/components/auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  return (
    <SignIn
      onSwitchToSignUp={() => router.push("/auth/signup")}
    />
  )
}
