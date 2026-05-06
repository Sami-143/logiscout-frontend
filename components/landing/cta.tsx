"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-2 shadow-lg shadow-primary/20">
          <Zap className="w-8 h-8" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Ready to Tame Your Logs?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Spin up a project, drop in our Node.js or Python SDK, and watch your
          logs stream in. Free while in beta — no card, no commitment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/20">
              Start Free — No Card Required
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
