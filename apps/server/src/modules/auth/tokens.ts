const encoder = new TextEncoder()

export interface AccessTokenPayload {
  sub: string
  sid: string
  tid: string
  roles: string[]
  iat: number
  exp: number
}

const base64UrlEncode = (value: string | Uint8Array) =>
  Buffer.from(typeof value === "string" ? value : value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")

export const base64UrlDecode = (value: string) => {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  )
  return Buffer.from(padded.replaceAll("-", "+").replaceAll("_", "/"), "base64")
}

const importHmacKey = (secret: string, usage: "sign" | "verify") =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  )

export const signAccessToken = async (
  claims: Omit<AccessTokenPayload, "iat" | "exp">,
  secret: string,
  ttlSeconds: number,
) => {
  const now = Math.floor(Date.now() / 1000)
  const payload: AccessTokenPayload = {
    ...claims,
    iat: now,
    exp: now + ttlSeconds,
  }
  const unsignedToken = [
    base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64UrlEncode(JSON.stringify(payload)),
  ].join(".")

  const key = await importHmacKey(secret, "sign")
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(unsignedToken),
  )

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`
}

export const verifyAccessToken = async (
  token: string,
  secret: string,
): Promise<AccessTokenPayload> => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".")

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Malformed access token")
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  const key = await importHmacKey(secret, "verify")
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(encodedSignature),
    encoder.encode(unsignedToken),
  )

  if (!isValid) {
    throw new Error("Invalid access token signature")
  }

  const payload = JSON.parse(
    base64UrlDecode(encodedPayload).toString("utf8"),
  ) as AccessTokenPayload

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Access token expired")
  }

  return payload
}

export const createRefreshToken = () =>
  `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`

export const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token))
  return Buffer.from(digest).toString("hex")
}
