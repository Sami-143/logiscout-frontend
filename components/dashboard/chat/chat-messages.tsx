"use client"

import { createElement, useEffect, useRef, useState, type ReactNode } from "react"
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

function renderCodeBlock(code: string, language: string, key: string) {
  return (
    <div key={key} className="group/code my-4 overflow-hidden rounded-xl border border-border/60 bg-zinc-950 dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 bg-zinc-900/80 dark:bg-zinc-800/60 px-4 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-zinc-100">
        <code className="whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2] && match[3]) {
      parts.push(
        <a
          key={`${keyPrefix}-link-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          {match[2]}
        </a>
      )
    } else if (match[4]) {
      parts.push(
        <code
          key={`${keyPrefix}-code-${match.index}`}
          className="rounded-md bg-muted/80 border border-border/60 px-1.5 py-0.5 font-mono text-[12px] text-foreground/90"
        >
          {match[4]}
        </code>
      )
    } else if (match[5] || match[6]) {
      parts.push(
        <strong key={`${keyPrefix}-bold-${match.index}`} className="font-semibold text-foreground">
          {match[5] || match[6]}
        </strong>
      )
    } else if (match[7] || match[8]) {
      parts.push(
        <em key={`${keyPrefix}-italic-${match.index}`} className="italic">
          {match[7] || match[8]}
        </em>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function renderInlineWithBreaks(text: string, keyPrefix: string) {
  return text.split("\n").flatMap((line, index) => (
    index === 0
      ? renderInline(line, `${keyPrefix}-${index}`)
      : [<br key={`${keyPrefix}-br-${index}`} />, ...renderInline(line, `${keyPrefix}-${index}`)]
  ))
}

function isHorizontalRule(line: string) {
  return /^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())
}

const UNORDERED_RE = /^([-*+])\s+(.*)$/
const ORDERED_RE = /^(\d+)\.\s+(.*)$/

function getIndent(line: string) {
  const match = line.match(/^(\s*)/)
  return match ? match[1].replace(/\t/g, "  ").length : 0
}

function isUnorderedListItem(line: string) {
  return UNORDERED_RE.test(line.trim())
}

function isOrderedListItem(line: string) {
  return ORDERED_RE.test(line.trim())
}

function isTableSeparator(line: string) {
  const trimmed = line.trim()
  if (!trimmed.includes("|") || !trimmed.includes("-")) return false
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(trimmed)
}

function isBlockStart(line: string) {
  const trimmed = line.trim()
  return trimmed.startsWith("```")
    || /^#{1,6}\s+/.test(trimmed)
    || /^>\s?/.test(trimmed)
    || isHorizontalRule(trimmed)
    || isUnorderedListItem(trimmed)
    || isOrderedListItem(trimmed)
}

function splitTableRow(row: string) {
  let trimmed = row.trim()
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1)
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1)
  return trimmed.split("|").map((cell) => cell.trim())
}

interface ListItemNode {
  content: string[]
  children: ListNode[]
}

interface ListNode {
  ordered: boolean
  start: number
  indent: number
  items: ListItemNode[]
}

function parseList(lines: string[], startIndex: number): { node: ListNode; nextIndex: number } {
  const firstLine = lines[startIndex]
  const firstTrimmed = firstLine.trim()
  const orderedMatch = firstTrimmed.match(ORDERED_RE)
  const ordered = !!orderedMatch
  const start = ordered ? parseInt(orderedMatch![1], 10) : 1
  const indent = getIndent(firstLine)

  const items: ListItemNode[] = []
  let i = startIndex

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      // blank line — peek ahead; if next non-blank line is still part of this list, continue
      let j = i + 1
      while (j < lines.length && !lines[j].trim()) j++
      if (j >= lines.length) break
      const nextIndent = getIndent(lines[j])
      const nextTrimmed = lines[j].trim()
      const sameLevel = nextIndent === indent && (ordered ? isOrderedListItem(nextTrimmed) : isUnorderedListItem(nextTrimmed))
      const nested = nextIndent > indent && (isOrderedListItem(nextTrimmed) || isUnorderedListItem(nextTrimmed))
      if (sameLevel || nested) {
        i = j
        continue
      }
      break
    }

    const lineIndent = getIndent(line)
    if (lineIndent < indent) break

    if (lineIndent === indent && (ordered ? isOrderedListItem(trimmed) : isUnorderedListItem(trimmed))) {
      const match = trimmed.match(ordered ? ORDERED_RE : UNORDERED_RE)
      const content: string[] = match ? [match[2]] : [""]
      const children: ListNode[] = []
      i += 1

      while (i < lines.length) {
        const innerLine = lines[i]
        const innerTrimmed = innerLine.trim()
        if (!innerTrimmed) {
          let j = i + 1
          while (j < lines.length && !lines[j].trim()) j++
          if (j >= lines.length) break
          const nIndent = getIndent(lines[j])
          if (nIndent <= indent) break
          i = j
          continue
        }
        const innerIndent = getIndent(innerLine)
        if (innerIndent <= indent) break

        if (isUnorderedListItem(innerTrimmed) || isOrderedListItem(innerTrimmed)) {
          const { node, nextIndex } = parseList(lines, i)
          children.push(node)
          i = nextIndex
          continue
        }

        content.push(innerTrimmed)
        i += 1
      }

      items.push({ content, children })
    } else if (lineIndent > indent) {
      // shouldn't happen at top-level call, but guard
      break
    } else {
      break
    }
  }

  return {
    node: { ordered, start, indent, items },
    nextIndex: i,
  }
}

