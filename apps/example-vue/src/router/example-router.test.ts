import { describe, expect, test } from "bun:test"

import { resolveExampleAppLayout } from "./example-router"

describe("example app router", () => {
  test("uses auth layout before a session exists", () => {
    expect(resolveExampleAppLayout(false)).toBe("auth")
  })

  test("uses admin layout after authentication", () => {
    expect(resolveExampleAppLayout(true)).toBe("admin")
  })
})
