import type {
  ElyQueryField,
  ElyQueryValues,
  ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type AuthSessionSummary,
  fetchAuthSessions,
  revokeAuthSession,
} from "../lib/platform-api"
import {
  createAuthSessionTableItems,
  filterAuthSessions,
  resolveAuthSessionSelection,
  type AuthSessionState,
} from "../lib/auth-session-workspace"

interface UseAuthSessionWorkspaceOptions {
  currentShellTabKey: Ref<string>
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  canEnterWorkspace: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
  onCurrentSessionRevoked: () => Promise<void>
}

export const useAuthSessionWorkspace = (
  options: UseAuthSessionWorkspaceOptions,
) => {
  const sessionItems = ref<AuthSessionSummary[]>([])
  const selectedSessionId = ref<string | null>(null)
  const sessionLoading = ref(false)
  const sessionActionLoading = ref(false)
  const sessionErrorMessage = ref("")
  const sessionQueryValues = ref<ElyQueryValues>({})

  const localizeState = (state: AuthSessionState) =>
    state === "current"
      ? options.t("app.onlineSession.state.current")
      : state === "active"
        ? options.t("app.onlineSession.state.active")
        : state === "rotated"
          ? options.t("app.onlineSession.state.rotated")
          : options.t("app.onlineSession.state.revoked")

  const filteredSessionItems = computed(() =>
    filterAuthSessions(sessionItems.value, {
      keyword:
        typeof sessionQueryValues.value.keyword === "string"
          ? sessionQueryValues.value.keyword
          : undefined,
      state:
        sessionQueryValues.value.state === "current" ||
        sessionQueryValues.value.state === "active" ||
        sessionQueryValues.value.state === "rotated" ||
        sessionQueryValues.value.state === "revoked"
          ? sessionQueryValues.value.state
          : "",
      scope:
        sessionQueryValues.value.scope === "all" ||
        sessionQueryValues.value.scope === "current" ||
        sessionQueryValues.value.scope === "history"
          ? sessionQueryValues.value.scope
          : "",
    }),
  )

  const selectedSession = computed(
    () =>
      filteredSessionItems.value.find(
        (session) => session.id === selectedSessionId.value,
      ) ??
      sessionItems.value.find((session) => session.id === selectedSessionId.value) ??
      null,
  )

  const queryFields = computed<ElyQueryField[]>(() => [
    {
      key: "keyword",
      label: options.t("app.onlineSession.field.keyword"),
      kind: "text",
      placeholder: options.t("app.onlineSession.query.keywordPlaceholder"),
    },
    {
      key: "state",
      label: options.t("app.onlineSession.field.state"),
      kind: "select",
      placeholder: options.t("copy.query.statusPlaceholder"),
      options: [
        {
          label: options.t("app.onlineSession.state.current"),
          value: "current",
        },
        {
          label: options.t("app.onlineSession.state.active"),
          value: "active",
        },
        {
          label: options.t("app.onlineSession.state.rotated"),
          value: "rotated",
        },
        {
          label: options.t("app.onlineSession.state.revoked"),
          value: "revoked",
        },
      ],
    },
    {
      key: "scope",
      label: options.t("app.onlineSession.field.scope"),
      kind: "select",
      placeholder: options.t("app.onlineSession.query.scopePlaceholder"),
      options: [
        {
          label: options.t("app.onlineSession.scope.all"),
          value: "all",
        },
        {
          label: options.t("app.onlineSession.scope.current"),
          value: "current",
        },
        {
          label: options.t("app.onlineSession.scope.history"),
          value: "history",
        },
      ],
    },
  ])

  const tableColumns = computed<ElyTableColumn[]>(() => [
    {
      key: "device",
      label: options.t("app.onlineSession.field.device"),
      width: "220",
    },
    {
      key: "ip",
      label: options.t("app.onlineSession.field.ip"),
      width: "140",
    },
    {
      key: "state",
      label: options.t("app.onlineSession.field.state"),
      width: "140",
    },
    {
      key: "lastUsedAt",
      label: options.t("app.onlineSession.field.lastUsedAt"),
      width: "190",
    },
    {
      key: "expiresAt",
      label: options.t("app.onlineSession.field.expiresAt"),
      width: "190",
    },
  ])

  const tableItems = computed(() =>
    createAuthSessionTableItems(filteredSessionItems.value, {
      localizeState,
      formatDateTime: (value) =>
        value ? new Date(value).toLocaleString(options.locale.value) : "—",
    }),
  )

  const countLabel = computed(() =>
    options.t("app.onlineSession.countLabel", {
      visible: filteredSessionItems.value.length,
      total: sessionItems.value.length,
    }),
  )

  const currentQuerySummary = computed(() => {
    const fragments: string[] = []

    if (
      typeof sessionQueryValues.value.keyword === "string" &&
      sessionQueryValues.value.keyword.trim()
    ) {
      fragments.push(
        `${options.t("app.onlineSession.field.keyword")}: ${sessionQueryValues.value.keyword.trim()}`,
      )
    }

    if (
      typeof sessionQueryValues.value.state === "string" &&
      sessionQueryValues.value.state
    ) {
      fragments.push(
        `${options.t("app.onlineSession.field.state")}: ${localizeState(
          sessionQueryValues.value.state as AuthSessionState,
        )}`,
      )
    }

    if (
      typeof sessionQueryValues.value.scope === "string" &&
      sessionQueryValues.value.scope
    ) {
      fragments.push(
        `${options.t("app.onlineSession.field.scope")}: ${
          sessionQueryValues.value.scope === "current"
            ? options.t("app.onlineSession.scope.current")
            : sessionQueryValues.value.scope === "history"
              ? options.t("app.onlineSession.scope.history")
              : options.t("app.onlineSession.scope.all")
        }`,
      )
    }

    return fragments.length > 0
      ? fragments.join(" / ")
      : options.t("app.filter.none")
  })

  const clearWorkspace = () => {
    sessionItems.value = []
    selectedSessionId.value = null
    sessionErrorMessage.value = ""
    sessionQueryValues.value = {}
  }

  const reloadSessions = async () => {
    if (!options.canEnterWorkspace.value) {
      clearWorkspace()
      return
    }

    sessionLoading.value = true
    sessionErrorMessage.value = ""

    try {
      const payload = await fetchAuthSessions()
      sessionItems.value = payload.items
      selectedSessionId.value = resolveAuthSessionSelection(
        payload.items,
        selectedSessionId.value,
      )
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      sessionErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadOnlineSessions")
    } finally {
      sessionLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    sessionQueryValues.value = values
  }

  const handleReset = () => {
    sessionQueryValues.value = {}
  }

  const handleRowClick = (row: Record<string, unknown>) => {
    const sessionId = String(row.id ?? "")

    if (!sessionId) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedSessionId.value = sessionId
  }

  const revokeSelectedSession = async () => {
    if (!selectedSession.value || sessionActionLoading.value) {
      return
    }

    sessionActionLoading.value = true
    sessionErrorMessage.value = ""

    try {
      const revokedCurrentSession = selectedSession.value.isCurrent
      await revokeAuthSession(selectedSession.value.id)

      if (revokedCurrentSession) {
        await options.onCurrentSessionRevoked()
        return
      }

      await reloadSessions()
    } catch (error) {
      options.onRecoverableAuthError(error)
      sessionErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.revokeOnlineSession")
    } finally {
      sessionActionLoading.value = false
    }
  }

  return {
    clearWorkspace,
    countLabel,
    currentQuerySummary,
    filteredSessionItems,
    handleReset,
    handleRowClick,
    handleSearch,
    queryFields,
    reloadSessions,
    revokeSelectedSession,
    selectedSession,
    selectedSessionId,
    sessionActionLoading,
    sessionErrorMessage,
    sessionLoading,
    sessionQueryValues,
    tableColumns,
    tableItems,
  }
}
