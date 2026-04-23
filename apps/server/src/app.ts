import { cors } from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { Elysia } from "elysia"

import { platformManifest } from "@elysian/core"
import { type ServerConfig, createServerConfig } from "./config"
import { AppError, toErrorResponse } from "./errors"
import { type ServerLogger, createServerLogger } from "./logging"
import { type ServerModule, registerModules, systemModule } from "./modules"

export interface CreateServerAppOptions {
  config?: ServerConfig
  logger?: ServerLogger
  modules?: ServerModule[]
}

export const createServerApp = (options: CreateServerAppOptions = {}) => {
  const config = options.config ?? createServerConfig()
  const logger = options.logger ?? createServerLogger(config.logLevel)
  const modules = options.modules ?? [systemModule]
  const rateLimitCounters = new Map<string, number>()

  const app = new Elysia({ name: "@elysian/server" })
    .use(
      cors({
        origin:
          config.corsAllowedOrigins === "*" ? true : config.corsAllowedOrigins,
      }),
    )
    .use(
      openapi({
        documentation: {
          info: {
            title: platformManifest.displayName,
            version: platformManifest.version,
            description:
              "Enterprise-grade rapid development platform powered by Elysia, schema-first code generation, and AI-assisted implementation.",
          },
          tags: [
            { name: "system", description: "System-level bootstrap endpoints" },
          ],
        },
      }),
    )
    .onBeforeHandle(({ request, set }) => {
      if (!config.rateLimitEnabled) {
        return
      }

      const currentBucket = Math.floor(Date.now() / config.rateLimitWindowMs)
      const previousBucket = currentBucket - 1
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip")?.trim() ||
        "unknown"
      const bucketKey = `${ip}:${String(currentBucket)}`
      const current = (rateLimitCounters.get(bucketKey) ?? 0) + 1
      rateLimitCounters.set(bucketKey, current)

      const previousKey = `${ip}:${String(previousBucket)}`
      rateLimitCounters.delete(previousKey)
      const resetSeconds =
        ((currentBucket + 1) * config.rateLimitWindowMs) / 1000

      set.headers["x-ratelimit-limit"] = String(config.rateLimitMaxRequests)
      set.headers["x-ratelimit-remaining"] = String(
        Math.max(config.rateLimitMaxRequests - current, 0),
      )
      set.headers["x-ratelimit-reset"] = String(Math.floor(resetSeconds))

      if (current > config.rateLimitMaxRequests) {
        set.headers["retry-after"] = String(
          Math.ceil(config.rateLimitWindowMs / 1000),
        )
        return toErrorResponse(
          new AppError({
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
            status: 429,
            expose: true,
            details: {
              limit: config.rateLimitMaxRequests,
              windowMs: config.rateLimitWindowMs,
            },
          }),
          config,
          429,
        )
      }
    })
    .onError(({ code, error, path, request }) => {
      if (code === "NOT_FOUND") {
        return toErrorResponse(
          new AppError({
            code: "ROUTE_NOT_FOUND",
            message: "Route not found",
            status: 404,
            expose: true,
            details: {
              method: request.method,
              path,
            },
          }),
          config,
          404,
        )
      }

      logger.error("Unhandled server error", {
        code,
        path,
        method: request.method,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : { value: String(error) },
      })

      return toErrorResponse(error, config)
    })

  return registerModules(app, modules, {
    config,
    logger,
  })
}
