"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fetchKafkaLogs, type LiveLogEntry, type LogLevel } from "@/lib/kafkaApi"
import { createLogger } from "@/lib/logger"
import { connectKafkaSocket } from "@/lib/kafkaSocket"
import { getStoredSelectedProject } from "@/lib/selected-project"
import { Play, Pause, Download, Filter, AlertCircle, AlertTriangle, Info, CheckCircle2, Terminal } from "lucide-react"

type ConnectionState = "idle" | "connecting" | "connected" | "paused" | "disconnected" | "error"

interface LiveLogsProps {
  projectId?: string
  projectName?: string
}

const LOG_LEVELS = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
} as const

const MAX_LOGS = 100
const HIDDEN_METADATA_KEYS = new Set(["correlation_id", "correlationid", "logger"])

const log = createLogger("LiveLogs")

function formatNow() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function normalizeMetadataKey(key: string) {
  return key.replace(/[\s-]+/g, "_").replace(/_/g, "").toLowerCase()
}

function mergeIncomingLog(prev: LiveLogEntry[], nextLog: LiveLogEntry) {
  return [nextLog, ...prev.filter((logItem) => logItem.id !== nextLog.id)].slice(0, MAX_LOGS)
}

function downloadLogs(projectName: string | undefined, logs: LiveLogEntry[]) {
  const fileName = `${(projectName || "live-logs").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "live-logs"}.json`
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" })
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = objectUrl
  link.download = fileName
  link.click()

  window.URL.revokeObjectURL(objectUrl)
}

