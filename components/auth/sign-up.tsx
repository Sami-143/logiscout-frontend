"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Eye, EyeOff, ArrowRight, Github, Mail, User, Building2, CheckCircle2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { signUp, signInWithGoogle, signInWithGithub, clearError } from "@/lib/store/authSlice"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("SignUp")

interface SignUpProps {
  onSignUp?: () => void
  onSwitchToSignIn: () => void
}

export function SignUp({ onSignUp, onSwitchToSignIn }: SignUpProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword]= useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  // Clear error on component mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (onSignUp) {
        onSignUp()
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, onSignUp, router])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, label: "", color: "" }
    if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-500" }
    if (password.length < 10) return { level: 2, label: "Fair", color: "bg-yellow-500" }
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) return { level: 4, label: "Strong", color: "bg-green-500" }
    return { level: 3, label: "Good", color: "bg-blue-500" }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }
    const result = await dispatch(signUp({ 
      name: fullName, 
      email, 
      password,
      company: company || undefined
    }))

    // On successful OTP send, redirect to verification page
    if (signUp.fulfilled.match(result)) {
      log.info({ email }, "Signup submitted, redirecting to OTP")
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
    }
  }

  const handleGoogleSignUp = async () => {
    log.info("Google sign-up initiated")
    await dispatch(signInWithGoogle())
  }

  const handleGithubSignUp = async () => {
    log.info("GitHub sign-up initiated")
    await dispatch(signInWithGithub())
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

          <div className="space-y-8 max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-balance">
              Start Resolving Incidents Faster Today
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed text-pretty">
              Join hundreds of engineering teams already using LogiScout to monitor, detect, and resolve incidents with AI assistance.
            </p>

            <div className="space-y-5 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/15 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Free 14-Day Trial</h3>
                  <p className="text-sm text-primary-foreground/70 mt-0.5">No credit card required. Full access to all features.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/15 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">5-Minute Setup</h3>
                  <p className="text-sm text-primary-foreground/70 mt-0.5">Install the library, add your API key, and start monitoring.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/15 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Node.js and Python Support</h3>
                  <p className="text-sm text-primary-foreground/70 mt-0.5">Lightweight libraries for your existing stack.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/50">
            Trusted by 500+ engineering teams worldwide
          </p>
        </div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">LogiScout</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground">Get started with LogiScout in minutes</p>
          </div>

          {/* Social signup buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button"
              variant="outline" 
              className="h-11 gap-2 bg-transparent"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="h-11 gap-2 bg-transparent"
              onClick={handleGithubSignUp}
              disabled={isLoading}
            >
              <Github className="w-5 h-5" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or sign up with email
            </span>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-company"
                    type="text"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
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

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed font-normal cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading || !agreeTerms}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onSwitchToSignIn} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
