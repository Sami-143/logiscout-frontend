"use client"

import { useState } from "react"
import { Code2, Zap, BarChart3, ArrowDown, Check, Copy, type LucideIcon } from "lucide-react"
import { notify } from "@/lib/notify"
import { SectionHeading } from "./section-heading"
import { StaggerContainer, StaggerItem } from "./animations"

interface Step {
  step: number
  icon: LucideIcon
  title: string
  description: string
  code: string
  language: string
}

const STEPS: Step[] = [
  {
    step: 1,
    icon: Code2,
    title: "Install the SDK",
    description:
      "Add the LogiScout logger to your Python or Node.js app with one command. No code changes needed.",
    code: `pip install logiscout
# or
npm install logiscout`,
    language: "bash",
  },
  {
    step: 2,
    icon: Zap,
    title: "Connect & Stream",
    description:
      "Pass your API token and logs start flowing in real time. Auto-detect errors, warnings, and patterns.",
    code: `from logiscout import init_logiscout, create_logger

init_logiscout(project_name="my-api", api_key="lgs_xxx")
logger = create_logger("PaymentService")
logger.info("Payment processed", extra={"amount": 49.99})`,
    language: "python",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Monitor & Resolve",
    description:
      "Watch live logs, get AI-powered root cause suggestions, and resolve incidents — all from one dashboard.",
    code: `# LogiScout Dashboard
✓ Live tail streaming
✓ AI root cause analysis
✓ One-click incident creation`,
    language: "text",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From install to insight in under 5 minutes"
          subtitle="Three simple steps to full observability. No agents, no sidecars, no YAML configs."
          className="mb-20"
        />

        <div className="relative">
          {/* desktop connecting line */}
          <div
            className="absolute left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] top-16 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
            aria-hidden="true"
          />

          <StaggerContainer
            className="space-y-12 md:grid md:grid-cols-3 md:gap-8 md:space-y-0"
            staggerChildren={0.15}
            amount={0.15}
          >
            {STEPS.map((step, i) => (
              <StaggerItem key={step.step}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="my-4 flex justify-center md:hidden" aria-hidden="true">
                      <ArrowDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
                    {step.step}
                  </div>

                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  <CopyableCodeBlock code={step.code} language={step.language} className="mt-6" />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}

interface CopyableCodeBlockProps {
  code: string
  language: string
  className?: string
}

function CopyableCodeBlock({ code, language, className }: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      notify.success("Copied", "Snippet copied to your clipboard.")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      notify.error("Couldn't copy", "Your browser blocked the clipboard write.")
    }
  }

  return (
    <div className={`group overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400/60" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/60" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-green-400/60" aria-hidden="true" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy snippet"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        {code}
      </pre>
    </div>
  )
}
