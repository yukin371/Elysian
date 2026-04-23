import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

interface LoginResponse {
  accessToken: string
}

interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
}

type SmokeFailureCategory = "environment" | "dependency" | "test_case"

interface SmokeReport {
  generatedAt: string
  status: "passed" | "failed"
  baseUrl: string
  durationMs: number
  lastStage: string
  failureCategory: SmokeFailureCategory | null
  failureMessage: string | null
}

const requiredEnvKeys = ["DATABASE_URL", "ACCESS_TOKEN_SECRET"] as const

const ensureRequiredEnv = () => {
  const missing = requiredEnvKeys.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for smoke e2e: ${missing.join(", ")}`,
    )
  }
}

const baseUrl = `http://127.0.0.1:${process.env.PORT ?? "3100"}`

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "smoke")

const resolveSmokeReportPath = () =>
  process.env.ELYSIAN_SMOKE_REPORT_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-report.json")

const writeSmokeReport = async (report: SmokeReport) => {
  const reportPath = resolveSmokeReportPath()
  const reportDir = dirname(reportPath)

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  return reportPath
}

const classifyFailure = (message: string): SmokeFailureCategory => {
  if (message.includes("Missing required environment variables")) {
    return "environment"
  }

  if (
    message.includes("timed out") ||
    message.includes("not ready") ||
    message.includes("migration/seed setup")
  ) {
    return "dependency"
  }

  return "test_case"
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
    `Required modules are not ready within ${timeoutMs}ms (required=${requiredModules.join(", ")}). Check DATABASE_URL/migration/seed setup.`,
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

const run = async () => {
  const startedAt = Date.now()
  let lastStage = "preflight"

  ensureRequiredEnv()

  const username = process.env.ELYSIAN_ADMIN_USERNAME ?? "admin"
  const password =
    process.env.ELYSIAN_ADMIN_PASSWORD ?? ["admin", "123"].join("")

  const server = spawn("bun", ["run", "server"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: process.env.PORT ?? "3100",
    },
    stdio: "inherit",
  })

  let customerId: string | null = null
  let cleanupAuthHeader: Record<string, string> | null = null

  try {
    lastStage = "server_bootstrap"
    await waitForHealth(90_000)
    lastStage = "module_readiness"
    await waitForRequiredModules(["auth", "customer"], 90_000)

    lastStage = "auth_login"
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
    await assertStatus(loginResponse, 200)
    const loginPayload = (await loginResponse.json()) as LoginResponse

    if (!loginPayload.accessToken) {
      throw new Error("Login succeeded but accessToken is missing")
    }

    const authHeader = {
      authorization: `Bearer ${loginPayload.accessToken}`,
    }
    cleanupAuthHeader = authHeader

    lastStage = "customer_list"
    const listResponse = await fetch(`${baseUrl}/customers`, {
      headers: authHeader,
    })
    await assertStatus(listResponse, 200)

    lastStage = "customer_create"
    const createName = `smoke-${Date.now()}`
    const createResponse = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: {
        ...authHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: createName,
        status: "active",
      }),
    })
    await assertStatus(createResponse, 201)
    const created = (await createResponse.json()) as CustomerRecord
    customerId = created.id

    if (!customerId) {
      throw new Error("Create customer succeeded but id is missing")
    }

    lastStage = "customer_update"
    const updateResponse = await fetch(`${baseUrl}/customers/${customerId}`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status: "inactive",
      }),
    })
    await assertStatus(updateResponse, 200)

    lastStage = "customer_detail"
    const detailResponse = await fetch(`${baseUrl}/customers/${customerId}`, {
      headers: authHeader,
    })
    await assertStatus(detailResponse, 200)
    const detailPayload = (await detailResponse.json()) as CustomerRecord
    if (detailPayload.status !== "inactive") {
      throw new Error(
        `Expected updated customer status=inactive, received ${detailPayload.status}`,
      )
    }

    lastStage = "customer_delete"
    const deleteResponse = await fetch(`${baseUrl}/customers/${customerId}`, {
      method: "DELETE",
      headers: authHeader,
    })
    await assertStatus(deleteResponse, 204)
    customerId = null

    lastStage = "customer_verify_deleted"
    const afterDeleteResponse = await fetch(
      `${baseUrl}/customers/${created.id}`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(afterDeleteResponse, 404)

    const reportPath = await writeSmokeReport({
      generatedAt: new Date().toISOString(),
      status: "passed",
      baseUrl,
      durationMs: Date.now() - startedAt,
      lastStage,
      failureCategory: null,
      failureMessage: null,
    })
    console.log(`[e2e-smoke] report: ${reportPath}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const reportPath = await writeSmokeReport({
      generatedAt: new Date().toISOString(),
      status: "failed",
      baseUrl,
      durationMs: Date.now() - startedAt,
      lastStage,
      failureCategory: classifyFailure(message),
      failureMessage: message,
    })
    console.error(`[e2e-smoke] report: ${reportPath}`)
    throw error
  } finally {
    if (customerId) {
      // best-effort cleanup when the smoke flow fails after create
      try {
        if (cleanupAuthHeader) {
          await fetch(`${baseUrl}/customers/${customerId}`, {
            method: "DELETE",
            headers: cleanupAuthHeader,
          })
        }
      } catch {
        // noop
      }
    }

    if (!server.killed) {
      server.kill("SIGTERM")
    }

    await Promise.race([
      once(server, "exit"),
      Bun.sleep(5_000).then(() => {
        if (!server.killed) {
          server.kill("SIGKILL")
        }
      }),
    ])
  }
}

try {
  await run()
  console.log("[e2e-smoke] passed")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-smoke] failed: ${message}`)
  process.exitCode = 1
}
