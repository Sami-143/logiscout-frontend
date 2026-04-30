import { createLogger } from "@/lib/logger"
import { type LiveLogEntry } from "@/lib/kafkaApi"

interface KafkaSocketHandlers {
  onConnecting?: () => void
  onConnected?: () => void
  onMessage: (logEntry: LiveLogEntry) => void
  onError?: () => void
  onDisconnected?: () => void
}

const log = createLogger("kafkaSocket")
const DEFAULT_RECONNECT_DELAY_MS = 3000
const SOCKET_BASE_URL = (
  process.env.NEXT_PUBLIC_LIVE_LOGS_URL ||
  process.env.NEXT_PUBLIC_LOGS_API_URL ||
  "http://47.130.208.43:3000"
)
  .replace(/^https:/, "wss:")
  .replace(/^http:/, "ws:")

export function connectKafkaSocket(
  projectId: string,
  handlers: KafkaSocketHandlers,
  reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
) {
  let socket: WebSocket | null = null
  let reconnectTimer: number | null = null
  let closedByCleanup = false

  const connect = () => {
    if (closedByCleanup) return

    handlers.onConnecting?.()

    socket = new WebSocket(`${SOCKET_BASE_URL}/live-logs/socket?projectId=${encodeURIComponent(projectId)}`)

    socket.onopen = () => {
      handlers.onConnected?.()
      log.info({ projectId }, "Kafka socket connected")
    }

    socket.onmessage = (event) => {
      try {
        handlers.onMessage(JSON.parse(event.data) as LiveLogEntry)
      } catch (error) {
        log.error({ projectId, error }, "Failed to parse kafka socket message")
      }
    }

    socket.onerror = () => {
      handlers.onError?.()
    }

    socket.onclose = () => {
      socket = null

      if (closedByCleanup) {
        return
      }

      handlers.onDisconnected?.()
      reconnectTimer = window.setTimeout(connect, reconnectDelayMs)
    }
  }

  connect()

  return () => {
    closedByCleanup = true

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (socket) {
      socket.close()
      socket = null
    }
  }
}
