type MultipartRequestBody = FormData

interface RequestJsonOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  bodyType?: "json" | "form-data"
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

const tryRefreshAccessToken = async () => {
  try {
    const payload = await requestJson<{ accessToken: string }>(
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

export const requestJson = async <T>(
  path: string,
  options: RequestJsonOptions = {},
  allowAuthRetry = true,
): Promise<T> => {
  const headers = new Headers()

  if (options.body !== undefined && options.bodyType !== "form-data") {
    headers.set("content-type", "application/json")
  }

  if (options.auth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body:
      options.bodyType === "form-data"
        ? (options.body as MultipartRequestBody)
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
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

export const requestBlob = async (
  path: string,
  options: Omit<RequestJsonOptions, "body" | "bodyType"> = {},
  allowAuthRetry = true,
): Promise<Blob> => {
  const headers = new Headers()

  if (options.auth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
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
      return requestBlob(path, options, false)
    }
  }

  if (!response.ok) {
    throw await toRequestError(response)
  }

  return response.blob()
}
