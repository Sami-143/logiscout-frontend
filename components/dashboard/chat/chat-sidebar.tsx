"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MessageSquare,
  Search,
  Zap,
  Trash2,
  MoreHorizontal,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ChatSummary } from "@/lib/chatApi"

interface ChatSidebarProps {
  chats: ChatSummary[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat?: (chatId: string) => void
  isLoading: boolean
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return "This Week"
  if (diffDays < 30) return "This Month"
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function groupChatsByDate(chats: ChatSummary[]) {
  const groups: Record<string, ChatSummary[]> = {}
  for (const chat of chats) {
    const label = formatDate(chat.updated_at || chat.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(chat)
  }
  return Object.entries(groups)
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isLoading,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : chats

  const grouped = groupChatsByDate(filtered)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-3 pb-0">
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground leading-none">LogiScout AI</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Chat History</p>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">
            {chats.length}
          </Badge>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full gap-2 h-9 rounded-lg shadow-sm"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-8 rounded-lg border border-input bg-background pl-8 pr-8 text-xs placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 focus:ring-[3px] outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2.5 py-2.5">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-3.5 flex-1 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-foreground mb-1">
              {search ? "No results found" : "No conversations yet"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
              {search
                ? `No chats matching "${search}"`
                : "Start a new conversation to get help with your project."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([label, groupChats]) => (
              <div key={label}>
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {label}
                </p>
                <div className="space-y-0.5 mt-0.5">
                  {groupChats.map((chat) => {
                    const isActive = activeChatId === chat.id
                    return (
                      <div
                        key={chat.id}
                        className={`group relative flex items-center rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-muted/80"
                        }`}
                      >
                        <button
                          onClick={() => onSelectChat(chat.id)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 px-2.5 py-2 text-left"
                        >
                          <MessageSquare
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? "opacity-80" : "opacity-40"
                            }`}
                          />
                          <span className="truncate text-xs font-medium">{chat.title}</span>
                        </button>
                        {onDeleteChat && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`shrink-0 mr-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                  isActive
                                    ? "hover:bg-primary-foreground/10"
                                    : "hover:bg-muted-foreground/10"
                                }`}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() => onDeleteChat(chat.id)}
                                className="text-destructive focus:text-destructive text-xs"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-muted-foreground">LogiScout AI Online</p>
        </div>
      </div>
    </div>
  )
}
