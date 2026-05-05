import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"

import {
  createRefreshToken,
  extractTenantIdFromRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens"

const testSecret = "test-tenant-secret"
const encoder = new TextEncoder()

const base64UrlEncode = (value: string) =>
  Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")

const signRawToken = async (payload: unknown, secret: string) => {
  const unsignedToken = [
    base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64UrlEncode(JSON.stringify(payload)),
  ].join(".")
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(unsignedToken),
  )
  const encodedSignature = Buffer.from(signature)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")

  return `${unsignedToken}.${encodedSignature}`
}

describe("signAccessToken / verifyAccessToken with tid", () => {
  it("includes tid in the signed JWT payload", async () => {
    const token = await signAccessToken(
      { sub: "user-1", sid: "session-1", tid: "tenant-xyz", roles: ["admin"] },
      testSecret,
      300,
    )
    const payload = await verifyAccessToken(token, testSecret)

    expect(payload.sub).toBe("user-1")
    expect(payload.sid).toBe("session-1")
    expect(payload.tid).toBe("tenant-xyz")
    expect(payload.roles).toEqual(["admin"])
    expect(typeof payload.iat).toBe("number")
    expect(typeof payload.exp).toBe("number")
    expect(payload.exp - payload.iat).toBe(300)
  })

  it("uses DEFAULT_TENANT_ID when signing a default-tenant user", async () => {
    const token = await signAccessToken(
      { sub: "user-1", sid: "session-1", tid: DEFAULT_TENANT_ID, roles: [] },
      testSecret,
      300,
    )
    const payload = await verifyAccessToken(token, testSecret)

    expect(payload.tid).toBe(DEFAULT_TENANT_ID)
  })

  it("rejects signed tokens with malformed payload shapes", async () => {
    const token = await signRawToken(
      {
        sub: "user-1",
        sid: "session-1",
        tid: DEFAULT_TENANT_ID,
        roles: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
      },
      testSecret,
    )

    await expect(verifyAccessToken(token, testSecret)).rejects.toThrow(
      "Malformed access token payload",
    )
  })
})

describe("createRefreshToken / extractTenantIdFromRefreshToken", () => {
  it("embeds tenant id into the refresh token when provided", () => {
    const token = createRefreshToken(DEFAULT_TENANT_ID)

    expect(token.startsWith(`${DEFAULT_TENANT_ID}.`)).toBe(true)
    expect(extractTenantIdFromRefreshToken(token)).toBe(DEFAULT_TENANT_ID)
  })

  it("returns null when refresh token has no tenant prefix", () => {
    expect(extractTenantIdFromRefreshToken(createRefreshToken())).toBeNull()
  })

  it("returns null for malformed tenant prefixes", () => {
    expect(extractTenantIdFromRefreshToken("not-a-uuid.token")).toBeNull()
    expect(extractTenantIdFromRefreshToken(null)).toBeNull()
  })
})
