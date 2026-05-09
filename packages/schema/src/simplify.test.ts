import { describe, expect, it } from "bun:test"

import type { ModuleSchema } from "./index"
import { expandSimplifiedSchema } from "./simplify"

describe("expandSimplifiedSchema", () => {
  it("expands minimal schema with auto-id and auto-label", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [
        { key: "name", kind: "string" },
        { key: "status", kind: "enum", options: ["active", "inactive"] },
      ],
    })

    expect(result.name).toBe("supplier")
    expect(result.label).toBe("Supplier")
    expect(result.fields[0]).toEqual({
      key: "id",
      label: "ID",
      kind: "id",
      required: true,
    })
    expect(result.fields[1]).toEqual({
      key: "name",
      label: "Name",
      kind: "string",
    })
    expect(result.fields[2]?.key).toBe("status")
    expect(result.fields[2]?.options).toEqual([
      { label: "active", value: "active" },
      { label: "inactive", value: "inactive" },
    ])
  })

  it("preserves explicit label and required", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [
        { key: "name", kind: "string", label: "供应商名称", required: true },
      ],
    })

    expect(result.fields[1]?.label).toBe("供应商名称")
    expect(result.fields[1]?.required).toBe(true)
  })

  it("generates frontend metadata from name when not provided", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [{ key: "name", kind: "string" }],
    })

    expect(result.frontend).toEqual({
      workspaceDomain: "business",
      routePath: "/business/supplier",
      permissionPrefix: "business:supplier",
      moduleCode: "supplier",
      workspaceKind: "standard-crud",
      permissionActions: {
        list: true,
        create: true,
        update: true,
        delete: true,
        export: true,
      },
    })
  })

  it("accepts full ModuleSchema as-is", () => {
    const full: ModuleSchema = {
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "name", label: "Name", kind: "string" },
      ],
      frontend: {
        workspaceDomain: "system" as const,
        routePath: "/system/supplier",
        permissionPrefix: "system:supplier",
        moduleCode: "supplier",
        workspaceKind: "standard-crud",
      },
    }

    const result = expandSimplifiedSchema(full)
    expect(result).toEqual(full)
  })

  it("throws on missing name", () => {
    expect(() => expandSimplifiedSchema({ fields: [] } as unknown)).toThrow(
      /name/,
    )
  })

  it("throws on empty fields", () => {
    expect(() => expandSimplifiedSchema({ name: "test", fields: [] })).toThrow(
      /fields/,
    )
  })
})
