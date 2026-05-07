"use client"

import { toast as rawToast } from "@/hooks/use-toast"

/**
 * Centralized notification helpers.
 *
 * Why: 17 callers used to inline `toast({...})` plus duplicate
 * `err?.response?.data?.message ?? "fallback"` extraction. Routing every
 * notification through here keeps wording, dedup, and error parsing
 * consistent — and makes it cheap to swap toast libraries later.
 */

type ToastVariant = "default" | "destructive"

interface NotifyOptions {
  description?: string
  /** Override default 5s duration. */
  durationMs?: number
}

const DEDUP_WINDOW_MS = 2000
const recent = new Map<string, { id: string; ts: number; dismiss: () => void }>()

function key(variant: ToastVariant, title: string, description?: string) {
  return `${variant}::${title}::${description ?? ""}`
}

function show(variant: ToastVariant, title: string, options?: NotifyOptions) {
  const k = key(variant, title, options?.description)
  const now = Date.now()
  const prior = recent.get(k)
  if (prior && now - prior.ts < DEDUP_WINDOW_MS) {
    // Same toast within dedup window — refresh timestamp, don't fire again.
    prior.ts = now
    return { id: prior.id, dismiss: prior.dismiss }
  }

  const t = rawToast({
    variant,
    title,
    description: options?.description,
    duration: options?.durationMs,
  })

  recent.set(k, { id: t.id, ts: now, dismiss: t.dismiss })
  // Drop dedup record once the toast lifetime has clearly passed so the
  // map doesn't grow forever in long-lived sessions.
  setTimeout(() => {
    const cur = recent.get(k)
    if (cur && cur.id === t.id) recent.delete(k)
  }, DEDUP_WINDOW_MS + 5000)

  return { id: t.id, dismiss: t.dismiss }
}

/**
 * Pull a human-readable message out of an axios/fetch-style error.
 * Falls back to the provided generic message so users never see "[object Object]".
 */
export function extractApiError(err: unknown, fallback = "Something went wrong"): string {
  if (!err) return fallback
  const e = err as {
    response?: { data?: { message?: unknown; detail?: unknown; error?: unknown } }
    message?: unknown
  }
  const candidates = [
    e?.response?.data?.message,
    e?.response?.data?.detail,
    e?.response?.data?.error,
    e?.message,
  ]
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c
  }
  return fallback
}

export const notify = {
  success(title: string, description?: string, options?: NotifyOptions) {
    return show("default", title, { ...options, description })
  },
  info(title: string, description?: string, options?: NotifyOptions) {
    return show("default", title, { ...options, description })
  },
  warning(title: string, description?: string, options?: NotifyOptions) {
    return show("default", title, { ...options, description })
  },
  /**
   * Pass either a description string or an unknown error — errors are
   * unwrapped via extractApiError so callers don't repeat that logic.
   */
  error(title: string, descriptionOrError?: string | unknown, options?: NotifyOptions) {
    let description: string | undefined
    if (typeof descriptionOrError === "string") {
      description = descriptionOrError
    } else if (descriptionOrError !== undefined) {
      description = extractApiError(descriptionOrError, "Please try again.")
    }
    return show("destructive", title, { ...options, description })
  },
}

export type { NotifyOptions }
