"use client"

import { Code2, Terminal } from "lucide-react"

const INTEGRATIONS = [
  {
    name: "Node.js",
    icon: Code2,
    description: "Official SDK",
    install: "npm install @logiscout/logger",
  },
  {
    name: "Python",
    icon: Terminal,
    description: "Official SDK",
    install: "pip install logiscout",
  },
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
            One-Line SDKs for Node.js &amp; Python
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Drop our official SDK into your service and start streaming logs in
            under a minute. No agents, no sidecars, no config files.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <code className="block px-3 py-2 rounded-md bg-muted/60 text-xs font-mono text-foreground/80 border border-border">
                {item.install}
              </code>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
