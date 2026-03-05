"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Download, Filter, AlertCircle, AlertTriangle, Info, CheckCircle2, Terminal } from "lucide-react"

type LogLevel = "error" | "warning" | "info" | "success"

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  message: string
  metadata?: Record<string, string>
}

const LOG_LEVELS = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
}

// Dummy log generator
const generateLog = (): LogEntry => {
  const levels: LogLevel[] = ["error", "warning", "info", "success"]
  const services = ["api-gateway", "auth-service", "payment-processor", "notification-service", "database"]
  const messages = {
    error: [
      "Connection timeout to database",
      "Failed to process payment transaction",
      "Authentication token expired",
      "Rate limit exceeded for API endpoint",
    ],
    warning: [
      "High memory usage detected",
      "Slow query execution time",
      "Deprecated API endpoint called",
      "Cache miss rate above threshold",
    ],
    info: [
      "New user registration completed",
      "Webhook delivered successfully",
      "Background job started",
      "Configuration updated",
    ],
    success: ["Payment processed successfully", "Email sent to user", "Backup completed", "Health check passed"],
  }

  const level = levels[Math.floor(Math.random() * levels.length)]
  const service = services[Math.floor(Math.random() * services.length)]
  const message = messages[level][Math.floor(Math.random() * messages[level].length)]

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    level,
    service,
    message,
    metadata: {
      request_id: `req_${Math.random().toString(36).substring(7)}`,
      user_id: `usr_${Math.floor(Math.random() * 1000)}`,
    },
  }
}

const INITIAL_LOGS: LogEntry[] = Array.from({ length: 15 }, generateLog)

export function LiveLogs({ projectName }: { projectName?: string }) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [isStreaming, setIsStreaming] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      const newLog = generateLog()
      setLogs((prev) => [newLog, ...prev].slice(0, 100)) // Keep last 100 logs
    }, 2000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const filteredLogs = logs.filter((log) => {
    if (selectedLevel !== "all" && log.level !== selectedLevel) return false
    if (selectedService !== "all" && log.service !== selectedService) return false
    return true
  })

  const services = Array.from(new Set(logs.map((log) => log.service)))

  return (
    <div className="flex h-full flex-col">
      {/* Logs Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Live Logs Stream</h2>
              {projectName && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {projectName}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {projectName
                ? `Real-time logs from ${projectName}`
                : "Real-time application logs from all services"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={isStreaming ? "default" : "outline"}
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
              className="gap-2"
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">Filters:</Label>
          </div>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
            <Label htmlFor="auto-scroll" className="text-xs cursor-pointer">
              Auto-scroll
            </Label>
          </div>

          <Badge variant="outline" className="ml-auto">
            {filteredLogs.length} logs
          </Badge>
        </div>
      </div>

      {/* Logs List */}
      <ScrollArea className="flex-1 bg-background">
        <div className="divide-y divide-border">
          {filteredLogs.map((log) => {
            const LogIcon = LOG_LEVELS[log.level].icon
            return (
              <div key={log.id} className="flex gap-4 px-6 py-3 hover:bg-muted/50 transition-colors font-mono text-xs">
                {/* Timestamp */}
                <span className="text-muted-foreground shrink-0 w-[68px]">{log.timestamp}</span>

                {/* Level */}
                <div className="shrink-0 w-20">
                  <Badge
                    variant="outline"
                    className={`${LOG_LEVELS[log.level].bg} ${LOG_LEVELS[log.level].color} border-transparent gap-1.5 font-medium`}
                  >
                    <LogIcon className="w-3 h-3" />
                    {log.level}
                  </Badge>
                </div>

                {/* Service */}
                <span className="text-primary font-medium shrink-0 w-[140px] truncate">{log.service}</span>

                {/* Message */}
                <p className="flex-1 text-foreground leading-relaxed">{log.message}</p>

                {/* Metadata */}
                {log.metadata && (
                  <div className="flex gap-2 shrink-0">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <span key={key} className="text-muted-foreground text-[10px]">
                        {key}={value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="border-t border-border bg-card px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isStreaming ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
            />
            {isStreaming ? "Streaming" : "Paused"}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{logs.filter((l) => l.level === "error").length} errors</span>
          <span className="text-muted-foreground">{logs.filter((l) => l.level === "warning").length} warnings</span>
        </div>
      </div>
    </div>
  )
}
