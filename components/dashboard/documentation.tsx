"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import {
  BookOpen,
  Code2,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  Search,
  Zap,
  ArrowRight,
  ExternalLink,
  Package,
  Server,
  Shield,
  Layers,
  Webhook,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  Globe,
  Database,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle2,
  Info,
  Lightbulb,
  Hash,
  Box,
  Cpu,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Reusable helpers                                                   */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function CodeBlock({ code, language = "python", filename }: { code: string; language?: string; filename?: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-[#0d1117] text-sm font-mono overflow-hidden my-4">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-[#161b22]">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{filename}</span>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
            {language}
          </Badge>
        </div>
      )}
      <CopyButton text={code} />
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  )
}

function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "tip" | "important"
  title?: string
  children: React.ReactNode
}) {
  const styles = {
    info: { border: "border-blue-500/30", bg: "bg-blue-500/5", icon: Info, iconColor: "text-blue-500", titleColor: "text-blue-500" },
    warning: { border: "border-yellow-500/30", bg: "bg-yellow-500/5", icon: AlertTriangle, iconColor: "text-yellow-500", titleColor: "text-yellow-500" },
    tip: { border: "border-green-500/30", bg: "bg-green-500/5", icon: Lightbulb, iconColor: "text-green-500", titleColor: "text-green-500" },
    important: { border: "border-purple-500/30", bg: "bg-purple-500/5", icon: Zap, iconColor: "text-purple-500", titleColor: "text-purple-500" },
  }
  const s = styles[type]
  const Icon = s.icon
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 my-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${s.iconColor}`} />
        <div className="space-y-1 text-sm">
          {title && <p className={`font-semibold ${s.titleColor}`}>{title}</p>}
          <div className="text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
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
    label: "Overview",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "concepts", label: "Core Concepts", icon: Layers },
    ],
  },
  {
    label: "Python SDK",
    items: [
      { id: "quickstart", label: "Quick Start", icon: Zap },
      { id: "installation", label: "Installation", icon: Package },
      { id: "initialization", label: "Initialization", icon: Settings },
      { id: "logging", label: "Logging", icon: Terminal },
      { id: "middleware", label: "Middleware", icon: Server },
      { id: "standalone", label: "Standalone Mode", icon: Box },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { id: "fastapi", label: "FastAPI", icon: Zap },
      { id: "flask", label: "Flask", icon: Globe },
      { id: "django", label: "Django", icon: Database },
    ],
  },
  {
    label: "Platform",
    items: [
      { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "incidents", label: "Incidents", icon: AlertTriangle },
      { id: "alerting", label: "Alerting & Notifications", icon: Bell },
      { id: "integrations", label: "Integrations", icon: Webhook },
    ],
  },
  {
    label: "REST API",
    items: [
      { id: "api-overview", label: "API Overview", icon: Code2 },
      { id: "api-auth", label: "Authentication", icon: Shield },
      { id: "api-logs", label: "Logs API", icon: FileText },
      { id: "api-incidents", label: "Incidents API", icon: AlertTriangle },
    ],
  },
]

const NODEJS_SIDEBAR_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "concepts", label: "Core Concepts", icon: Layers },
    ],
  },
  {
    label: "Node.js SDK",
    items: [
      { id: "nodejs-quickstart", label: "Quick Start", icon: Zap },
      { id: "nodejs-logging", label: "Logging", icon: Terminal },
      { id: "nodejs-errors", label: "Error Handling", icon: AlertTriangle },
      { id: "nodejs-express", label: "Express Integration", icon: Server },
      { id: "nodejs-api-ref", label: "API Reference", icon: Code2 },
    ],
  },
  {
    label: "Platform",
    items: [
      { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "incidents", label: "Incidents", icon: AlertTriangle },
      { id: "alerting", label: "Alerting & Notifications", icon: Bell },
      { id: "integrations", label: "Integrations", icon: Webhook },
    ],
  },
  {
    label: "REST API",
    items: [
      { id: "api-overview", label: "API Overview", icon: Code2 },
      { id: "api-auth", label: "Authentication", icon: Shield },
      { id: "api-logs", label: "Logs API", icon: FileText },
      { id: "api-incidents", label: "Incidents API", icon: AlertTriangle },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Main documentation component                                       */
/* ------------------------------------------------------------------ */

export function Documentation() {
  const [activeSection, setActiveSection] = useState("introduction")
  const [searchQuery, setSearchQuery] = useState("")
  const [sdkTab, setSdkTab] = useState<"python" | "nodejs">("python")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const sectionIdsRef = useRef<string[]>([])

  const activeSections = sdkTab === "python" ? PYTHON_SIDEBAR_SECTIONS : NODEJS_SIDEBAR_SECTIONS

  useEffect(() => {
    sectionIdsRef.current = activeSections.flatMap((s) => s.items.map((i) => i.id))
  }, [sdkTab]) // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [sdkTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll the sidebar so the active nav item is always visible
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const activeBtn = sidebar.querySelector<HTMLElement>(`[data-section="${activeSection}"]`)
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [activeSection])

  const switchTab = (tab: "python" | "nodejs") => {
    setSdkTab(tab)
    setActiveSection("introduction")
    scrollContainerRef.current?.scrollTo({ top: 0 })
  }

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
        {/* SDK Tab Picker + Search */}
        <div className="sticky top-0 bg-card/80 backdrop-blur-md z-10 p-3 space-y-2.5 border-b border-border">
          {/* Python / Node.js toggle */}
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 gap-0.5">
            <button
              onClick={() => switchTab("python")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                sdkTab === "python"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Python
            </button>
            <button
              onClick={() => switchTab("nodejs")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                sdkTab === "nodejs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              Node.js
            </button>
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
              <span className="text-foreground font-medium">LogiScout Platform</span>
            </div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  LogiScout Documentation
                </h1>
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Everything you need to integrate LogiScout into your application — SDK guides
                  for <strong className="text-foreground">Python</strong> and{" "}
                  <strong className="text-foreground">Node.js</strong>, framework integrations,
                  platform configuration, and the full REST API reference.
                </p>
              </div>
              <Badge variant="outline" className="flex-shrink-0 gap-1.5 px-3 py-1.5 text-xs border-primary/30 text-primary">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                v1.0 Stable
              </Badge>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant={sdkTab === "python" ? "default" : "outline"}
                size="sm" className="gap-2 h-9"
                onClick={() => switchTab("python")}
              >
                <Terminal className="h-4 w-4" />
                Python SDK
              </Button>
              <Button
                variant={sdkTab === "nodejs" ? "default" : "outline"}
                size="sm" className="gap-2 h-9"
                onClick={() => switchTab("nodejs")}
              >
                <Server className="h-4 w-4" />
                Node.js SDK
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => scrollTo("api-overview")}>
                <Code2 className="h-4 w-4" />
                API Reference
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <ExternalLink className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>

          <Separator className="mb-10" />

          {/* ============================================================ */}
          {/*  INTRODUCTION                                                 */}
          {/* ============================================================ */}

          <section id="introduction">
            <SectionHeading id="introduction-heading">Introduction</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">LogiScout</strong> is an AI-powered observability
              platform that unifies structured logging, real-time incident detection, and automated
              root-cause analysis into a single, developer-friendly system. It provides native SDKs
              for <strong className="text-foreground">Python</strong> and{" "}
              <strong className="text-foreground">Node.js</strong> that integrate with every major
              web framework — FastAPI, Flask, Django, and Express — with zero boilerplate.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When your application ships logs to LogiScout, they flow through a token-authenticated
              ingestion pipeline that indexes, enriches, and correlates them with incidents in
              real-time. A RAG-powered AI engine continuously cross-references incoming error
              patterns against a vector database of historical incidents to generate automated
              root-cause analyses and step-by-step remediation suggestions — reducing mean time to
              resolution by up to 80%.
            </p>

            {/* Architecture diagram */}
            <div className="mt-8 rounded-xl border border-border bg-muted/20 p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Platform Architecture
              </h4>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 text-xs">
                {[
                  { label: "Your App", sub: "Python / Node.js SDK", icon: Code2, color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                  { label: "Ingestion API", sub: "Token-auth · HTTPS", icon: Shield, color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                  { label: "Pipeline", sub: "Index · Correlate · Enrich", icon: Cpu, color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" },
                  { label: "AI Engine", sub: "RAG root-cause analysis", icon: Zap, color: "bg-pink-500/10 border-pink-500/20 text-pink-600" },
                  { label: "Dashboard", sub: "Logs · Incidents · Analytics", icon: BarChart3, color: "bg-green-500/10 border-green-500/20 text-green-600" },
                ].map((node, i, arr) => (
                  <div key={node.label} className="flex sm:flex-row items-center flex-1 gap-2 sm:gap-0">
                    <div className={`flex flex-col items-center justify-center rounded-xl border p-3 flex-1 text-center ${node.color}`}>
                      <node.icon className="h-4 w-4 mb-1.5" />
                      <span className="font-semibold text-[11px] leading-tight">{node.label}</span>
                      <span className="text-[10px] opacity-60 mt-0.5 leading-tight">{node.sub}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40 mx-1.5 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[
                {
                  icon: Terminal,
                  title: "Structured Logging",
                  desc: "JSON-formatted output with contextual key-value pairs, timestamps, log levels, and correlation IDs.",
                },
                {
                  icon: Server,
                  title: "Remote Transport",
                  desc: "Ship logs to your LogiScout instance over HTTPS with automatic batching and retry logic.",
                },
                {
                  icon: Shield,
                  title: "Correlation Tracking",
                  desc: "Auto-generated correlation IDs per request via ASGI/WSGI middleware for end-to-end tracing.",
                },
                {
                  icon: Zap,
                  title: "AI Root-Cause Analysis",
                  desc: "RAG-based engine correlates current errors with past incidents for 89%+ match confidence.",
                },
                {
                  icon: MessageSquare,
                  title: "Slack & Teams Alerts",
                  desc: "Instant incident alerts delivered to your team's Slack channels and Microsoft Teams.",
                },
                {
                  icon: BarChart3,
                  title: "Analytics Dashboard",
                  desc: "Real-time log volume, error rate trends, and incident timeline visualization.",
                },
              ].map((f) => (
                <Card key={f.title} className="p-4 bg-card hover:bg-muted/30 transition-colors border-border">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {sdkTab === "python" && <>
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
            <SectionHeading id="quickstart-heading">Quick Start (5 minutes)</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Get LogiScout Logger integrated into your Python application in under five minutes.
              Follow these three steps to start shipping structured logs to your LogiScout instance.
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
                    Call <InlineCode>init()</InlineCode> once at application startup to configure the
                    remote transport. Add the appropriate middleware for request correlation.
                  </p>
                  <CodeBlock
                    language="python"
                    filename="main.py"
                    code={`from fastapi import FastAPI
from logiscout_logger import init, get_logger, asgiConfiguration

app = FastAPI()

# Initialize LogiScout with your instance endpoint
init(
    service_name="my-fastapi-app",
    endpoint="https://logiscout.example.com/logs"
)

# Add ASGI middleware for automatic correlation IDs
app.add_middleware(asgiConfiguration)`}
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

logger = get_logger(__name__)

def process_payment(amount: float):
    logger.info("Processing payment", amount=amount, currency="USD")
    try:
        # ... business logic ...
        logger.info("Payment successful", amount=amount)
    except Exception as e:
        logger.error("Payment failed", error=str(e), amount=amount)`}
                  />
                </div>
              </div>
            </div>

            <Callout type="tip" title="You're all set!">
              Logs now stream to your LogiScout dashboard in real-time. Head to{" "}
              <strong>Live Logs</strong> in the sidebar to see them appear.
            </Callout>
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

            <SubHeading id="install-poetry">Using Poetry</SubHeading>
            <CodeBlock code="poetry add logiscout-logger" language="bash" />

            <SubHeading id="install-pipenv">Using Pipenv</SubHeading>
            <CodeBlock code="pipenv install logiscout-logger" language="bash" />

            <SubHeading id="install-requirements">requirements.txt</SubHeading>
            <CodeBlock code="logiscout-logger>=1.0.0" language="text" filename="requirements.txt" />

            <SubHeading id="verify-installation">Verify Installation</SubHeading>
            <CodeBlock
              language="python"
              code={`import logiscout_logger
print(logiscout_logger.__version__)  # → 1.0.0`}
            />

            <Callout type="info" title="Dependencies">
              The package automatically installs <InlineCode>structlog</InlineCode>,{" "}
              <InlineCode>httpx</InlineCode> (async HTTP client for log transport), and{" "}
              <InlineCode>python-json-logger</InlineCode>. No additional setup is needed.
            </Callout>
          </section>

          </>}

          {/* ============================================================ */}
          {/*  CORE CONCEPTS                                                */}
          {/* ============================================================ */}

          <section id="concepts">
            <SectionHeading id="concepts-heading">Core Concepts</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Understanding these concepts will help you make the most of LogiScout Logger and the
              LogiScout platform.
            </p>

            <div className="mt-6 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Structured Logging</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Instead of free-form strings, structured logging emits key-value pairs
                    alongside your message. This makes logs machine-parseable, filterable, and
                    searchable. LogiScout Logger uses JSON as the output format by default. Every
                    log entry includes: <InlineCode>timestamp</InlineCode>,{" "}
                    <InlineCode>level</InlineCode>, <InlineCode>event</InlineCode> (your message),{" "}
                    <InlineCode>service</InlineCode>, and any additional context you bind.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Correlation IDs</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    A correlation ID is a unique identifier propagated through every log line
                    within a single HTTP request. The ASGI/WSGI middleware injects this
                    automatically so you can trace a request across services. If an incoming
                    request has an <InlineCode>X-Correlation-ID</InlineCode> header, the
                    middleware reuses it; otherwise, a new UUID is generated.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Remote Transport</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    When you call <InlineCode>init()</InlineCode> with an endpoint, the library
                    configures an asynchronous HTTP transport that batches logs and ships them to
                    LogiScout&apos;s ingestion API over HTTPS. Logs are buffered in memory (max
                    100 entries or 5 seconds, whichever comes first) to minimize network overhead.
                    Failed deliveries are retried with exponential back-off up to 3 times.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Incidents</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    An incident is an event that requires immediate attention from your engineering
                    team. LogiScout automatically creates incidents when error-level logs match
                    predefined alert rules. Incidents track state (<InlineCode>triggered</InlineCode> →{" "}
                    <InlineCode>investigating</InlineCode> →{" "}
                    <InlineCode>identified</InlineCode> →{" "}
                    <InlineCode>resolved</InlineCode>), assignees, timeline, and root-cause analysis.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">RAG-Based Root Cause Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    LogiScout uses Retrieval-Augmented Generation to compare new errors against a
                    vector database of past incident data. When a new error pattern matches a
                    historical incident, the AI generates suggested root causes, remediation steps,
                    and links to the original resolution — significantly reducing MTTR.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {sdkTab === "python" && <>
          {/* ============================================================ */}
          {/*  INITIALIZATION                                               */}
          {/* ============================================================ */}

          <section id="initialization">
            <SectionHeading id="initialization-heading">Initialization</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The <InlineCode>init()</InlineCode> function configures global logging settings and
              the remote transport. Call it <strong>once</strong> during application startup,
              before any logging calls.
            </p>

            <SubHeading id="init-signature">Function Signature</SubHeading>
            <CodeBlock
              language="python"
              code={`def init(
    service_name: str,
    endpoint: str,
    *,
    api_key: str | None = None,
    environment: str = "production",
    log_level: str = "INFO",
    batch_size: int = 100,
    flush_interval: float = 5.0,
    max_retries: int = 3,
    timeout: float = 10.0,
) -> None:`}
            />

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Parameters</h4>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Parameter</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Default</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["service_name", "str", "required", "Unique identifier for your service (e.g., 'auth-service')."],
                      ["endpoint", "str", "required", "LogiScout ingestion endpoint URL."],
                      ["api_key", "str | None", "None", "API key for authenticated log shipping. Generated in Settings → API Keys."],
                      ["environment", "str", '"production"', "Deployment environment label (production, staging, development)."],
                      ["log_level", "str", '"INFO"', "Minimum log level to emit. One of DEBUG, INFO, WARNING, ERROR, CRITICAL."],
                      ["batch_size", "int", "100", "Max number of log entries buffered before flush."],
                      ["flush_interval", "float", "5.0", "Max seconds between automatic flushes."],
                      ["max_retries", "int", "3", "Number of retry attempts for failed HTTP deliveries."],
                      ["timeout", "float", "10.0", "HTTP request timeout in seconds."],
                    ].map(([param, type, def, desc]) => (
                      <tr key={param} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{param}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{def}</td>
                        <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <SubHeading id="init-example">Full Initialization Example</SubHeading>
            <CodeBlock
              language="python"
              filename="config/logging.py"
              code={`from logiscout_logger import init

def setup_logging():
    """Initialize LogiScout logger at application startup."""
    init(
        service_name="payment-service",
        endpoint="https://logiscout.example.com/logs",
        api_key="lsk_live_abc123...",
        environment="production",
        log_level="INFO",
        batch_size=50,
        flush_interval=3.0,
    )`}
            />

            <Callout type="warning" title="Environment Variables">
              Never hard-code API keys. Use environment variables instead:
              <CodeBlock
                language="python"
                code={`import os
init(
    service_name=os.getenv("SERVICE_NAME", "my-app"),
    endpoint=os.getenv("LOGISCOUT_ENDPOINT"),
    api_key=os.getenv("LOGISCOUT_API_KEY"),
)`}
              />
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  LOGGING                                                      */}
          {/* ============================================================ */}

          <section id="logging">
            <SectionHeading id="logging-heading">Logging</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The <InlineCode>get_logger()</InlineCode> function returns a
              bound <InlineCode>structlog</InlineCode> logger instance scoped
              to the given name. Pass any keyword arguments alongside your message
              to add structured context.
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

            <SubHeading id="basic-usage">Basic Usage</SubHeading>
            <CodeBlock
              language="python"
              code={`from logiscout_logger import get_logger

logger = get_logger("order-service")

# Simple message
logger.info("Order created")

# With structured context
logger.info("Order created", order_id="ORD-12345", user_id=42, total=99.99)

# Warning with context
logger.warning("Inventory running low", sku="WIDGET-01", remaining=3)

# Error with exception info
try:
    process_order(order)
except Exception as e:
    logger.error("Order processing failed", error=str(e), order_id=order.id)

# Debug (only emitted if log_level is set to DEBUG)
logger.debug("Cache miss", key="user:42:profile")`}
            />

            <SubHeading id="log-output">Output Format</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Every log entry is emitted as a JSON object with a consistent schema:
            </p>
            <CodeBlock
              language="json"
              filename="stdout"
              code={`{
  "timestamp": "2026-02-10T14:32:01.482Z",
  "level": "info",
  "event": "Order created",
  "service": "order-service",
  "environment": "production",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "order_id": "ORD-12345",
  "user_id": 42,
  "total": 99.99
}`}
            />

            <SubHeading id="exception-logging">Exception Logging</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              When you pass <InlineCode>exc_info=True</InlineCode> or log inside an{" "}
              <InlineCode>except</InlineCode> block, the full traceback is automatically
              captured and formatted.
            </p>
            <CodeBlock
              language="python"
              code={`try:
    result = 1 / 0
except ZeroDivisionError:
    logger.error("Division by zero", exc_info=True)
    # Traceback is automatically included in the JSON output`}
            />
          </section>

          {/* ============================================================ */}
          {/*  MIDDLEWARE                                                    */}
          {/* ============================================================ */}

          <section id="middleware">
            <SectionHeading id="middleware-heading">Middleware</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout provides two middleware implementations for automatic request context
              injection. The middleware generates a unique correlation ID per request (or reuses{" "}
              <InlineCode>X-Correlation-ID</InlineCode> from the incoming headers) and binds it
              to every log call within that request&apos;s scope.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <Card className="p-5 border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-500/10 text-green-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">asgiConfiguration</h4>
                    <p className="text-xs text-muted-foreground">For async frameworks</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compatible with FastAPI, Starlette, Quart, and any ASGI 3.0 application. Uses
                  async context variables for zero-overhead correlation propagation.
                </p>
              </Card>
              <Card className="p-5 border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">wsgiConfiguration</h4>
                    <p className="text-xs text-muted-foreground">For sync frameworks</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compatible with Flask, Django, Bottle, and any WSGI application. Uses
                  thread-local storage for correlation propagation within synchronous request handlers.
                </p>
              </Card>
            </div>

            <Callout type="info" title="Middleware capabilities">
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Generates or propagates <InlineCode>X-Correlation-ID</InlineCode> headers</li>
                <li>Binds <InlineCode>correlation_id</InlineCode>, <InlineCode>http_method</InlineCode>, <InlineCode>http_path</InlineCode>, and <InlineCode>http_status</InlineCode> to every log entry</li>
                <li>Logs request start and completion with timing information</li>
                <li>Sets the correlation ID on the response header for downstream tracing</li>
              </ul>
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  STANDALONE MODE                                              */}
          {/* ============================================================ */}

          <section id="standalone">
            <SectionHeading id="standalone-heading">Standalone Mode</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              You can use <InlineCode>logiscout-logger</InlineCode> as a standard structured
              logging library <strong>without</strong> connecting to the LogiScout platform. In
              standalone mode, all logs are formatted as JSON and written to{" "}
              <InlineCode>stdout</InlineCode>. There is no need to call{" "}
              <InlineCode>init()</InlineCode> or configure an endpoint.
            </p>

            <CodeBlock
              language="python"
              filename="scripts/etl_job.py"
              code={`from logiscout_logger import get_logger

# No init() call needed — logs go to stdout
logger = get_logger("etl-job")

logger.info("ETL pipeline started", source="s3://data-lake/raw")

for batch in data_batches:
    logger.debug("Processing batch", batch_id=batch.id, records=len(batch))

logger.info("ETL pipeline completed", processed=total, duration_s=elapsed)`}
            />

            <Callout type="tip" title="Great for scripts and CLIs">
              Standalone mode is ideal for cron jobs, data pipelines, CLI tools, and local
              development where you want structured logging without any remote dependency.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  FASTAPI INTEGRATION                                          */}
          {/* ============================================================ */}

          <section id="fastapi">
            <SectionHeading id="fastapi-heading">FastAPI Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              FastAPI is a modern async Python framework. Use the{" "}
              <InlineCode>asgiConfiguration</InlineCode> middleware for seamless integration.
            </p>

            <CodeBlock
              language="python"
              filename="main.py"
              code={`from fastapi import FastAPI, Request
from logiscout_logger import init, get_logger, asgiConfiguration

app = FastAPI(title="My API")

# 1. Initialize LogiScout (once at startup)
init(
    service_name="my-fastapi-app",
    endpoint="https://logiscout.example.com/logs",
    api_key=os.getenv("LOGISCOUT_API_KEY"),
    environment="production",
)

# 2. Add middleware for automatic correlation tracking
app.add_middleware(asgiConfiguration)

# 3. Create a logger
logger = get_logger("api")

@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy"}

@app.post("/orders")
async def create_order(request: Request):
    body = await request.json()
    logger.info("Creating order", user_id=body.get("user_id"))
    # All logs within this request share the same correlation_id
    order = await process_order(body)
    logger.info("Order created", order_id=order.id)
    return {"order_id": order.id}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})`}
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
              code={`from flask import Flask, request, jsonify
from logiscout_logger import init, get_logger, wsgiConfiguration

app = Flask(__name__)

# 1. Initialize LogiScout
init(
    service_name="my-flask-app",
    endpoint="https://logiscout.example.com/logs",
)

# 2. Wrap the WSGI app
app.wsgi_app = wsgiConfiguration(app.wsgi_app)

# 3. Use the logger
logger = get_logger("flask-api")

@app.route("/")
def index():
    logger.info("Index page accessed", ip=request.remote_addr)
    return jsonify({"message": "Hello from Flask"})

@app.errorhandler(500)
def handle_500(error):
    logger.error("Internal server error", error=str(error))
    return jsonify({"detail": "Internal Server Error"}), 500`}
            />
          </section>

          {/* ============================================================ */}
          {/*  DJANGO INTEGRATION                                           */}
          {/* ============================================================ */}

          <section id="django">
            <SectionHeading id="django-heading">Django Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              For Django, apply the WSGI middleware in your{" "}
              <InlineCode>wsgi.py</InlineCode> file and call{" "}
              <InlineCode>init()</InlineCode> in your Django settings or{" "}
              <InlineCode>AppConfig.ready()</InlineCode> hook.
            </p>

            <CodeBlock
              language="python"
              filename="myproject/wsgi.py"
              code={`import os
from django.core.wsgi import get_wsgi_application
from logiscout_logger import wsgiConfiguration

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
application = wsgiConfiguration(get_wsgi_application())`}
            />

            <CodeBlock
              language="python"
              filename="myproject/apps.py"
              code={`import os
from django.apps import AppConfig
from logiscout_logger import init

class MyAppConfig(AppConfig):
    name = "myapp"

    def ready(self):
        init(
            service_name="my-django-app",
            endpoint=os.getenv("LOGISCOUT_ENDPOINT"),
            api_key=os.getenv("LOGISCOUT_API_KEY"),
        )`}
            />

            <CodeBlock
              language="python"
              filename="myapp/views.py"
              code={`from django.http import JsonResponse
from logiscout_logger import get_logger

logger = get_logger("django-views")

def user_profile(request, user_id):
    logger.info("Fetching user profile", user_id=user_id)
    # ... view logic ...
    return JsonResponse({"user_id": user_id})`}
            />
          </section>

          </>}

          {sdkTab === "nodejs" && <>
          {/* ============================================================ */}
          {/*  NODE.JS SDK — section banner                                 */}
          {/* ============================================================ */}

          <div className="mt-14 mb-2">
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
                <p className="text-sm text-muted-foreground">npm &middot; Node.js 18+ &middot; TypeScript &middot; Express</p>
              </div>
            </div>
            <Separator />
          </div>

          {/* ============================================================ */}
          {/*  NODE.JS QUICK START                                          */}
          {/* ============================================================ */}

          <section id="nodejs-quickstart">
            <SectionHeading id="nodejs-quickstart-heading">Quick Start</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Get the <strong className="text-foreground">logiscout</strong> npm package running
              in your Node.js or TypeScript application in under five minutes. The SDK supports
              automatic correlation tracking and optional server-side log transport.
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
                    Install <InlineCode>logiscout</InlineCode> from npm.
                  </p>
                  <CodeBlock code="npm install logiscout" language="bash" />
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
                  <h4 className="font-semibold text-foreground">Initialize LogiScout</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Call <InlineCode>initLogiscout()</InlineCode> once before creating any loggers.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="app.ts"
                    code={`import { initLogiscout } from 'logiscout';

initLogiscout({
  projectName: 'my-app',
  environment: 'dev',     // 'dev' | 'staging' | 'prod'
  apiKey: 'your-api-key'  // optional
});`}
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
                  <h4 className="font-semibold text-foreground">Create a logger and start logging</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use <InlineCode>createLogger()</InlineCode> with a namespace to produce
                    structured, contextual logs.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="services/user.ts"
                    code={`import { createLogger } from 'logiscout';

const logger = createLogger('UserService');

logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error('Failed to process request');`}
                  />
                </div>
              </div>
            </div>

            <Callout type="tip" title="You're all set!">
              Logs now stream to your LogiScout dashboard in real-time when an API key is
              configured. Head to <strong>Live Logs</strong> in the sidebar to see them appear.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  NODE.JS LOGGING                                              */}
          {/* ============================================================ */}

          <section id="nodejs-logging">
            <SectionHeading id="nodejs-logging-heading">Logging (Node.js)</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The <InlineCode>createLogger()</InlineCode> function returns a logger instance
              scoped to the given namespace. Log at five severity levels and attach structured
              metadata to every entry.
            </p>

            <SubHeading id="nodejs-log-levels">Log Levels</SubHeading>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
              {[
                { level: "DEBUG", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
                { level: "INFO", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                { level: "WARN", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
                { level: "ERROR", color: "bg-red-500/10 text-red-500 border-red-500/20" },
                { level: "CRITICAL", color: "bg-red-700/10 text-red-700 border-red-700/20" },
              ].map((l) => (
                <div key={l.level} className={`text-center text-xs font-semibold px-3 py-2 rounded-lg border ${l.color}`}>
                  {l.level}
                </div>
              ))}
            </div>

            <SubHeading id="nodejs-basic-usage">Basic Usage</SubHeading>
            <CodeBlock
              language="typescript"
              code={`import { createLogger } from 'logiscout';

const logger = createLogger('UserService');

// Simple messages
logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error('Failed to process request');
logger.debug('Processing user data');
logger.critical('Database connection lost');`}
            />

            <SubHeading id="nodejs-metadata">Logging with Metadata</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Pass a metadata object as the second argument to attach structured context to your
              log entries.
            </p>
            <CodeBlock
              language="typescript"
              code={`// With metadata
logger.info('User created', { userId: '123', email: 'user@example.com' });

// Control server transport (production only)
logger.info('Order placed', { orderId: '789' }, { send: true });
logger.debug('Cache state', { keys: 42 }, { send: false });`}
            />

            <Callout type="info" title="Transport Control">
              The optional third argument <InlineCode>{`{ send: true | false }`}</InlineCode>{" "}
              controls whether a log entry is shipped to the LogiScout server. This is useful
              for selectively sending logs in production while keeping verbose debug output local.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  NODE.JS ERROR HANDLING                                       */}
          {/* ============================================================ */}

          <section id="nodejs-errors">
            <SectionHeading id="nodejs-errors-heading">Error Handling (Node.js)</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              When logging errors, pass the caught exception as the third argument to
              automatically capture the stack trace and error details.
            </p>

            <CodeBlock
              language="typescript"
              filename="services/config-loader.ts"
              code={`import { createLogger } from 'logiscout';

const logger = createLogger('ConfigLoader');

try {
  JSON.parse('{ invalid json }');
} catch (err) {
  logger.error(
    'Failed to parse config',
    { source: 'config-loader' },
    err
  );
}`}
            />

            <Callout type="tip" title="Error objects">
              When an <InlineCode>Error</InlineCode> object is passed as the third argument, the
              logger automatically extracts the message, stack trace, and error name for structured
              output. This makes it easy to search and filter errors in the LogiScout dashboard.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  EXPRESS INTEGRATION                                          */}
          {/* ============================================================ */}

          <section id="nodejs-express">
            <SectionHeading id="nodejs-express-heading">Express Integration</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout provides a built-in Express middleware for automatic correlation tracking
              across HTTP requests. Use <InlineCode>createCorrelationMiddleware()</InlineCode> to
              inject a unique correlation ID into every request.
            </p>

            <CodeBlock
              language="typescript"
              filename="server.ts"
              code={`import express from 'express';
import { initLogiscout, createLogger, createCorrelationMiddleware } from 'logiscout';

const app = express();

// 1. Initialize LogiScout
initLogiscout({
  projectName: 'my-api',
  environment: 'prod',
  apiKey: 'your-api-key'
});

// 2. Add correlation middleware
app.use(createCorrelationMiddleware());

// 3. Create a logger
const logger = createLogger('API');

app.get('/users', (req, res) => {
  logger.info('Fetching users', { page: req.query.page });
  res.json({ users: [] });
});

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});`}
            />

            <Callout type="info" title="Correlation Middleware">
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Generates a unique correlation ID for each incoming request</li>
                <li>Reuses <InlineCode>X-Correlation-ID</InlineCode> from incoming headers if present</li>
                <li>Binds the correlation ID to all log entries within the request lifecycle</li>
                <li>Sets the <InlineCode>X-Correlation-ID</InlineCode> response header for downstream tracing</li>
              </ul>
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  NODE.JS API REFERENCE                                        */}
          {/* ============================================================ */}

          <section id="nodejs-api-ref">
            <SectionHeading id="nodejs-api-ref-heading">API Reference (Node.js)</SectionHeading>

            <SubHeading id="init-logiscout-fn">initLogiscout(config)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Initialize the SDK. Must be called <strong>once</strong> before creating any loggers.
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
                    ["projectName", "string", "Yes", "Name of your project"],
                    ["environment", "'dev' | 'staging' | 'prod'", "Yes", "Current environment"],
                    ["apiKey", "string", "No", "API key for server transport"],
                  ].map(([param, type, req, desc]) => (
                    <tr key={param} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{param}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{type}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{req}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeading id="create-logger-fn">createLogger(namespace)</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Creates a logger instance scoped to the given namespace. Returns an object with
              logging methods for each level.
            </p>
            <CodeBlock
              language="typescript"
              code={`const logger = createLogger('MyService');

// Methods available:
logger.info(message, metadata?, options?)
logger.warn(message, metadata?, options?)
logger.error(message, metadata?, errorOrOptions?)
logger.debug(message, metadata?, options?)
logger.critical(message, metadata?, options?)`}
            />

            <SubHeading id="create-correlation-mw-fn">createCorrelationMiddleware()</SubHeading>
            <p className="text-sm text-muted-foreground mb-3">
              Returns an Express middleware function that injects correlation IDs into every
              request for end-to-end tracing.
            </p>
            <CodeBlock
              language="typescript"
              code={`import { createCorrelationMiddleware } from 'logiscout';

// Use as Express middleware
app.use(createCorrelationMiddleware());`}
            />
          </section>

          </>}

          {/* ============================================================ */}
          {/*  DASHBOARD                                                    */}
          {/* ============================================================ */}

          <section id="dashboard">
            <SectionHeading id="dashboard-heading">Dashboard</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The LogiScout Dashboard is your central hub for monitoring application health,
              viewing real-time logs, and managing incidents. It provides four main views:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  title: "Overview",
                  icon: BarChart3,
                  desc: "At-a-glance metrics: active incidents, log volume, error rate, and MTTR. Includes an activity feed with real-time incident and alert updates.",
                },
                {
                  title: "Live Logs",
                  icon: Terminal,
                  desc: "Real-time log stream with powerful filtering by service, level, time range, and full-text search. Click any log entry for detailed context and stack traces.",
                },
                {
                  title: "Incidents",
                  icon: AlertTriangle,
                  desc: "Incident timeline with state management (triggered → investigating → identified → resolved). Includes AI-generated root-cause analysis and suggested remediations.",
                },
                {
                  title: "Analytics",
                  icon: BarChart3,
                  desc: "Historical trends for log volume, error rates, incident frequency, mean time to resolution (MTTR), and service-level reliability metrics.",
                },
              ].map((v) => (
                <Card key={v.title} className="p-5 border-border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                      <v.icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{v.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/*  INCIDENTS                                                    */}
          {/* ============================================================ */}

          <section id="incidents">
            <SectionHeading id="incidents-heading">Incidents</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              Incidents are automatically created when incoming logs match your configured alert
              rules. Each incident follows a lifecycle with four states:
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {[
                { label: "Triggered", color: "bg-red-500/10 border-red-500/30 text-red-500" },
                { label: "Investigating", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" },
                { label: "Identified", color: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
                { label: "Resolved", color: "bg-green-500/10 border-green-500/30 text-green-500" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${s.color}`}>
                    {s.label}
                  </div>
                  {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground leading-relaxed mt-6">
              Each incident includes:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1.5 ml-2">
              <li><strong className="text-foreground">Severity</strong> — Critical, High, Medium, or Low, based on alert rule configuration</li>
              <li><strong className="text-foreground">Timeline</strong> — Chronological record of every state change, assignment, and communication</li>
              <li><strong className="text-foreground">Assignee</strong> — Team member responsible, auto-assigned based on on-call schedule or manually set</li>
              <li><strong className="text-foreground">Root-Cause Analysis</strong> — AI-generated analysis comparing the error signature against historical incidents</li>
              <li><strong className="text-foreground">Related Logs</strong> — All log entries sharing the same correlation ID or error pattern</li>
              <li><strong className="text-foreground">Suggested Remediations</strong> — Step-by-step resolution suggestions drawn from past incident resolutions</li>
            </ul>
          </section>

          {/* ============================================================ */}
          {/*  ALERTING & NOTIFICATIONS                                     */}
          {/* ============================================================ */}

          <section id="alerting">
            <SectionHeading id="alerting-heading">Alerting &amp; Notifications</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout supports multiple notification channels to ensure your team is alerted
              immediately when incidents occur.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: MessageSquare, title: "Slack", desc: "Rich incident cards posted to your #incidents channel with action buttons to acknowledge and resolve." },
                { icon: MessageSquare, title: "Microsoft Teams", desc: "Adaptive Cards with incident details, severity badges, and quick-action buttons for Teams workflows." },
                { icon: Bell, title: "Email & Webhook", desc: "Email digests for stakeholders and generic webhooks for custom integrations (PagerDuty, Opsgenie, etc.)." },
              ].map((n) => (
                <Card key={n.title} className="p-5 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <n.icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground text-sm">{n.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.desc}</p>
                </Card>
              ))}
            </div>

            <Callout type="info" title="Alert Rules">
              Alert rules are defined in <strong>Settings → Alert Rules</strong>. You can match on
              log level, service name, message patterns (regex), and custom field values. Each
              rule specifies which notification channels to use and the incident severity.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  INTEGRATIONS                                                 */}
          {/* ============================================================ */}

          <section id="integrations">
            <SectionHeading id="integrations-heading">Integrations</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              LogiScout connects with your existing development and operations toolchain.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              {[
                { category: "Monitoring", tools: "Prometheus, Grafana, Datadog, New Relic" },
                { category: "ChatOps", tools: "Slack, Microsoft Teams" },
                { category: "Ticketing", tools: "Jira, Linear, GitHub Issues" },
                { category: "CI/CD", tools: "GitHub Actions, GitLab CI, Jenkins" },
                { category: "Cloud", tools: "AWS CloudWatch, GCP Cloud Logging, Azure Monitor" },
                { category: "On-Call", tools: "PagerDuty, Opsgenie, VictorOps" },
              ].map((i) => (
                <div key={i.category} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors">
                  <Webhook className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{i.category}</span>
                    <span className="text-xs text-muted-foreground ml-2">{i.tools}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/*  API OVERVIEW                                                 */}
          {/* ============================================================ */}

          <section id="api-overview">
            <SectionHeading id="api-overview-heading">API Overview</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              The LogiScout REST API allows you to programmatically interact with your logs,
              incidents, and configuration. All endpoints accept and return JSON. Authenticate
              with a Bearer token in the <InlineCode>Authorization</InlineCode> header.
            </p>

            <CodeBlock
              language="bash"
              code={`# Base URL
https://api.logiscout.example.com/v1

# Authentication
curl -H "Authorization: Bearer lsk_live_abc123..." \\
     https://api.logiscout.example.com/v1/incidents`}
            />

            <SubHeading id="api-endpoints">Available Endpoints</SubHeading>
            <div className="border border-border rounded-xl overflow-hidden mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Method</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Endpoint</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["POST", "/v1/logs", "Ingest log entries (used by the library transport)"],
                    ["GET", "/v1/logs", "Search and filter log entries"],
                    ["GET", "/v1/logs/:id", "Retrieve a single log entry by ID"],
                    ["GET", "/v1/incidents", "List all incidents with filtering"],
                    ["GET", "/v1/incidents/:id", "Get incident details, timeline, and analysis"],
                    ["PATCH", "/v1/incidents/:id", "Update incident state or assignee"],
                    ["POST", "/v1/incidents/:id/resolve", "Resolve an incident"],
                    ["GET", "/v1/services", "List registered services"],
                    ["GET", "/v1/analytics/overview", "Get dashboard analytics summary"],
                    ["POST", "/v1/alerts/rules", "Create a new alert rule"],
                    ["GET", "/v1/alerts/rules", "List all alert rules"],
                  ].map(([method, endpoint, desc], index) => (
                    <tr key={`${method}-${endpoint}-${index}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold px-2 py-0.5 ${
                            method === "GET"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : method === "POST"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          }`}
                        >
                          {method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{endpoint}</td>
                      <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  API AUTHENTICATION                                           */}
          {/* ============================================================ */}

          <section id="api-auth">
            <SectionHeading id="api-auth-heading">Authentication</SectionHeading>
            <p className="text-muted-foreground leading-relaxed">
              All API requests require a valid API key. Generate keys in{" "}
              <strong>Settings → API Keys</strong>. Keys are scoped to your organization and can
              be rotated at any time.
            </p>

            <CodeBlock
              language="bash"
              code={`# Pass the API key as a Bearer token
curl -X GET \\
  https://api.logiscout.example.com/v1/incidents \\
  -H "Authorization: Bearer lsk_live_abc123..." \\
  -H "Content-Type: application/json"`}
            />

            <Callout type="warning" title="Security best practice">
              Store API keys in environment variables or a secrets manager. Never commit them to
              version control. Rotate keys immediately if you suspect they have been compromised.
            </Callout>
          </section>

          {/* ============================================================ */}
          {/*  LOGS API                                                     */}
          {/* ============================================================ */}

          <section id="api-logs">
            <SectionHeading id="api-logs-heading">Logs API</SectionHeading>

            <SubHeading id="ingest-logs">Ingest Logs</SubHeading>
            <p className="text-sm text-muted-foreground">
              Used internally by the library transport. You can also use it directly to ship logs
              from custom sources.
            </p>
            <CodeBlock
              language="bash"
              code={`POST /v1/logs
Content-Type: application/json

{
  "entries": [
    {
      "timestamp": "2026-02-10T14:32:01.482Z",
      "level": "error",
      "event": "Database connection timeout",
      "service": "api-gateway",
      "environment": "production",
      "correlation_id": "a1b2c3d4-...",
      "host": "web-01",
      "duration_ms": 30000
    }
  ]
}`}
            />

            <SubHeading id="search-logs">Search Logs</SubHeading>
            <CodeBlock
              language="bash"
              code={`GET /v1/logs?service=api-gateway&level=error&from=2026-02-10T00:00:00Z&limit=50

# Response
{
  "data": [...],
  "pagination": { "total": 142, "limit": 50, "offset": 0 }
}`}
            />
          </section>

          {/* ============================================================ */}
          {/*  INCIDENTS API                                                */}
          {/* ============================================================ */}

          <section id="api-incidents">
            <SectionHeading id="api-incidents-heading">Incidents API</SectionHeading>

            <SubHeading id="list-incidents">List Incidents</SubHeading>
            <CodeBlock
              language="bash"
              code={`GET /v1/incidents?status=investigating&severity=critical

# Response
{
  "data": [
    {
      "id": "inc_abc123",
      "title": "Database Connection Timeout",
      "service": "api-gateway",
      "severity": "critical",
      "status": "investigating",
      "assignee": { "name": "Sarah Chen", "email": "sarah@company.com" },
      "created_at": "2026-02-10T14:30:00Z",
      "updated_at": "2026-02-10T14:32:00Z",
      "root_cause_analysis": {
        "summary": "Connection pool exhausted due to long-running queries...",
        "confidence": 0.89,
        "similar_incidents": ["inc_xyz789"]
      }
    }
  ]
}`}
            />

            <SubHeading id="resolve-incident">Resolve an Incident</SubHeading>
            <CodeBlock
              language="bash"
              code={`POST /v1/incidents/inc_abc123/resolve
Content-Type: application/json

{
  "resolution_note": "Increased connection pool size and added query timeout.",
  "root_cause": "Connection pool exhaustion from unoptimized N+1 queries."
}`}
            />
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
                <p className="text-sm font-semibold text-foreground">LogiScout</p>
                <p className="text-xs text-muted-foreground">AI-Powered Incident Resolution</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Changelog</button>
              <span>·</span>
              <button className="hover:text-foreground transition-colors">Status</button>
              <span>·</span>
              <button className="hover:text-foreground transition-colors">Support</button>
              <span>·</span>
              <span>© 2026 LogiScout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
