import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import { describe, expect, it } from "bun:test"

import { signAccessToken, verifyAccessToken } from "./tokens"
import { parseTenantFromToken } from "./tenant"

const testSecret = "test-tenant-secret"

describe("parseTenantFromToken", () => {
  it("extracts tid from a valid JWT", async () => {
    const token = await signAccessToken(
      { sub: "user-1", sid: "session-1", tid: "tenant-abc", roles: [] },
      testSecret,
      300,
    )
    const result = parseTenantFromToken(`Bearer ${token}`)
    expect(result).toBe("tenant-abc")
  })

  it("returns null when JWT has no tid claim", async () => {
    const token = await signAccessToken(
      { sub: "user-1", sid: "session-1", tid: DEFAULT_TENANT_ID, roles: [] },
      testSecret,
      300,
    )
    const parts = token.split(".")
    const payloadStr = Buffer.from(parts[1]!, "base64").toString("utf8")
    const payload = JSON.parse(payloadStr) as Record<string, unknown>
    delete payload.tid
    const modifiedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const modifiedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`

    const result = parseTenantFromToken(`Bearer ${modifiedToken}`)
    expect(result).toBeNull()
  })

  it("returns null when authorization header is null", () => {
    expect(parseTenantFromToken(null)).toBeNull()
  })

  it("returns null for non-Bearer authorization", () => {
    expect(parseTenantFromToken("Basic dXNlcjpwYXNz")).toBeNull()
  })

  it("returns null for empty Bearer token", () => {
    expect(parseTenantFromToken("Bearer ")).toBeNull()
  })

  it("returns null for malformed JWT with wrong number of parts", () => {
    expect(parseTenantFromToken("Bearer abc.def")).toBeNull()
    expect(parseTenantFromToken("Bearer a.b.c.d")).toBeNull()
  })

  it("returns null for non-JSON JWT payload", () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url")
    const payload = Buffer.from("not-json").toString("base64url")
    const sig = Buffer.from("sig").toString("base64url")
    expect(parseTenantFromToken(`Bearer ${header}.${payload}.${sig}`)).toBeNull()
  })
})

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
