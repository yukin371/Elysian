import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { renderModuleFiles, writeModuleFiles } from "@elysian/generator"
import { customerModuleSchema } from "@elysian/schema"

interface CommandResult {
  code: number
  stderr: string
  stdout: string
}

const REPO_ROOT = resolve(import.meta.dir, "..")

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const runGeneratorCli = async (args: string[]): Promise<CommandResult> => {
  const process = Bun.spawn(
    ["bun", "--filter", "@elysian/generator", "generate", ...args],
    {
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const code = await process.exited
  const stdout = await new Response(process.stdout).text()
  const stderr = await new Response(process.stderr).text()

  return {
    code,
    stdout,
    stderr,
  }
}

const run = async () => {
  const previewResult = await runGeneratorCli([
    "--schema",
    "customer",
    "--target",
    "module",
    "--frontend",
    "vue",
    "--preview",
  ])

  assert(
    previewResult.code === 0,
    `module target preview failed:\n${previewResult.stdout}\n${previewResult.stderr}`,
  )
  assert(
    previewResult.stdout.includes("customer/customer.module.ts"),
    "Expected module target preview to include customer.module.ts.",
  )
  assert(
    previewResult.stdout.includes("Integration Checklist:"),
    "Expected module target preview to print the integration checklist.",
  )
  assert(
    previewResult.stdout.includes(
      "apps/server/src/modules/customer/customer.module.ts",
    ),
    "Expected checklist to reference the server module stub path.",
  )

  const outputDir = await mkdtemp(join(tmpdir(), "elysian-generator-module-"))

  try {
    const writtenFiles = await writeModuleFiles(customerModuleSchema, {
      outputDir,
      frontendTarget: "vue",
      targetPreset: "module",
    })
    const moduleEntry = writtenFiles.find(
      (file) => file.path === "customer/customer.module.ts",
    )

    assert(
      moduleEntry?.written === true,
      "Expected module target write to create customer/customer.module.ts.",
    )

    const moduleFile = await readFile(
      join(outputDir, "customer/customer.module.ts"),
      "utf8",
    )

    assert(
      moduleFile.includes("createCustomerModule"),
      "Expected module target output to include createCustomerModule.",
    )
    assert(
      moduleFile.includes("createCustomerRepository"),
      "Expected module target output to include createCustomerRepository.",
    )
    assert(
      moduleFile.includes("// TODO:"),
      "Expected module target output to keep TODO markers for manual follow-up.",
    )

    const stagingFiles = renderModuleFiles(customerModuleSchema, {
      frontendTarget: "vue",
    })
    const moduleFiles = renderModuleFiles(customerModuleSchema, {
      frontendTarget: "vue",
      targetPreset: "module",
    })

    assert(
      stagingFiles.every((file) => file.path.startsWith("modules/customer/")),
      "Expected staging target paths to remain under modules/customer/.",
    )
    assert(
      stagingFiles.every((file) => !file.path.endsWith(".module.ts")),
      "Expected staging target to remain unchanged and omit module stubs.",
    )
    assert(
      moduleFiles.some((file) => file.path === "customer/customer.module.ts"),
      "Expected module target render to include customer/customer.module.ts.",
    )

    console.log("[e2e-generator-module-target-smoke] passed")
  } finally {
    await rm(outputDir, { force: true, recursive: true })
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-module-target-smoke] failed: ${message}`)
  process.exitCode = 1
})
