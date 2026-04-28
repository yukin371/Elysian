import {
  clearStoredSessionSnapshot,
  readStoredSessionSnapshot,
  writeStoredSessionSnapshot,
  type StoredSessionSnapshot,
} from "../storage/session-storage"

export interface SessionUserSummary {
  id: string
  username: string
  displayName: string
  isSuperAdmin: boolean
  tenantId: string
}

export interface SessionSnapshot extends StoredSessionSnapshot {}

let accessToken: string | null = null
let sessionSnapshot: SessionSnapshot | null = readStoredSessionSnapshot()

export const getAccessToken = () => accessToken

export const getSessionSnapshot = () => sessionSnapshot

export const setSessionSnapshot = (
  snapshot: SessionSnapshot,
  nextAccessToken?: string | null,
) => {
  sessionSnapshot = snapshot
  accessToken = nextAccessToken ?? accessToken
  writeStoredSessionSnapshot(snapshot)
}

export const setAuthenticatedSession = (input: {
  accessToken: string
  user: SessionUserSummary
  roles: string[]
  permissionCodes: string[]
}) => {
  accessToken = input.accessToken
  setSessionSnapshot({
    user: input.user,
    roles: input.roles,
    permissionCodes: input.permissionCodes,
  })
}

export const clearSessionSnapshot = () => {
  accessToken = null
  sessionSnapshot = null
  clearStoredSessionSnapshot()
}
