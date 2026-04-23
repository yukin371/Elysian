import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  type FrontendTarget,
  type WriteConflictStrategy,
  getRegisteredSchema,
  listRegisteredSchemaNames,
  writeModuleFiles,
} from "@elysian/generator"
import {
  type GeneratorReportBase,
  createGeneratorReportRuntimeMetadata,
  resolveGeneratorReportDir,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

interface GenerationSnapshot {
  files: Record<string, string>
}

interface MatrixCaseResult {
  schemaName: string
  frontendTarget: FrontendTarget
  status: "passed" | "failed"
  message?: string
}

interface MatrixReport extends GeneratorReportBase {
  cases: MatrixCaseResult[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const writeReport = async (report: MatrixReport) => {
  const reportDir = resolveGeneratorReportDir()
  const reportPath = join(reportDir, "e2e-generator-matrix-report.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  return reportPath
}

const readSnapshot = async (
  outputDir: string,
  relativePaths: string[],
): Promise<GenerationSnapshot> => {
  const files = await Promise.all(
    relativePaths.map(async (relativePath) => ({
      relativePath,
      contents: await readFile(join(outputDir, relativePath), "utf8"),
    })),
  )

  return {
    files: Object.fromEntries(
      files.map((file) => [file.relativePath, file.contents]),
    ),
  }
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

const readManifestRaw = async (
  outputDir: string,
  schemaName: string,
  frontendTarget: FrontendTarget,
) =>
  readFile(
    join(
      outputDir,
      ".elysian-generator",
      `${schemaName}.${frontendTarget}.json`,
    ),
    "utf8",
  )

const assertManifestMatches = async (
  outputDir: string,
  schemaName: string,
  frontendTarget: FrontendTarget,
  conflictStrategy: WriteConflictStrategy,
  expectedFilePaths: string[],
) => {
  const manifestPath = join(
    outputDir,
    ".elysian-generator",
    `${schemaName}.${frontendTarget}.json`,
  )
  const manifestRaw = await readFile(manifestPath, "utf8")
  const manifest = JSON.parse(manifestRaw) as {
    schemaName: string
    frontendTarget: FrontendTarget
    conflictStrategy: WriteConflictStrategy
    files: Array<{ path: string }>
  }

  assert(
    manifest.schemaName === schemaName,
    `Expected manifest schemaName=${schemaName}, got ${manifest.schemaName}`,
  )
  assert(
    manifest.frontendTarget === frontendTarget,
    `Expected manifest frontendTarget=${frontendTarget}, got ${manifest.frontendTarget}`,
  )
  assert(
    manifest.conflictStrategy === conflictStrategy,
    `Expected manifest conflictStrategy=${conflictStrategy}, got ${manifest.conflictStrategy}`,
  )
  assert(
    manifest.files.length === expectedFilePaths.length,
    `Expected manifest file count=${expectedFilePaths.length}, got ${manifest.files.length}`,
  )

  const manifestPaths = new Set(manifest.files.map((file) => file.path))
  for (const expectedPath of expectedFilePaths) {
    assert(
      manifestPaths.has(expectedPath),
      `Expected manifest to include path=${expectedPath}`,
    )
  }
}

const runCase = async (schemaName: string, frontendTarget: FrontendTarget) => {
  const schema = getRegisteredSchema(schemaName)
  assert(schema, `Schema is not registered: ${schemaName}`)

  const outputDir = await mkdtemp(
    join(tmpdir(), `elysian-generator-matrix-${schemaName}-${frontendTarget}-`),
  )

  try {
    const firstRun = await writeModuleFiles(schema, {
      outputDir,
      frontendTarget,
      conflictStrategy: "skip",
    })
    const expectedPaths = firstRun.map((item) => item.path)
    assert(
      firstRun.length > 0 && firstRun.every((item) => item.written),
      `[${schemaName}/${frontendTarget}] first run should write all files`,
    )
    await assertManifestMatches(
      outputDir,
      schemaName,
      frontendTarget,
      "skip",
      expectedPaths,
    )

    const overwriteRunA = await writeModuleFiles(schema, {
      outputDir,
      frontendTarget,
      conflictStrategy: "overwrite-generated-only",
    })
    assert(
      overwriteRunA.every((item) => item.written),
      `[${schemaName}/${frontendTarget}] overwrite-generated-only should overwrite managed files`,
    )
    await assertManifestMatches(
      outputDir,
      schemaName,
      frontendTarget,
      "overwrite-generated-only",
      expectedPaths,
    )
    const snapshotA = await readSnapshot(outputDir, expectedPaths)

    const overwriteRunB = await writeModuleFiles(schema, {
      outputDir,
      frontendTarget,
      conflictStrategy: "overwrite-generated-only",
    })
    assert(
      overwriteRunB.every((item) => item.written),
      `[${schemaName}/${frontendTarget}] second overwrite-generated-only should still overwrite all files`,
    )
    const snapshotB = await readSnapshot(outputDir, expectedPaths)
    assert(
      JSON.stringify(snapshotA.files) === JSON.stringify(snapshotB.files),
      `[${schemaName}/${frontendTarget}] repeated overwrite-generated-only should be deterministic`,
    )

    const skipRun = await writeModuleFiles(schema, {
      outputDir,
      frontendTarget,
      conflictStrategy: "skip",
    })
    assert(
      skipRun.every((item) => item.written === false),
      `[${schemaName}/${frontendTarget}] skip should not overwrite existing files`,
    )
    await assertManifestMatches(
      outputDir,
      schemaName,
      frontendTarget,
      "skip",
      expectedPaths,
    )

    const beforeFailManifest = await readManifestRaw(
      outputDir,
      schemaName,
      frontendTarget,
    )

    let failAsExpected = false
    try {
      await writeModuleFiles(schema, {
        outputDir,
        frontendTarget,
        conflictStrategy: "fail",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failAsExpected = message.includes("Refusing to overwrite existing file")
    }
    assert(
      failAsExpected,
      `[${schemaName}/${frontendTarget}] fail strategy should reject existing files`,
    )

    const afterFailManifest = await readManifestRaw(
      outputDir,
      schemaName,
      frontendTarget,
    )
    assert(
      beforeFailManifest === afterFailManifest,
      `[${schemaName}/${frontendTarget}] fail strategy should not mutate manifest`,
    )

    const [concurrentRunA, concurrentRunB] = await Promise.all([
      writeModuleFiles(schema, {
        outputDir,
        frontendTarget,
        conflictStrategy: "overwrite-generated-only",
      }),
      writeModuleFiles(schema, {
        outputDir,
        frontendTarget,
        conflictStrategy: "overwrite-generated-only",
      }),
    ])

    assert(
      concurrentRunA.every((item) => item.written) &&
        concurrentRunB.every((item) => item.written),
      `[${schemaName}/${frontendTarget}] concurrent overwrite-generated-only should keep managed writes successful`,
    )

    const concurrentSnapshot = await readSnapshot(outputDir, expectedPaths)
    assert(
      JSON.stringify(snapshotB.files) ===
        JSON.stringify(concurrentSnapshot.files),
      `[${schemaName}/${frontendTarget}] concurrent overwrite-generated-only should remain deterministic`,
    )

    const tempFiles = await findTempFiles(outputDir)
    assert(
      tempFiles.length === 0,
      `[${schemaName}/${frontendTarget}] should not leave temporary files: ${tempFiles.join(", ")}`,
    )
  } finally {
    await rm(outputDir, { recursive: true, force: true })
  }
}

const run = async (): Promise<{
  passedCount: number
  failedCount: number
  results: MatrixCaseResult[]
}> => {
  const schemaNames = listRegisteredSchemaNames()
  const frontendTargets: FrontendTarget[] = ["vue", "react"]
  const results: MatrixCaseResult[] = []

  for (const schemaName of schemaNames) {
    for (const frontendTarget of frontendTargets) {
      try {
        await runCase(schemaName, frontendTarget)
        results.push({
          schemaName,
          frontendTarget,
          status: "passed",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        results.push({
          schemaName,
          frontendTarget,
          status: "failed",
          message,
        })
      }
    }
  }

  const passedCount = results.filter((item) => item.status === "passed").length
  const failedResults = results.filter((item) => item.status === "failed")

  console.log(
    `[e2e-generator-regression-matrix] summary: passed=${passedCount} failed=${failedResults.length}`,
  )
  for (const result of results) {
    const id = `${result.schemaName}/${result.frontendTarget}`
    if (result.status === "passed") {
      console.log(`[matrix] pass ${id}`)
      continue
    }

    console.error(`[matrix] fail ${id}: ${result.message}`)
  }

  return {
    passedCount,
    failedCount: failedResults.length,
    results,
  }
}

const startedTimestamp = Date.now()
const startedAt = new Date(startedTimestamp).toISOString()

try {
  const { passedCount, failedCount, results } = await run()
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
    cases: results,
  })

  console.log(`[e2e-generator-regression-matrix] report: ${reportPath}`)
  if (failedCount === 0) {
    console.log("[e2e-generator-regression-matrix] passed")
  } else {
    console.error(
      `[e2e-generator-regression-matrix] failed: ${failedCount} matrix case(s) failed`,
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
    cases: [],
    errorMessage: message,
  })
  console.error(`[e2e-generator-regression-matrix] report: ${reportPath}`)
  console.error(`[e2e-generator-regression-matrix] failed: ${message}`)
  process.exitCode = 1
}
