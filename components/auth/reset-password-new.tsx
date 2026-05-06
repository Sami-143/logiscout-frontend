"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Eye, EyeOff, ArrowRight, ArrowLeft, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { createLogger } from "@/lib/logger"

const log = createLogger("ResetPasswordNew")

export function ResetPasswordNew() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const resetToken = searchParams.get("resetToken") || ""
  const { toast } = useToast()

  const passwordStrength = useMemo(() => {
    if (newPassword.length === 0) return { level: 0, label: "", color: "" }
    if (newPassword.length < 6) return { level: 1, label: "Weak", color: "bg-red-500" }
    if (newPassword.length < 10) return { level: 2, label: "Fair", color: "bg-yellow-500" }
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword)) return { level: 4, label: "Strong", color: "bg-green-500" }
    return { level: 3, label: "Good", color: "bg-blue-500" }
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (resetToken.length !== 6) {
      toast({
        title: "Missing code",
        description: "Reset code is missing. Please complete the OTP step again.",
        variant: "destructive",
      })
      router.push(`/auth/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`)
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      await authAPI.resetPassword({ resetToken, newPassword, confirmPassword })
      log.info({ email }, "Password reset successful")
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully. Please sign in.",
      })
      router.push("/auth/login")
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const message = detail?.message || err?.response?.data?.message || "Something went wrong"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-4xl font-bold leading-tight text-balance">Set a New Password</h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed text-pretty">
              Choose a new password and confirm it to finish resetting your account.
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
            <h2 className="text-3xl font-bold text-foreground">Create new password</h2>
            <p className="text-muted-foreground">
              {email ? (
                <>
                  Resetting password for <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "Enter your new password below"
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Paste or type your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 pl-10 pr-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.level ? passwordStrength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className="font-medium text-foreground">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Paste or re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-2"
              disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Resetting password...
                </span>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <button
            onClick={() => router.push(`/auth/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to code entry
          </button>
        </div>
      </div>
    </div>
  )
}