export function LiveLogs({ projectId, projectName }: LiveLogsProps) {
  const [storedProject, setStoredProject] = useState<ReturnType<typeof getStoredSelectedProject>>(null)
  const [logs, setLogs] = useState<LiveLogEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [autoScroll, setAutoScroll] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const resolvedProjectId = projectId ?? storedProject?.id
  const resolvedProjectName = projectName ?? storedProject?.name
  const [connectionState, setConnectionState] = useState<ConnectionState>(resolvedProjectId ? "connecting" : "idle")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!projectId) {
      setStoredProject(getStoredSelectedProject())
    }
  }, [projectId])

  useEffect(() => {
    setSelectedService("all")
    setSelectedLevel("all")
  }, [resolvedProjectId])

  useEffect(() => {
    if (autoScroll) {
      topSentinelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [logs, autoScroll])

  useEffect(() => {
    let isCancelled = false

    async function loadInitialLogs() {
      if (!resolvedProjectId) {
        setLogs([])
        setLastUpdatedAt(null)
        setErrorMessage(null)
        setIsLoading(false)
        setConnectionState("idle")
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await fetchKafkaLogs(resolvedProjectId)
        if (isCancelled) return

        setLogs(Array.isArray(data) ? data.slice(0, MAX_LOGS) : [])
        setLastUpdatedAt(formatNow())
        log.info({ projectId: resolvedProjectId, count: Array.isArray(data) ? data.length : 0 }, "Initial live logs loaded")
      } catch (error) {
        if (isCancelled) return

        const message = error instanceof Error ? error.message : "Failed to load logs"
        setErrorMessage(message)
        setLogs([])
        log.error({ projectId: resolvedProjectId, error }, "Failed to load initial live logs")
        toast({
          title: "Live logs unavailable",
          description: message,
          variant: "destructive",
        })
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInitialLogs()

    return () => {
      isCancelled = true
    }
  }, [resolvedProjectId, toast])

  useEffect(() => {
    if (!resolvedProjectId) {
      setConnectionState("idle")
      return
    }

    if (!isStreaming) {
      setConnectionState("paused")
      return
    }

    return connectKafkaSocket(resolvedProjectId, {
      onConnecting: () => {
        setConnectionState("connecting")
      },
      onConnected: () => {
        setConnectionState("connected")
        setErrorMessage(null)
        log.info({ projectId: resolvedProjectId }, "Live log socket connected")
      },
      onMessage: (incomingLog) => {
        setLogs((prev) => mergeIncomingLog(prev, incomingLog))
        setLastUpdatedAt(formatNow())
      },
      onError: () => {
        setConnectionState("error")
      },
      onDisconnected: () => {
        setConnectionState("disconnected")
      },
    })
  }, [isStreaming, resolvedProjectId])

  const filteredLogs = logs.filter((logItem) => {
    if (selectedLevel !== "all" && logItem.level !== selectedLevel) return false
    if (selectedService !== "all" && logItem.service !== selectedService) return false
    return true
  })

  const services = Array.from(new Set(logs.map((logItem) => logItem.service)))
  const statusLabel =
    connectionState === "connected" ? "Streaming"
    : connectionState === "paused" ? "Paused"
    : connectionState === "connecting" ? "Connecting"
    : connectionState === "disconnected" ? "Reconnecting"
    : connectionState === "error" ? "Connection error"
    : "Idle"

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Live Logs Stream</h2>
              {resolvedProjectName && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {resolvedProjectName}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {resolvedProjectName ? `Real-time logs from ${resolvedProjectName}` : "Select a project to start streaming logs"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={isStreaming ? "default" : "outline"}
              size="sm"
              onClick={() => setIsStreaming((prev) => !prev)}
              className="gap-2"
              disabled={!resolvedProjectId}
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
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => downloadLogs(resolvedProjectName, filteredLogs)}
              disabled={!filteredLogs.length}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

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

      <ScrollArea className="flex-1 bg-background">
        <div className="divide-y divide-border">
          <div ref={topSentinelRef} />

          {!resolvedProjectId && (
            <div className="px-6 py-10 text-sm text-muted-foreground">
              Select a project from the dashboard to load its first 100 logs and start the live stream.
            </div>
          )}

          {resolvedProjectId && isLoading && (
            <div className="px-6 py-10 text-sm text-muted-foreground">Loading logs...</div>
          )}

          {resolvedProjectId && !isLoading && errorMessage && (
            <div className="px-6 py-10 text-sm text-destructive">{errorMessage}</div>
          )}

          {resolvedProjectId && !isLoading && !errorMessage && filteredLogs.length === 0 && (
            <div className="px-6 py-10 text-sm text-muted-foreground">No logs found for this project.</div>
          )}

          {filteredLogs.map((logItem) => {
            const LogIcon = LOG_LEVELS[logItem.level].icon
            const metadataEntries = Object.entries(logItem.metadata ?? {}).filter(
              ([key]) => !HIDDEN_METADATA_KEYS.has(normalizeMetadataKey(key)),
            )

            return (
              <div key={logItem.id} className="flex gap-4 px-6 py-3 hover:bg-muted/50 transition-colors font-mono text-xs">
                <span className="text-muted-foreground shrink-0 w-[68px]">{logItem.timestamp}</span>

                <div className="shrink-0 w-20">
                  <Badge
                    variant="outline"
                    className={`${LOG_LEVELS[logItem.level].bg} ${LOG_LEVELS[logItem.level].color} border-transparent gap-1.5 font-medium`}
                  >
                    <LogIcon className="w-3 h-3" />
                    {logItem.level}
                  </Badge>
                </div>

                <span className="text-primary font-medium shrink-0 w-[140px] truncate">{logItem.service}</span>
                <p className="flex-1 text-foreground leading-relaxed">{logItem.message}</p>

                {metadataEntries.length > 0 && (
                  <div className="flex gap-2 shrink-0">
                    {metadataEntries.map(([key, value]) => (
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

      <div className="border-t border-border bg-card px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${connectionState === "connected" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
            />
            {statusLabel}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>{lastUpdatedAt ? `Updated ${lastUpdatedAt}` : "Waiting for logs"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{logs.filter((entry) => entry.level === "error").length} errors</span>
          <span className="text-muted-foreground">{logs.filter((entry) => entry.level === "warning").length} warnings</span>
        </div>
      </div>
    </div>
  )
}
