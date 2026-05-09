import { describe, expect, it } from "bun:test"

import { parseCliArgs } from "./cli-args"
import { resolveTargetPresetOutputDir } from "./conventions"

describe("parseCliArgs", () => {
  it("parses overwrite-generated-only conflict strategy", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "staging",
      "--frontend",
      "vue",
      "--conflict",
      "overwrite-generated-only",
    ])

    expect(result).toEqual({
      schemaName: "customer",
      outputDir: resolveTargetPresetOutputDir("staging"),
      targetPreset: "staging",
      frontendTarget: "vue",
      conflictStrategy: "overwrite-generated-only",
      preview: false,
    })
  })

  it("accepts module target preset", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "module",
      "--frontend",
      "vue",
    ])

    expect(result).toEqual({
      schemaName: "customer",
      outputDir: resolveTargetPresetOutputDir("module"),
      targetPreset: "module",
      frontendTarget: "vue",
      conflictStrategy: "skip",
      preview: false,
    })
  })

  it("keeps custom output dir and parses frontend target", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--out",
      "./custom/generated",
      "--frontend",
      "react",
    ])

    expect(result).toEqual({
      schemaName: "customer",
      outputDir: "./custom/generated",
      targetPreset: "custom",
      frontendTarget: "react",
      conflictStrategy: "skip",
      preview: false,
    })
  })

  it("parses schema-file handoff input", () => {
    const result = parseCliArgs([
      "--schema-file",
      "./docs/ai-playbooks/examples/supplier.module-schema.json",
      "--target",
      "staging",
    ])

    expect(result).toEqual({
      schemaFilePath:
        "./docs/ai-playbooks/examples/supplier.module-schema.json",
      outputDir: resolveTargetPresetOutputDir("staging"),
      targetPreset: "staging",
      frontendTarget: "vue",
      conflictStrategy: "skip",
      preview: false,
    })
  })

  it("parses preview mode with a report path", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "staging",
      "--preview",
      "--report",
      "./generated/reports/customer.preview.json",
    ])

    expect(result).toEqual({
      schemaName: "customer",
      outputDir: resolveTargetPresetOutputDir("staging"),
      targetPreset: "staging",
      frontendTarget: "vue",
      conflictStrategy: "skip",
      preview: true,
      reportPath: "./generated/reports/customer.preview.json",
    })
  })

  it("parses init mode without schema input", () => {
    const result = parseCliArgs(["--init", "product"])

    expect(result).toEqual({
      initModule: "product",
      outputDir: resolveTargetPresetOutputDir("staging"),
      targetPreset: "staging",
      frontendTarget: "vue",
      conflictStrategy: "skip",
      preview: false,
    })
  })

  it("parses list-schemas mode without schema input", () => {
    const result = parseCliArgs(["--list-schemas"])

    expect(result).toEqual({
      listSchemas: true,
      outputDir: resolveTargetPresetOutputDir("staging"),
      targetPreset: "staging",
      frontendTarget: "vue",
      conflictStrategy: "skip",
      preview: false,
    })
  })

  it("lets --conflict override --overwrite shortcut", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "staging",
      "--overwrite",
      "--conflict",
      "fail",
    ])

    expect(result?.conflictStrategy).toBe("fail")
  })

  it("returns null on invalid conflict strategy", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "staging",
      "--conflict",
      "invalid",
    ])

    expect(result).toBeNull()
  })

  it("returns null when schema is missing", () => {
    const result = parseCliArgs(["--target", "staging"])

    expect(result).toBeNull()
  })

  it("returns null when schema and schema-file are both provided", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--schema-file",
      "./schema.json",
      "--target",
      "staging",
    ])

    expect(result).toBeNull()
  })

  it("returns null when init is mixed with schema input", () => {
    const result = parseCliArgs([
      "--init",
      "product",
      "--schema",
      "customer",
      "--target",
      "staging",
    ])

    expect(result).toBeNull()
  })

  it("returns null when report is provided without preview", () => {
    const result = parseCliArgs([
      "--schema",
      "customer",
      "--target",
      "staging",
      "--report",
      "./generated/reports/customer.preview.json",
    ])

    expect(result).toBeNull()
  })
})
