"use client"

import { SignUp } from "@/components/auth"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()

  return (
    <SignUp
      onSwitchToSignIn={() => router.push("/auth/login")}
    />
  )
}
