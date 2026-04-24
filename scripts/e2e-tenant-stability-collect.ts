import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

interface TenantStabilitySnapshot {
  generatedAt: string
  githubRunId: string | null
}

interface TenantStabilityCollectItem {
  sourcePath: string
  outputPath: string
  runKey: string
}

interface TenantStabilityCollectReport {
  generatedAt: string
  inputDir: string
  outputDir: string
  totalCollected: number
  items: TenantStabilityCollectItem[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value : null
}

const resolveInputDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR") ??
  join(process.cwd(), "artifacts", "downloads")

const resolveOutputDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR") ??
  join(process.cwd(), "artifacts", "tenant")

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

    if (entry.name === "e2e-tenant-stability-snapshot.json") {
      files.push(entryRelativePath)
    }
  }

  return files
}

const readSnapshot = async (
  inputDir: string,
  relativePath: string,
): Promise<TenantStabilitySnapshot> => {
  const raw = await readFile(join(inputDir, relativePath), "utf8")
  const parsed = JSON.parse(raw) as Partial<TenantStabilitySnapshot>

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
    `No tenant stability snapshot found under ${inputDir}`,
  )

  const runKeyCounts = new Map<string, number>()
  const items: TenantStabilityCollectItem[] = []

  for (const relativePath of snapshotFiles) {
    const snapshot = await readSnapshot(inputDir, relativePath)
    const runBaseKey = snapshot.githubRunId
      ? `run-${snapshot.githubRunId}`
      : `ts-${snapshot.generatedAt.replace(/[:.]/g, "-")}`
    const count = (runKeyCounts.get(runBaseKey) ?? 0) + 1
    runKeyCounts.set(runBaseKey, count)
    const runKey = count === 1 ? runBaseKey : `${runBaseKey}-${count}`
    const targetDir = join(outputDir, runKey)
    const targetPath = join(targetDir, "e2e-tenant-stability-snapshot.json")

    await mkdir(targetDir, { recursive: true })
    await copyFile(join(inputDir, relativePath), targetPath)
    items.push({
      sourcePath: relativePath,
      outputPath: targetPath,
      runKey,
    })
  }

  const report: TenantStabilityCollectReport = {
    generatedAt: new Date().toISOString(),
    inputDir,
    outputDir,
    totalCollected: items.length,
    items,
  }
  const reportPath = join(outputDir, "e2e-tenant-stability-collect-report.json")
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  console.log(`[e2e-tenant-stability-collect] report: ${reportPath}`)
  console.log(`[e2e-tenant-stability-collect] totalCollected=${items.length}`)
  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-stability-collect] failed: ${message}`)
    process.exitCode = 1
  }
}
