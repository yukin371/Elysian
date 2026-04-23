import type { UiMenuItem } from "@elysian/ui-core"

export interface PlatformResponse {
  manifest: {
    name: string
    displayName: string
    version: string
    runtime: string
    status: string
  }
  capabilities: string[]
}

export interface SystemModulesResponse {
  env: string
  modules: string[]
}

export interface AuthIdentityResponse {
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
  }
  roles: string[]
  permissionCodes: string[]
  menus: UiMenuItem[]
}

export interface LoginResponse extends AuthIdentityResponse {
  accessToken: string
}

export interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface CustomersResponse {
  items: CustomerRecord[]
}

export interface DictionaryTypeRecord {
  id: string
  code: string
  name: string
  description?: string
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DictionaryItemRecord {
  id: string
  typeId: string
  value: string
  label: string
  sort: number
  isDefault: boolean
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DictionaryTypesResponse {
  items: DictionaryTypeRecord[]
}

export interface DictionaryItemsResponse {
  items: DictionaryItemRecord[]
}

interface RequestJsonOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  auth?: boolean
  credentials?: "omit" | "same-origin" | "include"
}

const SERVER_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000"

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const clearAccessToken = () => {
  accessToken = null
}

const requestJson = async <T>(
  path: string,
  options: RequestJsonOptions = {},
  allowAuthRetry = true,
): Promise<T> => {
  const headers = new Headers()

  if (options.body !== undefined) {
    headers.set("content-type", "application/json")
  }

  if (options.auth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials,
  })

  if (
    response.status === 401 &&
    options.auth &&
    allowAuthRetry &&
    !path.startsWith("/auth/")
  ) {
    const restored = await tryRefreshAccessToken()

    if (restored) {
      return requestJson<T>(path, options, false)
    }
  }

  if (!response.ok) {
    throw await toRequestError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

const tryRefreshAccessToken = async () => {
  try {
    const payload = await requestJson<LoginResponse>(
      "/auth/refresh",
      {
        method: "POST",
        credentials: "include",
      },
      false,
    )
    setAccessToken(payload.accessToken)
    return true
  } catch {
    clearAccessToken()
    return false
  }
}

const toRequestError = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      error?: {
        code?: string
        message?: string
        status?: number
      }
    }
    const code = payload.error?.code
    const message =
      payload.error?.message ?? `Request failed with status ${response.status}`

    return new Error(code ? `${message} [${code}]` : message)
  } catch {
    return new Error(`Request failed with status ${response.status}`)
  }
}

export const fetchPlatform = () => requestJson<PlatformResponse>("/platform")

export const fetchSystemModules = () =>
  requestJson<SystemModulesResponse>("/system/modules")

export const login = async (input: {
  username: string
  password: string
}): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  // Strip the internal accessToken field to expose the canonical identity shape.
  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const refreshAuth = async (): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const fetchMe = () =>
  requestJson<AuthIdentityResponse>("/auth/me", {
    auth: true,
  })

export const logout = async (): Promise<void> => {
  await requestJson<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  })
  clearAccessToken()
}

export const fetchCustomers = async (): Promise<CustomersResponse> => {
  return requestJson<CustomersResponse>("/customers", {
    auth: true,
  })
}

export const fetchDictionaryTypes =
  async (): Promise<DictionaryTypesResponse> =>
    requestJson<DictionaryTypesResponse>("/system/dictionaries/types", {
      auth: true,
    })

export const fetchDictionaryItems = async (
  typeId?: string,
): Promise<DictionaryItemsResponse> =>
  requestJson<DictionaryItemsResponse>(
    typeId
      ? `/system/dictionaries/items?typeId=${encodeURIComponent(typeId)}`
      : "/system/dictionaries/items",
    {
      auth: true,
    },
  )

export const createCustomer = (input: {
  name: string
  status: "active" | "inactive"
}) =>
  requestJson<CustomerRecord>("/customers", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateCustomer = (
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
) =>
  requestJson<CustomerRecord>(`/customers/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const deleteCustomer = (id: string) =>
  requestJson<void>(`/customers/${id}`, {
    method: "DELETE",
    auth: true,
  })
