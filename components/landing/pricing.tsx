"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Check, ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    name: "Starter",
    description: "For small teams getting started with log monitoring.",
    price: "Free",
    period: "",
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
    cta: "Get Started Free",
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
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For organizations with custom compliance and scale needs.",
    price: "Custom",
    period: "",
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
    cta: "Contact Sales",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start free, upgrade as you grow. No surprise bills, no per-seat gotchas.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 border-border bg-card transition-all",
                plan.highlight && "border-primary shadow-xl shadow-primary/10 scale-[1.02] z-10",
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {plan.badge}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup">
                <Button
                  className={cn(
                    "w-full gap-2",
                    plan.highlight
                      ? ""
                      : "variant-outline",
                  )}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
