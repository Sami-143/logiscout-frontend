"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./section-heading"
import { StaggerContainer, StaggerItem } from "./animations"

interface BlogPost {
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
  tags: string[]
  href: string
  featured?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: "MTTR math: where teams lose the most time",
    excerpt:
      "Investigation is the hidden tax in every incident. See how LogiScout shortens the manual loop of digging through logs, copying context, and correlating deployments.",
    category: "Incident strategy",
    readTime: "5 min read",
    date: "May 2026",
    tags: ["MTTR", "Investigation", "Workflow"],
    href: "#contact",
    featured: true,
  },
  {
    title: "A seven-component pipeline built for signal",
    excerpt:
      "From SDKs to Kafka, ClickHouse, Qdrant, and the RAG server. A bird's-eye view of how LogiScout moves data from live logs to evidence-backed answers.",
    category: "Architecture",
    readTime: "7 min read",
    date: "May 2026",
    tags: ["Pipeline", "Kafka", "Qdrant"],
    href: "#how-it-works",
  },
  {
    title: "Two-phase retrieval: vector search plus raw logs",
    excerpt:
      "Why we combine semantic search with ClickHouse enrichment. The result is precise retrieval plus full-fidelity evidence for the LLM.",
    category: "AI pipeline",
    readTime: "6 min read",
    date: "May 2026",
    tags: ["RAG", "ClickHouse", "Evidence"],
    href: "#integrations",
  },
  {
    title: "Gatekeeper logic that keeps only 5 percent",
    excerpt:
      "The enrichment pipeline promotes only high-signal traces. See the tiered decision system that drops noise while preserving new or risky patterns.",
    category: "Ingestion",
    readTime: "6 min read",
    date: "May 2026",
    tags: ["Enrichment", "Gatekeeper", "Signals"],
    href: "#features",
  },
]

export function Blogs() {
  return (
    <section id="insights" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:36px_36px] opacity-[0.05]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Insights"
          title="From the LogiScout lab"
          subtitle="Hardcoded highlights based on the LogiScout architecture - short reads on how we cut incident time and keep evidence grounded."
          align="left"
          className="mb-16"
        />

        <StaggerContainer className="grid gap-6 lg:grid-cols-3" amount={0.15}>
          {BLOG_POSTS.map((post) => (
            <StaggerItem key={post.title}>
              <article
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
                  post.featured && "lg:col-span-2 lg:p-8",
                )}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-1 flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold uppercase tracking-wider text-primary">
                      {post.category}
                    </span>
                    <span className="text-muted-foreground">{post.readTime}</span>
                    <span className="text-muted-foreground">{post.date}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className={cn("text-xl font-semibold text-foreground", post.featured && "text-2xl")}>
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link href={post.href} className="group/link inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read story
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true" />
                    </Link>
                    <Link href={post.href}>
                      <Button variant="ghost" size="sm" className="gap-2 text-xs">
                        View details
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
