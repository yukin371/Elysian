import { platformManifest } from "@elysian/core"

export interface DatabaseConfig {
  databaseUrl: string
  schemaPath: string
  migrationsPath: string
}

export const createDatabaseConfig = (
  env: Record<string, string | undefined> = process.env,
): DatabaseConfig => {
  const databaseUrl = env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      `${platformManifest.name} requires DATABASE_URL for persistence commands and runtime access`,
    )
  }

  return {
    databaseUrl,
    schemaPath: "./src/schema",
    migrationsPath: "./drizzle",
  }
}
