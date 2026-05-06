"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowRight, ArrowLeft, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("ResetPassword")

export function ResetPassword() {
  const [resetToken, setResetToken] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (resetToken.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit reset code.",
        variant: "destructive",
      })
      return
    }

    const query = new URLSearchParams({ email, resetToken }).toString()
    log.info({ email }, "Reset OTP entered, moving to new-password step")
    router.push(`/auth/reset-password/new-password?${query}`)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">LogiScout</span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-balance">Verify Reset Code</h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed text-pretty">
              Enter the 6-digit code from your email to continue to the new password step.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/50">Trusted by 500+ engineering teams worldwide</p>
        </div>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">LogiScout</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Enter reset code</h2>
            <p className="text-muted-foreground">
              {email ? (
                <>
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "Enter the 6-digit code from your email"
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-code">Reset code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-code"
                  name="one-time-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Paste or type 6-digit code"
                  value={resetToken}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setResetToken(v)
                  }}
                  className="h-11 pl-10 tracking-[0.3em] text-center font-mono text-lg"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={resetToken.length !== 6}>
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            </Button>
          </form>

          <button
            onClick={() => router.push("/auth/login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}
