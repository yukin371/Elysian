import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import {
  type GeneratorReportBase,
  createGeneratorReportRuntimeMetadata,
  resolveGeneratorReportDir,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

interface CommandResult {
  code: number
  stdout: string
  stderr: string
}

interface CliCheckResult {
  name: string
  status: "passed" | "failed"
  message?: string
}

interface CliReport extends GeneratorReportBase {
  checks: CliCheckResult[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const writeReport = async (report: CliReport) => {
  const reportDir = resolveGeneratorReportDir()
  const reportPath = join(reportDir, "e2e-generator-cli-report.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  return reportPath
}

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

const runGeneratorCli = async (
  args: string[],
  cwd: string,
): Promise<CommandResult> => {
  const process = Bun.spawn(
    ["bun", "--filter", "@elysian/generator", "generate", ...args],
    {
      cwd,
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

const run = async (): Promise<CliCheckResult[]> => {
  const workspace = await mkdtemp(join(tmpdir(), "elysian-generator-cli-"))
  const checks: CliCheckResult[] = []

  const recordCheck = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn()
      checks.push({ name, status: "passed" })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      checks.push({ name, status: "failed", message })
    }
  }

  try {
    const managedDir = join(workspace, "managed")
    const unmanagedDir = join(workspace, "unmanaged")

    await recordCheck("initial generate writes managed files", async () => {
      const firstRun = await runGeneratorCli(
        ["--schema", "customer", "--out", managedDir, "--frontend", "vue"],
        process.cwd(),
      )
      assert(
        firstRun.code === 0,
        `Expected first run success, got ${firstRun.code}`,
      )
      assert(
        firstRun.stdout.includes("[generator] written"),
        "Expected first run to report written files",
      )
    })

    await recordCheck("fail strategy rejects existing files", async () => {
      const failRun = await runGeneratorCli(
        [
          "--schema",
          "customer",
          "--out",
          managedDir,
          "--frontend",
          "vue",
          "--conflict",
          "fail",
        ],
        process.cwd(),
      )
      assert(
        failRun.code !== 0,
        "Expected fail strategy to reject existing files in CLI mode",
      )
      const failOutput = `${failRun.stdout}\n${failRun.stderr}`
      assert(
        failOutput.includes("Refusing to overwrite existing file"),
        "Expected fail strategy error output",
      )
    })

    await recordCheck(
      "overwrite-generated-only accepts managed files without temp residue",
      async () => {
        const overwriteGeneratedRun = await runGeneratorCli(
          [
            "--schema",
            "customer",
            "--out",
            managedDir,
            "--frontend",
            "vue",
            "--conflict",
            "overwrite-generated-only",
          ],
          process.cwd(),
        )
        assert(
          overwriteGeneratedRun.code === 0,
          "Expected overwrite-generated-only to pass on managed files",
        )
        assert(
          (await findTempFiles(managedDir)).length === 0,
          "Expected no temporary files after managed overwrite run",
        )
      },
    )

    await recordCheck(
      "overwrite-generated-only rejects unmanaged files without temp residue",
      async () => {
        const unmanagedPath = join(
          unmanagedDir,
          "modules/customer/customer.schema.ts",
        )
        await mkdir(dirname(unmanagedPath), { recursive: true })
        await writeFile(unmanagedPath, "export const manual = true\n", "utf8")

        const unmanagedOverwriteRun = await runGeneratorCli(
          [
            "--schema",
            "customer",
            "--out",
            unmanagedDir,
            "--frontend",
            "vue",
            "--conflict",
            "overwrite-generated-only",
          ],
          process.cwd(),
        )
        assert(
          unmanagedOverwriteRun.code !== 0,
          "Expected overwrite-generated-only to reject unmanaged files in CLI mode",
        )
        const unmanagedOutput = `${unmanagedOverwriteRun.stdout}\n${unmanagedOverwriteRun.stderr}`
        assert(
          unmanagedOutput.includes("Refusing to overwrite unmanaged file"),
          "Expected unmanaged overwrite rejection message",
        )
        assert(
          (await findTempFiles(unmanagedDir)).length === 0,
          "Expected no temporary files after unmanaged rejection run",
        )
      },
    )

    await recordCheck(
      "schema-file handoff generates inline schema artifacts",
      async () => {
        const schemaFileRun = await runGeneratorCli(
          [
            "--schema-file",
            "./docs/ai-playbooks/examples/supplier.module-schema.json",
            "--out",
            join(workspace, "schema-file-output"),
            "--frontend",
            "vue",
          ],
          process.cwd(),
        )
        assert(
          schemaFileRun.code === 0,
          `Expected schema-file handoff success, got ${schemaFileRun.code}`,
        )

        const generatedSchemaPath = join(
          workspace,
          "schema-file-output",
          "modules/supplier/supplier.schema.ts",
        )
        const generatedSchema = await Bun.file(generatedSchemaPath).text()

        assert(
          generatedSchema.includes(
            "export const supplierModuleSchema: ModuleSchema = {",
          ),
          "Expected external schema handoff to inline the schema artifact",
        )
        assert(
          !generatedSchema.includes(
            'import { supplierModuleSchema } from "@elysian/schema"',
          ),
          "Expected external schema handoff to avoid package import references",
        )
      },
    )
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }

  return checks
}

const startedTimestamp = Date.now()
const startedAt = new Date(startedTimestamp).toISOString()

try {
  const checks = await run()
  const passedCount = checks.filter((item) => item.status === "passed").length
  const failedCount = checks.length - passedCount
  const status: "passed" | "failed" = failedCount === 0 ? "passed" : "failed"
  const reportPath = await writeReport({
    gitSha: resolveGeneratorReportGitSha(),
    runtime: createGeneratorReportRuntimeMetadata(),
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startedTimestamp,
    status,
    passedCount,
    failedCount,
    checks,
  })

  console.log(`[e2e-generator-cli] report: ${reportPath}`)
  if (failedCount === 0) {
    console.log("[e2e-generator-cli] passed")
  } else {
    for (const check of checks) {
      if (check.status === "failed") {
        console.error(`[cli] fail ${check.name}: ${check.message}`)
      }
    }
    console.error(
      `[e2e-generator-cli] failed: ${failedCount} cli check(s) failed`,
    )
    process.exitCode = 1
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  const reportPath = await writeReport({
    gitSha: resolveGeneratorReportGitSha(),
    runtime: createGeneratorReportRuntimeMetadata(),
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startedTimestamp,
    status: "failed",
    passedCount: 0,
    failedCount: 1,
    checks: [],
    errorMessage: message,
  })

  console.error(`[e2e-generator-cli] report: ${reportPath}`)
  console.error(`[e2e-generator-cli] failed: ${message}`)
  process.exitCode = 1
}
