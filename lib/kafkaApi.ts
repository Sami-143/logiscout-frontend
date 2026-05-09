import { createLogger } from "@/lib/logger"
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_LOGS_API_URL ||
  process.env.NEXT_PUBLIC_LIVE_LOGS_URL ||
  "https://lgstreamingserver.duckdns.org";
const headers = {
  accept: "application/json",
  "Content-Type": "application/json",
};

// Create instance
export const HTTP = axios.create({
  baseURL,
  headers,
  withCredentials: false,
});



export type LogLevel = "error" | "warning" | "info" | "success"

export interface LiveLogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  message: string
  metadata?: Record<string, string>
}

const log = createLogger("kafkaApi")

const LEVEL_ALIASES: Record<string, LogLevel> = {
  error: "error",
  err: "error",
  fatal: "error",
  critical: "error",
  crit: "error",
  severe: "error",
  warning: "warning",
  warn: "warning",
  info: "info",
  information: "info",
  notice: "info",
  debug: "info",
  trace: "info",
  verbose: "info",
  success: "success",
  ok: "success",
}

export function normalizeLogLevel(raw: unknown): LogLevel {
  if (typeof raw !== "string") return "info"
  const key = raw.trim().toLowerCase()
  return LEVEL_ALIASES[key] ?? "info"
}

export function normalizeLogEntry(raw: any): LiveLogEntry {
  return {
    ...raw,
    level: normalizeLogLevel(raw?.level),
  }
}

export async function fetchKafkaLogs(projectId: string): Promise<LiveLogEntry[]> {
  const response = await HTTP.get<LiveLogEntry[]>("/live-logs", {
    params: {
      projectId,
    },
  })

  const data = response.data
  const logs = Array.isArray(data) ? data.map(normalizeLogEntry) : []

  log.debug({ projectId, count: logs.length }, "Kafka logs fetched")
  return logs
}
