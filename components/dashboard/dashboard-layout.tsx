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
  Bell,
  Search,
  ChevronDown,
  Zap,
  Menu,
  X,
  Home,
  BarChart3,
  Workflow,
  FileText,
  HelpCircle,
  Terminal,
  ChevronLeft,
  FolderOpen,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logoutAsync } from "@/lib/store/authSlice"

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

function UserMenu() {
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
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
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
}


// Global nav — always visible regardless of project selection
const GLOBAL_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "integrations", label: "Integrations", icon: Workflow },
  { id: "docs", label: "Documentation", icon: FileText },
]

// Project-scoped nav — only visible when a project is selected
const PROJECT_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "logs", label: "Live Logs", icon: Terminal },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "docs", label: "Documentation", icon: FileText },
]

export function DashboardLayout({ children, activeView = "overview", onNavigate, selectedProject, onBackToProjects }: DashboardLayoutProps) {
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onNavigate?.("docs")}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <UserMenu />
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
          <nav className="flex flex-col h-full p-4 gap-1">
            {selectedProject && onBackToProjects && (
              <>
                <button
                  onClick={onBackToProjects}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  All Projects
                </button>
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground truncate">{selectedProject.name}</span>
                </div>
                <Separator className="mb-2" />
              </>
            )}
            {(selectedProject ? PROJECT_NAV_ITEMS : GLOBAL_NAV_ITEMS).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {React.createElement(item.icon, { className: "h-4 w-4" })}
                {item.label}
              </button>
            ))}

            <Separator className="my-4" />

            <button
              onClick={() => handleNavClick("docs")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === "settings-project"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Project Settings
            </button>
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
