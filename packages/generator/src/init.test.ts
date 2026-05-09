import { describe, expect, it } from "bun:test"

import { generateScaffoldSchema } from "./init"

describe("generateScaffoldSchema", () => {
  it("generates a minimal scaffold from module name", () => {
    const result = generateScaffoldSchema("product")
    const parsed = JSON.parse(result) as {
      fields: Array<{ key: string; kind: string }>
      name: string
    }

    expect(parsed.name).toBe("product")
    expect(parsed.fields).toBeInstanceOf(Array)
    expect(parsed.fields.length).toBeGreaterThanOrEqual(2)
    expect(parsed.fields.find((field) => field.key === "name")).toBeDefined()
    expect(
      parsed.fields.find(
        (field) => field.key === "description" && field.kind === "text",
      ),
    ).toBeDefined()
    expect(
      parsed.fields.find(
        (field) => field.key === "metadata" && field.kind === "json",
      ),
    ).toBeDefined()
  })

  it("includes all supported kinds in the scaffold output", () => {
    const result = generateScaffoldSchema("order")

    expect(result).toContain("string")
    expect(result).toContain("text")
    expect(result).toContain("number")
    expect(result).toContain("boolean")
    expect(result).toContain("enum")
    expect(result).toContain("json")
    expect(result).toContain("datetime")
  })
})
