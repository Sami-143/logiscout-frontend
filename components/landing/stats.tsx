"use client"

const STATS = [
  { value: "2", label: "Official SDKs" },
  { value: "<1s", label: "Ingest Latency" },
  { value: "5 min", label: "Time to First Log" },
  { value: "Free", label: "to Start" },
]

export function Stats() {
  return (
    <section className="py-16 sm:py-20 border-y border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
