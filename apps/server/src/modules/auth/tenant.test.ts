import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"

import {
  createRefreshToken,
  extractTenantIdFromRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens"

const testSecret = "test-tenant-secret"

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
