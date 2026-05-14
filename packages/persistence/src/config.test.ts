import { describe, expect, it } from "bun:test"

import { createDatabaseConfig, createRuntimeDatabaseConfig } from "./config"

describe("database config", () => {
  it("requires DATABASE_URL for migration and seed commands", () => {
    expect(() => createDatabaseConfig({})).toThrow(
      "DATABASE_URL for persistence commands and runtime access",
    )
  })

  it("prefers DATABASE_RUNTIME_URL for runtime client connections", () => {
    expect(
      createRuntimeDatabaseConfig({
        DATABASE_URL: "postgres://owner:owner@localhost:5432/elysian",
        DATABASE_RUNTIME_URL:
          "postgres://runtime:runtime@localhost:5432/elysian",
      }).databaseUrl,
    ).toBe("postgres://runtime:runtime@localhost:5432/elysian")
  })

  it("falls back to DATABASE_URL when runtime url is absent", () => {
    expect(
      createRuntimeDatabaseConfig({
        DATABASE_URL: "postgres://owner:owner@localhost:5432/elysian",
      }).databaseUrl,
    ).toBe("postgres://owner:owner@localhost:5432/elysian")
  })

  it("requires a runtime or base database url for runtime connections", () => {
    expect(() => createRuntimeDatabaseConfig({})).toThrow(
      "DATABASE_RUNTIME_URL or DATABASE_URL for persistence commands and runtime access",
    )
  })
})
