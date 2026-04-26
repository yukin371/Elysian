import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import { createConnection } from "node:net"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

interface LoginResponse {
  accessToken: string
  user: {
    id: string
  }
}

interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
}

interface WorkflowDefinitionRecord {
  id: string
  key: string
  name: string
  version: number
}

interface WorkflowTaskRecord {
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

interface WorkflowInstanceDetailRecord {
  id: string
  definitionId: string
  definitionKey: string
  status: "running" | "completed" | "terminated"
  currentNodeId: string | null
  currentTasks: WorkflowTaskRecord[]
  tasks: WorkflowTaskRecord[]
}

interface OperationLogRecord {
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
const smokePort =
  process.env.ELYSIAN_SMOKE_PORT ??
  (31_000 + Math.floor(Math.random() * 1_000)).toString()

const ensureRequiredEnv = () => {
  const missing = requiredEnvKeys.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for smoke e2e: ${missing.join(", ")}`,
    )
  }
}

const baseUrl = `http://127.0.0.1:${smokePort}`

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

const terminateServer = async (
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

const assertStatus = async (response: Response, expected: number) => {
  if (response.status !== expected) {
    const bodyText = await response.text()
    throw new Error(
      `Expected status ${expected}, received ${response.status}, body=${bodyText}`,
    )
  }
}

const getResponseJson = async <T>(response: Response) =>
  (await response.json()) as T

const buildWorkflowDefinitionDrafts = (runId: string) => ({
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

const run = async () => {
  const startedAt = Date.now()
  let lastStage = "preflight"

  ensureRequiredEnv()

  const username = process.env.ELYSIAN_ADMIN_USERNAME ?? "admin"
  const password =
    process.env.ELYSIAN_ADMIN_PASSWORD ?? ["admin", "123"].join("")
  const runId = `${Date.now()}`
  const workflowDrafts = buildWorkflowDefinitionDrafts(runId)

  const server = spawn("bun", ["src/index.ts"], {
    cwd: join(process.cwd(), "apps", "server"),
    env: {
      ...process.env,
      PORT: smokePort,
    },
    stdio: "inherit",
  })

  let customerId: string | null = null
  let cleanupAuthHeader: Record<string, string> | null = null
  const runningWorkflowInstanceIds = new Set<string>()

  try {
    lastStage = "server_bootstrap"
    await waitForHealth(90_000)
    lastStage = "module_readiness"
    await waitForRequiredModules(
      ["auth", "customer", "workflow-definition", "operation-log"],
      90_000,
    )

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
    if (!loginPayload.user?.id) {
      throw new Error("Login succeeded but user.id is missing")
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

    lastStage = "workflow_definition_create_linear"
    const createLinearDefinitionResponse = await fetch(
      `${baseUrl}/workflow/definitions`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify(workflowDrafts.linear),
      },
    )
    await assertStatus(createLinearDefinitionResponse, 201)
    const linearDefinition = await getResponseJson<WorkflowDefinitionRecord>(
      createLinearDefinitionResponse,
    )

    lastStage = "workflow_definition_create_conditional"
    const createConditionalDefinitionResponse = await fetch(
      `${baseUrl}/workflow/definitions`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify(workflowDrafts.conditional),
      },
    )
    await assertStatus(createConditionalDefinitionResponse, 201)
    const conditionalDefinition =
      await getResponseJson<WorkflowDefinitionRecord>(
        createConditionalDefinitionResponse,
      )

    lastStage = "workflow_definition_create_claimable"
    const createClaimableDefinitionResponse = await fetch(
      `${baseUrl}/workflow/definitions`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify(workflowDrafts.claimable),
      },
    )
    await assertStatus(createClaimableDefinitionResponse, 201)
    const claimableDefinition = await getResponseJson<WorkflowDefinitionRecord>(
      createClaimableDefinitionResponse,
    )

    lastStage = "workflow_linear_instance_start"
    const startLinearApprovedResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: linearDefinition.id,
          variables: {
            amount: 1000,
          },
        }),
      },
    )
    await assertStatus(startLinearApprovedResponse, 201)
    const linearApprovedInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startLinearApprovedResponse,
      )
    runningWorkflowInstanceIds.add(linearApprovedInstance.id)

    const linearApprovedTodoTask = linearApprovedInstance.currentTasks[0]
    if (!linearApprovedTodoTask) {
      throw new Error(
        "Linear workflow start did not create a manager todo task",
      )
    }

