"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import {
  BookOpen,
  Code2,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  Search,
  Zap,
  Package,
  Server,
  Shield,
  Layers,
  FileText,
  Globe,
  Database,
  Clock,
  CheckCircle2,
  Hash,
  Box,
  Cpu,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Reusable helpers                                                   */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label = "Snippet" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({ title: "Copied!", description: `${label} copied to clipboard.` })
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={copy}
            aria-label="Copy to clipboard"
            className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function CodeBlock({ code, language = "python", filename }: { code: string; language?: string; filename?: string }) {
  return (
    <div className="group relative rounded-xl border border-border bg-[#0d1117] text-sm font-mono overflow-hidden my-4">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-[#161b22]">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{filename}</span>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
            {language}
          </Badge>
        </div>
      )}
      <CopyButton text={code} label="Code" />
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-muted text-[13px] font-mono text-foreground border border-border">
      {children}
    </code>
  )
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-foreground mt-12 mb-4 scroll-mt-24 flex items-center gap-2 group">
      <Hash className="h-5 w-5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </h2>
  )
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-semibold text-foreground mt-8 mb-3 scroll-mt-24">
      {children}
    </h3>
  )
}

/* ------------------------------------------------------------------ */
/*  Sidebar navigation structure                                       */
/* ------------------------------------------------------------------ */

const PYTHON_SIDEBAR_SECTIONS = [
  {
    label: "Library SDK Overview",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "highlights", label: "Highlights", icon: CheckCircle2 },
    ],
  },
  {
    label: "Python SDK",
    items: [
      { id: "quickstart", label: "Quick Start", icon: Zap },
      { id: "installation", label: "Installation", icon: Package },
      { id: "environment-modes", label: "Environment Modes", icon: Shield },
      { id: "logging", label: "Logging API", icon: Terminal },
      { id: "logging-workflow", label: "How It Works", icon: Cpu },
      { id: "batching", label: "Batching", icon: Database },
      { id: "middleware", label: "Middleware", icon: Server },
      { id: "standalone", label: "Standalone Usage", icon: Box },
      { id: "api-reference", label: "API Reference", icon: Code2 },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { id: "framework-integrations", label: "Framework Integrations", icon: Zap },
      { id: "fastapi", label: "FastAPI", icon: Zap },
      { id: "flask", label: "Flask", icon: Globe },
      { id: "django", label: "Django", icon: Database },
    ],
  },
]

const NODEJS_SIDEBAR_SECTIONS = [
  {
    label: "Node.js SDK",
    items: [
      { id: "node-introduction", label: "Introduction", icon: BookOpen },
      { id: "node-features", label: "Features", icon: CheckCircle2 },
      { id: "node-installation", label: "Installation", icon: Package },
      { id: "node-quickstart", label: "Quick Start", icon: Zap },
      { id: "node-express", label: "Express Integration", icon: Server },
      { id: "node-error-logging", label: "Error Logging", icon: Shield },
      { id: "node-api-reference", label: "API Reference", icon: Code2 },
      { id: "node-log-levels", label: "Log Levels", icon: Terminal },
      { id: "node-console-output", label: "Console Output", icon: FileText },
      { id: "node-requirements", label: "Requirements", icon: Package },
    ],
  },
]


/* ------------------------------------------------------------------ */
/*  Main documentation component                                       */
/* ------------------------------------------------------------------ */

