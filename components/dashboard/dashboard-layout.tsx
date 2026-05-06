"use client"

import React from "react"

import type { ReactNode } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertTriangle,
  Settings,
  Search,
  ChevronDown,
  Zap,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  HelpCircle,
  Terminal,
  ChevronLeft,
  FolderOpen,
  LogOut,
  User,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logoutAsync } from "@/lib/store/authSlice"
import { NotificationsBell } from "./notifications-bell"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Settings className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const displayName = user?.name || user?.email || "User"

  const handleLogout = () => {
    dispatch(logoutAsync()).then(() => {
      router.push("/")
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{displayName}</p>
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onNavigate?.("profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate?.("user-settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DashboardLayoutProps {
  children?: ReactNode
  activeView?: string
  onNavigate?: (view: string) => void
  selectedProject?: { id: string; name: string } | null
  onBackToProjects?: () => void
  /** Called after a project invitation is accepted so the parent can refresh project data. */
  onInvitationAccepted?: () => void
}


// Global nav — shown only when no project is selected.
// Keep this minimal: project-scoped tools (Analytics, Integrations,
// Settings, etc.) only make sense within a project context.
const GLOBAL_NAV_ITEMS = [
  { id: "overview", label: "Projects", icon: FolderOpen },
  { id: "docs", label: "Documentation", icon: FileText },
]

// Project-scoped nav — shown after a project is selected.
// API tokens and GitHub integration live inside "Project Settings".
const PROJECT_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "logs", label: "Live Logs", icon: Terminal },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Project Settings", icon: Settings },
  { id: "docs", label: "Documentation", icon: FileText },
]

export function DashboardLayout({ children, activeView = "overview", onNavigate, selectedProject, onBackToProjects, onInvitationAccepted }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId)
    }
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center gap-4 px-6">
          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Zap className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground">LogiScout</h1>
              {selectedProject ? (
                <p className="text-[10px] text-muted-foreground leading-none">{selectedProject.name}</p>
              ) : (
                <p className="text-[10px] text-muted-foreground leading-none">Select a project</p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search incidents, logs..."
                className="w-full h-9 rounded-md border border-input bg-transparent pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 focus:ring-[3px] outline-none transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <NotificationsBell onInvitationAccepted={onInvitationAccepted} />
            <Button variant="ghost" size="icon" onClick={() => onNavigate?.("docs")}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <UserMenu onNavigate={onNavigate} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col h-full p-4 gap-1 overflow-y-auto">
            {selectedProject && onBackToProjects ? (
              <>
                <button
                  onClick={onBackToProjects}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  All Projects
                </button>

                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/15 mb-3">
                  <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 flex-shrink-0">
                    <FolderOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                      Current Project
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                      {selectedProject.name}
                    </p>
                  </div>
                </div>

                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Project
                </p>
                {PROJECT_NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeView === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {React.createElement(item.icon, { className: "h-4 w-4 flex-shrink-0" })}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspace
                </p>
                {GLOBAL_NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeView === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {React.createElement(item.icon, { className: "h-4 w-4 flex-shrink-0" })}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}

                <div className="mt-4 mx-1 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
                      <FolderOpen className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Select a project</p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Open a project to access live logs, AI chat, analytics, integrations, and settings.
                  </p>
                </div>
              </>
            )}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
