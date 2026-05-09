"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Play } from "lucide-react"
import { FadeIn } from "./animations"

export function Hero() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="hero"
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-20"
    >
      {/* Layered gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-[-10%] h-[700px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
          animate={prefersReducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]"
          animate={prefersReducedMotion ? undefined : { opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:40px_40px] opacity-[0.04] dark:opacity-[0.06]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <FadeIn direction="up" delay={0}>
            <Badge
              variant="outline"
              className="cursor-default border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Now with AI-Powered Root Cause Analysis
            </Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Resolve Incidents
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Before They Escalate
              </span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              LogiScout streams, indexes, and analyzes your application logs in real time.
              Get AI-powered root cause detection, instant alerts, and actionable insights
              for your Node.js &amp; Python services.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/25">
                  Start Free — No Card Required
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  See How It Works
                </Button>
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.4}>
            <p className="text-sm text-muted-foreground">
              Free to start &bull; 5-minute setup &bull; Node.js &amp; Python SDKs
            </p>
          </FadeIn>
        </div>

        <FadeIn direction="up" delay={0.5} distance={36} className="mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 ring-1 ring-white/5">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" aria-hidden="true" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                logiscout — live log stream (demo)
              </span>
            </div>
            <div className="overflow-x-auto bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <LogLine time="12:04:31" level="INFO" color="text-blue-400" msg="[api-gateway] GET /api/v1/users → 200 (14ms)" />
              <LogLine time="12:04:32" level="INFO" color="text-blue-400" msg="[payment-svc] POST /charge → 201 (230ms)" />
              <LogLine time="12:04:33" level="WARN" color="text-yellow-400" msg="[auth-svc] Token refresh attempt for expired session user_83fk2" />
              <LogLine time="12:04:33" level="ERROR" color="text-red-400" msg="[payment-svc] Stripe webhook timeout — retrying (attempt 2/3)" />
              <LogLine time="12:04:34" level="INFO" color="text-blue-400" msg="[api-gateway] GET /api/v1/projects → 200 (8ms)" />
              <LogLine time="12:04:35" level="INFO" color="text-emerald-400" msg="[logiscout-ai] Root cause: Stripe API rate limit exceeded" />
              <LogLine time="12:04:35" level="INFO" color="text-emerald-400" msg="[logiscout-ai] Suggested fix: exponential backoff on webhook handler" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function LogLine({ time, level, color, msg }: { time: string; level: string; color: string; msg: string }) {
  return (
    <div className="flex gap-3 py-0.5">
      <span className="shrink-0 text-muted-foreground/60">{time}</span>
      <span className={`w-12 shrink-0 font-semibold ${color}`}>{level}</span>
      <span className="text-foreground/80">{msg}</span>
    </div>
  )
}
