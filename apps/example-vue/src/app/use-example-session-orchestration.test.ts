import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { ref } from "vue"

import type {
  AuthIdentityResponse,
  PlatformResponse,
} from "../lib/platform-api"
import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import { useExampleSessionOrchestration } from "./use-example-session-orchestration"

const originalFetch = globalThis.fetch

const createAuthIdentity = (): AuthIdentityResponse => ({
  menus: [],
  permissionCodes: ["system:user:list"],
  roles: ["super-admin"],
  user: {
    displayName: "Admin",
    id: "user-1",
    isSuperAdmin: true,
    tenantId: "tenant-default",
    username: "admin",
  },
})

const createPlatform = (): PlatformResponse => ({
  capabilities: ["auth"],
  manifest: {
    displayName: "Elysian",
    name: "elysian",
    runtime: "bun",
    status: "ready",
    version: "0.1.0",
  },
})

const createOptions = () => {
  const clearCalls: string[] = []

  const options = {
    authErrorMessage: ref(""),
    authIdentity: ref<AuthIdentityResponse | null>(createAuthIdentity()),
    authLoading: ref(false),
    authModuleReady: ref(true),
    clearCustomerWorkspace: () => clearCalls.push("customer"),
    clearDepartmentWorkspace: () => clearCalls.push("department"),
    clearDictionaryOptions: () => clearCalls.push("dictionary"),
    clearFileWorkspace: () => clearCalls.push("file"),
    clearMenuWorkspace: () => clearCalls.push("menu"),
    clearNotificationWorkspace: () => clearCalls.push("notification"),
    clearOperationLogWorkspace: () => clearCalls.push("operation-log"),
    clearPostWorkspace: () => clearCalls.push("post"),
    clearRoleWorkspace: () => clearCalls.push("role"),
    clearSessionWorkspace: () => clearCalls.push("session"),
    clearSettingWorkspace: () => clearCalls.push("setting"),
    clearTenantWorkspace: () => clearCalls.push("tenant"),
    clearUserWorkspace: () => clearCalls.push("user"),
    clearWorkflowDefinitions: () => clearCalls.push("workflow"),
    customerModuleReady: ref(true),
    departmentModuleReady: ref(true),
    dictionaryModuleReady: ref(true),
    enterpriseFormMode: ref("detail"),
    envName: ref("development"),
    errorMessage: ref(""),
    fileModuleReady: ref(true),
    handleUserReset: () => clearCalls.push("user-reset"),
    loading: ref(false),
    loginForm: ref({
      password: "secret",
      username: "admin",
    }),
    menuModuleReady: ref(true),
    notificationModuleReady: ref(true),
    notificationQueryValues: ref<Record<string, unknown>>({
      status: "unread",
    }),
    operationLogModuleReady: ref(true),
    platform: ref<PlatformResponse | null>(createPlatform()),
    postModuleReady: ref(true),
    registeredModuleCodes: ref(["auth"]),
    reloadCustomers: async () => undefined,
    reloadDepartments: async () => undefined,
    reloadDictionaries: async () => undefined,
    reloadFiles: async () => undefined,
    reloadMenus: async () => undefined,
    reloadNotifications: async () => undefined,
    reloadOperationLogs: async () => undefined,
    reloadPosts: async () => undefined,
    reloadRoles: async () => undefined,
    reloadSessions: async () => undefined,
    reloadSettings: async () => undefined,
    reloadTenants: async () => undefined,
    reloadUsers: async () => undefined,
    reloadWorkflowDefinitions: async () => undefined,
    resetDepartmentQuery: () => clearCalls.push("reset-department"),
    resetMenuQuery: () => clearCalls.push("reset-menu"),
    resetOperationLogQuery: () => clearCalls.push("reset-operation-log"),
    resetPostQuery: () => clearCalls.push("reset-post"),
    resetRoleQuery: () => clearCalls.push("reset-role"),
    resetSettingQuery: () => clearCalls.push("reset-setting"),
    resetTenantQuery: () => clearCalls.push("reset-tenant"),
    roleModuleReady: ref(true),
    settingModuleReady: ref(true),
    t: (key: string) => key,
    tenantModuleReady: ref(true),
    userModuleReady: ref(true),
    workflowModuleReady: ref(true),
  }

  return {
    clearCalls,
    options,
  }
}

describe("useExampleSessionOrchestration", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("suppresses recoverable logout auth errors while clearing local session state", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/auth/logout") && method === "POST") {
        return new Response(
          JSON.stringify({
            error: {
              code: "AUTH_ACCESS_TOKEN_INVALID",
              message: "Access token invalid",
              status: 401,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 401,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { clearCalls, options } = createOptions()
    const orchestration = useExampleSessionOrchestration(options)

    await orchestration.submitLogout()

    expect(options.authErrorMessage.value).toBe("")
    expect(options.authIdentity.value).toBeNull()
    expect(options.authLoading.value).toBe(false)
    expect(options.enterpriseFormMode.value).toBe("create")
    expect(options.notificationQueryValues.value).toEqual({})
    expect(clearCalls).toContain("customer")
    expect(clearCalls).toContain("workflow")
    expect(clearCalls).toContain("user-reset")
  })

  test("keeps non-recoverable logout errors visible", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/auth/logout") && method === "POST") {
        return new Response(
          JSON.stringify({
            error: {
              code: "SYSTEM_UNAVAILABLE",
              message: "logout unavailable",
              status: 503,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 503,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { options } = createOptions()
    const orchestration = useExampleSessionOrchestration(options)

    await orchestration.submitLogout()

    expect(options.authErrorMessage.value).toBe("logout unavailable")
    expect(options.authIdentity.value).toBeNull()
  })
})
