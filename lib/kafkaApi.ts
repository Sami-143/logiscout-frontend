import api from "@/lib/api"
import { createLogger } from "@/lib/logger"
import axios from "axios";



let environment = "local";
console.log("Environment:", environment);

let IMAGE_BASE_URL = "";
let APP_URL = "";

if (environment === "local") {
  APP_URL = "http://localhost:3000/";
} else if (environment === "prod") {
  APP_URL = "http://47.130.208.43:3000/";
} else{
  APP_URL = "http://localhost:3000/"
}


const baseURL = `${APP_URL}`;
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
