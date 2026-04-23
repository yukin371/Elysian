import { defineConfig } from "drizzle-kit"

import { createDatabaseConfig } from "./src/config"

const config = createDatabaseConfig()

export default defineConfig({
  dialect: "postgresql",
  schema: `${config.schemaPath}/**/*.ts`,
  out: config.migrationsPath,
  dbCredentials: {
    url: config.databaseUrl,
  },
})
