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

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  env: "development",
  port: 3000,
  logLevel: "info",
  corsAllowedOrigins: "*",
  rateLimitEnabled: false,
  rateLimitWindowMs: 60_000,
  rateLimitMaxRequests: 120,
}

const APP_ENVS = new Set<AppEnv>(["development", "test", "production"])
const LOG_LEVELS = new Set<LogLevel>(["debug", "info", "warn", "error"])

export const createServerConfig = (
  overrides: Partial<ServerConfig> = {},
): ServerConfig => ({
  ...DEFAULT_SERVER_CONFIG,
  ...overrides,
})

export const loadServerConfig = (
  env: Record<string, string | undefined> = process.env,
): ServerConfig => {
  const appEnv = parseAppEnv(env.APP_ENV ?? env.NODE_ENV)
  const port = parsePort(env.PORT)
  const logLevel = parseLogLevel(env.LOG_LEVEL)
  const corsAllowedOrigins = parseCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS)
  const rateLimitEnabled = parseRateLimitEnabled(env.RATE_LIMIT_ENABLED, appEnv)
  const rateLimitWindowMs = parsePositiveInt(
    env.RATE_LIMIT_WINDOW_MS,
    "RATE_LIMIT_WINDOW_MS",
    DEFAULT_SERVER_CONFIG.rateLimitWindowMs,
  )
  const rateLimitMaxRequests = parsePositiveInt(
    env.RATE_LIMIT_MAX_REQUESTS,
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
  const appEnv = parseAppEnv(env.APP_ENV ?? env.NODE_ENV)
  const accessTokenSecret = env.ACCESS_TOKEN_SECRET?.trim()

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

  if (APP_ENVS.has(value as AppEnv)) {
    return value as AppEnv
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: `APP_ENV must be one of: ${[...APP_ENVS].join(", ")}`,
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

  if (LOG_LEVELS.has(value as LogLevel)) {
    return value as LogLevel
  }

  throw new AppError({
    code: "CONFIG_INVALID",
    message: `LOG_LEVEL must be one of: ${[...LOG_LEVELS].join(", ")}`,
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
