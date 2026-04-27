import api from "./api"
import type { ApiResponse } from "./api"

export interface ChatSummary {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface ChatDetail {
  id: string
  title: string
  project_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface AssistantMessage {
  message: ChatMessage
  chat: ChatSummary
}

export const chatAPI = {
  async listChats(projectId: string) {
    const res = await api.get<ApiResponse<ChatSummary[]>>(
      `/api/chats/${projectId}/`
    )
    return res.data
  },

  async getChat(projectId: string, chatId: string) {
    const res = await api.get<ApiResponse<ChatDetail>>(
      `/api/chats/${projectId}/${chatId}/`
    )
    return res.data
  },

  async sendPrompt(projectId: string, chatId: string, prompt: string) {
    const res = await api.post<ApiResponse<AssistantMessage>>(
      `/api/chats/${projectId}/${chatId}/prompt`,
      { prompt }
    )
    return res.data
  },
}
