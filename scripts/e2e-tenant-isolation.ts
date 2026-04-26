import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import {
  DEFAULT_TENANT_ID,
  createDatabaseClient,
  createTenantBootstrapSeedSpec,
  deleteCustomer,
  dictionaryItems,
  dictionaryTypes,
  getTenantByCode,
  insertCustomer,
  listCustomers,
  menus,
  permissions,
  roles,
  users,
} from "@elysian/persistence"

interface LoginResponse {
  accessToken: string
  user: {
    tenantId: string
    isSuperAdmin: boolean
  }
}

interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
}

type TenantFailureCategory = "environment" | "dependency" | "test_case"

interface TenantE2eReport {
  generatedAt: string
  status: "passed" | "failed"
  baseUrl: string
  durationMs: number
  lastStage: string
  failureCategory: TenantFailureCategory | null
  failureMessage: string | null
  tenantCodes: {
    alpha: string
    beta: string
  }
}

const requiredEnvKeys = ["DATABASE_URL", "ACCESS_TOKEN_SECRET"] as const

const ensureRequiredEnv = () => {
  const missing = requiredEnvKeys.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for tenant e2e: ${missing.join(", ")}`,
    )
  }
}

const resolvedPort =
  process.env.ELYSIAN_TENANT_PORT ??
  (31_000 + Math.floor(Math.random() * 1_000)).toString()
const baseUrl = `http://127.0.0.1:${resolvedPort}`

const resolveTenantReportDir = () =>
  process.env.ELYSIAN_TENANT_E2E_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "tenant")

const resolveTenantReportPath = () =>
  process.env.ELYSIAN_TENANT_E2E_REPORT_PATH ??
  join(resolveTenantReportDir(), "e2e-tenant-report.json")

const writeTenantReport = async (report: TenantE2eReport) => {
  const reportPath = resolveTenantReportPath()
  const reportDir = dirname(reportPath)

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  return reportPath
}

const classifyFailure = (message: string): TenantFailureCategory => {
  if (message.includes("Missing required environment variables")) {
    return "environment"
  }

  if (
    message.includes("timed out") ||
    message.includes("not ready") ||
    message.includes("tenant init failed")
  ) {
    return "dependency"
  }

  return "test_case"
}

const describeError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error)
  }

  const messages = [error.message]
  let currentCause: unknown = error.cause

  while (currentCause) {
    if (currentCause instanceof Error) {
      messages.push(currentCause.message)
      currentCause = currentCause.cause
      continue
    }

    messages.push(String(currentCause))
    break
  }

  return messages.filter(Boolean).join(" | caused by: ")
}

const waitForHealth = async (timeoutMs: number) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.ok) {
        return
      }
    } catch {
      // noop
    }

    await Bun.sleep(500)
  }

  throw new Error(`Server health check timed out (${timeoutMs}ms)`)
}

const waitForRequiredModules = async (
  requiredModules: string[],
  timeoutMs: number,
) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/system/modules`)
      if (!response.ok) {
        await Bun.sleep(500)
        continue
      }

      const payload = (await response.json()) as {
        modules?: string[]
      }
      const modules = payload.modules ?? []
      const missing = requiredModules.filter((name) => !modules.includes(name))

      if (missing.length === 0) {
        return
      }
    } catch {
      // noop
    }

    await Bun.sleep(500)
  }

  throw new Error(
    `Required modules are not ready within ${timeoutMs}ms (required=${requiredModules.join(", ")}). Check DATABASE_URL/migration/seed/tenant:init setup.`,
  )
}

const assertStatus = async (response: Response, expected: number) => {
  if (response.status !== expected) {
    const bodyText = await response.text()
    throw new Error(
      `Expected status ${expected}, received ${response.status}, body=${bodyText}`,
    )
  }
}

const runCommand = async (command: string, args: string[]) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  })
  const [code] = (await once(child, "exit")) as [number | null]

  if (code !== 0) {
    throw new Error(
      `Command failed (${command} ${args.join(" ")}), exit=${code ?? "null"}`,
    )
  }
}

const login = async (input: {
  username: string
  password: string
  tenantCode?: string
}) => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  })
  await assertStatus(response, 200)
  const payload = (await response.json()) as LoginResponse

  if (!payload.accessToken) {
    throw new Error("Login succeeded but accessToken is missing")
  }

  return payload
}

const createCustomerThroughApi = async (
  accessToken: string,
  name: string,
): Promise<CustomerRecord> => {
  const response = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      status: "active",
    }),
  })
  await assertStatus(response, 201)
  return (await response.json()) as CustomerRecord
}

const listCustomersThroughApi = async (accessToken: string) => {
  const response = await fetch(`${baseUrl}/customers`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })
  await assertStatus(response, 200)
  return (await response.json()) as {
    items: CustomerRecord[]
  }
}

const getCustomerThroughApi = async (accessToken: string, id: string) =>
  fetch(`${baseUrl}/customers/${id}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

