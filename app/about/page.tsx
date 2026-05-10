import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Code2,
  Sparkles,
  Heart,
  Zap,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react"
import { Navbar, Footer } from "@/components/landing"
import { SectionHeading } from "@/components/landing/section-heading"
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/landing/animations"

import saadPhoto from "@/app/assets/saad.jpeg"
import samiPhoto from "@/app/assets/Sami.jpeg"
import kazimPhoto from "@/app/assets/kazim.jpeg"
import barrPhoto from "@/app/assets/Barr.jpeg"

export const metadata: Metadata = {
  title: "About — LogiScout",
  description:
    "LogiScout is built by engineers for engineers. Meet the team turning noisy logs into calm, actionable insight.",
}

interface SocialLink {
  label: "GitHub" | "LinkedIn" | "Twitter"
  href: string
}

interface TeamMember {
  name: string
  role: string
  bio: string
  photo: StaticImageData
  socials?: SocialLink[]
}

const TEAM: TeamMember[] = [
  {
    name: "Saad",
    role: "Software Engineer",
    bio: "Backend systems and ingestion pipelines. Spends his day making sure your logs reach us within milliseconds — and that we don't drop a single one.",
    photo: saadPhoto,
  },
  {
    name: "Sami",
    role: "Software Engineer",
    bio: "Frontend, dashboards, and developer experience. The person to thank when the UI feels obvious — and the one to blame when a button is one pixel off.",
    photo: samiPhoto,
  },
  {
    name: "Kazim",
    role: "Software Engineer",
    bio: "Platform, infrastructure, and reliability. Keeps the lights on for every project that streams into LogiScout, day or night.",
    photo: kazimPhoto,
  },
  {
    name: "Barr",
    role: "Data Engineer",
    bio: "AI and root-cause analysis. Turns weeks of historical logs into the answer you actually wanted — in one short paragraph.",
    photo: barrPhoto,
  },
]

const VALUES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Code2,
    title: "Engineer-first by default",
    description:
      "Every decision starts with the question: would we use this on call at 3am? If not, we send it back.",
  },
  {
    icon: Sparkles,
    title: "AI that earns its place",
    description:
      "We use AI where it removes a real cognitive load — not as a sticker on the box. If it doesn't help you ship, we cut it.",
  },
  {
    icon: Heart,
    title: "Honest by design",
    description:
      "No vanity metrics, no dark patterns. Free tier stays free, error counts stay accurate, churn rate stays public.",
  },
]

const STATS = [
  { value: "4", label: "Engineers building it" },
  { value: "1", label: "Mission" },
  { value: "0", label: "Hidden fees" },
  { value: "100%", label: "Built in Pakistan" },
]

const SOCIAL_ICON: Record<SocialLink["label"], LucideIcon> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Twitter: Twitter,
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <Card className="group relative h-full overflow-hidden border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl opacity-60" />
          <div className="overflow-hidden rounded-full ring-2 ring-primary/20 transition-all group-hover:ring-primary/50">
            <Image
              src={member.photo}
              alt={`${member.name} — ${member.role}`}
              width={160}
              height={160}
              placeholder="blur"
              className="h-32 w-32 object-cover transition-transform duration-500 group-hover:scale-105 sm:h-36 sm:w-36"
            />
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
          <p className="text-sm font-medium text-primary">{member.role}</p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        {member.socials && member.socials.length > 0 && (
          <div className="mt-5 flex items-center gap-2">
            {member.socials.map((social) => {
              const Icon = SOCIAL_ICON[social.label]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on ${social.label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:40px_40px] opacity-[0.04]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <FadeIn direction="up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                About LogiScout
              </span>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Built by Engineers,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  for Engineers.
                </span>
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                LogiScout was born out of long on-call nights, half-broken
                logging stacks, and the conviction that finding the cause of an
                incident shouldn&rsquo;t be the hardest part of fixing it.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/25">
                    Start Free
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                    Talk to the team
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Story */}
        <section className="relative py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <FadeIn direction="up" className="lg:col-span-5">
                <SectionHeading
                  eyebrow="Our story"
                  align="left"
                  title="A logging tool we actually wanted to use"
                  subtitle="Every founder of LogiScout has been the one paged at 2am, scrolling through millions of lines of unstructured logs trying to figure out what just broke. We built the thing we kept wishing existed."
                />
              </FadeIn>

              <FadeIn direction="up" delay={0.1} className="lg:col-span-7">
                <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
                  <p>
                    LogiScout started in late nights between four engineers in
                    Lahore, working on completely different products but
                    debugging the same problem on repeat — production logs that
                    were technically there, but practically useless.
                  </p>
                  <p>
                    We wanted correlation IDs that crossed service boundaries.
                    We wanted a stream that didn&rsquo;t buffer for a minute
                    when latency mattered most. We wanted an assistant that
                    could read three days of history in two seconds and tell us
                    what changed. So we built it.
                  </p>
                  <p className="text-foreground">
                    Today LogiScout is a focused, opinionated tool for teams
                    who care about their on-call experience. We&rsquo;re still
                    a small team. We still ship the features we&rsquo;d use
                    ourselves. That isn&rsquo;t going to change.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <StaggerContainer
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              staggerChildren={0.08}
              amount={0.2}
            >
              {STATS.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary to-accent bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                      {stat.value}
                    </div>
                    <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Team */}
        <section className="relative py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[140px]" />
            <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-accent/5 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="The team"
              title="Meet the engineers behind LogiScout"
              subtitle="A small, opinionated team. No layers between you and the people building the product."
              className="mb-16"
            />

            <StaggerContainer
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              staggerChildren={0.1}
              amount={0.15}
            >
              {TEAM.map((member) => (
                <StaggerItem key={member.name}>
                  <TeamCard member={member} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Values */}
        <section className="relative bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="What we believe"
              title="The principles behind every release"
              subtitle="Three rules we keep coming back to whenever we&rsquo;re unsure about a feature, a price, or a design call."
              className="mb-16"
            />

            <StaggerContainer
              className="grid gap-6 md:grid-cols-3"
              staggerChildren={0.1}
              amount={0.2}
            >
              {VALUES.map(({ icon: Icon, title, description }) => (
                <StaggerItem key={title}>
                  <Card className="group h-full border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-colors group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/12" />
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <FadeIn direction="up">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30">
                <Zap className="h-8 w-8" aria-hidden="true" />
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <h2 className="text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                Want to build with us?
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Whether you&rsquo;re evaluating LogiScout for your team or just
                want to compare notes on observability — we&rsquo;d love to
                hear from you.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/25">
                    Start Free
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                    Get in touch
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
