import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

interface SmokeStabilitySnapshot {
  generatedAt: string
  githubRunId: string | null
}

interface SmokeStabilityCollectItem {
  sourcePath: string
  outputPath: string
  runKey: string
}

interface SmokeStabilityCollectReport {
  generatedAt: string
  inputDir: string
  outputDir: string
  totalCollected: number
  items: SmokeStabilityCollectItem[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveInputDir = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_COLLECT_INPUT_DIR ??
  join(process.cwd(), "artifacts", "downloads")

const resolveOutputDir = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR ??
  join(process.cwd(), "artifacts", "smoke")

const findSnapshotFilesRecursively = async (
  rootDir: string,
  relativePath = "",
): Promise<string[]> => {
  const currentPath = relativePath ? join(rootDir, relativePath) : rootDir
  const entries = await readdir(currentPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryRelativePath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name

    if (entry.isDirectory()) {
      files.push(
        ...(await findSnapshotFilesRecursively(rootDir, entryRelativePath)),
      )
      continue
    }

    if (entry.name === "e2e-smoke-stability-snapshot.json") {
      files.push(entryRelativePath)
    }
  }

  return files
}

const readSnapshot = async (
  inputDir: string,
  relativePath: string,
): Promise<SmokeStabilitySnapshot> => {
  const raw = await readFile(join(inputDir, relativePath), "utf8")
  const parsed = JSON.parse(raw) as Partial<SmokeStabilitySnapshot>
  assert(
    typeof parsed.generatedAt === "string",
    `Invalid generatedAt: ${relativePath}`,
  )
  return {
    generatedAt: parsed.generatedAt,
    githubRunId: parsed.githubRunId ?? null,
  }
}

export const run = async () => {
  const inputDir = resolveInputDir()
  const outputDir = resolveOutputDir()
  const snapshotFiles = await findSnapshotFilesRecursively(inputDir)
  assert(
    snapshotFiles.length > 0,
    `No stability snapshot found under ${inputDir}`,
  )

  const runKeyCounts = new Map<string, number>()
  const items: SmokeStabilityCollectItem[] = []

  for (const relativePath of snapshotFiles) {
    const snapshot = await readSnapshot(inputDir, relativePath)
    const runBaseKey = snapshot.githubRunId
      ? `run-${snapshot.githubRunId}`
      : `ts-${snapshot.generatedAt.replace(/[:.]/g, "-")}`
    const count = (runKeyCounts.get(runBaseKey) ?? 0) + 1
    runKeyCounts.set(runBaseKey, count)
    const runKey = count === 1 ? runBaseKey : `${runBaseKey}-${count}`
    const targetDir = join(outputDir, runKey)
    const targetPath = join(targetDir, "e2e-smoke-stability-snapshot.json")

    await mkdir(targetDir, { recursive: true })
    await copyFile(join(inputDir, relativePath), targetPath)
    items.push({
      sourcePath: relativePath,
      outputPath: targetPath,
      runKey,
    })
  }

  const report: SmokeStabilityCollectReport = {
    generatedAt: new Date().toISOString(),
    inputDir,
    outputDir,
    totalCollected: items.length,
    items,
  }
  const reportPath = join(outputDir, "e2e-smoke-stability-collect-report.json")
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  console.log(`[e2e-smoke-stability-collect] report: ${reportPath}`)
  console.log(`[e2e-smoke-stability-collect] totalCollected=${items.length}`)
  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-stability-collect] failed: ${message}`)
    process.exitCode = 1
  }
}