function renderList(node: ListNode, keyPrefix: string): ReactNode {
  const ListTag = node.ordered ? "ol" : "ul"
  const listClass = node.ordered
    ? "my-2 list-decimal space-y-1.5 pl-6 marker:text-muted-foreground marker:font-medium"
    : "my-2 list-disc space-y-1.5 pl-6 marker:text-primary/60"

  return (
    <ListTag
      key={keyPrefix}
      start={node.ordered && node.start !== 1 ? node.start : undefined}
      className={listClass}
    >
      {node.items.map((item, itemIndex) => {
        const itemKey = `${keyPrefix}-i${itemIndex}`
        const text = item.content.join("\n")
        return (
          <li key={itemKey} className="text-sm leading-relaxed text-foreground pl-1">
            <div className="space-y-1.5">
              <span>{renderInlineWithBreaks(text, `${itemKey}-t`)}</span>
              {item.children.map((child, ci) => renderList(child, `${itemKey}-c${ci}`))}
            </div>
          </li>
        )
      })}
    </ListTag>
  )
}

// Common section labels the model uses as pseudo-headings.
const PSEUDO_HEADING_LABELS = [
  "Summary",
  "Key Findings",
  "Likely Root Cause",
  "Root Cause",
  "Recommendations",
  "Next Steps",
  "Plan of Action",
  "Plan of Action & Debugging Steps",
  "Debugging Steps",
  "Improvements",
  "Improvements / Recommendations",
  "Current Evidence Limitation",
  "Evidence Limitation",
  "Observations",
  "Symptoms",
  "Affected Service",
  "Affected Component",
  "Reasoning",
  "Conclusion",
]

