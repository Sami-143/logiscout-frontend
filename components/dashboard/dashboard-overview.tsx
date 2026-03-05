"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Zap,
  Github,
  ExternalLink,
  MoreVertical,
  AlertCircle,
  Server,
  Info,
} from "lucide-react"

const MOCK_INCIDENTS = [
  {
    id: "INC-2024-1234",
    title: "Database Connection Timeout",
    service: "API Gateway",
    severity: "critical",
    status: "investigating",
    startTime: "2 min ago",
    assignee: "Sarah Chen",
  },
  {
    id: "INC-2024-1233",
    title: "High Error Rate on /auth endpoint",
    service: "Auth Service",
    severity: "high",
    status: "identified",
    startTime: "15 min ago",
    assignee: "Mike Johnson",
  },
  {
    id: "INC-2024-1232",
    title: "Memory Leak in Worker Process",
    service: "Background Jobs",
    severity: "medium",
    status: "monitoring",
    startTime: "1 hour ago",
    assignee: "Lisa Park",
  },
  {
    id: "INC-2024-1231",
    title: "Slow Query Performance",
    service: "Database",
    severity: "low",
    status: "resolved",
    startTime: "3 hours ago",
    assignee: "Tom Wilson",
  },
]

const ACTIVITY_FEED = [
  {
    id: 1,
    type: "incident",
    title: "New incident detected",
    description: "Database Connection Timeout in API Gateway",
    time: "2 minutes ago",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  {
    id: 3,
    type: "analysis",
    title: "Root cause analysis completed",
    description: "Similar to past incident INC-2024-0892 (confidence: 89%)",
    time: "5 minutes ago",
    icon: Zap,
    iconColor: "text-accent",
  },
  {
    id: 4,
    type: "github",
    title: "Related commit identified",
    description: "Commit ab3c4d1 may be related to current error spike",
    time: "10 minutes ago",
    icon: Github,
    iconColor: "text-muted-foreground",
  },
  {
    id: 5,
    type: "resolved",
    title: "Incident resolved",
    description: "INC-2024-1231 marked as resolved",
    time: "3 hours ago",
    icon: CheckCircle2,
    iconColor: "text-primary",
  },
]

const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    status: "connected",
    repo: "company/api-service",
    lastActivity: "1 hour ago",
    icon: Github,
    color: "text-foreground",
  },
]

export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState("24h")

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor your systems and respond to incidents</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
              <p className="text-3xl font-bold text-foreground">3</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-destructive" />
                <span className="text-destructive">+2 from yesterday</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">MTTR</p>
              <p className="text-3xl font-bold text-foreground">24m</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="h-3 w-3 text-primary" />
                <span className="text-primary">-15% improvement</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Services Monitored</p>
              <p className="text-3xl font-bold text-foreground">12</p>
              <div className="flex items-center gap-1 text-xs">
                <Activity className="h-3 w-3 text-primary" />
                <span className="text-primary">All healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
              <Server className="h-5 w-5 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold text-foreground">99.7%</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">+0.2% this week</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Incidents */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recent Incidents</h2>
                  <p className="text-sm text-muted-foreground mt-1">Track and manage active issues</p>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_INCIDENTS.map((incident) => (
                      <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground text-sm">{incident.id}</p>
                            <p className="text-xs text-muted-foreground">{incident.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {incident.service}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              incident.severity === "critical"
                                ? "destructive"
                                : incident.severity === "high"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {incident.status === "investigating" && (
                              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            )}
                            {incident.status === "identified" && <Info className="h-3.5 w-3.5 text-accent" />}
                            {incident.status === "monitoring" && <Activity className="h-3.5 w-3.5 text-primary" />}
                            {incident.status === "resolved" && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                            <span className="text-xs capitalize">{incident.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{incident.startTime}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Activity Feed</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time system events</p>
              </div>

              <div className="space-y-4">
                {ACTIVITY_FEED.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-muted flex-shrink-0`}>
                        <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                    {index < ACTIVITY_FEED.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-6 bg-transparent" size="sm">
                View All Activity
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Integrations Status */}
      <Card className="border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Integration Status</h2>
              <p className="text-sm text-muted-foreground mt-1">Connected collaboration tools and services</p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {INTEGRATIONS.map((integration) => (
              <Card key={integration.id} className="p-5 border-border bg-muted/30">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-background`}>
                    <integration.icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{integration.name}</h3>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      {integration.id === "github" && `Repo: ${integration.repo}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last activity:</span>
                    <span className="text-foreground font-medium">{integration.lastActivity}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button variant="ghost" size="sm" className="w-full gap-2 h-8">
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Collaboration Tools Active</p>
                <p className="text-xs text-muted-foreground">
                  LogiScout integrates with your development tools to provide real-time alerts, root cause analysis,
                  and incident updates directly where your team works.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
