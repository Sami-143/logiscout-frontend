"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Play } from "lucide-react"

export function Hero() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Gradient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 w-full">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Announcement badge */}
          <div
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-default"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Now with AI-Powered Root Cause Analysis
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Resolve Incidents
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Before They Escalate
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            LogiScout streams, indexes, and analyzes your application logs in real time.
            Get AI-powered root cause detection, instant alerts, and actionable insights
            for your Node.js &amp; Python services.
          </p>

          {/* CTA buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/20">
                Start Free — No Card Required
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold gap-2">
                <Play className="w-4 h-4" />
                See How It Works
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <p
            className={`text-sm text-muted-foreground transition-all duration-700 delay-[400ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Trusted by <span className="font-semibold text-foreground">500+</span> engineering teams &bull; 5-minute setup &bull; SOC 2 compliant
          </p>
        </div>

        {/* Terminal preview */}
        <div
          className={`mt-16 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="rounded-xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="text-xs text-muted-foreground ml-3 font-mono">LogiScout — Live Log Stream</span>
            </div>
            {/* Log lines */}
            <div className="p-4 font-mono text-xs sm:text-sm leading-relaxed space-y-1 bg-card text-muted-foreground overflow-x-auto">
              <LogLine time="12:04:31" level="INFO" color="text-blue-400" msg="[api-gateway] GET /api/v1/users → 200 (14ms)" />
              <LogLine time="12:04:32" level="INFO" color="text-blue-400" msg="[payment-svc] POST /charge → 201 (230ms)" />
              <LogLine time="12:04:33" level="WARN" color="text-yellow-400" msg="[auth-svc] Token refresh attempt for expired session user_83fk2" />
              <LogLine time="12:04:33" level="ERROR" color="text-red-400" msg="[payment-svc] Stripe webhook timeout — retrying (attempt 2/3)" />
              <LogLine time="12:04:34" level="INFO" color="text-blue-400" msg="[api-gateway] GET /api/v1/projects → 200 (8ms)" />
              <LogLine time="12:04:35" level="INFO" color="text-green-400" msg="[logiscout-ai] ⚡ Root cause identified: Stripe API rate limit exceeded" />
              <LogLine time="12:04:35" level="INFO" color="text-green-400" msg="[logiscout-ai] 📋 Suggested fix: Implement exponential backoff on webhook handler" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LogLine({ time, level, color, msg }: { time: string; level: string; color: string; msg: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground/60 shrink-0">{time}</span>
      <span className={`font-semibold shrink-0 w-12 ${color}`}>{level}</span>
      <span className="text-foreground/80">{msg}</span>
    </div>
  )
}
