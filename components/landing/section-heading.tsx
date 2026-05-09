"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { FadeIn } from "./animations"

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: "left" | "center"
  className?: string
}

/**
 * Shared eyebrow + headline + lede pattern used across every landing section.
 * Keeping a single component ensures consistent vertical rhythm and styling.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left"

  return (
    <FadeIn
      direction="up"
      className={cn("flex flex-col gap-4 max-w-3xl", align === "center" && "mx-auto", alignment, className)}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      )}
    </FadeIn>
  )
}
