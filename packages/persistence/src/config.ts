import { platformManifest } from "@elysian/core"

export interface DatabaseConfig {
  databaseUrl: string
  schemaPath: string
  migrationsPath: string
}

const buildMissingDatabaseUrlError = (keys: string[]) =>
  new Error(
    `${platformManifest.name} requires ${keys.join(" or ")} for persistence commands and runtime access`,
  )

export const createDatabaseConfig = (
  env: Record<string, string | undefined> = process.env,
): DatabaseConfig => {
  const databaseUrl = env.DATABASE_URL

  if (!databaseUrl) {
    throw buildMissingDatabaseUrlError(["DATABASE_URL"])
  }

  return {
    databaseUrl,
    schemaPath: "./src/schema",
    migrationsPath: "./drizzle",
  }
}

export const createRuntimeDatabaseConfig = (
  env: Record<string, string | undefined> = process.env,
): DatabaseConfig => {
  const databaseUrl = env.DATABASE_RUNTIME_URL ?? env.DATABASE_URL

  if (!databaseUrl) {
    throw buildMissingDatabaseUrlError(["DATABASE_RUNTIME_URL", "DATABASE_URL"])
  }

  return {
    databaseUrl,
    schemaPath: "./src/schema",
    migrationsPath: "./drizzle",
  }
}
