"use client"

const STATS = [
  { value: "500+", label: "Engineering Teams" },
  { value: "2B+", label: "Log Events / Day" },
  { value: "65%", label: "Faster MTTR" },
  { value: "99.99%", label: "Uptime SLA" },
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
