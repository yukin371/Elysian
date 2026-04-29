import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import { createConnection } from "node:net"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

export interface LoginResponse {
  accessToken: string
  user: {
    id: string
  }
}

export interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
}

export interface WorkflowDefinitionRecord {
  id: string
  key: string
  name: string
  version: number
}

export interface WorkflowTaskRecord {
  id: string
  instanceId: string
  nodeId: string
  assignee: string
  claimSourceAssignee?: string
  claimedByUserId?: string
  claimedAt?: string
  status: "todo" | "completed" | "cancelled"
  result: "approved" | "rejected" | null
}

export interface WorkflowInstanceDetailRecord {
  id: string
  definitionId: string
  definitionKey: string
  status: "running" | "completed" | "terminated"
  currentNodeId: string | null
  currentTasks: WorkflowTaskRecord[]
  tasks: WorkflowTaskRecord[]
}

export interface OperationLogRecord {
  id: string
  category: string
  action: string
  targetId: string
  result: "success" | "failure"
  details: Record<string, unknown> | null
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

export const smokePort =
  process.env.ELYSIAN_SMOKE_PORT ??
  (31_000 + Math.floor(Math.random() * 1_000)).toString()

export const baseUrl = `http://127.0.0.1:${smokePort}`

export const ensureRequiredEnv = () => {
  const missing = requiredEnvKeys.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for smoke e2e: ${missing.join(", ")}`,
    )
  }
}

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "smoke")

const resolveSmokeReportPath = () =>
  process.env.ELYSIAN_SMOKE_REPORT_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-report.json")

export const writeSmokeReport = async (report: SmokeReport) => {
  const reportPath = resolveSmokeReportPath()
  const reportDir = dirname(reportPath)

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  return reportPath
}

export const classifyFailure = (message: string): SmokeFailureCategory => {
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

export const waitForHealth = async (timeoutMs: number) => {
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

export const waitForRequiredModules = async (
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

const isPortListening = (port: string) =>
  new Promise<boolean>((resolve) => {
    const socket = createConnection({
      host: "127.0.0.1",
      port: Number(port),
    })

    const finish = (listening: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(listening)
    }

    socket.once("connect", () => finish(true))
    socket.once("error", () => finish(false))
    socket.setTimeout(1_000, () => finish(false))
  })

const waitForPortRelease = async (port: string, timeoutMs: number) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (!(await isPortListening(port))) {
      return true
    }

    await Bun.sleep(250)
  }

  return !(await isPortListening(port))
}

export const terminateServer = async (
  server: ReturnType<typeof spawn>,
  port: string,
) => {
  if (server.exitCode !== null) {
    if (await waitForPortRelease(port, 1_000)) {
      return
    }
  }

  const exitPromise =
    server.exitCode === null
      ? once(server, "exit").then(() => true)
      : Promise.resolve(true)

  if (server.exitCode === null) {
    server.kill("SIGTERM")
  }

  const exitedGracefully = await Promise.race([
    exitPromise,
    Bun.sleep(5_000).then(() => false),
  ])

  if (exitedGracefully) {
    if (await waitForPortRelease(port, 1_000)) {
      return
    }
  }

  if (process.platform === "win32") {
    const killer = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { taskkill /pid $_ /t /f | Out-Null }`,
      ],
      {
        stdio: "ignore",
      },
    )
    await once(killer, "exit")
  } else if (server.exitCode === null) {
    server.kill("SIGKILL")
  }

  if (!(await waitForPortRelease(port, 5_000))) {
    throw new Error(`Smoke server did not release port ${port}`)
  }
}

export const assertStatus = async (response: Response, expected: number) => {
  if (response.status !== expected) {
    const bodyText = await response.text()
    throw new Error(
      `Expected status ${expected}, received ${response.status}, body=${bodyText}`,
    )
  }
}

export const getResponseJson = async <T>(response: Response) =>
  (await response.json()) as T

export const buildWorkflowDefinitionDrafts = (runId: string) => ({
  linear: {
    key: `smoke-linear-${runId}`,
    name: `Smoke Linear ${runId}`,
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "approved" },
      ],
    },
  },
  conditional: {
    key: `smoke-conditional-${runId}`,
    name: `Smoke Conditional ${runId}`,
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        {
          id: "amount-check",
          type: "condition",
          name: "Amount Check",
          conditions: [
            {
              expression: "${amount > 5000}",
              target: "finance-review",
            },
            {
              expression: "default",
              target: "approved",
            },
          ],
        },
        {
          id: "finance-review",
          type: "approval",
          name: "Finance Review",
          assignee: "role:finance",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "amount-check" },
        { from: "amount-check", to: "finance-review" },
        { from: "amount-check", to: "approved" },
        { from: "finance-review", to: "approved" },
      ],
    },
  },
  claimable: {
    key: `smoke-claimable-${runId}`,
    name: `Smoke Claimable ${runId}`,
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "admin-review",
          type: "approval",
          name: "Admin Review",
          assignee: "role:admin",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "admin-review" },
        { from: "admin-review", to: "approved" },
      ],
    },
  },
})
