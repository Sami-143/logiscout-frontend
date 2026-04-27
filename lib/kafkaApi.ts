import { createLogger } from "@/lib/logger"
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_LOGS_API_URL ||
  process.env.NEXT_PUBLIC_LIVE_LOGS_URL ||
  "http://localhost:8001";
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

export async function fetchKafkaLogs(projectId: string): Promise<LiveLogEntry[]> {
  const response = await HTTP.get<LiveLogEntry[]>("/live-logs", {
    params: {
      projectId,
    },
  })
  
  const data = response.data
  const logs = Array.isArray(data) ? data : []

  log.debug({ projectId, count: logs.length }, "Kafka logs fetched")
  return logs
}
