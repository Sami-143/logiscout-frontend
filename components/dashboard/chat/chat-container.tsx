"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PanelLeftClose, PanelLeft, Zap, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"
import { chatAPI } from "@/lib/chatApi"
import type { ChatSummary, ChatMessage } from "@/lib/chatApi"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"

const log = createLogger("ChatContainer")

interface ChatContainerProps {
  projectId: string
  projectName: string
}

const DEMO_CHATS: ChatSummary[] = [
  {
    id: "demo-1",
    title: "Debugging 500 errors on /api/users",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Analyze memory leak in worker service",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    title: "Help with Kubernetes pod restart loop",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    title: "Database connection timeout issues",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-5",
    title: "Set up alerting for high error rate",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-6",
    title: "Optimize slow API response times",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-7",
    title: "Review deployment pipeline logs",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  "demo-1": [
    {
      id: "m1",
      role: "user",
      content: "I'm seeing 500 errors on the /api/users endpoint. Can you help me debug this?",
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "I've analyzed the recent logs for your `/api/users` endpoint. Here's what I found:\n\n**Root Cause:** The errors are caused by a database connection timeout. Your MongoDB connection pool is exhausted.\n\n**Evidence from logs:**\n- 47 occurrences of `MongoTimeoutError` in the last hour\n- Average response time spiked from 120ms to 8,200ms at 14:32 UTC\n- Connection pool size: 10 (all in use)\n\n**Recommended fix:**\n\n```javascript\n// Update your MongoDB connection config\nconst client = new MongoClient(uri, {\n  maxPoolSize: 50,        // increase from 10\n  minPoolSize: 10,\n  maxIdleTimeMS: 30000,\n  connectTimeoutMS: 10000,\n});\n```\n\nWould you like me to check if there are any long-running queries that might be holding connections?",
      created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    },
    {
      id: "m3",
      role: "user",
      content: "Yes, please check for long-running queries!",
      created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: "m4",
      role: "assistant",
      content:
        "Found it! There are **3 slow queries** holding connections:\n\n1. `db.users.find({ status: \"active\" })` - **no index on `status`** field, scanning 2.3M documents\n2. `db.users.aggregate([...])` - Complex pipeline without `$match` early stage, taking 12s avg\n3. `db.sessions.find({ userId: ... })` - Missing compound index\n\n**Quick wins:**\n\n```javascript\n// Add these indexes\ndb.users.createIndex({ status: 1 })\ndb.sessions.createIndex({ userId: 1, createdAt: -1 })\n```\n\nAfter adding these indexes, your connection pool usage should drop significantly. I'll keep monitoring the logs and alert you if the 500 errors persist.",
      created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    },
  ],
  "demo-2": [
    {
      id: "m5",
      role: "user",
      content: "Our worker service memory keeps growing. Can you analyze what's going on?",
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "m6",
      role: "assistant",
      content:
        "I've looked at the memory metrics for your worker service over the past 24 hours. The pattern is a **classic memory leak**:\n\n- Memory grows linearly at ~15MB/hour\n- GC pressure increasing, but not reclaiming\n- RSS hits 1.8GB before OOM kill triggers restart\n\nBased on the log patterns, the leak appears to be in your event listener registration. I see repeated `EventEmitter` warnings:\n\n```\nMaxListenersExceededWarning: Possible EventEmitter memory leak detected.\n11 'data' listeners added to [Socket].\n```\n\nYou're likely adding listeners in a loop without removing them. Check your WebSocket connection handler for missing `removeListener` calls.",
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000 + 30000).toISOString(),
    },
  ],
}

