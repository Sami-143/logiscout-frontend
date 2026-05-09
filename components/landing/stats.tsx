"use client"

import { type ReactNode } from "react"
import { AnimatedCounter, StaggerContainer, StaggerItem } from "./animations"

interface Stat {
  /** Numeric value for the counter. Use 0 if not numeric. */
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  /** Render this instead of the counter for fully non-numeric stats. */
  staticContent?: ReactNode
  label: string
}

const STATS: Stat[] = [
  { value: 2, suffix: "", label: "Official SDKs" },
  { value: 1, prefix: "<", suffix: "s", label: "Ingest Latency" },
  { value: 5, suffix: " min", label: "Time to First Log" },
  { value: 0, staticContent: "Free", label: "to Start" },
]

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12" amount={0.3}>
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <p className="mb-1 bg-gradient-to-br from-primary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                {stat.staticContent ? (
                  stat.staticContent
                ) : (
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                )}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
