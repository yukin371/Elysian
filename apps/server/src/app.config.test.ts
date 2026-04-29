import { describe, expect, it } from "bun:test"

import { loadServerConfig, resolveAccessTokenSecret } from "./config"

describe("loadServerConfig", () => {
  it("loads explicit environment values", () => {
    expect(
      loadServerConfig({
        APP_ENV: "production",
        PORT: "3100",
        LOG_LEVEL: "warn",
        CORS_ALLOWED_ORIGINS:
          "https://admin.example.com,https://ops.example.com",
        RATE_LIMIT_ENABLED: "true",
        RATE_LIMIT_WINDOW_MS: "120000",
        RATE_LIMIT_MAX_REQUESTS: "300",
      }),
    ).toEqual({
      env: "production",
      port: 3100,
      logLevel: "warn",
      corsAllowedOrigins: [
        "https://admin.example.com",
        "https://ops.example.com",
      ],
      rateLimitEnabled: true,
      rateLimitWindowMs: 120000,
      rateLimitMaxRequests: 300,
    })
  })

  it("throws on invalid port values", () => {
    expect(() =>
      loadServerConfig({
        PORT: "abc",
      }),
    ).toThrow("PORT must be an integer between 1 and 65535")
  })

  it("enables rate limit by default in production", () => {
    expect(
      loadServerConfig({
        APP_ENV: "production",
      }).rateLimitEnabled,
    ).toBe(true)
  })

  it("throws on invalid RATE_LIMIT_ENABLED values", () => {
    expect(() =>
      loadServerConfig({
        RATE_LIMIT_ENABLED: "yes",
      }),
    ).toThrow("RATE_LIMIT_ENABLED must be true or false")
  })
})

describe("resolveAccessTokenSecret", () => {
  it("requires ACCESS_TOKEN_SECRET outside test environments", () => {
    expect(() =>
      resolveAccessTokenSecret({
        APP_ENV: "development",
      }),
    ).toThrow("ACCESS_TOKEN_SECRET is required outside test environments")
  })

  it("allows a test fallback secret", () => {
    expect(
      resolveAccessTokenSecret({
        APP_ENV: "test",
      }),
    ).toBe("elysian-test-access-secret")
  })
})
