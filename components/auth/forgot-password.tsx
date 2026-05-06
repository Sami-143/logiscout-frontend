"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { createLogger } from "@/lib/logger"

const log = createLogger("ForgotPassword")

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await authAPI.forgotPassword(email)
      log.info({ email }, "Forgot password request sent")
      toast({
        title: "Check your email",
        description: res.message || "If that email is registered, a reset code has been sent.",
      })
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const message = err?.response?.data?.detail?.message || err?.response?.data?.message || "Something went wrong"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
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
            <h1 className="text-4xl font-bold leading-tight text-balance">
              Reset Your Password
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed text-pretty">
              No worries — it happens to the best of us. Enter your email and we'll send you a code to reset your password.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/50">
            Trusted by 500+ engineering teams worldwide
          </p>
        </div>

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">LogiScout</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Forgot password?</h2>
            <p className="text-muted-foreground">
              Enter the email address associated with your account and we'll send you a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Sending code...
                </span>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
