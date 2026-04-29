import type { AuthSessionSummary } from "./platform-api"

export type AuthSessionState = "current" | "active" | "rotated" | "revoked"

export interface AuthSessionWorkspaceQuery {
  keyword?: string
  state?: AuthSessionState | ""
  scope?: "all" | "current" | "history" | ""
}

export interface AuthSessionTableItem
  extends Omit<
    AuthSessionSummary,
    "createdAt" | "updatedAt" | "expiresAt" | "lastUsedAt"
  > {
  device: string
  state: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  lastUsedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const resolveSessionDeviceLabel = (userAgent: string | null) => {
  const normalized = (userAgent ?? "").toLowerCase()

  if (!normalized) {
    return "Unknown device"
  }

  const browser = normalized.includes("edg/")
    ? "Edge"
    : normalized.includes("chrome/")
      ? "Chrome"
      : normalized.includes("firefox/")
        ? "Firefox"
        : normalized.includes("safari/")
          ? "Safari"
          : normalized.includes("mobile")
            ? "Mobile browser"
            : "Browser"

  const os = normalized.includes("windows")
    ? "Windows"
    : normalized.includes("mac os x") && normalized.includes("iphone")
      ? "iOS"
      : normalized.includes("android")
        ? "Android"
        : normalized.includes("iphone") || normalized.includes("ipad")
          ? "iOS"
          : normalized.includes("mac os x")
            ? "macOS"
            : normalized.includes("linux")
              ? "Linux"
              : "Unknown OS"

  return `${browser} on ${os}`
}

export const resolveSessionState = (
  session: AuthSessionSummary,
): AuthSessionState => {
  if (session.revokedAt) {
    return "revoked"
  }

  if (session.isCurrent) {
    return "current"
  }

  if (session.replacedBySessionId) {
    return "rotated"
  }

  return "active"
}

export const filterAuthSessions = (
  sessions: AuthSessionSummary[],
  query: AuthSessionWorkspaceQuery,
) => {
  const keyword = normalizeQueryValue(query.keyword)
  const state = query.state ?? ""
  const scope = query.scope ?? ""

  return sessions.filter((session) => {
    const device = resolveSessionDeviceLabel(session.userAgent).toLowerCase()
    const resolvedState = resolveSessionState(session)

    if (
      keyword.length > 0 &&
      !device.includes(keyword) &&
      !(session.ip ?? "").toLowerCase().includes(keyword) &&
      !(session.userAgent ?? "").toLowerCase().includes(keyword)
    ) {
      return false
    }

    if (state && resolvedState !== state) {
      return false
    }

    if (scope === "current" && !session.isCurrent) {
      return false
    }

    if (scope === "history" && session.isCurrent) {
      return false
    }

    return true
  })
}

export const resolveAuthSessionSelection = (
  sessions: Array<Pick<AuthSessionSummary, "id">>,
  selectedSessionId: string | null,
) => {
  if (sessions.length === 0) {
    return null
  }

  if (
    selectedSessionId &&
    sessions.some((session) => session.id === selectedSessionId)
  ) {
    return selectedSessionId
  }

  return sessions[0]?.id ?? null
}

export const createAuthSessionTableItems = (
  sessions: AuthSessionSummary[],
  options: {
    localizeState: (state: AuthSessionState) => string
    formatDateTime: (value: string | null) => string
  },
): AuthSessionTableItem[] =>
  sessions.map((session) => ({
    ...session,
    device: resolveSessionDeviceLabel(session.userAgent),
    state: options.localizeState(resolveSessionState(session)),
    createdAt: options.formatDateTime(session.createdAt),
    updatedAt: options.formatDateTime(session.updatedAt),
    expiresAt: options.formatDateTime(session.expiresAt),
    lastUsedAt: options.formatDateTime(session.lastUsedAt),
  }))
