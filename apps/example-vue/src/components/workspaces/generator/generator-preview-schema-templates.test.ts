import { describe, expect, it } from "bun:test"

import {
  getSchemaTemplate,
  listSchemaTemplateIds,
} from "./generator-preview-schema-templates"

describe("schema templates", () => {
  it("lists available template ids", () => {
    const ids = listSchemaTemplateIds()

    expect(ids.length).toBeGreaterThanOrEqual(3)
    expect(ids).toContain("simple-crud")
    expect(ids).toContain("with-status")
    expect(ids).toContain("with-dictionary")
  })

  it("returns valid simplified schema for each template", () => {
    for (const id of listSchemaTemplateIds()) {
      const template = getSchemaTemplate(id)

      expect(template).toContain('"name"')
      expect(template).toContain('"fields"')
      expect(template).toContain('"kind"')
    }
  })

  it("simple-crud template has name and description fields", () => {
    const template = JSON.parse(getSchemaTemplate("simple-crud")) as {
      fields: Array<{ key: string }>
    }

    expect(template.fields.some((field) => field.key === "name")).toBe(true)
  })

  it("with-status template has enum status field", () => {
    const template = JSON.parse(getSchemaTemplate("with-status")) as {
      fields: Array<{ key: string; kind: string; options?: string[] }>
    }
    const statusField = template.fields.find((field) => field.key === "status")

    expect(statusField).toBeDefined()
    expect(statusField?.kind).toBe("enum")
    expect(statusField?.options?.length ?? 0).toBeGreaterThan(0)
  })

  it("with-dictionary template has dictionaryTypeCode", () => {
    const template = JSON.parse(getSchemaTemplate("with-dictionary")) as {
      fields: Array<{ dictionaryTypeCode?: string }>
    }
    const dictionaryField = template.fields.find(
      (field) => field.dictionaryTypeCode !== undefined,
    )

    expect(dictionaryField).toBeDefined()
  })
})