    lastStage = "workflow_linear_todo_list"
    const managerTodoResponse = await fetch(
      `${baseUrl}/workflow/tasks/todo?assignee=role:manager`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(managerTodoResponse, 200)
    const managerTodoPayload = await getResponseJson<{
      items: WorkflowTaskRecord[]
    }>(managerTodoResponse)
    if (
      !managerTodoPayload.items.some(
        (task) => task.id === linearApprovedTodoTask.id,
      )
    ) {
      throw new Error(
        "Manager todo list does not include the linear workflow task",
      )
    }

    lastStage = "workflow_linear_complete_approved"
    const completeLinearApprovedResponse = await fetch(
      `${baseUrl}/workflow/tasks/${linearApprovedTodoTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      },
    )
    await assertStatus(completeLinearApprovedResponse, 200)
    const linearApprovedCompleted =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        completeLinearApprovedResponse,
      )
    if (linearApprovedCompleted.status !== "completed") {
      throw new Error(
        `Expected approved linear workflow instance to be completed, received ${linearApprovedCompleted.status}`,
      )
    }
    if (linearApprovedCompleted.currentTasks.length !== 0) {
      throw new Error(
        "Approved linear workflow instance still has current tasks",
      )
    }
    runningWorkflowInstanceIds.delete(linearApprovedCompleted.id)

    lastStage = "workflow_linear_done_list"
    const managerDoneResponse = await fetch(
      `${baseUrl}/workflow/tasks/done?assignee=role:manager`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(managerDoneResponse, 200)
    const managerDonePayload = await getResponseJson<{
      items: WorkflowTaskRecord[]
    }>(managerDoneResponse)
    const approvedDoneTask = managerDonePayload.items.find(
      (task) => task.id === linearApprovedTodoTask.id,
    )
    if (!approvedDoneTask || approvedDoneTask.result !== "approved") {
      throw new Error(
        "Manager done list does not include the approved linear workflow task",
      )
    }

    lastStage = "workflow_linear_reject_start"
    const startLinearRejectedResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: linearDefinition.id,
          variables: {
            amount: 500,
          },
        }),
      },
    )
    await assertStatus(startLinearRejectedResponse, 201)
    const linearRejectedInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startLinearRejectedResponse,
      )
    runningWorkflowInstanceIds.add(linearRejectedInstance.id)

    const linearRejectedTodoTask = linearRejectedInstance.currentTasks[0]
    if (!linearRejectedTodoTask) {
      throw new Error(
        "Rejected linear workflow start did not create a todo task",
      )
    }

    lastStage = "workflow_linear_complete_rejected"
    const completeLinearRejectedResponse = await fetch(
      `${baseUrl}/workflow/tasks/${linearRejectedTodoTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "rejected",
        }),
      },
    )
    await assertStatus(completeLinearRejectedResponse, 200)
    const linearRejectedCompleted =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        completeLinearRejectedResponse,
      )
    if (linearRejectedCompleted.status !== "terminated") {
      throw new Error(
        `Expected rejected linear workflow instance to be terminated, received ${linearRejectedCompleted.status}`,
      )
    }
    runningWorkflowInstanceIds.delete(linearRejectedCompleted.id)

    lastStage = "workflow_conditional_branch_start"
    const startConditionalBranchResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: conditionalDefinition.id,
          variables: {
            amount: 6001,
          },
        }),
      },
    )
    await assertStatus(startConditionalBranchResponse, 201)
    const conditionalBranchInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startConditionalBranchResponse,
      )
    runningWorkflowInstanceIds.add(conditionalBranchInstance.id)

    const conditionalManagerTask = conditionalBranchInstance.currentTasks[0]
    if (!conditionalManagerTask) {
      throw new Error(
        "Conditional workflow branch case did not create the manager task",
      )
    }

    lastStage = "workflow_conditional_branch_manager_complete"
    const conditionalManagerCompleteResponse = await fetch(
      `${baseUrl}/workflow/tasks/${conditionalManagerTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      },
    )
    await assertStatus(conditionalManagerCompleteResponse, 200)
    const conditionalAfterManager =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        conditionalManagerCompleteResponse,
      )
    if (conditionalAfterManager.currentTasks.length !== 1) {
      throw new Error(
        `Expected exactly one finance task after conditional manager approval, received ${conditionalAfterManager.currentTasks.length}`,
      )
    }
    const financeTask = conditionalAfterManager.currentTasks[0]
    if (!financeTask || financeTask.assignee !== "role:finance") {
      throw new Error(
        "Conditional branch did not route to the finance approver",
      )
    }

    lastStage = "workflow_conditional_branch_finance_todo"
    const financeTodoResponse = await fetch(
      `${baseUrl}/workflow/tasks/todo?assignee=role:finance`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(financeTodoResponse, 200)
    const financeTodoPayload = await getResponseJson<{
      items: WorkflowTaskRecord[]
    }>(financeTodoResponse)
    if (!financeTodoPayload.items.some((task) => task.id === financeTask.id)) {
      throw new Error(
        "Finance todo list does not include the conditional branch task",
      )
    }

    lastStage = "workflow_conditional_branch_finance_complete"
    const conditionalFinanceCompleteResponse = await fetch(
      `${baseUrl}/workflow/tasks/${financeTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      },
    )
    await assertStatus(conditionalFinanceCompleteResponse, 200)
    const conditionalBranchCompleted =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        conditionalFinanceCompleteResponse,
      )
    if (conditionalBranchCompleted.status !== "completed") {
      throw new Error(
        `Expected conditional branch workflow instance to be completed, received ${conditionalBranchCompleted.status}`,
      )
    }
    runningWorkflowInstanceIds.delete(conditionalBranchCompleted.id)

    lastStage = "workflow_conditional_default_start"
    const startConditionalDefaultResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: conditionalDefinition.id,
          variables: {
            amount: 4999,
          },
        }),
      },
    )
    await assertStatus(startConditionalDefaultResponse, 201)
    const conditionalDefaultInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startConditionalDefaultResponse,
      )
    runningWorkflowInstanceIds.add(conditionalDefaultInstance.id)

    const conditionalDefaultManagerTask =
      conditionalDefaultInstance.currentTasks[0]
    if (!conditionalDefaultManagerTask) {
      throw new Error(
        "Conditional default case did not create the manager approval task",
      )
    }

    lastStage = "workflow_conditional_default_manager_complete"
    const conditionalDefaultCompleteResponse = await fetch(
      `${baseUrl}/workflow/tasks/${conditionalDefaultManagerTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      },
    )
    await assertStatus(conditionalDefaultCompleteResponse, 200)
    const conditionalDefaultCompleted =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        conditionalDefaultCompleteResponse,
      )
    if (conditionalDefaultCompleted.status !== "completed") {
      throw new Error(
        `Expected conditional default workflow instance to be completed, received ${conditionalDefaultCompleted.status}`,
      )
    }
    if (
      conditionalDefaultCompleted.tasks.some(
        (task) => task.assignee === "role:finance",
      )
    ) {
      throw new Error(
        "Conditional default workflow instance unexpectedly created a finance task",
      )
    }
    runningWorkflowInstanceIds.delete(conditionalDefaultCompleted.id)

    lastStage = "workflow_claim_start"
    const startClaimableResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: claimableDefinition.id,
          variables: {
            amount: 300,
          },
        }),
      },
    )
    await assertStatus(startClaimableResponse, 201)
    const claimableInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startClaimableResponse,
      )
    runningWorkflowInstanceIds.add(claimableInstance.id)

    const claimableTodoTask = claimableInstance.currentTasks[0]
    if (!claimableTodoTask || claimableTodoTask.assignee !== "role:admin") {
      throw new Error(
        "Claimable workflow start did not create the expected admin todo task",
      )
    }

    lastStage = "workflow_claim_execute"
    const claimTaskResponse = await fetch(
      `${baseUrl}/workflow/tasks/${claimableTodoTask.id}/claim`,
      {
        method: "POST",
        headers: authHeader,
      },
    )
    await assertStatus(claimTaskResponse, 200)
    const claimedInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(claimTaskResponse)
    const claimedTask = claimedInstance.currentTasks[0]
    const claimedAssignee = `user:${loginPayload.user.id}`
    if (!claimedTask || claimedTask.assignee !== claimedAssignee) {
      throw new Error(
        `Claimed workflow task assignee mismatch (expected=${claimedAssignee}, received=${claimedTask?.assignee ?? "missing"})`,
      )
    }
    if (claimedTask.claimSourceAssignee !== "role:admin") {
      throw new Error(
        `Claimed workflow task source assignee mismatch (expected=role:admin, received=${claimedTask.claimSourceAssignee ?? "missing"})`,
      )
    }
    if (claimedTask.claimedByUserId !== loginPayload.user.id) {
      throw new Error(
        `Claimed workflow task claimer mismatch (expected=${loginPayload.user.id}, received=${claimedTask.claimedByUserId ?? "missing"})`,
      )
    }
    if (!claimedTask.claimedAt) {
      throw new Error("Claimed workflow task did not expose claimedAt")
    }

    lastStage = "workflow_claim_todo_list"
    const claimedTodoResponse = await fetch(
      `${baseUrl}/workflow/tasks/todo?assignee=${encodeURIComponent(claimedAssignee)}`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(claimedTodoResponse, 200)
    const claimedTodoPayload = await getResponseJson<{
      items: WorkflowTaskRecord[]
    }>(claimedTodoResponse)
    if (!claimedTodoPayload.items.some((task) => task.id === claimedTask.id)) {
      throw new Error(
        "Claimed todo list does not include the claimable workflow task",
      )
    }

    lastStage = "workflow_claim_complete"
    const completeClaimedTaskResponse = await fetch(
      `${baseUrl}/workflow/tasks/${claimedTask.id}/complete`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      },
    )
    await assertStatus(completeClaimedTaskResponse, 200)
    const claimedCompleted =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        completeClaimedTaskResponse,
      )
    if (claimedCompleted.status !== "completed") {
      throw new Error(
        `Expected claimed workflow instance to be completed, received ${claimedCompleted.status}`,
      )
    }
    const claimedDoneTask = claimedCompleted.tasks.find(
      (task) => task.id === claimedTask.id,
    )
    if (!claimedDoneTask || claimedDoneTask.assignee !== claimedAssignee) {
      throw new Error(
        "Claimed workflow completion did not preserve the claimed assignee",
      )
    }
    if (claimedDoneTask.claimSourceAssignee !== "role:admin") {
      throw new Error(
        "Claimed workflow completion did not preserve the original assignee snapshot",
      )
    }
    runningWorkflowInstanceIds.delete(claimedCompleted.id)

    lastStage = "workflow_cancel_start"
    const startCancellableResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: linearDefinition.id,
          variables: {
            amount: 200,
          },
        }),
      },
    )
    await assertStatus(startCancellableResponse, 201)
    const cancellableInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        startCancellableResponse,
      )
    runningWorkflowInstanceIds.add(cancellableInstance.id)

    const cancellableTodoTask = cancellableInstance.currentTasks[0]
    if (!cancellableTodoTask) {
      throw new Error(
        "Cancellable workflow start did not create a manager todo task",
      )
    }

    lastStage = "workflow_cancel_execute"
    const cancelWorkflowResponse = await fetch(
      `${baseUrl}/workflow/instances/${cancellableInstance.id}/cancel`,
      {
        method: "POST",
        headers: authHeader,
      },
    )
    await assertStatus(cancelWorkflowResponse, 200)
    const cancelledInstance =
      await getResponseJson<WorkflowInstanceDetailRecord>(
        cancelWorkflowResponse,
      )
    if (cancelledInstance.status !== "terminated") {
      throw new Error(
        `Expected cancelled workflow instance to be terminated, received ${cancelledInstance.status}`,
      )
    }
    if (cancelledInstance.currentTasks.length !== 0) {
      throw new Error("Cancelled workflow instance still has current tasks")
    }
    runningWorkflowInstanceIds.delete(cancelledInstance.id)

    lastStage = "workflow_instance_list"
    const workflowInstanceListResponse = await fetch(
      `${baseUrl}/workflow/instances`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(workflowInstanceListResponse, 200)
    const workflowInstanceListPayload = await getResponseJson<{
      items: WorkflowInstanceDetailRecord[]
    }>(workflowInstanceListResponse)
    const instanceIds = new Set(
      workflowInstanceListPayload.items.map((instance) => instance.id),
    )
    for (const instanceId of [
      linearApprovedCompleted.id,
      linearRejectedCompleted.id,
      conditionalBranchCompleted.id,
      conditionalDefaultCompleted.id,
      claimedCompleted.id,
    ]) {
      if (!instanceIds.has(instanceId)) {
        throw new Error(
          `Workflow instance list does not include expected instance ${instanceId}`,
        )
      }
    }

    if (!instanceIds.has(cancelledInstance.id)) {
      throw new Error(
        `Workflow instance list does not include cancelled instance ${cancelledInstance.id}`,
      )
    }

    lastStage = "workflow_audit_log_claim"
    const claimAuditResponse = await fetch(
      `${baseUrl}/system/operation-logs?category=workflow&action=workflow_task_claim`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(claimAuditResponse, 200)
    const claimAuditPayload = await getResponseJson<{
      items: OperationLogRecord[]
    }>(claimAuditResponse)
    const claimAudit = claimAuditPayload.items.find(
      (item) => item.targetId === claimedTask.id,
    )
    if (!claimAudit) {
      throw new Error("Workflow claim audit log is missing from operation logs")
    }
    if (claimAudit.result !== "success") {
      throw new Error(
        `Workflow claim audit result mismatch (expected=success, received=${claimAudit.result})`,
      )
    }
    if (claimAudit.details?.assignee !== claimedAssignee) {
      throw new Error(
        `Workflow claim audit assignee mismatch (expected=${claimedAssignee}, received=${String(claimAudit.details?.assignee ?? "missing")})`,
      )
    }
    if (claimAudit.details?.claimSourceAssignee !== "role:admin") {
      throw new Error(
        `Workflow claim audit source assignee mismatch (expected=role:admin, received=${String(claimAudit.details?.claimSourceAssignee ?? "missing")})`,
      )
    }
    if (claimAudit.details?.claimedByUserId !== loginPayload.user.id) {
      throw new Error(
        `Workflow claim audit claimer mismatch (expected=${loginPayload.user.id}, received=${String(claimAudit.details?.claimedByUserId ?? "missing")})`,
      )
    }
    if (!claimAudit.details?.claimedAt) {
      throw new Error("Workflow claim audit did not expose claimedAt")
    }

    lastStage = "workflow_audit_log_complete"
    const completeAuditResponse = await fetch(
      `${baseUrl}/system/operation-logs?category=workflow&action=workflow_task_complete`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(completeAuditResponse, 200)
    const completeAuditPayload = await getResponseJson<{
      items: OperationLogRecord[]
    }>(completeAuditResponse)
    const completeAudit = completeAuditPayload.items.find(
      (item) => item.targetId === claimedTask.id,
    )
    if (!completeAudit) {
      throw new Error(
        "Workflow completion audit log is missing from operation logs",
      )
    }
    if (completeAudit.details?.assignee !== claimedAssignee) {
      throw new Error(
        `Workflow completion audit assignee mismatch (expected=${claimedAssignee}, received=${String(completeAudit.details?.assignee ?? "missing")})`,
      )
    }
    if (completeAudit.details?.claimSourceAssignee !== "role:admin") {
      throw new Error(
        `Workflow completion audit source assignee mismatch (expected=role:admin, received=${String(completeAudit.details?.claimSourceAssignee ?? "missing")})`,
      )
    }
    if (completeAudit.details?.claimedByUserId !== loginPayload.user.id) {
      throw new Error(
        `Workflow completion audit claimer mismatch (expected=${loginPayload.user.id}, received=${String(completeAudit.details?.claimedByUserId ?? "missing")})`,
      )
    }
    if (completeAudit.details?.result !== "approved") {
      throw new Error(
        `Workflow completion audit result mismatch (expected=approved, received=${String(completeAudit.details?.result ?? "missing")})`,
      )
    }

    lastStage = "workflow_audit_log_cancel"
    const cancelAuditResponse = await fetch(
      `${baseUrl}/system/operation-logs?category=workflow&action=workflow_instance_cancel`,
      {
        headers: authHeader,
      },
    )
    await assertStatus(cancelAuditResponse, 200)
    const cancelAuditPayload = await getResponseJson<{
      items: OperationLogRecord[]
    }>(cancelAuditResponse)
    const cancelAudit = cancelAuditPayload.items.find(
      (item) => item.targetId === cancelledInstance.id,
    )
    if (!cancelAudit) {
      throw new Error(
        "Workflow cancel audit log is missing from operation logs",
      )
    }
    if (cancelAudit.details?.status !== "terminated") {
      throw new Error(
        `Workflow cancel audit status mismatch (expected=terminated, received=${String(cancelAudit.details?.status ?? "missing")})`,
      )
    }
    const cancelledTasks = cancelAudit.details?.cancelledTasks
    if (!Array.isArray(cancelledTasks) || cancelledTasks.length !== 1) {
      throw new Error(
        `Workflow cancel audit cancelledTasks mismatch (expected=1, received=${Array.isArray(cancelledTasks) ? cancelledTasks.length : "missing"})`,
      )
    }
    const cancelledAuditTask = cancelledTasks[0] as Record<string, unknown>
    if (cancelledAuditTask.id !== cancellableTodoTask.id) {
      throw new Error(
        `Workflow cancel audit task id mismatch (expected=${cancellableTodoTask.id}, received=${String(cancelledAuditTask.id ?? "missing")})`,
      )
    }
    if (cancelledAuditTask.assignee !== "role:manager") {
      throw new Error(
        `Workflow cancel audit task assignee mismatch (expected=role:manager, received=${String(cancelledAuditTask.assignee ?? "missing")})`,
      )
    }

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

    if (cleanupAuthHeader) {
      for (const instanceId of runningWorkflowInstanceIds) {
        try {
          await fetch(`${baseUrl}/workflow/instances/${instanceId}/cancel`, {
            method: "POST",
            headers: cleanupAuthHeader,
          })
        } catch {
          // noop
        }
      }
    }

    await terminateServer(server, smokePort)
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
