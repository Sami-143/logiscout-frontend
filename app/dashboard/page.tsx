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
} from "@/components/dashboard"
import type { Project } from "@/components/dashboard"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("DashboardPage")

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get("view") || "overview"
  const [activeView, setActiveView] = useState(initialView)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  
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

  const handleSelectProject = (project: Project) => {
    log.info({ projectId: project.id, name: project.name }, "Project selected")
    setSelectedProject(project)
    setActiveView("overview") // Go to project overview first
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
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

  // If no project is selected and view is overview, show project selector
  if (!selectedProject && activeView !== "docs") {
    return (
      <ProtectedRoute>
        <DashboardLayout activeView="overview" onNavigate={(view) => {
          if (view === "docs") setActiveView("docs")
        }} selectedProject={null}>
          <ProjectSelector
            onSelectProject={handleSelectProject}
            onViewDocs={() => setActiveView("docs")}
          />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  // Docs can be shown without a project
  if (activeView === "docs" && !selectedProject) {
    return (
      <ProtectedRoute>
        <DashboardLayout activeView="docs" onNavigate={(view) => {
          if (view === "overview") {
            setActiveView("overview")
          } else if (view === "docs") {
            setActiveView("docs")
          }
        }} selectedProject={null}>
          <Documentation />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview />
      case "logs":
        return <LiveLogs projectName={selectedProject?.name} />
      case "settings":
        return selectedProject ? (
          <div className="space-y-8">
            <TokenManagement projectId={selectedProject.id} projectName={selectedProject.name} />
            <WebhookConfiguration
              projectId={selectedProject.id}
              projectName={selectedProject.name}
              webhookBaseUrl={selectedProject.webhook_base_url ?? null}
              onBaseUrlSaved={(url) => {
                setSelectedProject((prev) =>
                  prev ? { ...prev, webhook_base_url: url } : prev
                )
              }}
            />
          </div>
        ) : null
      case "analytics":
        return <AnalyticsDashboard />
      case "docs":
        return <Documentation />
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