const getTenantListThroughApi = async (accessToken: string) => {
  const response = await fetch(`${baseUrl}/system/tenants`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })
  return response
}

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`

const quoteLiteral = (value: string) => `'${value.replaceAll("'", "''")}'`

const buildRoleDatabaseUrl = (
  baseDatabaseUrl: string,
  username: string,
  password: string,
) => {
  const url = new URL(baseDatabaseUrl)
  url.username = username
  url.password = password
  return url.toString()
}

const provisionRuntimeRole = async (
  db: ReturnType<typeof createDatabaseClient>,
  input: {
    roleName: string
    rolePassword: string
    databaseName: string
  },
) => {
  await db.execute(`
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${quoteLiteral(input.roleName)}) THEN
    EXECUTE 'DROP OWNED BY ' || quote_ident(${quoteLiteral(input.roleName)});
    EXECUTE 'DROP ROLE ' || quote_ident(${quoteLiteral(input.roleName)});
  END IF;
END
$$;
`)
  await db.execute(`
CREATE ROLE ${quoteIdentifier(input.roleName)}
WITH LOGIN
PASSWORD ${quoteLiteral(input.rolePassword)}
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOINHERIT
NOBYPASSRLS;
`)
  await db.execute(
    `GRANT CONNECT ON DATABASE ${quoteIdentifier(input.databaseName)} TO ${quoteIdentifier(input.roleName)};`,
  )
  await db.execute(
    `GRANT USAGE ON SCHEMA public TO ${quoteIdentifier(input.roleName)};`,
  )
  await db.execute(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quoteIdentifier(input.roleName)};`,
  )
  await db.execute(
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${quoteIdentifier(input.roleName)};`,
  )
}

const dropRuntimeRole = async (
  db: ReturnType<typeof createDatabaseClient>,
  roleName: string,
) => {
  await db.execute(`DROP OWNED BY ${quoteIdentifier(roleName)};`)
  await db.execute(`DROP ROLE IF EXISTS ${quoteIdentifier(roleName)};`)
}

const withTenantContext = async <T>(
  db: ReturnType<typeof createDatabaseClient>,
  tenantId: string,
  action: (scopedDb: ReturnType<typeof createDatabaseClient>) => Promise<T>,
) =>
  db.transaction(async (tx) => {
    const scopedDb = tx as unknown as ReturnType<typeof createDatabaseClient>
    await scopedDb.execute(
      `SET LOCAL app.current_tenant = ${quoteLiteral(tenantId)}`,
    )
    return action(scopedDb)
  })

