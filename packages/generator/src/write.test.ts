import { describe, expect, it } from "bun:test"
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { customerModuleSchema } from "@elysian/schema"

import { writeModuleFiles } from "./write"

const findTempFiles = async (
  directory: string,
  relativePath = "",
): Promise<string[]> => {
  const currentPath = relativePath ? join(directory, relativePath) : directory
  const entries = await readdir(currentPath, { withFileTypes: true })
  const result: string[] = []

  for (const entry of entries) {
    const entryRelativePath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name

    if (entry.isDirectory()) {
      result.push(...(await findTempFiles(directory, entryRelativePath)))
      continue
    }

    if (entry.name.includes(".tmp-")) {
      result.push(entryRelativePath)
    }
  }

  return result
}

describe("writeModuleFiles", () => {
  it("writes generated customer files to disk", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const results = await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    expect(results).toHaveLength(5)
    expect(results.every((item) => item.written)).toBe(true)

    const schemaFile = await readFile(
      join(directory, "modules/customer/customer.schema.ts"),
      "utf8",
    )
    const manifestFile = await readFile(
      join(directory, ".elysian-generator/customer.vue.json"),
      "utf8",
    )

    expect(schemaFile).toContain("customerModuleSchema")
    expect(manifestFile).toContain('"schemaName": "customer"')
    expect(manifestFile).toContain('"targetPreset": "custom"')
  })

  it("does not overwrite existing files by default", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))

    await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    const secondRun = await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    expect(secondRun.every((item) => item.written === false)).toBe(true)
  })

  it("does not leave temporary files after successful writes", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))

    await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
      conflictStrategy: "overwrite",
    })

    const tempFiles = await findTempFiles(directory)

    expect(tempFiles).toEqual([])
  })

  it("fails on existing files when conflict strategy is fail", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))

    await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "fail",
      }),
    ).toThrow("Refusing to overwrite existing file")
  })

  it("fails on existing empty files when conflict strategy is fail", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const existingPath = join(directory, "modules/customer/customer.schema.ts")

    await mkdir(dirname(existingPath), { recursive: true })
    await writeFile(existingPath, "", "utf8")

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "fail",
      }),
    ).toThrow("Refusing to overwrite existing file")
  })

  it("does not partially write files when fail strategy encounters conflicts", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const conflictPath = join(directory, "modules/customer/customer.routes.ts")
    const preConflictPath = join(
      directory,
      "modules/customer/customer.schema.ts",
    )

    await mkdir(dirname(conflictPath), { recursive: true })
    await writeFile(conflictPath, "export const custom = true\n", "utf8")

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "fail",
      }),
    ).toThrow("Refusing to overwrite existing file")

    await expect(stat(preConflictPath)).rejects.toThrow()
  })

  it("overwrites generated files with overwrite-generated-only strategy", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))

    await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    const secondRun = await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
      conflictStrategy: "overwrite-generated-only",
    })

    expect(secondRun.every((item) => item.written)).toBe(true)
  })

  it("supports concurrent overwrite-generated-only runs on managed files", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))

    await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    const [runA, runB] = await Promise.all([
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "overwrite-generated-only",
      }),
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "overwrite-generated-only",
      }),
    ])

    expect(runA.every((item) => item.written)).toBe(true)
    expect(runB.every((item) => item.written)).toBe(true)
    expect(await findTempFiles(directory)).toEqual([])
  })

  it("refuses to overwrite unmanaged files with overwrite-generated-only strategy", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const unmanagedPath = join(directory, "modules/customer/customer.schema.ts")

    await mkdir(dirname(unmanagedPath), { recursive: true })
    await writeFile(unmanagedPath, "export const custom = true\n", "utf8")

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "overwrite-generated-only",
      }),
    ).toThrow("Refusing to overwrite unmanaged file")
  })

  it("refuses to overwrite unmanaged empty files with overwrite-generated-only strategy", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const unmanagedPath = join(directory, "modules/customer/customer.schema.ts")

    await mkdir(dirname(unmanagedPath), { recursive: true })
    await writeFile(unmanagedPath, "", "utf8")

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "overwrite-generated-only",
      }),
    ).toThrow("Refusing to overwrite unmanaged file")
  })

  it("does not partially write files when overwrite-generated-only strategy encounters unmanaged conflicts", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const conflictPath = join(directory, "modules/customer/customer.routes.ts")
    const preConflictPath = join(
      directory,
      "modules/customer/customer.schema.ts",
    )

    await mkdir(dirname(conflictPath), { recursive: true })
    await writeFile(conflictPath, "export const custom = true\n", "utf8")

    await expect(() =>
      writeModuleFiles(customerModuleSchema, {
        outputDir: directory,
        frontendTarget: "vue",
        conflictStrategy: "overwrite-generated-only",
      }),
    ).toThrow("Refusing to overwrite unmanaged file")

    await expect(stat(preConflictPath)).rejects.toThrow()
    expect(await findTempFiles(directory)).toEqual([])
  })

  it("skips existing empty files with default skip strategy", async () => {
    const directory = await mkdtemp(join(tmpdir(), "elysian-generator-"))
    const existingPath = join(directory, "modules/customer/customer.schema.ts")

    await mkdir(dirname(existingPath), { recursive: true })
    await writeFile(existingPath, "", "utf8")

    const result = await writeModuleFiles(customerModuleSchema, {
      outputDir: directory,
      frontendTarget: "vue",
    })

    const schemaEntry = result.find(
      (item) => item.path === "modules/customer/customer.schema.ts",
    )
    const schemaFile = await readFile(existingPath, "utf8")

    expect(schemaEntry?.written).toBe(false)
    expect(schemaFile).toBe("")
  })
})
