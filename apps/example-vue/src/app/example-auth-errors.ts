import { ApiError } from "../lib/platform-api/core"
import { resolveApiErrorCode } from "../lib/platform-api/error-codes"

const recoverableAuthErrorCodes = new Set([
  resolveApiErrorCode("AUTH_REFRESH_TOKEN_REQUIRED"),
  resolveApiErrorCode("AUTH_REFRESH_TOKEN_INVALID"),
  resolveApiErrorCode("AUTH_REFRESH_TOKEN_EXPIRED"),
  resolveApiErrorCode("AUTH_ACCESS_TOKEN_REQUIRED"),
  resolveApiErrorCode("AUTH_ACCESS_TOKEN_INVALID"),
])

export const isRecoverableAuthError = (error: unknown) =>
  error instanceof ApiError &&
  error.code !== null &&
  recoverableAuthErrorCodes.has(error.code)
