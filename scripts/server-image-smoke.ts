import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { appendFile, mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

const DEFAULT_IMAGE = "elysian-server:local"
const DEFAULT_PORT = 3300
const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_LOG_TAIL_LINES = 120
const CHECK_PATHS = ["/health", "/metrics"] as const

type CheckPath = (typeof CHECK_PATHS)[number]

export interface ServerImageSmokeConfig {
  image: string
  containerName: string
  appEnv: "production" | "development" | "test"
  port: number
  baseUrl: string
  timeoutMs: number
  logTailLines: number
  databaseUrl: string
  runtimeDatabaseUrl: string
  accessTokenSecret: string
  corsAllowedOrigins: string
  rateLimitEnabled: boolean
  rateLimitWindowMs: number | null
  rateLimitMaxRequests: number | null
  logLevel: "debug" | "info" | "warn" | "error" | null
}

export interface EndpointCheck {
  path: CheckPath
  status: "passed" | "failed"
  httpStatus: number | null
  bodySnippet: string | null
}

export interface ServerImageSmokeReport {
  generatedAt: string
  status: "passed" | "failed"
  image: string
  containerName: string
  baseUrl: string
  durationMs: number
  checks: EndpointCheck[]
  failureMessage: string | null
  logsExcerpt: string | null
}

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message)
  }
}

const parsePort = (
  value: string | undefined,
  key: string,
  fallback: number,
) => {
  if (value === undefined || value.trim() === "") {
    return fallback
  }

  const parsed = Number(value)
  assert(
    Number.isInteger(parsed) && parsed >= 1 && parsed <= 65_535,
    `${key} must be an integer between 1 and 65535`,
  )
  return parsed
}

const parsePositiveInt = (
  value: string | undefined,
  key: string,
  fallback: number,
) => {
  if (value === undefined || value.trim() === "") {
    return fallback
  }

  const parsed = Number(value)
  assert(
    Number.isInteger(parsed) && parsed > 0,
    `${key} must be a positive integer`,
  )
  return parsed
}

const parseOptionalPositiveInt = (value: string | undefined, key: string) => {
  if (value === undefined || value.trim() === "") {
    return null
  }

  return parsePositiveInt(value, key, 1)
}

const parseRateLimitEnabled = (value: string | undefined) => {
  if (value === undefined || value.trim() === "") {
    return true
  }

  const normalized = value.trim().toLowerCase()
  assert(
    normalized === "true" || normalized === "false",
    "RATE_LIMIT_ENABLED must be true or false",
  )
  return normalized === "true"
}

const parseLogLevel = (value: string | undefined) => {
  if (value === undefined || value.trim() === "") {
    return null
  }

  assert(
    value === "debug" ||
      value === "info" ||
      value === "warn" ||
      value === "error",
    "LOG_LEVEL must be one of: debug, info, warn, error",
  )
  return value
}

export const loadServerImageSmokeConfig = (
  env: Record<string, string | undefined> = process.env,
): ServerImageSmokeConfig => {
  const databaseUrl = env.DATABASE_URL?.trim()
  const runtimeDatabaseUrl =
    env.DATABASE_RUNTIME_URL?.trim() || databaseUrl || undefined
  const accessTokenSecret = env.ACCESS_TOKEN_SECRET?.trim()
  assert(databaseUrl, "DATABASE_URL is required for server image smoke")
  assert(
    runtimeDatabaseUrl,
    "DATABASE_RUNTIME_URL or DATABASE_URL is required for server image smoke",
  )
  assert(
    accessTokenSecret,
    "ACCESS_TOKEN_SECRET is required for server image smoke",
  )

  const port = parsePort(
    env.ELYSIAN_SERVER_IMAGE_SMOKE_PORT,
    "ELYSIAN_SERVER_IMAGE_SMOKE_PORT",
    DEFAULT_PORT,
  )
  const appEnv = (env.APP_ENV?.trim() || "production") as
    | "production"
    | "development"
    | "test"
  assert(
    appEnv === "production" || appEnv === "development" || appEnv === "test",
    "APP_ENV must be one of: development, test, production",
  )

  return {
    image: env.ELYSIAN_SERVER_IMAGE_SMOKE_IMAGE?.trim() || DEFAULT_IMAGE,
    containerName:
      env.ELYSIAN_SERVER_IMAGE_SMOKE_CONTAINER_NAME?.trim() ||
      `elysian-server-smoke-${randomUUID().slice(0, 8)}`,
    appEnv,
    port,
    baseUrl: `http://127.0.0.1:${String(port)}`,
    timeoutMs: parsePositiveInt(
      env.ELYSIAN_SERVER_IMAGE_SMOKE_TIMEOUT_MS,
      "ELYSIAN_SERVER_IMAGE_SMOKE_TIMEOUT_MS",
      DEFAULT_TIMEOUT_MS,
    ),
    logTailLines: parsePositiveInt(
      env.ELYSIAN_SERVER_IMAGE_SMOKE_LOG_TAIL_LINES,
      "ELYSIAN_SERVER_IMAGE_SMOKE_LOG_TAIL_LINES",
      DEFAULT_LOG_TAIL_LINES,
    ),
    databaseUrl,
    runtimeDatabaseUrl,
    accessTokenSecret,
    corsAllowedOrigins:
      env.CORS_ALLOWED_ORIGINS?.trim() || "http://localhost:4173",
    rateLimitEnabled: parseRateLimitEnabled(env.RATE_LIMIT_ENABLED),
    rateLimitWindowMs: parseOptionalPositiveInt(
      env.RATE_LIMIT_WINDOW_MS,
      "RATE_LIMIT_WINDOW_MS",
    ),
    rateLimitMaxRequests: parseOptionalPositiveInt(
      env.RATE_LIMIT_MAX_REQUESTS,
      "RATE_LIMIT_MAX_REQUESTS",
    ),
    logLevel: parseLogLevel(env.LOG_LEVEL?.trim()),
  }
}