function normalizeMarkdown(raw: string) {
  let text = raw.replace(/\r\n/g, "\n")

  // Protect fenced code blocks from line-break normalization
  const fences: string[] = []
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    fences.push(match)
    return `\u0000FENCE${fences.length - 1}\u0000`
  })

  // Protect inline backtick code so its contents aren't touched
  const ticks: string[] = []
  text = text.replace(/`[^`\n]+`/g, (match) => {
    ticks.push(match)
    return `\u0000TICK${ticks.length - 1}\u0000`
  })

  // 1) Promote bold pseudo-headings to real `##` headings.
  //    Pattern A: line starts with "**Label**" or "**Label:**" followed by content on same line.
  const labelAlternation = PSEUDO_HEADING_LABELS
    .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")
  const boldHeadingAtStart = new RegExp(
    `^[ \\t]*\\*\\*(${labelAlternation})\\*\\*\\s*:?[ \\t]*(.*)$`,
    "gim",
  )
  text = text.replace(boldHeadingAtStart, (_m, label, rest) => {
    const tail = rest.trim()
    return tail ? `## ${label}\n\n${tail}` : `## ${label}`
  })

  // Pattern B: bold pseudo-heading appearing mid-line — break before it.
  const boldHeadingMid = new RegExp(
    `([^\\n])\\s+(\\*\\*(?:${labelAlternation})\\*\\*\\s*:?)`,
    "g",
  )
  text = text.replace(boldHeadingMid, "$1\n\n$2")
  // After breaking, the now line-starting bold will be picked up next pass — re-run start rule.
  text = text.replace(boldHeadingAtStart, (_m, label, rest) => {
    const tail = rest.trim()
    return tail ? `## ${label}\n\n${tail}` : `## ${label}`
  })

  // 2) Insert newline before ATX headings that appear mid-line.
  text = text.replace(/([^\n])\s+(#{1,6}\s+)/g, "$1\n\n$2")

  // 2b) Split heading lines that include body text after a known section label.
  //     "## Summary The POST..." -> "## Summary\n\nThe POST..."
  //     Also handles trailing colon: "## Summary: The POST..." -> "## Summary\n\nThe POST..."
  const headingWithBody = new RegExp(
    `^(#{1,6})[ \\t]+(${labelAlternation})[ \\t]*:?[ \\t]+(.+)$`,
    "gim",
  )
  text = text.replace(headingWithBody, (_m, hashes, label, rest) => {
    const tail = rest.trim()
    return tail ? `${hashes} ${label}\n\n${tail}` : `${hashes} ${label}`
  })

  // 2c) Generic fallback: if a heading line still has 8+ words, treat the first
  //     2-5 words as the heading title and split off the rest. Heuristic:
  //     find the first "." or sentence-like break, but if absent, just split
  //     after the first capitalized word run (Title Case stretch).
  text = text.replace(/^(#{1,6})[ \t]+([^\n]+)$/gim, (m, hashes, body) => {
    const trimmedBody = body.trim()
    // Already short enough — leave it.
    if (trimmedBody.split(/\s+/).length <= 6) return m

    // Try Title-Case run at the start: e.g. "Plan Of Action The next..." -> "Plan Of Action" + rest.
    const titleRun = trimmedBody.match(/^([A-Z][A-Za-z0-9&/]*(?:\s+(?:&|\/|of|and|the|to|for|in|on|by|[A-Z][A-Za-z0-9&/]*))*?)\s+([A-Z`*_].*)$/)
    if (titleRun && titleRun[1].split(/\s+/).length <= 6) {
      return `${hashes} ${titleRun[1].trim()}\n\n${titleRun[2].trim()}`
    }
    return m
  })

  // 3) Ensure a blank line AFTER a heading line so the next content becomes its own block.
  text = text.replace(/^(#{1,6}[ \t]+[^\n]+)\n(?!\n)/gm, "$1\n\n")

  // 4) Insert newline before numbered list items that appear mid-line.
  //    Two patterns:
  //    a) After sentence punctuation: "text. 1. Item" -> break.
  //    b) Sequence of numbered items inline: "1. First 2. Second" -> break before each `N.`
  //       starting from the second one. Detect by looking for ` <digits>. ` not at line start
  //       and not preceded by a digit (so we don't match "1.5").
  text = text.replace(/([.:!?\)])\s+(\d+\.\s+)/g, "$1\n$2")
  text = text.replace(/([^\n\d])\s+(\d+\.\s+[A-Z`*_])/g, "$1\n$2")

  // 5) Insert newline before bullet items that appear mid-line.
  text = text.replace(/([.:!?\)])\s+([-*+]\s+[A-Z*_`])/g, "$1\n$2")

  // 6) Generic "**Label:**" pseudo-headings that aren't in our known list — break to new line.
  text = text.replace(/([.:!?\)])\s+(\*\*[^*\n]{2,40}\*\*\s*:)/g, "$1\n\n$2")

  // 7) Strip whole-line bold wrappers. If a line is entirely wrapped in `**...**`
  //    (with no other bold runs inside), unwrap it — the model is over-bolding
  //    full sentences/paragraphs which makes the whole message render bold.
  text = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      // Skip headings/list items — they may legitimately contain bold spans.
      if (/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s*)/.test(trimmed)) return line

      // Match line wrapped entirely in ** ... ** with no inner ** pairs.
      const wholeBold = trimmed.match(/^\*\*([^]+)\*\*$/)
      if (wholeBold && !wholeBold[1].includes("**")) {
        const indentMatch = line.match(/^(\s*)/)
        const indent = indentMatch ? indentMatch[1] : ""
        return `${indent}${wholeBold[1].trim()}`
      }
      return line
    })
    .join("\n")

  // 8) Unwrap "long" bold spans that cover most of a line. If a line consists of
  //    one bold run plus minor punctuation, treat it as plain text. Heuristic:
  //    bold-run length / line length > 0.7 and bold-run is > 40 chars.
  text = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed || /^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s*)/.test(trimmed)) return line
      const single = trimmed.match(/^([^*]*?)\*\*([^*]+)\*\*([^*]*)$/)
      if (!single) return line
      const [, before, bold, after] = single
      if (bold.length > 40 && bold.length / trimmed.length > 0.7) {
        const indent = line.match(/^(\s*)/)?.[1] ?? ""
        return `${indent}${before}${bold}${after}`.replace(/\s+/g, " ").trimEnd()
      }
      return line
    })
    .join("\n")

  // 9) Collapse 3+ newlines to exactly 2.
  text = text.replace(/\n{3,}/g, "\n\n")

  // Restore inline ticks and fenced code blocks
  text = text.replace(/\u0000TICK(\d+)\u0000/g, (_, i) => ticks[Number(i)])
  text = text.replace(/\u0000FENCE(\d+)\u0000/g, (_, i) => fences[Number(i)])

  return text
}

function renderMarkdown(content: string) {
  const blocks: ReactNode[] = []
  const normalized = normalizeMarkdown(content)
  const lines = normalized.split("\n")
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim()
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) {
        index += 1
      }

      blocks.push(renderCodeBlock(codeLines.join("\n"), language, `code-${index}`))
      continue
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const [, hashes, headingText] = trimmed.match(/^(#{1,6})\s+(.*)$/) || []
      const level = hashes?.length ?? 1
      const headingClass =
        level === 1 ? "mt-4 mb-2 text-lg font-bold text-foreground tracking-tight"
        : level === 2 ? "mt-4 mb-2 text-base font-bold text-foreground tracking-tight"
        : level === 3 ? "mt-3 mb-1.5 text-sm font-bold text-foreground"
        : "mt-3 mb-1 text-sm font-semibold text-foreground/90"

      const headingTag = `h${Math.min(level + 1, 6)}`
      blocks.push(
        createElement(
          headingTag,
          { key: `heading-${index}`, className: headingClass },
          renderInline(headingText || "", `heading-${index}`)
        )
      )
      index += 1
      continue
    }

    if (isHorizontalRule(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-border/60" />)
      index += 1
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""))
        index += 1
      }

      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="my-3 border-l-4 border-primary/40 bg-primary/5 px-4 py-2 rounded-r-md text-foreground/80 italic"
        >
          {renderInlineWithBreaks(quoteLines.join("\n"), `quote-${index}`)}
        </blockquote>
      )
      continue
    }

    // Table: header line + separator line
    if (
      trimmed.includes("|")
      && index + 1 < lines.length
      && isTableSeparator(lines[index + 1])
    ) {
      const header = splitTableRow(lines[index])
      index += 2
      const rows: string[][] = []
      while (index < lines.length && lines[index].trim().includes("|") && !isBlockStart(lines[index])) {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }

      blocks.push(
        <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/60">
              <tr>
                {header.map((cell, ci) => (
                  <th key={`th-${ci}`} className="border-b border-border/60 px-3 py-2 text-left font-semibold text-foreground">
                    {renderInline(cell, `th-${index}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={`tr-${ri}`} className="even:bg-muted/20">
                  {row.map((cell, ci) => (
                    <td key={`td-${ri}-${ci}`} className="border-b border-border/40 px-3 py-2 text-foreground/90 last:border-r-0">
                      {renderInline(cell, `td-${index}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    if (isUnorderedListItem(trimmed) || isOrderedListItem(trimmed)) {
      const { node, nextIndex } = parseList(lines, index)
      blocks.push(renderList(node, `list-${index}`))
      index = nextIndex
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index])
      index += 1
    }

    blocks.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-foreground">
        {renderInlineWithBreaks(paragraphLines.join("\n"), `p-${index}`)}
      </p>
    )
  }

  return blocks
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
      <div className="flex-1 max-w-[92%] space-y-1 mt-1 min-w-0">
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
        <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/50 px-5 py-4 shadow-sm">
          <div className="space-y-2 text-sm leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {renderMarkdown(message.content)}
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