export function ChatContainer({ projectId, projectName }: ChatContainerProps) {
  const [chats, setChats] = useState<ChatSummary[]>(DEMO_CHATS)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatsLoading, setChatsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const fetchChats = useCallback(async () => {
    setChatsLoading(true)
    try {
      const res = await chatAPI.listChats(projectId)
      if (res.success && res.data) {
        setChats(res.data)
        log.info({ projectId, count: res.data.length }, "Chats loaded")
        return
      }
    } catch {
      log.debug({ projectId }, "API unavailable, using demo data")
    }
    setChats(DEMO_CHATS)
    setChatsLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchChats()
    setActiveChatId(null)
    setMessages([])
  }, [fetchChats])

  const loadChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId)

      if (DEMO_MESSAGES[chatId]) {
        setMessages(DEMO_MESSAGES[chatId])
        return
      }

      setMessagesLoading(true)
      try {
        const res = await chatAPI.getChat(projectId, chatId)
        if (res.success && res.data) {
          setMessages(res.data.messages)
          log.info({ chatId, count: res.data.messages.length }, "Chat messages loaded")
          setMessagesLoading(false)
          return
        }
      } catch {
        log.debug({ chatId }, "API unavailable, showing empty chat")
      }
      setMessages([])
      setMessagesLoading(false)
    },
    [projectId]
  )

  const handleNewChat = useCallback(() => {
    const tempId = `new-${Date.now()}`
    setActiveChatId(tempId)
    setMessages([])
  }, [])

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId))
      if (activeChatId === chatId) {
        setActiveChatId(null)
        setMessages([])
      }
      toast({ title: "Deleted", description: "Conversation removed" })
    },
    [activeChatId, toast]
  )

  const handleSend = useCallback(
    async (content: string) => {
      if (!activeChatId) return

      const userMsg: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setSending(true)

      try {
        const chatId = activeChatId.startsWith("new-") ? "new" : activeChatId
        const res = await chatAPI.sendPrompt(projectId, chatId, content)

        if (res.success && res.data) {
          const { message: assistantMsg, chat: updatedChat } = res.data

          if (activeChatId.startsWith("new-")) {
            setActiveChatId(updatedChat.id)
          }

          setMessages((prev) => {
            const withoutTemp = prev.map((m) =>
              m.id === userMsg.id ? { ...m, id: `confirmed-${Date.now()}` } : m
            )
            return [...withoutTemp, assistantMsg]
          })

          setChats((prev) => {
            const exists = prev.some((c) => c.id === updatedChat.id)
            if (exists) {
              return prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
            }
            return [updatedChat, ...prev]
          })

          log.info({ chatId: updatedChat.id }, "Message sent successfully")
          setSending(false)
          return
        }
      } catch (err: any) {
        log.debug({ err }, "API unavailable, simulating response")
      }

      // Demo fallback when no backend
      setTimeout(() => {
        const demoResponse: ChatMessage = {
          id: `demo-resp-${Date.now()}`,
          role: "assistant",
          content: `I've analyzed your request regarding **"${content.slice(0, 60)}${content.length > 60 ? "..." : ""}"**.\n\nThis is a demo response from LogiScout AI. Once the backend chat API is connected, I'll be able to:\n\n- Analyze your project's **live logs** in real-time\n- Help debug **incidents** and errors\n- Provide **actionable recommendations** based on your data\n- Generate **reports** and summaries\n\nConnect the backend API at \`/api/chats/${projectId}/\` to enable full functionality.`,
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, demoResponse])

        if (activeChatId?.startsWith("new-")) {
          const newChat: ChatSummary = {
            id: `local-${Date.now()}`,
            title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setActiveChatId(newChat.id)
          setChats((prev) => [newChat, ...prev])
        }

        setSending(false)
      }, 1500)
    },
    [activeChatId, projectId]
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div
        className={`shrink-0 border-r border-border bg-card transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden hidden lg:block`}
      >
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={loadChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isLoading={chatsLoading}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-border bg-card shadow-xl lg:hidden">
            <ChatSidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={(id) => {
                loadChat(id)
                setSidebarOpen(false)
              }}
              onNewChat={() => {
                handleNewChat()
                setSidebarOpen(false)
              }}
              onDeleteChat={handleDeleteChat}
              isLoading={chatsLoading}
            />
          </div>
        </>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-foreground">LogiScout</h2>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">
                    AI
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  {projectName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <Sparkles className="h-3 w-3 text-primary/60" />
              <span className="text-[10px] text-muted-foreground">Powered by AI</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ChatMessages
          messages={messages}
          isLoading={messagesLoading || sending}
          projectName={projectName}
        />

        {/* Input */}
        {activeChatId ? (
          <ChatInput onSend={handleSend} isLoading={sending} />
        ) : (
          <div className="border-t border-border bg-card px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Select a conversation from the sidebar or start a new one
              </p>
              <Button
                onClick={handleNewChat}
                className="gap-2 rounded-xl shadow-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
