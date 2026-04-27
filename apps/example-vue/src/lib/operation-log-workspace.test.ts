import { describe, expect, test } from "bun:test"

import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"

import type { OperationLogRecord } from "./platform-api"

import {
  buildOperationLogListQuery,
  createOperationLogDetailValues,
  createOperationLogTableItems,
  filterOperationLogs,
  formatOperationLogDetailsText,
  resolveOperationLogSelection,
} from "./operation-log-workspace"

const createOperationLog = (
  overrides: Partial<OperationLogRecord> & Pick<OperationLogRecord, "id">,
): OperationLogRecord => ({
  id: overrides.id,
  category: overrides.category ?? "auth",
  action: overrides.action ?? "login",
  actorUserId: overrides.actorUserId ?? "user_admin",
  targetType: overrides.targetType ?? "session",
  targetId: overrides.targetId ?? "session_1",
  result: overrides.result ?? "success",
  requestId: overrides.requestId ?? "req_1",
  ip: overrides.ip ?? "127.0.0.1",
  userAgent: overrides.userAgent ?? "bun:test",
  details:
    overrides.details === undefined
      ? { traceId: "trace_1" }
      : overrides.details,
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
})

describe("operation log workspace helpers", () => {
  const logs = [
    createOperationLog({
      id: "audit_login",
      category: "auth",
      action: "login",
      actorUserId: "user_admin",
      result: "success",
    }),
    createOperationLog({
      id: "workflow_reject",
      category: "workflow",
      action: "reject",
      actorUserId: "manager_1",
      result: "failure",
      details: null,
    }),
    createOperationLog({
      id: "tenant_update",
      category: "tenant",
      action: "update",
      actorUserId: "super_admin",
      result: "success",
    }),
  ]

  test("builds list query from query values", () => {
    const values: ElyQueryValues = {
      category: " workflow ",
      action: " reject ",
      actorUserId: " manager_1 ",
      result: "failure",
    }

    expect(buildOperationLogListQuery(values)).toEqual({
      category: "workflow",
      action: "reject",
      actorUserId: "manager_1",
      result: "failure",
    })
  })

  test("filters operation logs across category, action, actor, and result", () => {
    expect(
      filterOperationLogs(logs, { category: "work" }).map((item) => item.id),
    ).toEqual(["workflow_reject"])

    expect(
      filterOperationLogs(logs, { action: "update" }).map((item) => item.id),
    ).toEqual(["tenant_update"])

    expect(
      filterOperationLogs(logs, {
        actorUserId: "admin",
        result: "success",
      }).map((item) => item.id),
    ).toEqual(["audit_login", "tenant_update"])
  })

  test("keeps the selected operation log when it remains visible", () => {
    expect(resolveOperationLogSelection(logs, "workflow_reject")).toBe(
      "workflow_reject",
    )
  })

  test("falls back to the first visible operation log when the previous selection disappears", () => {
    const successfulLogs = logs.filter((item) => item.result === "success")

    expect(
      resolveOperationLogSelection(successfulLogs, "workflow_reject"),
    ).toBe("audit_login")
  })

  test("returns null when there are no visible operation logs", () => {
    expect(resolveOperationLogSelection([], null)).toBeNull()
  })

  test("maps operation log result and timestamps for table display", () => {
    expect(
      createOperationLogTableItems(logs, {
        localizeResult: (result) => `result:${result}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "audit_login",
        result: "result:success",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "workflow_reject",
        result: "result:failure",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "tenant_update",
        result: "result:success",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })

  test("creates read-only detail values and details text", () => {
    const firstLog = logs[0]
    const secondLog = logs[1]

    expect(firstLog).toBeDefined()
    expect(secondLog).toBeDefined()

    if (!firstLog || !secondLog) {
      throw new Error("expected fixture logs")
    }

    expect(
      createOperationLogDetailValues(firstLog, {
        localizeResult: (result) => `result:${result}`,
      }),
    ).toEqual({
      category: "auth",
      action: "login",
      actorUserId: "user_admin",
      targetType: "session",
      targetId: "session_1",
      result: "result:success",
      requestId: "req_1",
      ip: "127.0.0.1",
      userAgent: "bun:test",
      createdAt: "2026-04-27T08:00:00.000Z",
    })

    expect(formatOperationLogDetailsText(firstLog, "empty")).toContain(
      "traceId",
    )
    expect(formatOperationLogDetailsText(secondLog, "empty")).toBe("empty")
  })
})
