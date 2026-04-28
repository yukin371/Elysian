const LOCAL_DEV_HOSTS = new Set(["127.0.0.1", "localhost"])

const normalizeApiBaseUrl = (value: string) => {
  if (typeof window === "undefined") {
    return value
  }

  try {
    const apiUrl = new URL(value)
    const currentHostname = window.location.hostname

    if (
      LOCAL_DEV_HOSTS.has(currentHostname) &&
      LOCAL_DEV_HOSTS.has(apiUrl.hostname) &&
      apiUrl.hostname !== currentHostname
    ) {
      apiUrl.hostname = currentHostname
      return apiUrl.toString().replace(/\/$/, "")
    }
  } catch {
    return value
  }

  return value
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
)

import { clearSessionSnapshot, getAccessToken, setAuthenticatedSession } from "../auth/session"

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: Record<string, unknown> | string
  auth?: boolean
  skipAuthRefresh?: boolean
}

export const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`

interface ApiResponse<T> {
  statusCode: number
  data: T
  header: Record<string, string>
}

const normalizeErrorMessage = (data: unknown) => {
  if (typeof data === "string") {
    return data
  }

  if (data && typeof data === "object") {
    const message = Reflect.get(data, "message")

    if (typeof message === "string" && message.trim()) {
      return message
    }

    const error = Reflect.get(data, "error")

    if (error && typeof error === "object") {
      const nestedMessage = Reflect.get(error, "message")

      if (typeof nestedMessage === "string" && nestedMessage.trim()) {
        return nestedMessage
      }
    }
  }

  return "Request failed"
}

const request = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {
    ...(options.body ? { "content-type": "application/json" } : {}),
    ...(options.headers ?? {}),
  }

  if (options.auth && getAccessToken()) {
    headers.authorization = `Bearer ${getAccessToken()}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildApiUrl(path),
      method: options.method ?? "GET",
      header: headers,
      data:
        typeof options.body === "string" || options.body === undefined
          ? options.body
          : JSON.stringify(options.body),
      dataType: "json",
      withCredentials: true,
      enableCookie: true,
      success: (response) => {
        resolve({
          statusCode: response.statusCode,
          data: response.data as T,
          header: response.header as Record<string, string>,
        })
      },
      fail: (error) => {
        reject(new Error(error.errMsg || "Network request failed"))
      },
    } as never)
  })
}

const refreshAuth = async () => {
  const response = await request<{
    accessToken: string
    user: {
      id: string
      username: string
      displayName: string
      isSuperAdmin: boolean
      tenantId: string
    }
    roles: string[]
    permissionCodes: string[]
  }>("/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  })

  if (response.statusCode >= 400) {
    clearSessionSnapshot()
    throw new Error(normalizeErrorMessage(response.data))
  }

  setAuthenticatedSession(response.data)
  return response.data
}

let refreshPromise: Promise<void> | null = null

const ensureRefreshedSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshAuth().then(() => undefined).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const requestJson = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const response = await request<T>(path, options)

  if (response.statusCode === 401 && options.auth && !options.skipAuthRefresh) {
    await ensureRefreshedSession()
    return requestJson<T>(path, {
      ...options,
      skipAuthRefresh: true,
    })
  }

  if (response.statusCode >= 400) {
    throw new Error(normalizeErrorMessage(response.data))
  }

  return response.data
}
