"use client"

import { Code2, Terminal, Github, MessageSquare, Webhook, Cloud } from "lucide-react"

const INTEGRATIONS = [
  { name: "Node.js", icon: Code2, description: "Official SDK" },
  { name: "Python", icon: Terminal, description: "Official SDK" },
  { name: "GitHub", icon: Github, description: "Deployments" },
  { name: "Slack", icon: MessageSquare, description: "Alerts" },
  { name: "Webhooks", icon: Webhook, description: "Custom" },
  { name: "AWS / GCP", icon: Cloud, description: "Cloud logs" },
]

export function Integrations() {
  return (
    <section id="integrations" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Integrations
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Fits Into Your Existing Stack
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            First-class SDKs for Python &amp; Node.js, plus webhooks and integrations for
            the tools you already use.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
