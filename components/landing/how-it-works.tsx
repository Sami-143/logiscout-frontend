"use client"

import { Code2, Zap, BarChart3, ArrowDown } from "lucide-react"

const STEPS = [
  {
    step: 1,
    icon: Code2,
    title: "Install the SDK",
    description: "Add the LogiScout logger to your Python or Node.js app with one command. No code changes needed.",
    code: `pip install logiscout\n# or\nnpm install @logiscout/logger`,
  },
  {
    step: 2,
    icon: Zap,
    title: "Connect & Stream",
    description: "Pass your API token and logs start flowing in real time. Auto-detect errors, warnings, and patterns.",
    code: `from logiscout import Logger\n\nlogger = Logger(token="ls_xxx")\nlogger.info("Payment processed", amount=49.99)`,
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Monitor & Resolve",
    description: "Watch live logs, get AI-powered root cause suggestions, and resolve incidents — all from one dashboard.",
    code: `# LogiScout Dashboard\n✓ Live tail streaming\n✓ AI root cause analysis\n✓ One-click incident creation`,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From Install to Insight in Under 5 Minutes
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Three simple steps to full observability. No agents, no sidecars, no YAML configs.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 relative">
          {/* Connecting lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-border" />

          {STEPS.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Mobile connecting arrow */}
              {i < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </div>
              )}

              {/* Step number */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">
                {step.step}
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <step.icon className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Code snippet */}
              <div className="mt-6 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border">
                  <span className="w-2 h-2 rounded-full bg-red-400/60" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <span className="w-2 h-2 rounded-full bg-green-400/60" />
                </div>
                <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
