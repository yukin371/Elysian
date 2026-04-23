import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { writeModuleFiles } from "@elysian/generator"
import { customerModuleSchema } from "@elysian/schema"

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const verifyManagedOverwrite = async (rootDir: string) => {
  const outputDir = join(rootDir, "managed-overwrite")

  await writeModuleFiles(customerModuleSchema, {
    outputDir,
    frontendTarget: "vue",
  })

  const secondRun = await writeModuleFiles(customerModuleSchema, {
    outputDir,
    frontendTarget: "vue",
    conflictStrategy: "overwrite-generated-only",
  })

  assert(
    secondRun.every((item) => item.written),
    "Expected overwrite-generated-only to rewrite managed files",
  )
}

const verifyUnmanagedRefusal = async (rootDir: string) => {
  const outputDir = join(rootDir, "unmanaged-refusal")
  const unmanagedPath = join(outputDir, "modules/customer/customer.schema.ts")

  await mkdir(dirname(unmanagedPath), { recursive: true })
  await writeFile(unmanagedPath, "export const manual = true\n", "utf8")

  let failedAsExpected = false

  try {
    await writeModuleFiles(customerModuleSchema, {
      outputDir,
      frontendTarget: "vue",
      conflictStrategy: "overwrite-generated-only",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failedAsExpected = message.includes("Refusing to overwrite unmanaged file")
  }

  assert(
    failedAsExpected,
    "Expected overwrite-generated-only to refuse unmanaged files",
  )
}

const verifySkipPreservesManualFile = async (rootDir: string) => {
  const outputDir = join(rootDir, "skip-preserve")
  const manualPath = join(outputDir, "modules/customer/customer.schema.ts")
  const manualContent = "export const manual = true\n"

  await mkdir(dirname(manualPath), { recursive: true })
  await writeFile(manualPath, manualContent, "utf8")

  const result = await writeModuleFiles(customerModuleSchema, {
    outputDir,
    frontendTarget: "vue",
    conflictStrategy: "skip",
  })
  const schemaEntry = result.find(
    (item) => item.path === "modules/customer/customer.schema.ts",
  )
  const contentAfterRun = await readFile(manualPath, "utf8")

  assert(
    schemaEntry?.written === false,
    "Expected skip strategy to skip conflicts",
  )
  assert(
    contentAfterRun === manualContent,
    "Expected skip strategy to preserve manual file contents",
  )
}

const run = async () => {
  const workspace = await mkdtemp(
    join(tmpdir(), "elysian-generator-safe-apply-"),
  )

  try {
    await verifyManagedOverwrite(workspace)
    await verifyUnmanagedRefusal(workspace)
    await verifySkipPreservesManualFile(workspace)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
}

try {
  await run()
  console.log("[e2e-generator-safe-apply] passed")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-safe-apply] failed: ${message}`)
  process.exitCode = 1
}
