/**
 * Frontend Logger
 * ─────────────────────
 * Lightweight structured logger for Next.js (works in SSR + browser).
 * No external dependencies — avoids bundler issues with Node-only libs.
 *
 * Usage:
 *   import { createLogger } from "@/lib/logger"
 *   const log = createLogger("MyComponent")
 *   log.info({ userId: "abc" }, "User logged in")
 *   log.info("Simple message")
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const isDev = process.env.NODE_ENV !== "production"
const minLevel: LogLevel = isDev ? "debug" : "info"

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[minLevel]
}

interface Logger {
  debug: (objOrMsg: unknown, msg?: string) => void
  info: (objOrMsg: unknown, msg?: string) => void
  warn: (objOrMsg: unknown, msg?: string) => void
  error: (objOrMsg: unknown, msg?: string) => void
}

function emit(level: LogLevel, module: string, objOrMsg: unknown, msg?: string) {
  if (!shouldLog(level)) return
  const fn =
    level === "debug" ? console.debug
    : level === "warn" ? console.warn
    : level === "error" ? console.error
    : console.info
  const ts = new Date().toISOString()
  if (typeof objOrMsg === "string") {
    fn(`[${ts}] ${level.toUpperCase()} [${module}] ${objOrMsg}`)
  } else {
    fn(`[${ts}] ${level.toUpperCase()} [${module}] ${msg ?? ""}`, objOrMsg)
  }
}

/**
 * Create a namespaced logger.
 * @param name — logical module / component name (e.g. "auth", "ProjectSelector")
 */
function createLogger(name: string): Logger {
  return {
    debug: (o: unknown, m?: string) => emit("debug", name, o, m),
    info: (o: unknown, m?: string) => emit("info", name, o, m),
    warn: (o: unknown, m?: string) => emit("warn", name, o, m),
    error: (o: unknown, m?: string) => emit("error", name, o, m),
  }
}

export { createLogger }
