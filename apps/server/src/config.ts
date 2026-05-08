import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { AppError } from "./errors"

export type AppEnv = "development" | "test" | "production"
export type LogLevel = "debug" | "info" | "warn" | "error"

export interface ServerConfig {
  env: AppEnv
  port: number
  logLevel: LogLevel
  corsAllowedOrigins: string[] | "*"
  rateLimitEnabled: boolean
  rateLimitWindowMs: number
  rateLimitMaxRequests: number
}

const TEST_ACCESS_TOKEN_SECRET = "elysian-test-access-secret"
const APP_ENV_VALUES = ["development", "test", "production"] as const
const LOG_LEVEL_VALUES = ["debug", "info", "warn", "error"] as const
const SERVER_SRC_DIR = dirname(fileURLToPath(import.meta.url))
const DEFAULT_ENV_FILE_PATHS = [
  resolve(process.cwd(), ".env"),
  resolve(SERVER_SRC_DIR, "../../../.env"),
]

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  env: "development",
  port: 3000,
  logLevel: "info",
  corsAllowedOrigins: "*",
  rateLimitEnabled: false,
  rateLimitWindowMs: 60_000,
  rateLimitMaxRequests: 120,
}

export const createServerConfig = (
  overrides: Partial<ServerConfig> = {},
): ServerConfig => ({
  ...DEFAULT_SERVER_CONFIG,
  ...overrides,
})

export const applyServerEnvFiles = (
  env: Record<string, string | undefined> = process.env,
  envFilePaths: readonly string[] = DEFAULT_ENV_FILE_PATHS,
) => {
  for (const filePath of new Set(envFilePaths)) {
    if (!existsSync(filePath)) {
      continue
    }

    const fileEnv = parseEnvFile(readFileSync(filePath, "utf-8"))

    for (const [key, value] of Object.entries(fileEnv)) {
      if (env[key] === undefined) {
        env[key] = value
      }
    }
  }

  return env
}

export const loadServerConfig = (
  env: Record<string, string | undefined> = process.env,
): ServerConfig => {
  const runtimeEnv = env === process.env ? applyServerEnvFiles(env) : env
  const appEnv = parseAppEnv(runtimeEnv.APP_ENV ?? runtimeEnv.NODE_ENV)
  const port = parsePort(runtimeEnv.PORT)
  const logLevel = parseLogLevel(runtimeEnv.LOG_LEVEL)
  const corsAllowedOrigins = parseCorsAllowedOrigins(
    runtimeEnv.CORS_ALLOWED_ORIGINS,
  )
  const rateLimitEnabled = parseRateLimitEnabled(
    runtimeEnv.RATE_LIMIT_ENABLED,
    appEnv,
  )
  const rateLimitWindowMs = parsePositiveInt(
    runtimeEnv.RATE_LIMIT_WINDOW_MS,
    "RATE_LIMIT_WINDOW_MS",
    DEFAULT_SERVER_CONFIG.rateLimitWindowMs,
  )
  const rateLimitMaxRequests = parsePositiveInt(
    runtimeEnv.RATE_LIMIT_MAX_REQUESTS,
    "RATE_LIMIT_MAX_REQUESTS",
    DEFAULT_SERVER_CONFIG.rateLimitMaxRequests,
  )

  return createServerConfig({
    env: appEnv,
    port,
    logLevel,
    corsAllowedOrigins,
    rateLimitEnabled,
    rateLimitWindowMs,
    rateLimitMaxRequests,
  })
}

export const resolveAccessTokenSecret = (
  env: Record<string, string | undefined> = process.env,
): string => {
  const runtimeEnv = env === process.env ? applyServerEnvFiles(env) : env
  const appEnv = parseAppEnv(runtimeEnv.APP_ENV ?? runtimeEnv.NODE_ENV)
  const accessTokenSecret = runtimeEnv.ACCESS_TOKEN_SECRET?.trim()

  if (accessTokenSecret) {
    return accessTokenSecret
  }

  if (appEnv === "test") {
    return TEST_ACCESS_TOKEN_SECRET
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: "ACCESS_TOKEN_SECRET is required outside test environments",
    status: 500,
    expose: true,
    details: { key: "ACCESS_TOKEN_SECRET", env: appEnv },
  })
}

const parseAppEnv = (value: string | undefined): AppEnv => {
  if (value === undefined || value === "") {
    return DEFAULT_SERVER_CONFIG.env
  }

  if (value === "development" || value === "test" || value === "production") {
    return value
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: `APP_ENV must be one of: ${APP_ENV_VALUES.join(", ")}`,
    status: 500,
    expose: true,
    details: { key: "APP_ENV", value },
  })
}

const parsePort = (value: string | undefined): number => {
  if (value === undefined || value === "") {
    return DEFAULT_SERVER_CONFIG.port
  }

  const port = Number(value)
  const isIntegerPort = Number.isInteger(port) && port >= 1 && port <= 65535

  if (isIntegerPort) {
    return port
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: "PORT must be an integer between 1 and 65535",
    status: 500,
    expose: true,
    details: { key: "PORT", value },
  })
}

const parseLogLevel = (value: string | undefined): LogLevel => {
  if (value === undefined || value === "") {
    return DEFAULT_SERVER_CONFIG.logLevel
  }

  if (
    value === "debug" ||
    value === "info" ||
    value === "warn" ||
    value === "error"
  ) {
    return value
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: `LOG_LEVEL must be one of: ${LOG_LEVEL_VALUES.join(", ")}`,
    status: 500,
    expose: true,
    details: { key: "LOG_LEVEL", value },
  })
}

const parseCorsAllowedOrigins = (value: string | undefined): string[] | "*" => {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_SERVER_CONFIG.corsAllowedOrigins
  }

  const normalized = value.trim()

  if (normalized === "*") {
    return "*"
  }

  const items = normalized
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (items.length > 0) {
    return items
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message:
      "CORS_ALLOWED_ORIGINS must be '*' or a comma-separated origin list",
    status: 500,
    expose: true,
    details: { key: "CORS_ALLOWED_ORIGINS", value },
  })
}

const parseRateLimitEnabled = (
  value: string | undefined,
  appEnv: AppEnv,
): boolean => {
  if (value === undefined || value.trim() === "") {
    return appEnv === "production"
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === "true") {
    return true
  }

  if (normalized === "false") {
    return false
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: "RATE_LIMIT_ENABLED must be true or false",
    status: 500,
    expose: true,
    details: { key: "RATE_LIMIT_ENABLED", value },
  })
}

const parsePositiveInt = (
  value: string | undefined,
  key: string,
  fallback: number,
): number => {
  if (value === undefined || value.trim() === "") {
    return fallback
  }

  const parsed = Number(value)

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: `${key} must be a positive integer`,
    status: 500,
    expose: true,
    details: { key, value },
  })
}

const parseEnvFile = (content: string): Record<string, string> => {
  const parsed: Record<string, string> = {}

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim()

    if (line.length === 0 || line.startsWith("#")) {
      continue
    }

    const normalized = line.startsWith("export ")
      ? line.slice("export ".length)
      : line
    const separatorIndex = normalized.indexOf("=")

    if (separatorIndex <= 0) {
      continue
    }

    const key = normalized.slice(0, separatorIndex).trim()
    const rawValue = normalized.slice(separatorIndex + 1).trim()

    if (key.length === 0) {
      continue
    }

    parsed[key] = stripEnvValueQuotes(rawValue)
  }

  return parsed
}

const stripEnvValueQuotes = (value: string) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
