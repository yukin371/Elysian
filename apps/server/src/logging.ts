import { platformManifest } from "@elysian/core"

import type { LogLevel } from "./config"

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export interface ServerLogger {
  debug: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
}

export const createServerLogger = (level: LogLevel): ServerLogger => ({
  debug: (message, context) => emitLog(level, "debug", message, context),
  info: (message, context) => emitLog(level, "info", message, context),
  warn: (message, context) => emitLog(level, "warn", message, context),
  error: (message, context) => emitLog(level, "error", message, context),
})

const emitLog = (
  activeLevel: LogLevel,
  messageLevel: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) => {
  if (LOG_LEVEL_PRIORITY[messageLevel] < LOG_LEVEL_PRIORITY[activeLevel]) {
    return
  }

  const payload = {
    ts: new Date().toISOString(),
    level: messageLevel,
    service: platformManifest.name,
    message,
    ...(context ? { context } : {}),
  }

  const serialized = JSON.stringify(payload)

  if (messageLevel === "error") {
    console.error(serialized)
    return
  }

  if (messageLevel === "warn") {
    console.warn(serialized)
    return
  }

  console.log(serialized)
}
