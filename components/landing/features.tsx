"use client"

import { Card } from "@/components/ui/card"
import {
  Activity,
  Brain,
  Bell,
  Shield,
  Gauge,
  Code2,
} from "lucide-react"

const FEATURES = [
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
      "Automatically detect anomalies, correlate across services, and pinpoint the root cause with AI — before your users notice.",
  },
  {
    icon: Bell,
    title: "Smart Alerting",
    description:
      "Set threshold-based and anomaly-based alerts. Get notified on Slack, PagerDuty, email, or webhooks within seconds.",
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
      "Customizable dashboards with error rates, latency percentiles, and deployment correlations — zero config.",
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
    <section id="features" className="py-24 sm:py-32 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Stay On Top of Incidents
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From log ingestion to AI-powered resolution — LogiScout replaces your entire
            observability and incident stack.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="group p-6 border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
