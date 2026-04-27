"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SendHorizontal, Loader2, Paperclip } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resetHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [value, isLoading, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-gradient-to-t from-card to-card/80 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-input bg-background shadow-sm p-1.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] focus-within:shadow-md transition-all">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                  disabled
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Attach files (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              resetHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask LogiScout anything..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5 max-h-[200px] disabled:opacity-50"
          />

          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="h-8 w-8 shrink-0 rounded-xl shadow-sm transition-all disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground/60">
            Shift + Enter for new line
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-[10px] text-muted-foreground/60">
            LogiScout AI can make mistakes
          </span>
        </div>
      </div>
    </div>
  )
}
