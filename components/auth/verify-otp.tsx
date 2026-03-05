"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Zap, ArrowLeft, Mail, RotateCw } from "lucide-react"
import { useAppDispatch } from "@/lib/store/hooks"
import { verifyOtp } from "@/lib/store/authSlice"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("VerifyOTP")

export function VerifyOTP() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const email = searchParams.get("email") || ""

  // Redirect to home if no email in URL
  useEffect(() => {
    if (!email) {
      router.push("/")
    }
  }, [email, router])

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Start with a 30s cooldown (OTP was just sent)
  useEffect(() => {
    setCooldown(30)
  }, [])

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length !== 6) return
      setIsVerifying(true)
      try {
        const result = await dispatch(verifyOtp({ email, otp: code })).unwrap()
        log.info({ email }, "OTP verified successfully")
        toast({
          title: "Account Created",
          description: result.message || "Your email has been verified!",
        })
        router.push("/dashboard")
      } catch (err: any) {
        log.warn({ email }, "OTP verification failed")
        toast({
          title: "Verification Failed",
          description: err || "Invalid or expired code",
          variant: "destructive",
        })
        setOtp("")
      } finally {
        setIsVerifying(false)
      }
    },
    [dispatch, email, router, toast],
  )

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp)
    }
  }, [otp, handleVerify])

  const handleResend = async () => {
    setIsResending(true)
    try {
      const res = await authAPI.resendOtp(email)
      log.info({ email }, "OTP resent")
      toast({
        title: "Code Resent",
        description: res.message || "A new code has been sent to your email",
      })
      setCooldown(30)
      setOtp("")
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (!email) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">LogiScout</span>
          </div>

          <div className="space-y-8 max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-balance">
              Almost There!
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed text-pretty">
              We sent a verification code to your email. Enter it below to activate your account and start resolving incidents faster.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/50">
            Trusted by 500+ engineering teams worldwide
          </p>
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Right panel — OTP form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">LogiScout</span>
          </div>

          <button
            onClick={() => router.push("/auth/signup")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign up
          </button>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Verify your email</h2>
            <p className="text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {/* OTP icon */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* OTP input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify button */}
          <Button
            className="w-full h-11"
            disabled={otp.length !== 6 || isVerifying}
            onClick={() => handleVerify(otp)}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Verifying...
              </span>
            ) : (
              "Verify & Create Account"
            )}
          </Button>

          {/* Resend */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="ghost"
              size="sm"
              disabled={cooldown > 0 || isResending}
              onClick={handleResend}
              className="gap-2"
            >
              <RotateCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : isResending
                  ? "Sending..."
                  : "Resend code"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
