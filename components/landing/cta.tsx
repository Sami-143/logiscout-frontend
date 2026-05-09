"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, BookOpen } from "lucide-react"
import { FadeIn } from "./animations"

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/12" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:40px_40px] opacity-[0.04]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <FadeIn direction="up">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30">
            <Zap className="h-8 w-8" aria-hidden="true" />
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <h2 className="text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Ship faster, debug calmer.
          </h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Drop in our Node.js or Python SDK and have structured, correlated logs
            streaming in five minutes. Free while we build — no card, no commitment.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/25">
                Start Free — No Card Required
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/dashboard?view=docs">
              <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Read the docs
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
