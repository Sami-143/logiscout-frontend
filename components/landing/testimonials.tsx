"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Ayesha Malik",
    role: "SRE Lead, FinTrack",
    avatar: "AM",
    quote:
      "LogiScout cut our MTTR by 65%. The AI root cause analysis catches issues we would have spent hours debugging.",
    stars: 5,
  },
  {
    name: "James Chen",
    role: "CTO, CloudSync",
    avatar: "JC",
    quote:
      "We replaced Datadog + PagerDuty with LogiScout and saved $2k/month. The Python SDK was literally a one-line setup.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "DevOps Engineer, Payroll.io",
    avatar: "PS",
    quote:
      "The live log tail is incredible. Being able to filter, search, and get AI suggestions in the same view is a game-changer.",
    stars: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Engineering Teams
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See why hundreds of teams choose LogiScout for their monitoring stack.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card
              key={t.name}
              className="p-6 border-border bg-card hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
