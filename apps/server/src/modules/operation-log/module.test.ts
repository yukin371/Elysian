import { describe, expect, it } from "bun:test"

import type { OperationLogRecord } from "@elysian/schema"

import { createServerApp } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"
import { createOperationLogModule } from "./module"
import { createInMemoryOperationLogRepository } from "./repository"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const createTestApp = (items: OperationLogRecord[]) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
    }),
    logger: silentLogger,
    modules: [
      createOperationLogModule(createInMemoryOperationLogRepository(items)),
    ],
  })

const createOperationLogSeedRecords = (): OperationLogRecord[] => [
  {
    id: "operation_log_login_success",
    category: "auth",
    action: "login",
    authEventType: "login",
    authFailureReason: null,
    actorUserId: "user_admin_1",
    targetType: "session",
    targetId: "session_login_1",
    result: "success",
    requestId: "request_login_1",
    ip: "127.0.0.1",
    userAgent: "login-agent",
    details: null,
    createdAt: "2026-04-29T01:00:00.000Z",
  },
  {
    id: "operation_log_login_failure",
    category: "auth",
    action: "login",
    authEventType: "login",
    authFailureReason: "invalid_password",
    actorUserId: "user_admin_1",
    targetType: null,
    targetId: null,
    result: "failure",
    requestId: "request_login_2",
    ip: "127.0.0.2",
    userAgent: "login-agent",
    details: {
      reason: "invalid_password",
    },
    createdAt: "2026-04-29T02:00:00.000Z",
  },
  {
    id: "operation_log_workflow_success",
    category: "workflow",
    action: "task_claim",
    authEventType: null,
    authFailureReason: null,
    actorUserId: "user_manager_1",
    targetType: "workflow_task",
    targetId: "workflow_task_1",
    result: "success",
    requestId: "request_workflow_1",
    ip: "127.0.0.3",
    userAgent: "workflow-agent",
    details: null,
    createdAt: "2026-04-29T03:00:00.000Z",
  },
]

describe("operation log module", () => {
  it("filters auth events with lightweight auth query parameters", async () => {
    const app = createTestApp(createOperationLogSeedRecords())

    const response = await app.handle(
      new Request(
        "http://localhost/system/operation-logs?authEventType=login&result=failure&authFailureReason=invalid_password",
      ),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [createOperationLogSeedRecords()[1]],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })

  it("returns derived auth event fields in operation log detail payloads", async () => {
    const app = createTestApp(createOperationLogSeedRecords())

    const response = await app.handle(
      new Request(
        "http://localhost/system/operation-logs/operation_log_login_failure",
      ),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(createOperationLogSeedRecords()[1])
  })
})
