"use client"

import { Card } from "@/components/ui/card"
import {
  Activity,
  Brain,
  Bell,
  Shield,
  Gauge,
  Code2,
  type LucideIcon,
} from "lucide-react"
import { SectionHeading } from "./section-heading"
import { StaggerContainer, StaggerItem } from "./animations"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Activity,
    title: "Real-Time Log Streaming",
    description:
      "Ingest and stream logs from Node.js and Python services with sub-second latency. Filter, search, and tail live output.",
  },
  {
    icon: Brain,
    title: "AI Root Cause Analysis",
    description:
      "Detect anomalies, correlate across services, and pinpoint the root cause with AI — before your users notice.",
  },
  {
    icon: Bell,
    title: "Smart Alerting",
    description:
      "Threshold and anomaly-based alerts delivered to Slack, PagerDuty, email, or webhooks within seconds.",
  },
  {
    icon: Shield,
    title: "Incident Management",
    description:
      "Track, assign, and resolve incidents collaboratively. Post-mortems and SLA tracking built right in.",
  },
  {
    icon: Gauge,
    title: "Dashboards & Analytics",
    description:
      "Customisable dashboards with error rates, latency percentiles, and deployment correlations — zero config.",
  },
  {
    icon: Code2,
    title: "Developer-First SDKs",
    description:
      "One-line integration for Python and Node.js. Structured logging, context propagation, and auto-instrumentation included.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to stay on top of incidents"
          subtitle="From log ingestion to AI-powered resolution — LogiScout replaces your entire observability and incident stack."
          className="mb-16"
        />

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" amount={0.15}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card className="group relative h-full overflow-hidden border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
