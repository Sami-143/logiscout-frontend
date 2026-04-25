"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  FolderOpen,
  Activity,
  Clock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Code2,
  Trash2,
  Search,
  FileText,
  ExternalLink,
  Key,
  Loader2,
  Copy,
  Check,
  Terminal,
  BookOpen,
  ShieldCheck,
} from "lucide-react"
import { projectAPI, type ProjectData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("ProjectSelector")

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string
  name: string
  description: string
  language: "python" | "nodejs"
  owner_id: string
  status: "active" | "inactive"
  token_count: number
  created_at: string
  updated_at: string
  webhook_base_url: string | null
}

interface ProjectSelectorProps {
  onSelectProject: (project: Project) => void
  onViewDocs: () => void
}

type WizardStep = "details" | "language" | "creating" | "token"

/* ------------------------------------------------------------------ */
/*  SDK Docs (shown after project creation)                            */
/* ------------------------------------------------------------------ */

const SDK_DOCS: Record<
  "python" | "nodejs",
  { install: string; usage: string; label: string; icon: string }
> = {
  python: {
    label: "Python",
    icon: "🐍",
    install: "pip install logiscout",
    usage: `from logiscout import LogiScout

# Initialize with your API token
scout = LogiScout(token="YOUR_TOKEN")

# Send logs
scout.info("Payment processed", {"order_id": "12345"})
scout.error("Payment failed", {"error": "timeout"})
scout.warn("Rate limit approaching", {"usage": "89%"})`,
  },
  nodejs: {
    label: "Node.js",
    icon: "🟢",
    install: "npm install logiscout",
    usage: `import { LogiScout } from 'logiscout';

// Initialize with your API token
const scout = new LogiScout({ token: 'YOUR_TOKEN' });

// Send logs
scout.info('Payment processed', { orderId: '12345' });
scout.error('Payment failed', { error: 'timeout' });
scout.warn('Rate limit approaching', { usage: '89%' });`,
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProjectSelector({ onSelectProject, onViewDocs }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  /* Wizard state */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState<WizardStep>("details")
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [selectedLang, setSelectedLang] = useState<"python" | "nodejs">("python")
  const [creating, setCreating] = useState(false)
  const [createdProject, setCreatedProject] = useState<Project | null>(null)
  const [createdToken, setCreatedToken] = useState("")
  const [tokenCopied, setTokenCopied] = useState(false)

  /* ---------------------------------------------------------------- */
  /*  Fetch projects                                                   */
  /* ---------------------------------------------------------------- */

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await projectAPI.list()
      if (res.success && res.data) {
        setProjects(
          res.data.map((p: ProjectData) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            language: p.language || "python",
            owner_id: p.owner_id,
            status: p.status,
            token_count: p.token_count,
            created_at: p.created_at,
            updated_at: p.updated_at,
            webhook_base_url: p.webhook_base_url ?? null,
          })),
        )
        log.info({ count: res.data.length }, "Projects loaded")
      }
    } catch {
      log.error("Failed to load projects")
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  /* ---------------------------------------------------------------- */
  /*  Wizard helpers                                                   */
  /* ---------------------------------------------------------------- */

  const resetWizard = () => {
    setWizardStep("details")
    setNewName("")
    setNewDesc("")
    setSelectedLang("python")
    setCreating(false)
    setCreatedProject(null)
    setCreatedToken("")
    setTokenCopied(false)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetWizard()
  }

  const handleCreateProject = async () => {
    if (!newName.trim()) return
    setWizardStep("creating")
    setCreating(true)

    try {
      // 1) Create the project
      const res = await projectAPI.create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        language: selectedLang,
      })

      if (!res.success || !res.data) throw new Error("Project creation failed")

      const project: Project = {
        id: res.data.id,
        name: res.data.name,
        description: res.data.description || "",
        language: res.data.language || selectedLang,
        owner_id: res.data.owner_id,
        status: res.data.status,
        token_count: 1,
        created_at: res.data.created_at,
        updated_at: res.data.updated_at,
        webhook_base_url: res.data.webhook_base_url ?? null,
      }

      // 2) Auto-generate an API token
      const tokenRes = await projectAPI.createToken(project.id, { label: "Default" })

      if (!tokenRes.success || !tokenRes.data) throw new Error("Token creation failed")

      setCreatedProject(project)
      setCreatedToken(tokenRes.data.token)
      setProjects((prev) => [project, ...prev])
      setWizardStep("token")

      log.info({ projectId: project.id, name: project.name }, "Project created with token")
    } catch {
      log.error({ name: newName }, "Failed to create project")
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" })
      setWizardStep("language") // go back so user can retry
    } finally {
      setCreating(false)
    }
  }

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(createdToken)
      setTokenCopied(true)
      toast({ title: "Copied", description: "Token copied to clipboard" })
      setTimeout(() => setTokenCopied(false), 2000)
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" })
    }
  }

  const handleFinish = () => {
    if (createdProject) {
      onSelectProject(createdProject)
    }
    handleDialogChange(false)
  }

  /* ---------------------------------------------------------------- */
  /*  Delete                                                           */
  /* ---------------------------------------------------------------- */

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await projectAPI.delete(id)
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
        log.info({ projectId: id }, "Project deleted")
        toast({ title: "Deleted", description: "Project deleted" })
      }
    } catch {
      log.error({ projectId: id }, "Failed to delete project")
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" })
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return iso
    }
  }

  const langLabel = (lang: string) => (lang === "nodejs" ? "Node.js" : "Python")

  /* ---------------------------------------------------------------- */
  /*  Wizard Steps                                                     */
  /* ---------------------------------------------------------------- */

  const renderWizardContent = () => {
    switch (wizardStep) {
      /* ---- Step 1: Name & Description ---- */
      case "details":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Every project gets its own bot and API token for log ingestion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Payment Service"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && newName.trim() && setWizardStep("language")}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-desc">Description (optional)</Label>
                <Textarea
                  id="project-desc"
                  placeholder="Brief description of your service or application"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setWizardStep("language")}
                disabled={!newName.trim()}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )

      /* ---- Step 2: Language Selection ---- */
      case "language":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Select Language</DialogTitle>
              <DialogDescription>
                Choose the language for your project. This determines the SDK setup instructions.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-6">
              {(["python", "nodejs"] as const).map((lang) => {
                const doc = SDK_DOCS[lang]
                const isSelected = selectedLang === lang
                return (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="text-3xl">{doc.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{doc.label}</span>
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {doc.install}
                    </code>
                  </button>
                )
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setWizardStep("details")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCreateProject} className="gap-2">
                Create Project
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )

      /* ---- Step 3: Creating (spinner) ---- */
      case "creating":
        return (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-foreground">Creating your project...</p>
              <p className="text-sm text-muted-foreground mt-1">Setting up your bot and generating an API token</p>
            </div>
          </div>
        )

      /* ---- Step 4: Token + Quick-start docs ---- */
      case "token":
        return (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Project Created!</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Your API token is shown below. Copy it now — it won&apos;t be shown again.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* API Token */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4 text-primary" />
                  API Token
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 block text-xs bg-muted border border-border rounded-lg px-3 py-2.5 font-mono break-all select-all">
                    {createdToken}
                  </code>
                  <Button size="icon" variant="outline" onClick={handleCopyToken} className="flex-shrink-0">
                    {tokenCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Store this token securely. It cannot be retrieved later.
                </p>
              </div>

              <Separator />

              {/* Quick-start guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Quick Start — {SDK_DOCS[selectedLang].label}
                </h4>

                {/* Install */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    1. Install the SDK
                  </p>
                  <pre className="text-xs bg-muted border border-border rounded-lg px-3 py-2 font-mono overflow-x-auto">
                    {SDK_DOCS[selectedLang].install}
                  </pre>
                </div>

                {/* Usage */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    2. Initialize &amp; send logs
                  </p>
                  <pre className="text-xs bg-muted border border-border rounded-lg px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap">
                    {SDK_DOCS[selectedLang].usage.replace("YOUR_TOKEN", createdToken || "YOUR_TOKEN")}
                  </pre>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="gap-2" onClick={onViewDocs}>
                <FileText className="h-4 w-4" />
                Full Documentation
              </Button>
              <Button onClick={handleFinish} className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Select a project to view live logs, incidents, and manage API tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={onViewDocs}>
            <FileText className="h-4 w-4" />
            Documentation
          </Button>

          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px]">
              {renderWizardContent()}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: projects.length, icon: FolderOpen },
          { label: "Active", value: projects.filter((p) => p.status === "active").length, icon: Activity },
          { label: "API Tokens", value: projects.reduce((a, p) => a + (p.token_count || 0), 0), icon: Key },
          { label: "Inactive", value: projects.filter((p) => p.status === "inactive").length, icon: Clock },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term."
                : "Create your first project to start monitoring your applications."}
            </p>
          </div>
          {!searchQuery && (
            <Button className="gap-2 mt-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Card
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="p-5 border-border bg-card hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{formatDate(project.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-muted text-muted-foreground mr-1"
                  >
                    {langLabel(project.language)}
                  </Badge>
                  <Badge
                    variant={project.status === "active" ? "default" : "secondary"}
                    className={`text-[10px] ${
                      project.status === "active"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        project.status === "active" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                      }`}
                    />
                    {project.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(project.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
              )}

              <Separator className="mb-3" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-3 w-3" />
                    {project.token_count} token{project.token_count !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(project.updated_at)}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))}

          {/* Create new project card */}
          <Card
            onClick={() => setDialogOpen(true)}
            className="p-5 border-dashed border-2 border-border hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center text-center min-h-[200px] group"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors mb-3">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="font-semibold text-foreground">New Project</h4>
            <p className="text-xs text-muted-foreground mt-1">Create a new project to monitor</p>
          </Card>
        </div>
      )}

      {/* Getting Started Tip */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground flex-shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Getting Started with LogiScout</h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Create a project, generate an API token, and integrate the LogiScout Logger SDK into
              your Python or Node.js application to start streaming logs.
            </p>
            <Button variant="link" className="px-0 h-auto mt-2 gap-1.5 text-primary" onClick={onViewDocs}>
              Read the Documentation
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
