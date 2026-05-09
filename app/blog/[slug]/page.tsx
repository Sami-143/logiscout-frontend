import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar, Footer, CTA } from "@/components/landing"
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts"

interface BlogPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export default function BlogDetailPage({ params }: BlogPageProps) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="relative overflow-hidden py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
            <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-accent/10 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6">
            <Link href="/#insights" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to insights
            </Link>

            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold uppercase tracking-wider text-primary">
                  {post.category}
                </span>
                <span className="text-muted-foreground">{post.readTime}</span>
                <span className="text-muted-foreground">{post.date}</span>
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {post.title}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-4xl px-6 space-y-10">
            {post.sections.map((section) => (
              <article key={section.title} className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-2 rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.code && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.code.language}
                      </span>
                      <Button variant="ghost" size="sm" className="gap-2 text-xs" asChild>
                        <a href="/#contact">
                          Talk to us
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                      {section.code.content}
                    </pre>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  )
}