export const buildDockerRunArgs = (config: ServerImageSmokeConfig) => {
  const args = [
    "run",
    "-d",
    "--name",
    config.containerName,
    "-p",
    `${String(config.port)}:${String(config.port)}`,
    "-e",
    `APP_ENV=${config.appEnv}`,
    "-e",
    `PORT=${String(config.port)}`,
    "-e",
    `DATABASE_URL=${config.databaseUrl}`,
    "-e",
    `DATABASE_RUNTIME_URL=${config.runtimeDatabaseUrl}`,
    "-e",
    `ACCESS_TOKEN_SECRET=${config.accessTokenSecret}`,
    "-e",
    `CORS_ALLOWED_ORIGINS=${config.corsAllowedOrigins}`,
    "-e",
    `RATE_LIMIT_ENABLED=${String(config.rateLimitEnabled)}`,
  ]

  if (config.rateLimitWindowMs !== null) {
    args.push("-e", `RATE_LIMIT_WINDOW_MS=${String(config.rateLimitWindowMs)}`)
  }

  if (config.rateLimitMaxRequests !== null) {
    args.push(
      "-e",
      `RATE_LIMIT_MAX_REQUESTS=${String(config.rateLimitMaxRequests)}`,
    )
  }

  if (config.logLevel !== null) {
    args.push("-e", `LOG_LEVEL=${config.logLevel}`)
  }

  args.push(config.image)
  return args
}

const resolveReportDir = () =>
  process.env.ELYSIAN_SERVER_IMAGE_SMOKE_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "server-image-smoke")

const resolveReportPath = () =>
  process.env.ELYSIAN_SERVER_IMAGE_SMOKE_REPORT_PATH ??
  join(resolveReportDir(), "server-image-smoke-report.json")

const resolveSummaryPath = () =>
  process.env.ELYSIAN_SERVER_IMAGE_SMOKE_SUMMARY_PATH ??
  process.env.GITHUB_STEP_SUMMARY ??
  null

const SENSITIVE_ENV_KEYS = new Set(["ACCESS_TOKEN_SECRET", "DATABASE_URL"])

export const sanitizeCommandArgs = (args: string[]) => {
  const sanitized: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === "-e") {
      const next = args[index + 1]
      if (next) {
        const separatorIndex = next.indexOf("=")
        const key =
          separatorIndex >= 0 ? next.slice(0, separatorIndex) : next.trim()

        sanitized.push(
          "-e",
          SENSITIVE_ENV_KEYS.has(key) ? `${key}=[REDACTED]` : next,
        )
        index += 1
        continue
      }
    }

    sanitized.push(current)
  }

  return sanitized
}

