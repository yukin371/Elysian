import { resolveApiErrorCode, resolveApiErrorCodeLabel } from "./error-codes"

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
  (() => {
    const browserLocation = globalThis.window?.location

    if (
      browserLocation &&
      (browserLocation.hostname === "localhost" ||
        browserLocation.hostname === "127.0.0.1")
    ) {
      return `${browserLocation.protocol}//${browserLocation.hostname}:3000`
    }

    return "http://localhost:3000"
  })()

let accessToken: string | null = null

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonRecord = async (response: { json(): Promise<unknown> }) => {
  const body: unknown = await response.json()

  if (!isRecord(body)) {
    throw new Error("Malformed JSON response")
  }

  return body
}

const readOptionalRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === undefined) {
    return undefined
  }

  if (!isRecord(property)) {
    throw new Error(`Expected optional object field: ${key}`)
  }

  return property
}

const readOptionalStringOrNumber = (
  value: Record<string, unknown>,
  key: string,
) => {
  const property = value[key]

  if (
    property === undefined ||
    typeof property === "string" ||
    typeof property === "number"
  ) {
    return property
  }

  throw new Error(`Expected optional string/number field: ${key}`)
}

const readOptionalString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === undefined || typeof property === "string") {
    return property
  }

  throw new Error(`Expected optional string field: ${key}`)
}

const readOptionalNumber = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === undefined || typeof property === "number") {
    return property
  }

  throw new Error(`Expected optional number field: ${key}`)
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: number | null = null,
    readonly details?: Record<string, unknown>,
  ) {
    const codeLabel = resolveApiErrorCodeLabel(code)
    super(codeLabel === null ? message : `${message} [${codeLabel}]`)
    this.name = "ApiError"
  }
}

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const clearAccessToken = () => {
  accessToken = null
}

const toRequestError = async (response: Response) => {
  try {
    const payload = await readJsonRecord(response)
    const envelope = payload.error ?? payload
    const envelopeRecord = isRecord(envelope) ? envelope : payload
    const message =
      readOptionalString(envelopeRecord, "message") ??
      `Request failed with status ${response.status}`

    return new ApiError(
      message,
      readOptionalNumber(envelopeRecord, "status") ?? response.status,
      resolveApiErrorCode(readOptionalStringOrNumber(envelopeRecord, "code")),
      readOptionalRecord(envelopeRecord, "details"),
    )
  } catch {
    return new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    )
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
