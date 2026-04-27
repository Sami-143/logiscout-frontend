"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Zap, User, Copy, Check, Sparkles } from "lucide-react"
import type { ChatMessage } from "@/lib/chatApi"

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
  projectName?: string
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto px-4 sm:px-6">
      <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-primary/20">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Zap className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-tl-sm bg-muted/60 border border-border/50 px-4 py-3 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:400ms]" />
          </div>
          <span className="text-[10px] text-muted-foreground ml-1.5">LogiScout is thinking...</span>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-6 w-6 opacity-0 group-hover/code:opacity-100 transition-opacity"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

function formatContent(content: string) {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`} className="whitespace-pre-wrap">
          {formatInline(content.slice(lastIndex, match.index))}
        </span>
      )
    }

    const lang = match[1]
    const code = match[2].replace(/\n$/, "")
    parts.push(
      <div key={`c-${match.index}`} className="group/code my-3 rounded-xl overflow-hidden border border-border/60 bg-background">
        <div className="flex items-center justify-between bg-muted/50 px-4 py-1.5 border-b border-border/40">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {lang || "code"}
          </span>
          <CopyButton text={code} />
        </div>
        <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
          <code>{code}</code>
        </pre>
      </div>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`t-${lastIndex}`} className="whitespace-pre-wrap">
        {formatInline(content.slice(lastIndex))}
      </span>
    )
  }

  return parts
}

function formatInline(text: string) {
  const parts: React.ReactNode[] = []
  const boldRegex = /\*\*(.+?)\*\*/g
  const inlineCodeRegex = /`([^`]+)`/g
  const combined = /(\*\*(.+?)\*\*|`([^`]+)`)/g
  let lastIdx = 0
  let m: RegExpExecArray | null

  while ((m = combined.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(text.slice(lastIdx, m.index))
    }
    if (m[2]) {
      parts.push(
        <strong key={`b-${m.index}`} className="font-semibold">
          {m[2]}
        </strong>
      )
    } else if (m[3]) {
      parts.push(
        <code
          key={`ic-${m.index}`}
          className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[12px] font-mono text-primary"
        >
          {m[3]}
        </code>
      )
    }
    lastIdx = m.index + m[0].length
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }

  return parts
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
            {message.content}
          </p>
        </div>
        <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto px-4 sm:px-6">
      <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-primary/20">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Zap className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] space-y-1 mt-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-semibold text-foreground">LogiScout</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-muted/60 border border-border/50 px-4 py-3">
          <div className="text-sm leading-relaxed text-foreground">
            {formatContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatMessages({ messages, isLoading, projectName }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          {/* Logo */}
          <div className="relative mx-auto w-fit">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Hi, I&apos;m LogiScout
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI assistant for{" "}
              {projectName ? (
                <span className="font-medium text-foreground">{projectName}</span>
              ) : (
                "this project"
              )}
              . Ask me about logs, incidents, deployments, or anything related to your project.
            </p>
          </div>

          {/* Suggestion chips */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Try asking
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Show me recent errors",
                "Summarize today's incidents",
                "What services are unhealthy?",
                "Help me debug a 500 error",
              ].map((suggestion) => (
                <span
                  key={suggestion}
                  className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-default transition-colors"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-5 py-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
