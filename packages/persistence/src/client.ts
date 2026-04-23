import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"

import { createDatabaseConfig } from "./config"

export const createDatabaseClient = (
  env: Record<string, string | undefined> = process.env,
) => {
  const config = createDatabaseConfig(env)
  const client = new SQL(config.databaseUrl)

  return drizzle({ client })
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>
