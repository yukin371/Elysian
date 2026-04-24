import { createDatabaseClient } from "./client"
import { initializeTenant } from "./seed"

export interface TenantInitCliOptions {
  tenantCode: string
  tenantName: string
  tenantStatus?: "active" | "suspended"
  adminUsername?: string
  adminPassword: string
  adminDisplayName?: string
}

export const parseTenantInitCliArgs = (
  args: string[],
): TenantInitCliOptions | null => {
  let tenantCode = ""
  let tenantName = ""
  let tenantStatus: "active" | "suspended" | undefined
  let adminUsername = ""
  let adminPassword = ""
  let adminDisplayName = ""

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === "--code") {
      tenantCode = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--name") {
      tenantName = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--status") {
      const value = args[index + 1]

      if (value === "active" || value === "suspended") {
        tenantStatus = value
        index += 1
        continue
      }

      return null
    }

    if (current === "--admin-username") {
      adminUsername = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--admin-password") {
      adminPassword = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--admin-display-name") {
      adminDisplayName = args[index + 1] ?? ""
      index += 1
      continue
    }

    return null
  }

  if (!tenantCode || !tenantName || !adminPassword) {
    return null
  }

  return {
    tenantCode,
    tenantName,
    adminPassword,
    ...(tenantStatus ? { tenantStatus } : {}),
    ...(adminUsername ? { adminUsername } : {}),
    ...(adminDisplayName ? { adminDisplayName } : {}),
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      '  bun src/tenant-init.ts --code tenant-alpha --name "Tenant Alpha" --admin-password "replace-me" [--status active|suspended] [--admin-username admin] [--admin-display-name "Tenant Alpha Admin"]',
    ].join("\n"),
  )
}

if (import.meta.main) {
  try {
    const options = parseTenantInitCliArgs(Bun.argv.slice(2))

    if (!options) {
      printUsage()
      process.exitCode = 1
    } else {
      const db = createDatabaseClient()
      try {
        const result = await initializeTenant(db, options)

        console.log(
          `[elysian] tenant init complete (code=${result.tenantCode}, tenantId=${result.tenantId}, createdTenant=${result.createdTenant}, admin=${result.adminUsername}, insertedAdmin=${result.insertedAdmin})`,
        )
      } finally {
        await db.$client.end()
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[elysian] tenant init failed: ${message}`)
    process.exitCode = 1
  }
}
