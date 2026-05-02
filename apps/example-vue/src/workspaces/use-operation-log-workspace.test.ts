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

const createWorkspace = () =>
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
    onRecoverableAuthError: () => {},
  })

describe("useOperationLogWorkspace", () => {
  test("exposes known auth failure reasons as localized query select options", () => {
    const workspace = useOperationLogWorkspace({
      currentShellTabKey: ref("overview"),
      page: {
        tableColumns: computed(() => []),
        queryFields: computed(() => [
          { key: "authFailureReason", kind: "text" as const },
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
})
