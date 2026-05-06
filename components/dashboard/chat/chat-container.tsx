"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PanelLeftClose, PanelLeft, Zap, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"
import { chatAPI } from "@/lib/chatApi"
import { extractChatMessages, normalizeChatMessages } from "@/lib/chatApi"
import type { ChatSummary, ChatMessage, ChatStreamEvent } from "@/lib/chatApi"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"

const log = createLogger("ChatContainer")

interface ChatContainerProps {
  projectId: string
  projectName: string
}

function buildPendingChatTitle(content: string) {
  return content.slice(0, 50) + (content.length > 50 ? "..." : "")
}

// Chat IDs that don't exist on the server yet — skip /close for these.
const isLocalChatId = (id: string) =>
  id.startsWith("new-") || id.startsWith("temp-") || id.startsWith("local-")

const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes of inactivity

export function ChatContainer({ projectId, projectName }: ChatContainerProps) {
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatsLoading, setChatsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  // Refs for the close-session lifecycle — refs (not state) so the unmount
  // cleanup, idle timer, and unload handlers all see the latest values
  // without re-binding listeners on every render.
  const activeChatIdRef = useRef<string | null>(null)
  const closedChatsRef = useRef<Set<string>>(new Set())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Send a /close request for a chat, idempotently. */
  const closeChatSession = useCallback(
    (chatId: string | null, useBeacon = false) => {
      if (!chatId || isLocalChatId(chatId)) return
      if (closedChatsRef.current.has(chatId)) return
      closedChatsRef.current.add(chatId)

      if (useBeacon) {
        chatAPI.closeChatBeacon(projectId, chatId)
        log.info({ chatId, projectId }, "Chat closed via beacon")
        return
      }

      chatAPI
        .closeChat(projectId, chatId)
        .then(() => log.info({ chatId, projectId }, "Chat session closed"))
        .catch((err) => {
          log.debug({ err, chatId }, "Close chat failed (best-effort)")
          // Keep it in closedChats — retrying on every event would be noisy.
        })
    },
    [projectId]
  )

  /** Reset the inactivity timer — call on any user interaction. */
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (!activeChatIdRef.current) return
    idleTimerRef.current = setTimeout(() => {
      const chatId = activeChatIdRef.current
      if (chatId) {
        log.info({ chatId }, "Chat idle timeout — closing session")
        closeChatSession(chatId)
      }
    }, IDLE_TIMEOUT_MS)
  }, [closeChatSession])

  // Keep the activeChatId ref in sync, and close the *previous* chat when
  // the user switches conversations.
  useEffect(() => {
    const previous = activeChatIdRef.current
    activeChatIdRef.current = activeChatId

    if (previous && previous !== activeChatId) {
      closeChatSession(previous)
    }

    // Clear the closed marker when a new chat becomes active so that
    // re-opening a chat later in the session works normally.
    if (activeChatId) {
      closedChatsRef.current.delete(activeChatId)
      resetIdleTimer()
    } else if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [activeChatId, closeChatSession, resetIdleTimer])

  // Page-level lifecycle: close the active chat when the tab is hidden,
  // navigated away from, or the component unmounts.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        closeChatSession(activeChatIdRef.current, true)
      }
    }
    const handlePageHide = () => {
      closeChatSession(activeChatIdRef.current, true)
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("beforeunload", handlePageHide)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("beforeunload", handlePageHide)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      // Component unmounting (user navigated to another dashboard view) —
      // close synchronously via beacon to survive route changes.
      closeChatSession(activeChatIdRef.current, true)
    }
  }, [closeChatSession])

  const fetchChats = useCallback(async () => {
    setChatsLoading(true)

    try {
      const res = await chatAPI.listChats(projectId)
      const nextChats = res.success && res.data ? res.data.chats : []

      setChats(nextChats)
      log.info({ projectId, count: nextChats.length }, "Chats loaded")
      return nextChats
    } catch (error) {
      log.error({ projectId, error }, "Failed to load chats")
      toast({
        title: "Unable to load chats",
        description: "Could not fetch the chat history for this project.",
        variant: "destructive",
      })
      setChats([])
      return []
    } finally {
      setChatsLoading(false)
    }
  }, [projectId, toast])

  const loadChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId)
      setMessagesLoading(true)

      try {
        const res = await chatAPI.getChat(projectId, chatId)
        const nextMessages = res.success && res.data
          ? normalizeChatMessages(extractChatMessages(res.data))
          : []

        setMessages(nextMessages)
        log.info({ chatId, count: nextMessages.length }, "Chat messages loaded")
      } catch (error) {
        log.error({ projectId, chatId, error }, "Failed to load chat messages")
        setMessages([])
        toast({
          title: "Unable to load conversation",
          description: "Could not fetch messages for the selected chat.",
          variant: "destructive",
        })
      } finally {
        setMessagesLoading(false)
      }
    },
    [projectId, toast]
  )

  useEffect(() => {
    let isCancelled = false

    async function initializeChats() {
      setActiveChatId(null)
      setMessages([])

      const nextChats = await fetchChats()
      if (isCancelled || nextChats.length === 0) {
        return
      }

      void loadChat(nextChats[0].id)
    }

    initializeChats()

    return () => {
      isCancelled = true
    }
  }, [fetchChats, loadChat])

  const handleNewChat = useCallback(() => {
    setActiveChatId(`new-${Date.now()}`)
    setMessages([])
  }, [])

  const handleSend = useCallback(
    async (content: string) => {
      if (!activeChatId) return

      // User just interacted — push the idle deadline back.
      resetIdleTimer()

      const isNewChat = activeChatId.startsWith("new-")
      let resolvedChatId: string | undefined = isNewChat ? undefined : activeChatId
      const tempAssistantId = `temp-assistant-${Date.now()}`
      const tempUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      }

      if (isNewChat) {
        const pendingChat: ChatSummary = {
          id: activeChatId,
          project_id: projectId,
          title: buildPendingChatTitle(content),
          message_count: 1,
          created_at: tempUserMessage.created_at,
          updated_at: tempUserMessage.created_at,
        }

        setChats((prev) => [pendingChat, ...prev.filter((chat) => chat.id !== activeChatId)])
      }

      setMessages((prev) => [...prev, tempUserMessage])
      setSending(true)

      try {
        let assistantStarted = false

        await chatAPI.streamChat(
          {
            projectId,
            chatId: resolvedChatId,
            userPrompt: content,
          },
          {
            onEvent: (event: ChatStreamEvent) => {
              if (event.type === "error") {
                throw new Error(event.message || "Chat stream failed")
              }

              if (event.type === "context_ready" && event.chatId) {
                resolvedChatId = event.chatId
                setActiveChatId(event.chatId)
                setChats((prev) => {
                  const nextTitle = buildPendingChatTitle(content)
                  const pendingChat: ChatSummary = {
                    id: event.chatId!,
                    project_id: projectId,
                    title: nextTitle,
                    message_count: 1,
                    created_at: tempUserMessage.created_at,
                    updated_at: tempUserMessage.created_at,
                  }
                  const remainingChats = prev.filter((chat) => chat.id !== activeChatId && chat.id !== event.chatId)
                  return [pendingChat, ...remainingChats]
                })
                return
              }

              if (event.type === "assistant_start") {
                assistantStarted = true
                setMessages((prev) => [
                  ...prev.map((message) =>
                    message.id === tempUserMessage.id
                      ? { ...message, id: resolvedChatId ? `${resolvedChatId}-user` : message.id }
                      : message
                  ),
                  {
                    id: event.messageId || tempAssistantId,
                    role: "assistant",
                    content: "",
                    created_at: new Date().toISOString(),
                    metadata: {},
                  },
                ])
                return
              }

              if (event.type === "assistant_delta") {
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === (event.messageId || tempAssistantId)
                      ? { ...message, content: `${message.content}${event.delta || ""}` }
                      : message
                  )
                )
                return
              }

              if (event.type === "assistant_done") {
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === (event.messageId || tempAssistantId)
                      ? { ...message, content: event.content || message.content }
                      : message
                  )
                )
              }
            },
          }
        )

        if (!assistantStarted) {
          throw new Error("No assistant response received")
        }

        const refreshedChats = await fetchChats()
        if (resolvedChatId) {
          const updatedChat = refreshedChats.find((chat) => chat.id === resolvedChatId)
          if (updatedChat) {
            setChats((prev) => [updatedChat, ...prev.filter((chat) => chat.id !== updatedChat.id && chat.id !== activeChatId)])
          }
          await loadChat(resolvedChatId)
        }

        log.info({ chatId: resolvedChatId }, "Message streamed successfully")
      } catch (error) {
        log.error({ projectId, activeChatId, resolvedChatId, error }, "Failed to stream prompt")

        toast({
          title: "Message failed",
          description: "Could not send your message. Your draft conversation is still open.",
          variant: "destructive",
        })
      } finally {
        setSending(false)
      }
    },
    [activeChatId, fetchChats, loadChat, projectId, resetIdleTimer, toast]
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
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
          isLoading={chatsLoading}
        />
      </div>

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
                void loadChat(id)
                setSidebarOpen(false)
              }}
              onNewChat={() => {
                handleNewChat()
                setSidebarOpen(false)
              }}
              isLoading={chatsLoading}
            />
          </div>
        </>
      )}

      <div
        className="flex min-w-0 flex-1 flex-col"
        onMouseMove={resetIdleTimer}
        onKeyDown={resetIdleTimer}
        onScroll={resetIdleTimer}
        onClick={resetIdleTimer}
      >
        <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-sm sm:px-6">
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

            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-foreground">LogiScout</h2>
                  <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[9px] font-medium">
                    AI
                  </Badge>
                </div>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {projectName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="mr-2 hidden items-center gap-1.5 sm:flex">
              <Sparkles className="h-3 w-3 text-primary/60" />
              <span className="text-[10px] text-muted-foreground">Powered by AI</span>
            </div>
          </div>
        </div>

        <ChatMessages
          messages={messages}
          isLoading={messagesLoading || sending}
          projectName={projectName}
        />

        {activeChatId ? (
          <ChatInput onSend={handleSend} isLoading={sending} />
        ) : (
          <div className="border-t border-border bg-card px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Select a conversation from the sidebar or start a new one
              </p>
              <Button onClick={handleNewChat} className="gap-2 rounded-xl shadow-sm">
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