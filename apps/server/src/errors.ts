import type { ServerConfig } from "./config"

export interface ErrorResponse {
  error: {
    code: string
    message: string
    status: number
    details?: Record<string, unknown>
  }
}

interface AppErrorOptions {
  code: string
  message: string
  status: number
  expose?: boolean
  details?: Record<string, unknown>
  cause?: unknown
}

export class AppError extends Error {
  readonly code: string
  readonly status: number
  readonly expose: boolean
  readonly details?: Record<string, unknown>

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = "AppError"
    this.code = options.code
    this.status = options.status
    this.expose = options.expose ?? false
    this.details = options.details
  }
}

export class ModuleRegistrationError extends AppError {
  constructor(moduleName: string, cause: unknown) {
    super({
      code: "MODULE_REGISTRATION_FAILED",
      message: `Failed to register module "${moduleName}"`,
      status: 500,
      expose: true,
      details: { moduleName },
      cause,
    })

    this.name = "ModuleRegistrationError"
  }
}

export const toErrorResponse = (
  error: unknown,
  config: ServerConfig,
  fallbackStatus = 500,
): Response => {
  const normalized = normalizeError(error, config, fallbackStatus)

  return Response.json(normalized.body, {
    status: normalized.status,
  })
}

const normalizeError = (
  error: unknown,
  config: ServerConfig,
  fallbackStatus: number,
): { status: number; body: ErrorResponse } => {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
          details: shouldExposeDetails(config, error)
            ? error.details
            : undefined,
        },
      },
    }
  }

  return {
    status: fallbackStatus,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message:
          config.env === "production"
            ? "Internal server error"
            : unknownErrorMessage(error),
        status: fallbackStatus,
      },
    },
  }
}

const shouldExposeDetails = (config: ServerConfig, error: AppError) =>
  error.expose && config.env !== "production"

const unknownErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Unknown error"
}
