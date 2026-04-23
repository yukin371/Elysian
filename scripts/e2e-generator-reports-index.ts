import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import {
  resolveGeneratorReportDir,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

interface ParsedReport {
  status: "passed" | "failed"
  passedCount: number
  failedCount: number
}

interface ReportIndexItem {
  source: "matrix" | "cli" | "unknown"
  reportPath: string
  fileName: string
  status: "passed" | "failed"
  passedCount: number
  failedCount: number
}

interface ReportsIndex {
  gitSha: string
  generatedAt: string
  inputDir: string
  totalReports: number
  passedReports: number
  failedReports: number
  overallStatus: "passed" | "failed"
  conclusion: string
  failedItems: ReportIndexItem[]
  items: ReportIndexItem[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveInputDir = () =>
  process.env.ELYSIAN_REPORT_INDEX_INPUT_DIR ?? resolveGeneratorReportDir()

const resolveReportSource = (
  relativePath: string,
): ReportIndexItem["source"] => {
  if (relativePath.startsWith("matrix/")) {
    return "matrix"
  }

  if (relativePath.startsWith("cli/")) {
    return "cli"
  }

  return "unknown"
}

const findJsonFilesRecursively = async (
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
        ...(await findJsonFilesRecursively(rootDir, entryRelativePath)),
      )
      continue
    }

    if (
      entry.name.endsWith(".json") &&
      entry.name !== "e2e-generator-reports-index.json"
    ) {
      files.push(entryRelativePath)
    }
  }

  return files
}

const readParsedReport = async (
  inputDir: string,
  relativePath: string,
): Promise<ParsedReport> => {
  const raw = await readFile(join(inputDir, relativePath), "utf8")
  const parsed = JSON.parse(raw) as Partial<ParsedReport>

  const status = parsed.status
  const passedCount = parsed.passedCount
  const failedCount = parsed.failedCount

  assert(
    status === "passed" || status === "failed",
    `Invalid report status: ${relativePath}`,
  )
  assert(
    typeof passedCount === "number" && Number.isFinite(passedCount),
    `Invalid passedCount: ${relativePath}`,
  )
  assert(
    typeof failedCount === "number" && Number.isFinite(failedCount),
    `Invalid failedCount: ${relativePath}`,
  )

  return {
    status,
    passedCount,
    failedCount,
  }
}

const run = async () => {
  const inputDir = resolveInputDir()
  const outputDir = resolveGeneratorReportDir()
  const outputPath = join(outputDir, "e2e-generator-reports-index.json")
  const reportFiles = await findJsonFilesRecursively(inputDir)

  assert(reportFiles.length > 0, `No report files found under ${inputDir}`)

  const items: ReportIndexItem[] = []
  for (const fileName of reportFiles) {
    const report = await readParsedReport(inputDir, fileName)
    items.push({
      source: resolveReportSource(fileName),
      reportPath: fileName,
      fileName,
      status: report.status,
      passedCount: report.passedCount,
      failedCount: report.failedCount,
    })
  }

  const failedItems = items.filter((item) => item.status === "failed")
  const failedReports = failedItems.length
  const passedReports = items.length - failedReports
  const overallStatus: "passed" | "failed" =
    failedReports === 0 ? "passed" : "failed"
  const conclusion =
    overallStatus === "passed"
      ? "All generator e2e reports passed."
      : `${failedReports} generator e2e report(s) failed.`
  const index: ReportsIndex = {
    gitSha: resolveGeneratorReportGitSha(),
    generatedAt: new Date().toISOString(),
    inputDir,
    totalReports: items.length,
    passedReports,
    failedReports,
    overallStatus,
    conclusion,
    failedItems,
    items,
  }

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, JSON.stringify(index, null, 2), "utf8")

  console.log(`[e2e-generator-reports-index] report: ${outputPath}`)
  if (failedReports > 0) {
    console.error(
      `[e2e-generator-reports-index] failed: ${failedReports} failed report(s) detected`,
    )
    process.exitCode = 1
    return
  }

  console.log("[e2e-generator-reports-index] passed")
}

try {
  await run()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-reports-index] failed: ${message}`)
  process.exitCode = 1
}
