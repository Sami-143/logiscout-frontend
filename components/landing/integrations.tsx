"use client"

import { useState } from "react"
import { Code2, Terminal, Check, Copy, type LucideIcon } from "lucide-react"
import { notify } from "@/lib/notify"
import { SectionHeading } from "./section-heading"
import { StaggerContainer, StaggerItem } from "./animations"

interface Integration {
  name: string
  icon: LucideIcon
  description: string
  install: string
}

const INTEGRATIONS: Integration[] = [
  {
    name: "Node.js",
    icon: Code2,
    description: "Official SDK · TypeScript-first",
    install: "npm install logiscout",
  },
  {
    name: "Python",
    icon: Terminal,
    description: "Official SDK · async ready",
    install: "pip install logiscout",
  },
]

export function Integrations() {
  return (
    <section id="integrations" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Integrations"
          title="One-line SDKs for Node.js & Python"
          subtitle="Drop our official SDK into your service and start streaming logs in under a minute. No agents, no sidecars, no config files."
          className="mb-16"
        />

        <StaggerContainer
          className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2"
          amount={0.2}
        >
          {INTEGRATIONS.map((item) => (
            <StaggerItem key={item.name}>
              <IntegrationCard integration={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          More languages coming soon. Need one specific?{" "}
          <a href="mailto:hello@logiscout.dev" className="font-medium text-primary hover:underline">
            Tell us what you need
          </a>
          .
        </p>
      </div>
    </section>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(integration.install)
      setCopied(true)
      notify.success("Copied", `${integration.name} install command copied.`)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      notify.error("Couldn't copy", "Your browser blocked the clipboard write.")
    }
  }

  return (
    <div className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <integration.icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{integration.name}</p>
          <p className="text-xs text-muted-foreground">{integration.description}</p>
        </div>
      </div>
      <div className="relative">
        <code className="block rounded-md border border-border bg-muted/60 px-3 py-2 pr-10 font-mono text-xs text-foreground/80">
          {integration.install}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : `Copy ${integration.name} install command`}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
