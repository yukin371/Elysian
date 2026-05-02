import { describe, expect, it } from "bun:test"

import {
  productModuleSchema,
  registeredModuleSchemas,
  sampleModuleSchema,
} from "@elysian/schema"

import {
  getRegisteredSchema,
  listRegisteredSchemaNames,
  listRegisteredSchemas,
} from "./schemas"

describe("generator schema registry", () => {
  it("exposes the full generator-visible schema list for consumers", () => {
    expect(listRegisteredSchemas()).toEqual([
      ...registeredModuleSchemas,
      sampleModuleSchema,
    ])
  })

  it("derives formal schema names from the shared schema registry", () => {
    expect(listRegisteredSchemaNames()).toEqual([
      ...registeredModuleSchemas.map((schema) => schema.name),
      "sample",
    ])
  })

  it("resolves shared registered schemas and keeps sample as an explicit extra", () => {
    expect(getRegisteredSchema("product")).toBe(productModuleSchema)
    expect(getRegisteredSchema("sample")).toBe(sampleModuleSchema)
    expect(getRegisteredSchema("missing")).toBeNull()
  })
})
