export interface StoredSessionSnapshot {
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
    tenantId: string
  } | null
  roles: string[]
  permissionCodes: string[]
}

const SESSION_STORAGE_KEY = "elysian.uniapp.session"

export const readStoredSessionSnapshot = (): StoredSessionSnapshot | null => {
  try {
    const raw = uni.getStorageSync(SESSION_STORAGE_KEY)

    if (!raw || typeof raw !== "string") {
      return null
    }

    return JSON.parse(raw) as StoredSessionSnapshot
  } catch {
    return null
  }
}

export const writeStoredSessionSnapshot = (snapshot: StoredSessionSnapshot) => {
  try {
    uni.setStorageSync(SESSION_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures during skeleton-stage validation.
  }
}

export const clearStoredSessionSnapshot = () => {
  try {
    uni.removeStorageSync(SESSION_STORAGE_KEY)
  } catch {
    // Keep the shell resilient during first-run storage checks.
  }
}
