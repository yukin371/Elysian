import { describe, expect, test } from "bun:test"

import {
  buildDockerRunArgs,
  loadServerImageSmokeConfig,
  renderSmokeSummaryMarkdown,
  sanitizeCommandArgs,
} from "./server-image-smoke"

describe("loadServerImageSmokeConfig", () => {
  test("loads required values and defaults", () => {
    const config = loadServerImageSmokeConfig({
      DATABASE_URL:
        "postgres://postgres:postgres@host.docker.internal:5432/elysian",
      ACCESS_TOKEN_SECRET: "secret",
    })

    expect(config.image).toBe("elysian-server:local")
    expect(config.port).toBe(3300)
    expect(config.appEnv).toBe("production")
    expect(config.rateLimitEnabled).toBeTrue()
    expect(config.baseUrl).toBe("http://127.0.0.1:3300")
  })

  test("throws when DATABASE_URL is missing", () => {
    expect(() =>
      loadServerImageSmokeConfig({
        ACCESS_TOKEN_SECRET: "secret",
      }),
    ).toThrow("DATABASE_URL is required for server image smoke")
  })
})

describe("buildDockerRunArgs", () => {
  test("builds docker run arguments with required env vars", () => {
    const config = loadServerImageSmokeConfig({
      DATABASE_URL:
        "postgres://postgres:postgres@host.docker.internal:5432/elysian",
      ACCESS_TOKEN_SECRET: "secret",
      ELYSIAN_SERVER_IMAGE_SMOKE_CONTAINER_NAME: "elysian-server-smoke-test",
      ELYSIAN_SERVER_IMAGE_SMOKE_PORT: "3400",
      CORS_ALLOWED_ORIGINS: "https://admin.example.com",
      RATE_LIMIT_ENABLED: "false",
      LOG_LEVEL: "warn",
    })

    expect(buildDockerRunArgs(config)).toEqual([
      "run",
      "-d",
      "--name",
      "elysian-server-smoke-test",
      "-p",
      "3400:3400",
      "-e",
      "APP_ENV=production",
      "-e",
      "PORT=3400",
      "-e",
      "DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5432/elysian",
      "-e",
      "ACCESS_TOKEN_SECRET=secret",
      "-e",
      "CORS_ALLOWED_ORIGINS=https://admin.example.com",
      "-e",
      "RATE_LIMIT_ENABLED=false",
      "-e",
      "LOG_LEVEL=warn",
      "elysian-server:local",
    ])
  })
})

describe("sanitizeCommandArgs", () => {
  test("redacts sensitive env values in docker run args", () => {
    expect(
      sanitizeCommandArgs([
        "run",
        "-e",
        "DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5432/elysian",
        "-e",
        "ACCESS_TOKEN_SECRET=secret",
        "-e",
        "LOG_LEVEL=warn",
      ]),
    ).toEqual([
      "run",
      "-e",
      "DATABASE_URL=[REDACTED]",
      "-e",
      "ACCESS_TOKEN_SECRET=[REDACTED]",
      "-e",
      "LOG_LEVEL=warn",
    ])
  })
})

describe("renderSmokeSummaryMarkdown", () => {
  test("renders endpoint status summary", () => {
    const markdown = renderSmokeSummaryMarkdown({
      generatedAt: "2026-05-06T00:00:00.000Z",
      status: "passed",
      image: "elysian-server:local",
      containerName: "elysian-server-smoke-test",
      baseUrl: "http://127.0.0.1:3300",
      durationMs: 1234,
      failureMessage: null,
      logsExcerpt: null,
      checks: [
        {
          path: "/health",
          status: "passed",
          httpStatus: 200,
          bodySnippet: '{"status":"ok"}',
        },
        {
          path: "/metrics",
          status: "passed",
          httpStatus: 200,
          bodySnippet: "# HELP",
        },
      ],
    })

    expect(markdown).toContain("### Server Image Smoke")
    expect(markdown).toContain("- status: `passed`")
    expect(markdown).toContain("- /health: status=`passed` httpStatus=`200`")
    expect(markdown).toContain("- /metrics: status=`passed` httpStatus=`200`")
  })
})
