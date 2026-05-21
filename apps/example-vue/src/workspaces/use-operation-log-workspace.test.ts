import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { OperationLogRecord } from "../lib/platform-api"
import { useOperationLogWorkspace } from "./use-operation-log-workspace"

const createOperationLogRecord = (
  overrides: Partial<OperationLogRecord> & Pick<OperationLogRecord, "id">,
): OperationLogRecord => ({
  id: overrides.id,
  category: overrides.category ?? "auth",
  action: overrides.action ?? "login",
  authEventType: overrides.authEventType ?? "login",
  authFailureReason: overrides.authFailureReason ?? null,
  actorUserId: overrides.actorUserId ?? "user-1",
  targetType: overrides.targetType ?? "session",
  targetId: overrides.targetId ?? "session-1",
  result: overrides.result ?? "failure",
  requestId: overrides.requestId ?? "req-1",
  ip: overrides.ip ?? "127.0.0.1",
  userAgent: overrides.userAgent ?? "browser",
  details: overrides.details ?? { reason: overrides.authFailureReason },
  createdAt: overrides.createdAt ?? "2026-05-02T08:00:00.000Z",
})

const createWorkspace = (options?: {
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useOperationLogWorkspace({
    currentShellTabKey: ref("overview"),
    page: {
      tableColumns: computed(() => [
        { key: "id" },
        { key: "authFailureReason" },
        { key: "result" },
      ]),
      queryFields: computed(() => []),
    },
    locale: ref("zh-CN"),
    t: (key) => key,
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeResult: (result) => `result:${result}`,
    canView: computed(() => true),
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
  })

describe("useOperationLogWorkspace", () => {
  test("keeps operation log list columns focused on traceable events", () => {
    const workspace = useOperationLogWorkspace({
      currentShellTabKey: ref("overview"),
      page: {
        tableColumns: computed(() => [
          { key: "id" },
          { key: "authFailureReason" },
          { key: "ip" },
          { key: "userAgent" },
          { key: "requestId" },
          { key: "result" },
          { key: "targetId" },
          { key: "targetType" },
          { key: "actorUserId" },
          { key: "action" },
          { key: "category" },
          { key: "createdAt" },
        ]),
        queryFields: computed(() => []),
      },
      locale: ref("zh-CN"),
      t: (key) => key,
      localizeFieldLabel: (fieldKey) => fieldKey,
      localizeResult: (result) => `result:${result}`,
      canView: computed(() => true),
      onRecoverableAuthError: () => {},
    })

    expect(workspace.tableColumns.value.map((column) => column.key)).toEqual([
      "category",
      "action",
      "actorUserId",
      "targetType",
      "targetId",
      "result",
      "requestId",
      "createdAt",
    ])
  })

  test("exposes known auth failure reasons as localized query select options", () => {
    const workspace = useOperationLogWorkspace({
      currentShellTabKey: ref("overview"),
      page: {
        tableColumns: computed(() => []),
        queryFields: computed(() => [
          {
            key: "authFailureReason",
            kind: "text" as const,
            label: "authFailureReason",
          },
        ]),
      },
      locale: ref("zh-CN"),
      t: (key) => key,
      localizeFieldLabel: (fieldKey) => fieldKey,
      localizeResult: (result) => `result:${result}`,
      canView: computed(() => true),
      onRecoverableAuthError: () => {},
    })

    expect(workspace.queryFields.value).toEqual([
      {
        key: "authFailureReason",
        kind: "select",
        label: "authFailureReason",
        options: [
          {
            label: "app.operationLog.authFailureReason.invalid_password",
            value: "invalid_password",
          },
          {
            label: "app.operationLog.authFailureReason.account_locked",
            value: "account_locked",
          },
          {
            label: "app.operationLog.authFailureReason.user_disabled",
            value: "user_disabled",
          },
        ],
        placeholder: "app.operationLog.query.authFailureReasonPlaceholder",
      },
    ])
  })

  test("passes through request and target query fields with localized placeholders", () => {
    const workspace = useOperationLogWorkspace({
      currentShellTabKey: ref("overview"),
      page: {
        tableColumns: computed(() => []),
        queryFields: computed(() => [
          { key: "requestId", kind: "text" as const, label: "requestId" },
          { key: "targetType", kind: "text" as const, label: "targetType" },
          { key: "userAgent", kind: "text" as const, label: "userAgent" },
        ]),
      },
      locale: ref("zh-CN"),
      t: (key) => key,
      localizeFieldLabel: (fieldKey) => fieldKey,
      localizeResult: (result) => `result:${result}`,
      canView: computed(() => true),
      onRecoverableAuthError: () => {},
    })

    expect(workspace.queryFields.value).toEqual([
      {
        key: "requestId",
        kind: "text",
        label: "requestId",
        options: undefined,
        placeholder: "app.operationLog.query.requestIdPlaceholder",
      },
      {
        key: "targetType",
        kind: "text",
        label: "targetType",
        options: undefined,
        placeholder: "app.operationLog.query.targetTypePlaceholder",
      },
      {
        key: "userAgent",
        kind: "text",
        label: "userAgent",
        options: undefined,
        placeholder: "app.operationLog.query.userAgentPlaceholder",
      },
    ])
  })

  test("localizes user-disabled auth failure reasons in table items and detail values", async () => {
    const log = createOperationLogRecord({
      id: "login-disabled",
      authFailureReason: "user_disabled",
    })

    globalThis.fetch = (async (input) => {
      const url = String(input)

      if (url.endsWith("/system/operation-logs/login-disabled")) {
        return new Response(JSON.stringify(log), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/operation-logs")) {
        return new Response(
          JSON.stringify({
            items: [log],
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadOperationLogs()

    expect(workspace.tableItems.value[0]?.authFailureReason).toBe(
      "app.operationLog.authFailureReason.user_disabled",
    )
    expect(workspace.detailValues.value.authFailureReason).toBe(
      "app.operationLog.authFailureReason.user_disabled",
    )
  })

  test("preserves query values when reloading operation logs fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.includes("/system/operation-logs") && method === "GET") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.handleSearch({
      action: " login ",
      authEventType: "login",
      authFailureReason: "invalid_password",
      result: "failure",
    })

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.operationLogErrorMessage.value).toContain("unauthorized")
    expect(workspace.filteredOperationLogItems.value).toEqual([])
    expect(workspace.operationLogQueryValues.value).toEqual({
      action: " login ",
      authEventType: "login",
      authFailureReason: "invalid_password",
      result: "failure",
    })
    expect(workspace.currentQuerySummary.value).toBe(
      "app.operationLog.field.action: login / app.operationLog.field.authEventType: app.operationLog.authEventType.login / app.operationLog.field.authFailureReason: app.operationLog.authFailureReason.invalid_password / app.operationLog.field.result: result:failure",
    )
    expect(workspace.hasActiveFilters.value).toBe(true)
  })

  test("preserves cached operation log context when reloading fails", async () => {
    const loginFailed = createOperationLogRecord({
      id: "login-failed",
      authFailureReason: "invalid_password",
    })
    const loginSucceeded = createOperationLogRecord({
      id: "login-succeeded",
      authFailureReason: null,
      result: "success",
    })
    const recoverableErrors: unknown[] = []
    let failReload = false

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/system/operation-logs/login-failed")) {
        return new Response(JSON.stringify(loginFailed), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.includes("/system/operation-logs") && method === "GET") {
        if (failReload) {
          return new Response(JSON.stringify({ message: "unavailable" }), {
            headers: { "content-type": "application/json" },
            status: 503,
          })
        }

        return new Response(
          JSON.stringify({
            items: [loginFailed, loginSucceeded],
            total: 2,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadOperationLogs()
    await workspace.handleSearch({
      action: " login ",
      authEventType: "login",
      authFailureReason: "invalid_password",
      result: "failure",
    })
    failReload = true

    await workspace.reloadOperationLogs()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.operationLogErrorMessage.value).toContain("unavailable")
    expect(workspace.selectedOperationLogId.value).toBe("login-failed")
    expect(workspace.selectedOperationLog.value?.id).toBe("login-failed")
    expect(workspace.tableItems.value).toHaveLength(1)
    expect(workspace.detailValues.value.authFailureReason).toBe(
      "app.operationLog.authFailureReason.invalid_password",
    )
    expect(workspace.operationLogQueryValues.value).toEqual({
      action: " login ",
      authEventType: "login",
      authFailureReason: "invalid_password",
      result: "failure",
    })
    expect(workspace.currentQuerySummary.value).toBe(
      "app.operationLog.field.action: login / app.operationLog.field.authEventType: app.operationLog.authEventType.login / app.operationLog.field.authFailureReason: app.operationLog.authFailureReason.invalid_password / app.operationLog.field.result: result:failure",
    )
  })
})