const run = async () => {
  const startedAt = Date.now()
  let lastStage = "preflight"
  ensureRequiredEnv()
  const runId = Date.now().toString(36)
  const tenantCodes = {
    alpha: `tenant-e2e-alpha-${runId}`,
    beta: `tenant-e2e-beta-${runId}`,
  }
  const tenantNames = {
    alpha: `Tenant E2E Alpha ${runId}`,
    beta: `Tenant E2E Beta ${runId}`,
  }
  const tenantAdminPassword = `tenant-pass-${runId}`
  const runtimeRoleName = `elysian_tenant_e2e_${runId}`.replaceAll("-", "_")
  const runtimeRolePassword = `runtime-pass-${runId}`
  const defaultAdminUsername = process.env.ELYSIAN_ADMIN_USERNAME ?? "admin"
  const defaultAdminPassword =
    process.env.ELYSIAN_ADMIN_PASSWORD ?? ["admin", "123"].join("")
  const db = createDatabaseClient()
  const runtimeDatabaseUrl = buildRoleDatabaseUrl(
    process.env.DATABASE_URL ?? "",
    runtimeRoleName,
    runtimeRolePassword,
  )
  const runtimeDb = createDatabaseClient({
    ...process.env,
    DATABASE_URL: runtimeDatabaseUrl,
  })
  const databaseName =
    new URL(process.env.DATABASE_URL ?? "").pathname.slice(1) || "postgres"
  const bootstrapSpec = createTenantBootstrapSeedSpec({
    adminPassword: tenantAdminPassword,
  })
  const createdCustomerIds: Array<{ tenantId: string; customerId: string }> = []
  let server: ReturnType<typeof spawn> | null = null

  try {
    lastStage = "tenant_init_alpha_first"
    await runCommand("bun", [
      "run",
      "tenant:init",
      "--",
      "--code",
      tenantCodes.alpha,
      "--name",
      tenantNames.alpha,
      "--admin-password",
      tenantAdminPassword,
    ])

    const alphaTenant = await getTenantByCode(db, tenantCodes.alpha)
    if (!alphaTenant) {
      throw new Error("tenant:init did not create tenant alpha")
    }

    lastStage = "tenant_init_alpha_second"
    await runCommand("bun", [
      "run",
      "tenant:init",
      "--",
      "--code",
      tenantCodes.alpha,
      "--name",
      tenantNames.alpha,
      "--admin-password",
      tenantAdminPassword,
    ])

    const alphaTenantAfterRerun = await getTenantByCode(db, tenantCodes.alpha)
    if (!alphaTenantAfterRerun || alphaTenantAfterRerun.id !== alphaTenant.id) {
      throw new Error(
        "tenant:init rerun did not preserve tenant alpha identity",
      )
    }

    lastStage = "tenant_init_beta"
    await runCommand("bun", [
      "run",
      "tenant:init",
      "--",
      "--code",
      tenantCodes.beta,
      "--name",
      tenantNames.beta,
      "--admin-password",
      tenantAdminPassword,
    ])

    const betaTenant = await getTenantByCode(db, tenantCodes.beta)
    if (!betaTenant) {
      throw new Error("tenant:init did not create tenant beta")
    }

    lastStage = "runtime_role_provision"
    await provisionRuntimeRole(db, {
      roleName: runtimeRoleName,
      rolePassword: runtimeRolePassword,
      databaseName,
    })

    lastStage = "tenant_bootstrap_verification"
    await withTenantContext(runtimeDb, alphaTenant.id, async (scopedDb) => {
      const alphaRoles = await scopedDb.select().from(roles)
      const alphaPermissions = await scopedDb.select().from(permissions)
      const alphaMenus = await scopedDb.select().from(menus)
      const alphaDictionaryTypes = await scopedDb.select().from(dictionaryTypes)
      const alphaDictionaryItems = await scopedDb.select().from(dictionaryItems)
      const alphaAdminUsers = (await scopedDb.select().from(users)).filter(
        (user) => user.username === defaultAdminUsername,
      )

      if (alphaRoles.length !== bootstrapSpec.roles.length) {
        throw new Error(
          `Tenant alpha role bootstrap drifted (expected=${bootstrapSpec.roles.length}, received=${alphaRoles.length})`,
        )
      }

      if (alphaPermissions.length !== bootstrapSpec.permissions.length) {
        throw new Error(
          `Tenant alpha permission bootstrap drifted (expected=${bootstrapSpec.permissions.length}, received=${alphaPermissions.length})`,
        )
      }

      if (alphaMenus.length !== bootstrapSpec.menus.length) {
        throw new Error(
          `Tenant alpha menu bootstrap drifted (expected=${bootstrapSpec.menus.length}, received=${alphaMenus.length})`,
        )
      }

      if (
        alphaDictionaryTypes.length !== bootstrapSpec.dictionaryTypes.length
      ) {
        throw new Error(
          `Tenant alpha dictionary type bootstrap drifted (expected=${bootstrapSpec.dictionaryTypes.length}, received=${alphaDictionaryTypes.length})`,
        )
      }

      if (
        alphaDictionaryItems.length !== bootstrapSpec.dictionaryItems.length
      ) {
        throw new Error(
          `Tenant alpha dictionary item bootstrap drifted (expected=${bootstrapSpec.dictionaryItems.length}, received=${alphaDictionaryItems.length})`,
        )
      }

      if (alphaAdminUsers.length !== 1) {
        throw new Error(
          `Tenant alpha admin bootstrap is not idempotent (expected=1, received=${alphaAdminUsers.length})`,
        )
      }

      if (alphaAdminUsers[0]?.isSuperAdmin !== false) {
        throw new Error("Tenant alpha admin must not be a super admin")
      }
    })

    server = spawn("bun", ["run", "server"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: runtimeDatabaseUrl,
        PORT: resolvedPort,
      },
      stdio: "inherit",
    })

    lastStage = "server_bootstrap"
    await waitForHealth(90_000)
    lastStage = "module_readiness"
    await waitForRequiredModules(["auth", "customer", "tenant"], 90_000)

    lastStage = "http_login"
    const defaultLogin = await login({
      username: defaultAdminUsername,
      password: defaultAdminPassword,
    })
    const alphaLogin = await login({
      username: defaultAdminUsername,
      password: tenantAdminPassword,
      tenantCode: tenantCodes.alpha,
    })
    const betaLogin = await login({
      username: defaultAdminUsername,
      password: tenantAdminPassword,
      tenantCode: tenantCodes.beta,
    })

    if (defaultLogin.user.tenantId !== DEFAULT_TENANT_ID) {
      throw new Error("Default admin login did not resolve the default tenant")
    }

    if (alphaLogin.user.tenantId !== alphaTenant.id) {
      throw new Error("Tenant alpha login did not resolve the alpha tenant")
    }

    if (betaLogin.user.tenantId !== betaTenant.id) {
      throw new Error("Tenant beta login did not resolve the beta tenant")
    }

    if (alphaLogin.user.isSuperAdmin) {
      throw new Error("Tenant alpha admin unexpectedly has super-admin access")
    }

    if (!defaultLogin.user.isSuperAdmin) {
      throw new Error("Default admin lost super-admin access")
    }

    lastStage = "http_tenant_management_authorization"
    const defaultTenantListResponse = await getTenantListThroughApi(
      defaultLogin.accessToken,
    )
    await assertStatus(defaultTenantListResponse, 200)
    const defaultTenantList = (await defaultTenantListResponse.json()) as {
      items: Array<{ code: string }>
    }
    if (
      !defaultTenantList.items.some(
        (item) => item.code === tenantCodes.alpha,
      ) ||
      !defaultTenantList.items.some((item) => item.code === tenantCodes.beta)
    ) {
      throw new Error(
        "Super-admin tenant list did not include freshly initialized tenants",
      )
    }

    const alphaTenantListResponse = await getTenantListThroughApi(
      alphaLogin.accessToken,
    )
    await assertStatus(alphaTenantListResponse, 403)

    lastStage = "http_customer_create"
    const defaultCustomer = await createCustomerThroughApi(
      defaultLogin.accessToken,
      `default-customer-${runId}`,
    )
    createdCustomerIds.push({
      tenantId: DEFAULT_TENANT_ID,
      customerId: defaultCustomer.id,
    })
    const alphaCustomer = await createCustomerThroughApi(
      alphaLogin.accessToken,
      `alpha-customer-${runId}`,
    )
    createdCustomerIds.push({
      tenantId: alphaTenant.id,
      customerId: alphaCustomer.id,
    })
    const betaCustomer = await createCustomerThroughApi(
      betaLogin.accessToken,
      `beta-customer-${runId}`,
    )
    createdCustomerIds.push({
      tenantId: betaTenant.id,
      customerId: betaCustomer.id,
    })

    lastStage = "http_customer_isolation"
    const defaultCustomerList = await listCustomersThroughApi(
      defaultLogin.accessToken,
    )
    const alphaCustomerList = await listCustomersThroughApi(
      alphaLogin.accessToken,
    )
    const betaCustomerList = await listCustomersThroughApi(
      betaLogin.accessToken,
    )

    if (
      !defaultCustomerList.items.some(
        (item) => item.id === defaultCustomer.id,
      ) ||
      defaultCustomerList.items.some((item) => item.id === alphaCustomer.id) ||
      defaultCustomerList.items.some((item) => item.id === betaCustomer.id)
    ) {
      throw new Error("Default tenant customer list leaked cross-tenant data")
    }

    if (
      !alphaCustomerList.items.some((item) => item.id === alphaCustomer.id) ||
      alphaCustomerList.items.some((item) => item.id === defaultCustomer.id) ||
      alphaCustomerList.items.some((item) => item.id === betaCustomer.id)
    ) {
      throw new Error("Tenant alpha customer list leaked cross-tenant data")
    }

    if (
      !betaCustomerList.items.some((item) => item.id === betaCustomer.id) ||
      betaCustomerList.items.some((item) => item.id === defaultCustomer.id) ||
      betaCustomerList.items.some((item) => item.id === alphaCustomer.id)
    ) {
      throw new Error("Tenant beta customer list leaked cross-tenant data")
    }

    const alphaGetDefaultCustomer = await getCustomerThroughApi(
      alphaLogin.accessToken,
      defaultCustomer.id,
    )
    await assertStatus(alphaGetDefaultCustomer, 404)
    const betaGetAlphaCustomer = await getCustomerThroughApi(
      betaLogin.accessToken,
      alphaCustomer.id,
    )
    await assertStatus(betaGetAlphaCustomer, 404)

    lastStage = "db_rls_isolation"
    const defaultRows = await withTenantContext(
      runtimeDb,
      DEFAULT_TENANT_ID,
      (scopedDb) => listCustomers(scopedDb),
    )
    const alphaRows = await withTenantContext(
      runtimeDb,
      alphaTenant.id,
      (scopedDb) => listCustomers(scopedDb),
    )
    const betaRows = await withTenantContext(
      runtimeDb,
      betaTenant.id,
      (scopedDb) => listCustomers(scopedDb),
    )

    if (
      !defaultRows.some((row) => row.id === defaultCustomer.id) ||
      defaultRows.some((row) => row.id === alphaCustomer.id) ||
      defaultRows.some((row) => row.id === betaCustomer.id)
    ) {
      throw new Error("Default tenant DB context leaked cross-tenant rows")
    }

    if (
      !alphaRows.some((row) => row.id === alphaCustomer.id) ||
      alphaRows.some((row) => row.id === defaultCustomer.id) ||
      alphaRows.some((row) => row.id === betaCustomer.id)
    ) {
      throw new Error("Tenant alpha DB context leaked cross-tenant rows")
    }

    if (
      !betaRows.some((row) => row.id === betaCustomer.id) ||
      betaRows.some((row) => row.id === defaultCustomer.id) ||
      betaRows.some((row) => row.id === alphaCustomer.id)
    ) {
      throw new Error("Tenant beta DB context leaked cross-tenant rows")
    }

    lastStage = "db_fk_constraint"
    const invalidTenantId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"

    let fkFailureMessage = ""
    try {
      await withTenantContext(runtimeDb, invalidTenantId, (scopedDb) =>
        insertCustomer(scopedDb, {
          name: `invalid-fk-${runId}`,
          tenantId: invalidTenantId,
          status: "active",
        }),
      )
    } catch (error) {
      fkFailureMessage = describeError(error)
    }

    if (!fkFailureMessage.toLowerCase().includes("foreign key")) {
      throw new Error(
        `Expected foreign key failure for invalid tenant insert, received=${fkFailureMessage || "success"}`,
      )
    }

    const reportPath = await writeTenantReport({
      generatedAt: new Date().toISOString(),
      status: "passed",
      baseUrl,
      durationMs: Date.now() - startedAt,
      lastStage,
      failureCategory: null,
      failureMessage: null,
      tenantCodes,
    })
    console.log(`[e2e-tenant] report: ${reportPath}`)
  } catch (error) {
    const message = describeError(error)
    const reportPath = await writeTenantReport({
      generatedAt: new Date().toISOString(),
      status: "failed",
      baseUrl,
      durationMs: Date.now() - startedAt,
      lastStage,
      failureCategory: classifyFailure(message),
      failureMessage: message,
      tenantCodes,
    })
    console.error(`[e2e-tenant] report: ${reportPath}`)
    throw error
  } finally {
    for (const item of createdCustomerIds) {
      try {
        await withTenantContext(db, item.tenantId, () =>
          deleteCustomer(db, item.customerId),
        )
      } catch {
        // noop
      }
    }

    if (server && !server.killed) {
      server.kill("SIGTERM")
    }

    if (server) {
      await Promise.race([
        once(server, "exit"),
        Bun.sleep(5_000).then(() => {
          if (!server.killed) {
            server.kill("SIGKILL")
          }
        }),
      ])
    }

    try {
      await dropRuntimeRole(db, runtimeRoleName)
    } catch {
      // noop
    }

    await Promise.allSettled([db.$client.end(), runtimeDb.$client.end()])
  }
}

try {
  await run()
  console.log("[e2e-tenant] passed")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-tenant] failed: ${message}`)
  process.exitCode = 1
}
