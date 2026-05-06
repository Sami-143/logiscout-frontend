"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lock, Shield, AlertTriangle, Loader2, KeyRound } from "lucide-react"
import { useAppSelector } from "@/lib/store/hooks"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("UserSettings")

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (password.length === 0) return { level: 0, label: "", color: "" }
    if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-500" }
    if (password.length < 10) return { level: 2, label: "Fair", color: "bg-yellow-500" }
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password))
      return { level: 4, label: "Strong", color: "bg-green-500" }
    return { level: 3, label: "Good", color: "bg-blue-500" }
  }, [password])

  if (password.length === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength.level ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{strength.label}</span>
      </p>
    </div>
  )
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete: string
  autoFocus?: boolean
  children?: React.ReactNode
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pl-10 pr-10"
          required
          minLength={6}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {children}
    </div>
  )
}

export function UserSettings() {
  const { user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isOAuthUser = user?.provider !== "email"

  const canSubmit =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    currentPassword !== newPassword &&
    !isLoading

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentPassword === newPassword) {
      toast({
        title: "Validation error",
        description: "New password must be different from the current password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    log.info("Password update requested")

    try {
      const res = await authAPI.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (res.success) {
        log.info("Password updated successfully")
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully.",
        })
        resetForm()
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const message =
        detail?.message || err?.response?.data?.message || "Failed to update password"
      log.error({ status: err?.response?.status }, "Password update failed")
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account security and preferences
        </p>
      </div>

      <Separator />

      {/* Account Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{user?.name || "User"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {user?.provider || "email"} account
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Update Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Update Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isOAuthUser ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Password change not available
                </p>
                <p className="text-sm text-muted-foreground">
                  Your account uses{" "}
                  <span className="font-medium capitalize">{user?.provider}</span>{" "}
                  authentication. Password management is handled by your OAuth provider.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                id="current-password"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter your current password"
                autoComplete="current-password"
                autoFocus
              />

              <Separator />

              <PasswordInput
                id="new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter a new password"
                autoComplete="new-password"
              >
                <PasswordStrengthBar password={newPassword} />
                {newPassword.length > 0 && currentPassword === newPassword && (
                  <p className="text-xs text-destructive">
                    New password must be different from the current password
                  </p>
                )}
              </PasswordInput>

              <PasswordInput
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              >
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </PasswordInput>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After updating your password, your current session will remain active.
                  Use a strong, unique password that you don&apos;t use on other sites.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={!canSubmit} className="gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
