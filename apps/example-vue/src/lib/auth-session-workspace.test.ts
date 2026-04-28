import { describe, expect, test } from "bun:test"

import type { AuthSessionSummary } from "./platform-api"
import {
  createAuthSessionTableItems,
  filterAuthSessions,
  resolveAuthSessionSelection,
  resolveSessionDeviceLabel,
  resolveSessionState,
} from "./auth-session-workspace"

const createSession = (
  overrides: Partial<AuthSessionSummary> & Pick<AuthSessionSummary, "id">,
): AuthSessionSummary => ({
  id: overrides.id,
  userAgent: overrides.userAgent ?? "Mozilla/5.0 Chrome/135.0",
  ip: overrides.ip ?? "127.0.0.1",
  expiresAt: overrides.expiresAt ?? "2026-04-28T12:00:00.000Z",
  lastUsedAt: overrides.lastUsedAt ?? "2026-04-28T10:00:00.000Z",
  revokedAt: overrides.revokedAt ?? null,
  replacedBySessionId: overrides.replacedBySessionId ?? null,
  createdAt: overrides.createdAt ?? "2026-04-28T09:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-28T10:00:00.000Z",
  isCurrent: overrides.isCurrent ?? false,
})

describe("auth session workspace helpers", () => {
  const sessions = [
    createSession({
      id: "session_current",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/135.0 Safari/537.36",
      ip: "10.0.0.10",
      isCurrent: true,
    }),
    createSession({
      id: "session_rotated",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      ip: "10.0.0.20",
      replacedBySessionId: "session_current",
    }),
    createSession({
      id: "session_revoked",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148",
      ip: "10.0.0.30",
      revokedAt: "2026-04-28T11:00:00.000Z",
    }),
  ]

  test("derives device label and session state", () => {
    expect(resolveSessionDeviceLabel(sessions[0]?.userAgent ?? null)).toBe(
      "Chrome on Windows",
    )
    expect(resolveSessionDeviceLabel(sessions[1]?.userAgent ?? null)).toBe(
      "Safari on macOS",
    )
    expect(resolveSessionDeviceLabel(sessions[2]?.userAgent ?? null)).toBe(
      "Mobile browser on iOS",
    )

    expect(resolveSessionState(sessions[0]!)).toBe("current")
    expect(resolveSessionState(sessions[1]!)).toBe("rotated")
    expect(resolveSessionState(sessions[2]!)).toBe("revoked")
  })

  test("filters sessions across device, ip, state, and current/history scope", () => {
    expect(
      filterAuthSessions(sessions, { keyword: "windows" }).map(
        (session) => session.id,
      ),
    ).toEqual(["session_current"])

    expect(
      filterAuthSessions(sessions, { keyword: "10.0.0.20" }).map(
        (session) => session.id,
      ),
    ).toEqual(["session_rotated"])

    expect(
      filterAuthSessions(sessions, { state: "revoked" }).map(
        (session) => session.id,
      ),
    ).toEqual(["session_revoked"])

    expect(
      filterAuthSessions(sessions, { scope: "current" }).map(
        (session) => session.id,
      ),
    ).toEqual(["session_current"])

    expect(
      filterAuthSessions(sessions, { scope: "history" }).map(
        (session) => session.id,
      ),
    ).toEqual(["session_rotated", "session_revoked"])
  })

  test("keeps or falls back session selection within the visible list", () => {
    expect(resolveAuthSessionSelection(sessions, "session_rotated")).toBe(
      "session_rotated",
    )
    expect(
      resolveAuthSessionSelection(
        sessions.filter((session) => session.isCurrent),
        "session_rotated",
      ),
    ).toBe("session_current")
  })

  test("maps state, device, and timestamps for table display", () => {
    expect(
      createAuthSessionTableItems(sessions, {
        localizeState: (state) => `state:${state}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "session_current",
        device: "Chrome on Windows",
        state: "state:current",
        createdAt: "time:2026-04-28T09:00:00.000Z",
      }),
      expect.objectContaining({
        id: "session_rotated",
        device: "Safari on macOS",
        state: "state:rotated",
      }),
      expect.objectContaining({
        id: "session_revoked",
        device: "Mobile browser on iOS",
        state: "state:revoked",
      }),
    ])
  })
})
