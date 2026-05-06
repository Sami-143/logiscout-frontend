"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchDashboard } from "@/lib/store/authSlice"
import {
  DashboardLayout,
  DashboardOverview,
  LiveLogs,
  AnalyticsDashboard,
  Documentation,
  ProjectSelector,
  TokenManagement,
  WebhookConfiguration,
  CollaboratorManagement,
  ChatContainer,
  UserSettings,
} from "@/components/dashboard"
import type { Project } from "@/components/dashboard"
import { projectAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"
import { clearStoredSelectedProject, setStoredSelectedProject } from "@/lib/selected-project"

const log = createLogger("DashboardPage")

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get("view") || "overview"
  const [activeView, setActiveView] = useState(initialView)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0)

  const handleInvitationAccepted = () => {
    setProjectsRefreshKey((k) => k + 1)
  }
  
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  // Fetch dashboard data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboard())
        .unwrap()
        .then((response) => {
          if (response.data) {
            setDashboardData(response.data)
            log.info("Dashboard data loaded")
          }
        })
        .catch((error) => {
          log.error({ error }, "Failed to load dashboard data")
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          })
        })
    }
  }, [isAuthenticated, dispatch, toast])

  // Handle collaborator invite acceptance via URL param
  useEffect(() => {
    if (!isAuthenticated) return
    const inviteToken = searchParams.get("accept_invite")
    if (!inviteToken) return

    projectAPI
      .acceptInvite(inviteToken)
      .then((res) => {
        if (res.success) {
          log.info("Collaborator invite accepted")
          toast({
            title: "Invitation accepted",
            description: "You now have access to the shared project.",
          })
          setProjectsRefreshKey((k) => k + 1)
        } else {
          toast({
            title: "Invitation issue",
            description: res.message || "Could not accept invitation",
            variant: "destructive",
          })
        }
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message || "Could not accept invitation"
        log.error({ err: msg }, "Failed to accept invite")
        toast({
          title: "Invitation issue",
          description: msg,
          variant: "destructive",
        })
      })
      .finally(() => {
        // Clean the URL so refreshing doesn't retry
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href)
          url.searchParams.delete("accept_invite")
          window.history.replaceState({}, "", url.toString())
        }
      })
  }, [isAuthenticated, searchParams, toast])

  const handleSelectProject = (project: Project) => {
    log.info({ projectId: project.id, name: project.name }, "Project selected")
    setSelectedProject(project)
    setStoredSelectedProject({ id: project.id, name: project.name })
    setActiveView("overview") // Go to project overview first
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    clearStoredSelectedProject()
    setActiveView("overview")
  }

  const handleNavigate = (view: string) => {
    if (view === "overview" && !selectedProject) {
      // If no project selected, show project selector
      setActiveView("overview")
      return
    }
    setActiveView(view)
  }

  const globalViews = ["docs", "user-settings", "profile"]

  // If no project is selected and view is overview, show project selector
  if (!selectedProject && !globalViews.includes(activeView)) {
    return (
      <ProtectedRoute>
        <DashboardLayout activeView="overview" onNavigate={(view) => {
          if (view === "docs" || view === "user-settings" || view === "profile") setActiveView(view)
        }} selectedProject={null} onInvitationAccepted={handleInvitationAccepted}>
          <ProjectSelector
            onSelectProject={handleSelectProject}
            onViewDocs={() => setActiveView("docs")}
            refreshKey={projectsRefreshKey}
          />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  // Global views that can be shown without a project
  if (!selectedProject && globalViews.includes(activeView)) {
    const renderGlobalContent = () => {
      switch (activeView) {
        case "docs":
          return <Documentation />
        case "user-settings":
          return <UserSettings />
        case "profile":
          return <UserSettings />
        default:
          return null
      }
    }
    return (
      <ProtectedRoute>
        <DashboardLayout activeView={activeView} onNavigate={(view) => {
          if (view === "overview") {
            setActiveView("overview")
          } else if (globalViews.includes(view)) {
            setActiveView(view)
          }
        }} selectedProject={null} onInvitationAccepted={handleInvitationAccepted}>
          {renderGlobalContent()}
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview />
      case "logs":
        return <LiveLogs projectId={selectedProject?.id} projectName={selectedProject?.name} />
      case "settings":
        return selectedProject ? (
          <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Project Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage API tokens, GitHub integration, and team members for{" "}
                <span className="font-medium text-foreground">{selectedProject.name}</span>.
              </p>
            </div>

            {selectedProject.role === "owner" && (
              <>
                <section className="rounded-xl border border-border bg-card overflow-hidden">
                  <TokenManagement
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                  />
                </section>

                <section className="rounded-xl border border-border bg-card overflow-hidden">
                  <WebhookConfiguration
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                  />
                </section>
              </>
            )}

            <section className="rounded-xl border border-border bg-card overflow-hidden">
              <CollaboratorManagement
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                currentUserRole={selectedProject.role}
              />
            </section>
          </div>
        ) : null
      case "chat":
        return selectedProject ? (
          <ChatContainer projectId={selectedProject.id} projectName={selectedProject.name} />
        ) : null
      case "analytics":
        return <AnalyticsDashboard />
      case "docs":
        return <Documentation />
      case "user-settings":
      case "profile":
        return <UserSettings />
      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        activeView={activeView}
        onNavigate={handleNavigate}
        selectedProject={selectedProject}
        onBackToProjects={handleBackToProjects}
        onInvitationAccepted={handleInvitationAccepted}
      >
        {renderContent()}
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}
