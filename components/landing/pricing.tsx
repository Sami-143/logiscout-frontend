"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Check, ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./section-heading"
import { StaggerContainer, StaggerItem } from "./animations"

interface Plan {
  name: string
  description: string
  price: string
  period?: string
  highlight: boolean
  badge?: string | null
  features: string[]
  cta: string
  href: string
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    description: "For small teams getting started with log monitoring.",
    price: "Free",
    highlight: false,
    badge: null,
    features: [
      "1 project",
      "500 MB log ingestion / day",
      "7-day retention",
      "2 team members",
      "Community support",
      "Basic alerting",
    ],
    cta: "Get started free",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    description: "For growing teams that need AI insights and longer retention.",
    price: "$49",
    period: "/mo",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "10 GB log ingestion / day",
      "30-day retention",
      "10 team members",
      "AI root cause analysis",
      "Slack & webhook alerts",
      "Priority support",
      "Custom dashboards",
    ],
    cta: "Start free trial",
    href: "/auth/signup",
  },
  {
    name: "Enterprise",
    description: "For organisations with custom compliance and scale needs.",
    price: "Custom",
    highlight: false,
    badge: null,
    features: [
      "Unlimited everything",
      "Custom log retention",
      "SSO / SAML",
      "Dedicated support engineer",
      "SLA guarantees",
      "On-prem option",
      "Audit logs",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "mailto:hello@logiscout.dev",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Start free, upgrade as you grow. No surprise bills, no per-seat gotchas."
          className="mb-16"
        />

        <StaggerContainer
          className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8"
          staggerChildren={0.12}
          amount={0.15}
        >
          {PLANS.map((plan) => (
            <StaggerItem
              key={plan.name}
              className={cn("flex", plan.highlight && "md:-translate-y-2")}
            >
              <Card
                className={cn(
                  "relative flex h-full w-full flex-col border-border bg-card p-8 transition-all hover:shadow-md",
                  plan.highlight && "border-primary/60 bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/15 ring-1 ring-primary/20",
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent px-3 py-0.5 text-xs text-primary-foreground shadow-lg shadow-primary/25">
                    <Zap className="mr-1 h-3 w-3" aria-hidden="true" />
                    {plan.badge}
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.highlight ? "bg-primary/15 text-primary" : "text-primary",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="mt-auto">
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
