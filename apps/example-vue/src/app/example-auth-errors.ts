export const isRecoverableAuthError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("[AUTH_REFRESH_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_INVALID]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_EXPIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_INVALID]"))
