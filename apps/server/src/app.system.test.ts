import { describe, expect, it } from "bun:test"

import { createServerApp } from "./app"
import { createServerConfig } from "./config"
import { AppError } from "./errors"
import type { ServerLogger } from "./logging"
import type { ServerModule } from "./modules"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const createTestApp = (
  options: {
    modules?: ServerModule[]
    config?: Parameters<typeof createServerConfig>[0]
  } = {},
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
      ...options.config,
    }),
    logger: silentLogger,
    modules: options.modules,
  })

describe("createServerApp", () => {
  it("returns a healthy response", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: "ok",
      service: "elysian",
      schemaVersion: 1,
    })
  })

  it("returns the registered module list", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/system/modules"),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      env: "test",
      modules: ["system"],
    })
  })

  it("returns a runtime metrics snapshot", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/metrics"))

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      service: string
      schemaVersion: number
      uptimeSeconds: number
      process: {
        rssBytes: number
        heapUsedBytes: number
      }
      cpu: {
        userMicros: number
        systemMicros: number
      }
      timestamp: string
    }

    expect(payload.service).toBe("elysian")
    expect(payload.schemaVersion).toBe(1)
    expect(payload.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(payload.process.rssBytes).toBeGreaterThan(0)
    expect(payload.process.heapUsedBytes).toBeGreaterThan(0)
    expect(payload.cpu.userMicros).toBeGreaterThanOrEqual(0)
    expect(payload.cpu.systemMicros).toBeGreaterThanOrEqual(0)
    expect(() => new Date(payload.timestamp)).not.toThrow()
  })

  it("returns prometheus metrics snapshot", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/metrics/prometheus"),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain(
      "text/plain; version=0.0.4",
    )
    const payload = await response.text()

    expect(payload).toContain("# HELP process_uptime_seconds")
    expect(payload).toContain("# TYPE process_uptime_seconds gauge")
    expect(payload).toContain("process_uptime_seconds ")
    expect(payload).toContain("process_start_time_seconds ")
    expect(payload).toContain("process_cpu_user_seconds_total ")
    expect(payload).toContain("process_cpu_system_seconds_total ")
    expect(payload).toContain("process_memory_rss_bytes ")
    expect(payload).toContain("process_memory_heap_used_bytes ")
  })

  it("allows cross-origin requests for frontend development", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/health", {
        headers: {
          origin: "http://127.0.0.1:5173",
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:5173",
    )
  })

  it("returns 429 when rate limit is exceeded", async () => {
    const app = createTestApp({
      config: {
        rateLimitEnabled: true,
        rateLimitMaxRequests: 1,
        rateLimitWindowMs: 60_000,
      },
    })
    const first = await app.handle(new Request("http://localhost/health"))
    const second = await app.handle(new Request("http://localhost/health"))

    expect(first.status).toBe(200)
    expect(first.headers.get("x-ratelimit-limit")).toBe("1")
    expect(first.headers.get("x-ratelimit-remaining")).toBe("0")
    expect(first.headers.get("x-ratelimit-reset")).toEqual(expect.any(String))
    expect(second.status).toBe(429)
    expect(await second.json()).toEqual({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
        status: 429,
        details: {
          limit: 1,
          windowMs: 60_000,
        },
      },
    })
    expect(second.headers.get("retry-after")).toBe("60")
    expect(second.headers.get("x-ratelimit-limit")).toBe("1")
    expect(second.headers.get("x-ratelimit-remaining")).toBe("0")
    expect(second.headers.get("x-ratelimit-reset")).toEqual(expect.any(String))
  })

  it("does not expose rate limit headers when rate limit is disabled", async () => {
    const app = createTestApp({
      config: {
        rateLimitEnabled: false,
      },
    })
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(200)
    expect(response.headers.get("x-ratelimit-limit")).toBeNull()
    expect(response.headers.get("x-ratelimit-remaining")).toBeNull()
    expect(response.headers.get("x-ratelimit-reset")).toBeNull()
    expect(response.headers.get("retry-after")).toBeNull()
  })

  it("returns a structured 404 error envelope", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/missing"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found",
        status: 404,
        details: {
          method: "GET",
          path: "/missing",
        },
      },
    })
  })

  it("keeps the app stable when no modules are registered", async () => {
    const app = createTestApp({ modules: [] })
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found",
        status: 404,
        details: {
          method: "GET",
          path: "/health",
        },
      },
    })
  })

  it("returns structured app errors from registered modules", async () => {
    const failingModule: ServerModule = {
      name: "failing",
      register: (app) =>
        app.get("/failing", () => {
          throw new AppError({
            code: "MODULE_FAILURE",
            message: "Module failed",
            status: 409,
            expose: true,
            details: {
              reason: "test",
            },
          })
        }),
    }

    const app = createTestApp({ modules: [failingModule] })
    const response = await app.handle(new Request("http://localhost/failing"))

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: {
        code: "MODULE_FAILURE",
        message: "Module failed",
        status: 409,
        details: {
          reason: "test",
        },
      },
    })
  })
})
