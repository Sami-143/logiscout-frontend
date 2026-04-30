import api from "./api"
import type { ApiResponse } from "./api"

export interface ChatSummary {
  id: string
  project_id: string
  title: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  metadata?: Record<string, unknown>
}

interface BackendChatMessage {
  role: "user" | "assistant"
  content: string
  created_at?: string
  metadata?: Record<string, unknown>
}

export interface ChatDetail extends ChatSummary {
  messages: ChatMessage[]
}

interface ChatListPayload {
  project_id: string
  project_name: string
  chats: ChatSummary[]
}

interface ChatDetailPayload {
  project_id?: string
  project_name?: string
  chat?: Omit<ChatDetail, "messages"> & {
    messages: BackendChatMessage[]
  }
  messages?: BackendChatMessage[]
  chat_context?: BackendChatMessage[]
}

export interface ChatStreamRequest {
  projectId: string
  chatId?: string
  userPrompt: string
  vagueContext?: string
}

export interface ChatStreamEvent {
  type: "context_ready" | "assistant_start" | "assistant_delta" | "assistant_done" | "error"
  projectId?: string
  chatId?: string
  messageId?: string
  delta?: string
  content?: string
  message?: string
  payload?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isBackendChatMessage(value: unknown): value is BackendChatMessage {
  return isRecord(value)
    && (value.role === "user" || value.role === "assistant")
    && typeof value.content === "string"
}

function isBackendChatMessageArray(value: unknown): value is BackendChatMessage[] {
  return Array.isArray(value) && value.every(isBackendChatMessage)
}

export function extractChatMessages(payload: unknown): BackendChatMessage[] {
  if (!isRecord(payload)) {
    return []
  }

  if (isBackendChatMessageArray(payload.chat_context)) {
    return payload.chat_context
  }

  if (isBackendChatMessageArray(payload.messages)) {
    return payload.messages
  }

  if (isRecord(payload.chat) && isBackendChatMessageArray(payload.chat.messages)) {
    return payload.chat.messages
  }

  return []
}

export function normalizeChatMessages(messages: BackendChatMessage[]): ChatMessage[] {
  const fallbackTimestamp = new Date().toISOString()
  return messages.map((message, index) => {
    const createdAt = message.created_at ?? fallbackTimestamp
    return {
      id: `msg-${createdAt}-${index}`,
      role: message.role,
      content: message.content,
      created_at: createdAt,
      metadata: message.metadata ?? {},
    }
  })
}

function getApiBaseUrl() {
  return api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}

function buildStreamUrl() {
  return `${getApiBaseUrl().replace(/\/$/, "")}/chat/stream`
}

function parseSseEventChunk(chunk: string) {
  const lines = chunk.split(/\r?\n/)
  let eventName = "message"
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim()
      continue
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim())
    }
  }

  if (!dataLines.length) {
    return null
  }

  const rawData = dataLines.join("\n")
  const parsed = JSON.parse(rawData) as ChatStreamEvent
  if (!parsed.type) {
    parsed.type = eventName as ChatStreamEvent["type"]
  }
  return parsed
}

export const chatAPI = {
  async listChats(projectId: string) {
    const res = await api.get<ApiResponse<ChatListPayload>>(`/chat/${projectId}`)
    return res.data
  },

  async getChat(projectId: string, chatId: string) {
    const res = await api.get<ApiResponse<ChatDetailPayload>>(`/chat/${projectId}/${chatId}`)
    return res.data
  },

  async streamChat(
    request: ChatStreamRequest,
    handlers: {
      onEvent: (event: ChatStreamEvent) => void
    },
  ) {
    const response = await fetch(buildStreamUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to stream chat (${response.status})`)
    }

    if (!response.body) {
      throw new Error("Streaming response body is unavailable")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

      const events = buffer.split("\n\n")
      buffer = events.pop() || ""

      for (const rawEvent of events) {
        const parsedEvent = parseSseEventChunk(rawEvent)
        if (parsedEvent) {
          handlers.onEvent(parsedEvent)
        }
      }

      if (done) {
        if (buffer.trim()) {
          const trailingEvent = parseSseEventChunk(buffer)
          if (trailingEvent) {
            handlers.onEvent(trailingEvent)
          }
        }
        break
      }
    }
  },
}