const runCommand = async (
  command: string,
  args: string[],
  options: { allowNonZeroExit?: boolean } = {},
) => {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  })

  let stdout = ""
  let stderr = ""

  child.stdout.on("data", (chunk) => {
    stdout += String(chunk)
  })

  child.stderr.on("data", (chunk) => {
    stderr += String(chunk)
  })

  const exitCode: number = await new Promise((resolve, reject) => {
    child.once("error", reject)
    child.once("close", (code) => resolve(code ?? 0))
  })

  if (exitCode !== 0 && !options.allowNonZeroExit) {
    const displayArgs = sanitizeCommandArgs(args)
    throw new Error(
      `${command} ${displayArgs.join(" ")} failed with exit code ${String(exitCode)}: ${stderr.trim() || stdout.trim() || "no output"}`,
    )
  }

  return {
    exitCode,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const checkEndpoint = async (
  baseUrl: string,
  path: CheckPath,
): Promise<EndpointCheck> => {
  try {
    const response = await fetch(`${baseUrl}${path}`)
    const body = (await response.text()).slice(0, 200)
    return {
      path,
      status: response.ok ? "passed" : "failed",
      httpStatus: response.status,
      bodySnippet: body || null,
    }
  } catch (error) {
    return {
      path,
      status: "failed",
      httpStatus: null,
      bodySnippet: error instanceof Error ? error.message : String(error),
    }
  }
}

const createPendingChecks = (): EndpointCheck[] =>
  CHECK_PATHS.map((path) => ({
    path,
    status: "failed",
    httpStatus: null,
    bodySnippet: null,
  }))

const waitForChecks = async (config: ServerImageSmokeConfig) => {
  const startedAt = Date.now()
  let lastChecks = createPendingChecks()

  while (Date.now() - startedAt < config.timeoutMs) {
    lastChecks = await Promise.all(
      CHECK_PATHS.map((path) => checkEndpoint(config.baseUrl, path)),
    )

    if (lastChecks.every((item) => item.status === "passed")) {
      return lastChecks
    }

    await sleep(1_000)
  }

  const failedChecks = lastChecks
    .filter((item) => item.status === "failed")
    .map((item) => item.path)
    .join(", ")
  const error = new Error(
    `Server image smoke timed out after ${String(config.timeoutMs)}ms; failed endpoints: ${failedChecks || "unknown"}`,
  ) as Error & { checks?: EndpointCheck[] }
  error.checks = lastChecks
  throw error
}

const readLogsExcerpt = async (
  containerName: string,
  logTailLines: number,
): Promise<string | null> => {
  const result = await runCommand(
    "docker",
    ["logs", "--tail", String(logTailLines), containerName],
    { allowNonZeroExit: true },
  )
  const output = result.stderr || result.stdout
  return output || null
}

const cleanupContainer = async (containerName: string) => {
  await runCommand("docker", ["rm", "-f", containerName], {
    allowNonZeroExit: true,
  })
}

export const renderSmokeSummaryMarkdown = (report: ServerImageSmokeReport) => {
  const lines = [
    "### Server Image Smoke",
    "",
    `- status: \`${report.status}\``,
    `- image: \`${report.image}\``,
    `- containerName: \`${report.containerName}\``,
    `- baseUrl: \`${report.baseUrl}\``,
    `- durationMs: \`${String(report.durationMs)}\``,
    `- failureMessage: ${report.failureMessage ?? "none"}`,
    "",
    "Endpoint checks:",
    ...report.checks.map(
      (item) =>
        `- ${item.path}: status=\`${item.status}\` httpStatus=\`${item.httpStatus === null ? "none" : String(item.httpStatus)}\``,
    ),
    "",
  ]

  return `${lines.join("\n")}\n`
}

const writeReport = async (report: ServerImageSmokeReport) => {
  const reportPath = resolveReportPath()
  await mkdir(dirname(reportPath), { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await mkdir(dirname(summaryPath), { recursive: true })
    await appendFile(summaryPath, renderSmokeSummaryMarkdown(report), "utf8")
  }

  return reportPath
}

export const run = async () => {
  const config = loadServerImageSmokeConfig()
  const startedAt = Date.now()
  let checks = createPendingChecks()
  let failureMessage: string | null = null
  let logsExcerpt: string | null = null

  try {
    await cleanupContainer(config.containerName)
    await runCommand("docker", buildDockerRunArgs(config))
    checks = await waitForChecks(config)
  } catch (error) {
    failureMessage = error instanceof Error ? error.message : String(error)
    checks =
      typeof error === "object" &&
      error !== null &&
      "checks" in error &&
      Array.isArray((error as { checks?: unknown }).checks)
        ? (error as { checks: EndpointCheck[] }).checks
        : checks
    logsExcerpt = await readLogsExcerpt(
      config.containerName,
      config.logTailLines,
    )
  } finally {
    await cleanupContainer(config.containerName)
  }

  const report: ServerImageSmokeReport = {
    generatedAt: new Date().toISOString(),
    status: failureMessage === null ? "passed" : "failed",
    image: config.image,
    containerName: config.containerName,
    baseUrl: config.baseUrl,
    durationMs: Date.now() - startedAt,
    checks,
    failureMessage,
    logsExcerpt,
  }
  const reportPath = await writeReport(report)

  console.log(`[server-image-smoke] report: ${reportPath}`)
  console.log(
    `[server-image-smoke] status=${report.status} image=${report.image} baseUrl=${report.baseUrl}`,
  )

  if (report.failureMessage) {
    console.error(`[server-image-smoke] failure: ${report.failureMessage}`)
    if (report.logsExcerpt) {
      console.error("[server-image-smoke] logs:")
      console.error(report.logsExcerpt)
    }
    process.exitCode = 1
  }
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[server-image-smoke] failed: ${message}`)
    process.exitCode = 1
  }
}