export function Documentation() {
  const [activeSection, setActiveSection] = useState("introduction")
  const [searchQuery, setSearchQuery] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const sectionIdsRef = useRef<string[]>([])

  const activeSections = [...PYTHON_SIDEBAR_SECTIONS, ...NODEJS_SIDEBAR_SECTIONS]

  useEffect(() => {
    sectionIdsRef.current = activeSections.flatMap((s) => s.items.map((i) => i.id))
  }, [])

  // Scroll-spy: on every scroll tick, find the last section whose top edge has
  // passed the top 30% of the container and mark it active.  This approach uses
  // getBoundingClientRect() which works reliably with any custom scroll root.
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const onScroll = () => {
      const ids = sectionIdsRef.current
      const containerTop = container.getBoundingClientRect().top
      // "activation line" = 30% down from the top of the scroll pane
      const activationY = containerTop + container.clientHeight * 0.3

      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= activationY) {
          current = id
        } else {
          // sections are in document order — no need to keep scanning
          break
        }
      }
      if (current) setActiveSection(current)
    }

    container.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => container.removeEventListener("scroll", onScroll)
  }, [])

  // Auto-scroll the sidebar so the active nav item is always visible
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const activeBtn = sidebar.querySelector<HTMLElement>(`[data-section="${activeSection}"]`)
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [activeSection])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ---- Doc Sidebar ---- */}
      <aside
        ref={sidebarRef}
        className={`hidden xl:flex flex-col w-72 border-r border-border bg-card/50 overflow-y-auto flex-shrink-0 transition-all`}
      >
        {/* SDK Search */}
        <div className="sticky top-0 bg-card/80 backdrop-blur-md z-10 p-3 space-y-2.5 border-b border-border">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">SDK Docs</span>
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5">
              Python + Node.js
            </Badge>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 focus:ring-[3px] outline-none transition-all"
            />
          </div>
        </div>

        <nav className="p-3 space-y-5">
          {activeSections.map((section) => {
            const filtered = section.items.filter((i) =>
              i.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (searchQuery && filtered.length === 0) return null
            return (
              <div key={section.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1.5">
                  {section.label}
                </p>
                {(searchQuery ? filtered : section.items).map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      data-section={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`relative flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        activeSection === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {activeSection === item.id && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ---- Main Content ---- */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
          {/* Hero / Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <BookOpen className="h-4 w-4" />
              <span>Documentation</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">LogiScout SDKs</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  LogiScout SDK Documentation
                </h1>
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Everything you need to integrate the <strong className="text-foreground">logiscout-logger</strong> (Python)
                  and <strong className="text-foreground">logiscout</strong> (Node.js) SDKs — quick start,
                  integrations, and API references.
                </p>
              </div>
            </div>
          </div>

          <Separator className="mb-10" />

          {/* ============================================================ */}
          {/*  INTRODUCTION                                                 */}
          {/* ============================================================ */}

          <section id="introduction">
            <SectionHeading id="introduction-heading">Introduction</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">logiscout-logger</strong> is a Python logging client
              for the LogiScout ingest platform. It&apos;s built on <InlineCode>structlog</InlineCode>
              and ships with first-class support for FastAPI, Flask, and Django — including
              automatic per-request correlation IDs and an intelligent batching layer that
              minimizes network overhead.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you&apos;re already using <InlineCode>structlog</InlineCode>, the API will feel
              familiar. If you&apos;re not, the learning curve is small: <InlineCode>init()</InlineCode>
              once at startup, <InlineCode>get_logger(__name__)</InlineCode> everywhere else.
            </p>
          </section>

          {/* ============================================================ */}
          {/*  PYTHON SDK — section banner                                  */}
          {/* ============================================================ */}

          <div className="mt-14 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-foreground">Python SDK</h2>
                  <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500 px-2 h-5">
                    logiscout-logger
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">PyPI &middot; Python 3.9+ &middot; FastAPI &middot; Flask &middot; Django</p>
              </div>
            </div>
            <Separator />
          </div>

          {/* ============================================================ */}
          {/*  QUICK START                                                  */}
          {/* ============================================================ */}

          <section id="quickstart">
            <SectionHeading id="quickstart-heading">Quick Start</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Get up and running in a few minutes with a single initialization step and a logger
              instance you can use anywhere in your codebase.
            </p>

            <div className="mt-6 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6 flex-1">
                  <h4 className="font-semibold text-foreground">Install the package</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Install <InlineCode>logiscout-logger</InlineCode> from PyPI using pip.
                  </p>
                  <CodeBlock code="pip install logiscout-logger" language="bash" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6 flex-1">
                  <h4 className="font-semibold text-foreground">Initialize in your app entry-point</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Call <InlineCode>init()</InlineCode> once at application startup to configure the SDK.
                  </p>
                  <CodeBlock
                    language="python"
                    filename="main.py"
                    code={`from logiscout_logger import init, PROD

# 1. Initialize once at app startup
init(
    api_token="your_api_key",
    service_name="my-service",
    env=PROD,
)`}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Start logging</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use <InlineCode>get_logger()</InlineCode> anywhere in your codebase to produce
                    structured, correlated logs.
                  </p>
                  <CodeBlock
                    language="python"
                    filename="services/payment.py"
                    code={`from logiscout_logger import get_logger

# 2. Get a logger anywhere in your codebase
logger = get_logger(__name__)

# 3. Log structured events
logger.info("User logged in", user_id=123)
logger.warning("Rate limit approaching", current=95, limit=100)
logger.error("Payment failed", order_id="abc-123", reason="insufficient_funds")`}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              In <InlineCode>DEV</InlineCode> mode the same code prints to the console only — no
              network calls and no token required.
            </p>
          </section>

          {/* ============================================================ */}
          {/*  INSTALLATION                                                 */}
          {/* ============================================================ */}

          <section id="installation">
            <SectionHeading id="installation-heading">Installation</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout Logger is hosted on PyPI and supports Python 3.9+.
            </p>

            <SubHeading id="install-pip">Using pip</SubHeading>
            <CodeBlock code="pip install logiscout-logger" language="bash" />

            <SubHeading id="requirements">Requirements</SubHeading>
            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Dependency</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Python", ">= 3.9"],
                    ["structlog", ">= 24.0.0"],
                    ["requests", ">= 2.28.0"],
                  ].map(([dep, version]) => (
                    <tr key={dep} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{dep}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  HIGHLIGHTS                                                  */}
          {/* ============================================================ */}

          <section id="highlights">
            <SectionHeading id="highlights-heading">Highlights</SectionHeading>
            <div className="mt-6 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Structured by default</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Every log carries a timestamp, level, logger name, and arbitrary metadata as JSON.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Intelligent batching</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Payloads are flushed when 200 logs accumulate or 30 seconds elapse, whichever comes first.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Automatic correlation</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Middleware tags every log emitted during a request with the same correlationId.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex-shrink-0">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Framework-ready</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Drop-in middleware for ASGI (FastAPI, Starlette, Django ASGI) and WSGI (Flask, Django WSGI).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">DEV / PROD modes</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Console-only in development, console + batched remote ingest in production.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Confidential logs</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Flag sensitive entries with <InlineCode>send=False</InlineCode> so they never leave the host.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Thread-safe</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Designed for concurrent web workers and high-throughput services.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Graceful shutdown</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Remaining logs are flushed automatically on process exit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  ENVIRONMENT MODES                                           */}
          {/* ============================================================ */}

          <section id="environment-modes">
            <SectionHeading id="environment-modes-heading">Environment Modes</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Choose the appropriate environment mode for your service. <InlineCode>DEV</InlineCode>
              is console-only, while <InlineCode>PROD</InlineCode> enables console + batched remote ingest.
            </p>

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Mode</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Console output</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Remote ingest</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Batching</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">DEV</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">Yes</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">No</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">No</td>
                    <td className="px-4 py-3 text-muted-foreground">Ideal for local development. No api_token required.</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">PROD</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">Yes</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">Yes</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">Yes</td>
                    <td className="px-4 py-3 text-muted-foreground">Logs are batched and shipped to the LogiScout endpoint.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <CodeBlock
              language="python"
              code={`from logiscout_logger import init, DEV, PROD

# Development — console only
init(api_token="...", service_name="my-service", env=DEV)

# Production — console + remote with batching
init(api_token="...", service_name="my-service", env=PROD)`}
            />
          </section>

          {/* ============================================================ */}
          {/*  LOGGING                                                      */}
          {/* ============================================================ */}

          <section id="logging">
            <SectionHeading id="logging-heading">Logging API</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The <InlineCode>get_logger()</InlineCode> function returns a logger instance scoped
              to the given name. Pass any keyword arguments alongside your message to add
              structured context.
            </p>

            <SubHeading id="log-levels">Log Levels</SubHeading>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
              {[
                { level: "DEBUG", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
                { level: "INFO", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                { level: "WARNING", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
                { level: "ERROR", color: "bg-red-500/10 text-red-500 border-red-500/20" },
                { level: "CRITICAL", color: "bg-red-700/10 text-red-700 border-red-700/20" },
              ].map((l) => (
                <div key={l.level} className={`text-center text-xs font-semibold px-3 py-2 rounded-lg border ${l.color}`}>
                  {l.level}
                </div>
              ))}
            </div>

            <SubHeading id="log-levels-example">Levels</SubHeading>
            <CodeBlock
              language="python"
              code={`logger.debug("Detailed debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical error message")`}
            />

            <SubHeading id="metadata-logging">Adding Metadata</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Pass arbitrary keyword arguments — they are serialized into the structured log entry.
            </p>
            <CodeBlock
              language="python"
              code={`logger.info("Order created", order_id="123", total=99.99, currency="USD")`}
            />

            <SubHeading id="confidential-logs">Confidential Logging</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Use <InlineCode>send=False</InlineCode> to keep a log local to the host (still
              printed to the console, never transmitted).
            </p>
            <CodeBlock
              language="python"
              code={`logger.info("Password reset token generated", token="secret-token", send=False)
logger.error("Internal error details", stack_trace=trace, send=False)`}
            />

            <SubHeading id="bound-loggers">Bound Loggers</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Bind context once and reuse it across calls:
            </p>
            <CodeBlock
              language="python"
              code={`user_logger = logger.bind(user_id=123, session_id="abc")
user_logger.info("User action", action="click")  # includes user_id and session_id`}
            />

          </section>

          {/* ============================================================ */}
          {/*  LOGGING WORKFLOW                                            */}
          {/* ============================================================ */}

          <section id="logging-workflow">
            <SectionHeading id="logging-workflow-heading">How It Works</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              A high-level view of how log events move from your application to the LogiScout
              ingest pipeline.
            </p>
            <CodeBlock
              language="text"
              code={`┌────────────────────┐    ┌─────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Application code  │ →  │   structlog chain   │ →  │   BatchManager   │ →  │   HTTPTransport  │
│  logger.info(...)  │    │ build_log_event,    │    │  200 logs / 30s  │    │   POST /ingest   │
│                    │    │ push_to_buffer, …   │    │  thread-safe     │    │   Bearer auth    │
└────────────────────┘    └─────────────────────┘    └──────────────────┘    └──────────────────┘
            │                                                                           ▲
            │                                                                           │
            └──────── ASGI / WSGI middleware adds correlationId ────────────────────────┘`}
            />
          </section>

          {/* ============================================================ */}
          {/*  BATCHING                                                     */}
          {/* ============================================================ */}

          <section id="batching">
            <SectionHeading id="batching-heading">Batching</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              In <InlineCode>PROD</InlineCode>, request payloads are queued and flushed by the
              BatchManager to minimize network overhead.
            </p>

            <ul className="list-disc list-inside text-sm text-muted-foreground mt-4 space-y-1.5 ml-2">
              <li><strong className="text-foreground">Log-count trigger</strong> — flushes when total queued logs reach <strong className="text-foreground">200</strong>.</li>
              <li><strong className="text-foreground">Time trigger</strong> — flushes every <strong className="text-foreground">30 seconds</strong> as long as the queue is non-empty.</li>
              <li><strong className="text-foreground">Partial payloads</strong> — large requests are split across batches and re-stitched on the backend by correlationId.</li>
              <li><strong className="text-foreground">Graceful shutdown</strong> — <InlineCode>atexit</InlineCode> flushes any remaining logs on a clean process exit.</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              For the full design, batch wire format, and tuning knobs, see
              <InlineCode>BATCHING_SYSTEM.md</InlineCode>.
            </p>
          </section>

          {/* ============================================================ */}
          {/*  MIDDLEWARE                                                    */}
          {/* ============================================================ */}

          <section id="middleware">
            <SectionHeading id="middleware-heading">Middleware</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout provides two middleware implementations for automatic request correlation.
              Use <InlineCode>asgiConfiguration</InlineCode> for ASGI apps and
              <InlineCode>wsgiConfiguration</InlineCode> for WSGI apps.
            </p>
            <CodeBlock
              language="python"
              code={`from logiscout_logger import asgiConfiguration, wsgiConfiguration

# ASGI — FastAPI, Starlette, Django (ASGI)
app.add_middleware(asgiConfiguration)

# WSGI — Flask, Django (WSGI)
app.wsgi_app = wsgiConfiguration(app.wsgi_app)`}
            />
          </section>

          {/* ============================================================ */}
          {/*  STANDALONE MODE                                              */}
          {/* ============================================================ */}

          <section id="standalone">
            <SectionHeading id="standalone-heading">Standalone Usage</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The library can be used as a plain console logger without calling
              <InlineCode>init()</InlineCode>. Nothing is sent to the network in this mode.
            </p>

            <CodeBlock
              language="python"
              filename="scripts/etl_job.py"
              code={`from logiscout_logger import get_logger

logger = get_logger("my_script")
logger.info("Script started")
logger.warning("Disk space low", available_gb=1.5)`}
            />
          </section>

          {/* ============================================================ */}
          {/*  FASTAPI INTEGRATION                                          */}
          {/* ============================================================ */}

          <section id="framework-integrations">
            <SectionHeading id="framework-integrations-heading">Framework Integrations</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout Logger ships with first-class integrations for FastAPI, Flask, and Django.
              Each framework uses the same core API and middleware configuration.
            </p>
          </section>

          <section id="fastapi">
            <SectionHeading id="fastapi-heading">FastAPI Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              FastAPI is a modern async Python framework. Use the{" "}
              <InlineCode>asgiConfiguration</InlineCode> middleware for seamless integration.
            </p>

            <CodeBlock
              language="python"
              filename="main.py"
              code={`from fastapi import FastAPI
from logiscout_logger import init, get_logger, asgiConfiguration, PROD

app = FastAPI()

init(api_token="your_api_key", service_name="my-fastapi-app", env=PROD)
app.add_middleware(asgiConfiguration)

logger = get_logger("api")

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    logger.info("Fetching user", user_id=user_id)
    return {"user_id": user_id}`}
            />
          </section>

          {/* ============================================================ */}
          {/*  FLASK INTEGRATION                                            */}
          {/* ============================================================ */}

          <section id="flask">
            <SectionHeading id="flask-heading">Flask Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Flask is a synchronous WSGI framework. Wrap the WSGI application with{" "}
              <InlineCode>wsgiConfiguration</InlineCode>.
            </p>

            <CodeBlock
              language="python"
              filename="app.py"
              code={`from flask import Flask
from logiscout_logger import init, get_logger, wsgiConfiguration, PROD

app = Flask(__name__)

init(api_token="your_api_key", service_name="my-flask-app", env=PROD)
app.wsgi_app = wsgiConfiguration(app.wsgi_app)

logger = get_logger("api")

@app.route("/users/<int:user_id>")
def get_user(user_id):
    logger.info("Fetching user", user_id=user_id)
    return {"user_id": user_id}`}
            />
          </section>

          {/* ============================================================ */}
          {/*  DJANGO INTEGRATION                                           */}
          {/* ============================================================ */}

          <section id="django">
            <SectionHeading id="django-heading">Django Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              For Django, initialize in <InlineCode>settings.py</InlineCode> and apply the
              appropriate middleware in <InlineCode>wsgi.py</InlineCode> or <InlineCode>asgi.py</InlineCode>.
            </p>

            <CodeBlock
              language="python"
              filename="settings.py"
              code={`from logiscout_logger import init, PROD

init(api_token="your_api_key", service_name="my-django-app", env=PROD)`}
            />

            <CodeBlock
              language="python"
              filename="myproject/wsgi.py"
              code={`import os
from django.core.wsgi import get_wsgi_application
from logiscout_logger import wsgiConfiguration

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

application = get_wsgi_application()
application = wsgiConfiguration(application)`}
            />

            <CodeBlock
              language="python"
              filename="myproject/asgi.py"
              code={`import os
from django.core.asgi import get_asgi_application
from logiscout_logger import asgiConfiguration

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

application = get_asgi_application()
application = asgiConfiguration(application)`}
            />

            <CodeBlock
              language="python"
              filename="myapp/views.py"
              code={`from logiscout_logger import get_logger

logger = get_logger(__name__)

def my_view(request):
    logger.info("Processing request", user_id=request.user.id)
    return JsonResponse({"status": "ok"})`}
            />
          </section>

          {/* ============================================================ */}
          {/*  PYTHON API REFERENCE                                         */}
          {/* ============================================================ */}

          <section id="api-reference">
            <SectionHeading id="api-reference-heading">API Reference (Python)</SectionHeading>

            <SubHeading id="py-init-fn">init(api_token, service_name, env)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Initialize the LogiScout logger. Call once at app startup.
            </p>

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Parameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["api_token", "str", "API token for authenticating with the LogiScout ingest endpoint."],
                    ["service_name", "str", "Service identifier applied to every log produced in this process."],
                    ["env", "Environment", "DEV (console only) or PROD (console + batched remote ingest)."],
                  ].map(([param, type, desc]) => (
                    <tr key={param} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{param}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeading id="py-get-logger-fn">get_logger(name)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Returns a <InlineCode>LogiScoutLogger</InlineCode> instance scoped to the given
              name. Typically called as <InlineCode>get_logger(__name__)</InlineCode> at module
              top-level.
            </p>
            <CodeBlock
              language="python"
              code={`from logiscout_logger import get_logger
logger = get_logger(__name__)`}
            />

            <SubHeading id="py-logger-methods">LogiScoutLogger Methods</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              All level methods accept <InlineCode>send: bool = True</InlineCode> plus arbitrary
              keyword metadata.
            </p>
            <CodeBlock
              language="python"
              code={`logger.debug(msg: str, send: bool = True, **metadata)
logger.info(msg: str, send: bool = True, **metadata)
logger.warning(msg: str, send: bool = True, **metadata)
logger.error(msg: str, send: bool = True, **metadata)
logger.critical(msg: str, send: bool = True, **metadata)
logger.bind(**context) -> LogiScoutLogger`}
            />

            <SubHeading id="py-middleware-fn">asgiConfiguration / wsgiConfiguration</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Request-correlation middleware. See <InlineCode>Middleware</InlineCode> above.
            </p>
            <CodeBlock
              language="python"
              code={`from logiscout_logger import asgiConfiguration, wsgiConfiguration

# ASGI (FastAPI / Starlette / Django ASGI)
app.add_middleware(asgiConfiguration)

# WSGI (Flask / Django WSGI)
app.wsgi_app = wsgiConfiguration(app.wsgi_app)`}
            />

            <SubHeading id="py-constants">Constants</SubHeading>
            <CodeBlock
              language="python"
              code={`from logiscout_logger import DEV, PROD

# DEV  — console-only mode, no remote transmission
# PROD — console + batched remote ingest`}
            />

          </section>

          {/* ============================================================ */}
          {/*  NODE.JS SDK — section banner                                 */}
          {/* ============================================================ */}

          <div className="mt-16 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-foreground">Node.js SDK</h2>
                  <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500 px-2 h-5">
                    logiscout
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">npm &middot; Node.js &gt;= 18 &middot; TypeScript &middot; Express</p>
              </div>
            </div>
            <Separator />
          </div>

          {/* ============================================================ */}
          {/*  NODE INTRODUCTION                                            */}
          {/* ============================================================ */}

          <section id="node-introduction">
            <SectionHeading id="node-introduction-heading">Introduction</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">logiscout</strong> is a structured logging library
              for Node.js applications with automatic correlation tracking and middleware support.
              It produces consistent JSON-shaped logs, ships first-class Express middleware, and
              supports both ESM and CommonJS environments.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The API mirrors the Python SDK&apos;s philosophy:{" "}
              <InlineCode>initLogiscout()</InlineCode> once at startup, then{" "}
              <InlineCode>createLogger(&quot;Name&quot;)</InlineCode> wherever you need to log.
            </p>
          </section>

          {/* ============================================================ */}
          {/*  NODE FEATURES                                                */}
          {/* ============================================================ */}

          <section id="node-features">
            <SectionHeading id="node-features-heading">Features</SectionHeading>
            <div className="mt-6 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Structured JSON output</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Every log emits consistent JSON with timestamp, level, logger name, and metadata.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Automatic correlation IDs</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Request-scoped IDs propagate to every log emitted during a single HTTP request.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex-shrink-0">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Five log levels</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    <InlineCode>debug</InlineCode>, <InlineCode>info</InlineCode>,{" "}
                    <InlineCode>warn</InlineCode>, <InlineCode>error</InlineCode>, and{" "}
                    <InlineCode>critical</InlineCode>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Exception capture</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Pass caught errors directly to <InlineCode>logger.error()</InlineCode> for
                    full stack-trace serialization.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Express middleware</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Drop-in <InlineCode>createCorrelationMiddleware()</InlineCode> for request
                    tracking and timing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Dual module support</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Works with both ESM and CommonJS, ships TypeScript types and enums.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  NODE INSTALLATION                                            */}
          {/* ============================================================ */}

          <section id="node-installation">
            <SectionHeading id="node-installation-heading">Installation</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Install the <InlineCode>logiscout</InlineCode> package from npm.
            </p>
            <CodeBlock code="npm install logiscout" language="bash" />
          </section>

          {/* ============================================================ */}
          {/*  NODE QUICK START                                             */}
          {/* ============================================================ */}

          <section id="node-quickstart">
            <SectionHeading id="node-quickstart-heading">Quick Start</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Three steps: initialize the SDK, create a logger, then log structured events.
            </p>

            <div className="mt-6 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6 flex-1">
                  <h4 className="font-semibold text-foreground">Initialize the SDK</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Call <InlineCode>initLogiscout()</InlineCode> once at your application entry point.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="index.ts"
                    code={`import { Environment, initLogiscout } from "logiscout";

initLogiscout({
  projectName: "my-app",
  environment: Environment.DEVELOPMENT,
  apiKey: "your-api-key",
});`}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6 flex-1">
                  <h4 className="font-semibold text-foreground">Create a named logger</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pass a service or module name so logs are attributable.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="services/userService.ts"
                    code={`import { createLogger } from "logiscout";

const logger = createLogger("UserService");`}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Emit structured logs</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use any of the five log levels with optional metadata and transport options.
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={`logger.info("User logged in");
logger.warn("Rate limit approaching");
logger.error("Failed to process request");
logger.debug("Processing user data");
logger.critical("Database connection lost");

// With structured metadata
logger.info("User created", { userId: "123", email: "user@example.com" });

// Control server transport (only active in Environment.PRODUCTION)
logger.info("Order placed", { orderId: "789" }, { send: true });
logger.debug("Cache state", { keys: 42 }, { send: false });`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  NODE EXPRESS INTEGRATION                                     */}
          {/* ============================================================ */}

          <section id="node-express">
            <SectionHeading id="node-express-heading">Express Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The <InlineCode>createCorrelationMiddleware()</InlineCode> helper attaches a unique
              correlation ID to every request, propagates it across logs emitted during the request
              lifecycle, and logs request start/end with method, path, status, and timing.
            </p>

            <CodeBlock
              language="typescript"
              filename="server.ts"
              code={`import express from "express";
import {
  Environment,
  initLogiscout,
  createLogger,
  createCorrelationMiddleware,
} from "logiscout";

const app = express();

initLogiscout({
  projectName: "my-api",
  environment: Environment.PRODUCTION,
  apiKey: "your-api-key",
});

app.use(createCorrelationMiddleware());

const logger = createLogger("API");

app.get("/users", (req, res) => {
  logger.info("Fetching users", { page: req.query.page });
  res.json({ users: [] });
});

app.listen(3000);`}
            />

            <p className="text-muted-foreground leading-relaxed mt-4">The middleware:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1.5 ml-2">
              <li>Generates a unique correlation ID per request, or reuses an incoming <InlineCode>x-correlation-id</InlineCode> header.</li>
              <li>Attaches the correlation ID to all logs within the request scope.</li>
              <li>Sets the <InlineCode>x-correlation-id</InlineCode> response header.</li>
              <li>Logs request start and end with method, path, status code, and response time.</li>
            </ul>
          </section>

          {/* ============================================================ */}
          {/*  NODE ERROR LOGGING                                           */}
          {/* ============================================================ */}

          <section id="node-error-logging">
            <SectionHeading id="node-error-logging-heading">Error Logging with Exceptions</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Pass a caught exception as the third argument to <InlineCode>logger.error()</InlineCode>{" "}
              and the SDK serializes the message, name, and stack trace alongside your metadata.
            </p>

            <CodeBlock
              language="typescript"
              code={`try {
  JSON.parse("{ invalid json }");
} catch (err) {
  logger.error("Failed to parse config", { source: "config-loader" }, err);
}`}
            />
          </section>

          {/* ============================================================ */}
          {/*  NODE API REFERENCE                                           */}
          {/* ============================================================ */}

          <section id="node-api-reference">
            <SectionHeading id="node-api-reference-heading">API Reference (Node.js)</SectionHeading>

            <SubHeading id="node-init-fn">initLogiscout(config)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Initialize the SDK. Must be called once before creating any loggers.
            </p>

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Parameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Required</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["projectName", "string", "Yes", "Name of your project."],
                    ["environment", "Environment", "Yes", "Current environment (DEVELOPMENT / STAGING / PRODUCTION)."],
                    ["apiKey", "string", "No", "API key for server transport. Required when environment is PRODUCTION."],
                  ].map(([param, type, required, desc]) => (
                    <tr key={param} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{param}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{type}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{required}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mt-4 mb-2">Available <InlineCode>Environment</InlineCode> values:</p>
            <CodeBlock
              language="typescript"
              code={`Environment.DEVELOPMENT
Environment.STAGING
Environment.PRODUCTION`}
            />

            <SubHeading id="node-create-logger-fn">createLogger(loggerName)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Create a named logger instance scoped to a service or module.
            </p>

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Parameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">loggerName</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Name identifying this logger, such as a service or module name.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SubHeading id="node-logger-methods">Logger Methods</SubHeading>
            <CodeBlock
              language="typescript"
              code={`logger.info(message, meta?, options?);
logger.warn(message, meta?, options?);
logger.debug(message, meta?, options?);
logger.critical(message, meta?, options?);

// error has two overloads
logger.error(message, meta?, options?);
logger.error(message, meta, exception, options?);`}
            />

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Parameter</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Required</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["message", "string", "Yes", "The log message."],
                    ["meta", "Record<string, unknown>", "No", "Additional structured metadata."],
                    ["exception", "unknown", "No", "A caught exception, accepted by error()."],
                    ["options.send", "boolean", "No", "Send to server. Default true, but only sends in Environment.PRODUCTION."],
                  ].map(([param, type, required, desc]) => (
                    <tr key={param} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{param}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{type}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{required}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeading id="node-correlation-fn">createCorrelationMiddleware()</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Returns Express middleware for automatic correlation tracking.
            </p>
            <CodeBlock
              language="typescript"
              code={`app.use(createCorrelationMiddleware());`}
            />
          </section>

          {/* ============================================================ */}
          {/*  NODE LOG LEVELS                                              */}
          {/* ============================================================ */}

          <section id="node-log-levels">
            <SectionHeading id="node-log-levels-heading">Log Levels</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Five severity levels are available, ordered from least to most severe.
            </p>

            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Level</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Severity</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["debug", "0", "Detailed debugging information."],
                    ["info", "1", "General operational information."],
                    ["warn", "2", "Warning conditions."],
                    ["error", "3", "Error conditions."],
                    ["critical", "4", "Critical failures requiring immediate attention."],
                  ].map(([level, severity, desc]) => (
                    <tr key={level} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{level}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{severity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  NODE CONSOLE OUTPUT                                          */}
          {/* ============================================================ */}

          <section id="node-console-output">
            <SectionHeading id="node-console-output-heading">Console Output</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Logs print to stdout in a human-readable format outside production. Metadata is
              indented under the headline for fast scanning.
            </p>
            <CodeBlock
              language="text"
              code={`[2026-01-15T10:30:00.000Z] [INFO] [UserService] User logged in
  userId: "user_456"`}
            />
          </section>

          {/* ============================================================ */}
          {/*  NODE REQUIREMENTS                                            */}
          {/* ============================================================ */}

          <section id="node-requirements">
            <SectionHeading id="node-requirements-heading">Requirements</SectionHeading>
            <div className="border border-border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Dependency</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Node.js", ">= 18"],
                    ["TypeScript (optional)", "5.x"],
                  ].map(([dep, version]) => (
                    <tr key={dep} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{dep}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  Footer                                                       */}
          {/* ============================================================ */}

          <Separator className="mt-16 mb-8" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">LogiScout SDKs</p>
                <p className="text-xs text-muted-foreground">Python &middot; Node.js Documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2026 LogiScout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
