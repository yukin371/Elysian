import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises"
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
  source: "matrix" | "cli" | "studio" | "browser" | "unknown"
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

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const resolveInputDir = () =>
  process.env.ELYSIAN_REPORT_INDEX_INPUT_DIR ?? resolveGeneratorReportDir()

export const shouldIndexGeneratorReportFile = (fileName: string) =>
  fileName.endsWith(".json") &&
  fileName !== "e2e-generator-reports-index.json" &&
  fileName !== "e2e-generator-reports-gate.json"

export const resolveReportSource = (
  relativePath: string,
): ReportIndexItem["source"] => {
  const fileName = relativePath.split("/").at(-1) ?? relativePath

  if (relativePath.startsWith("matrix/")) {
    return "matrix"
  }

  if (fileName === "e2e-generator-matrix-report.json") {
    return "matrix"
  }

  if (relativePath.startsWith("cli/")) {
    return "cli"
  }

  if (fileName === "e2e-generator-cli-report.json") {
    return "cli"
  }

  if (relativePath.startsWith("studio/")) {
    return "studio"
  }

  if (fileName === "e2e-generator-studio-report.json") {
    return "studio"
  }

  if (relativePath.startsWith("browser/")) {
    return "browser"
  }

  if (fileName === "e2e-generator-browser-smoke-report.json") {
    return "browser"
  }

  return "unknown"
}

export const parseReportEnvelope = (
  parsed: Partial<ParsedReport>,
  relativePath: string,
): ParsedReport => {
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

    if (shouldIndexGeneratorReportFile(entry.name)) {
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

  return parseReportEnvelope(parsed, relativePath)
}

export const renderIndexSummaryMarkdown = (index: ReportsIndex) => {
  const lines = [
    "### Generator Reports Index",
    "",
    `- status: \`${index.overallStatus}\``,
    `- totalReports: \`${String(index.totalReports)}\``,
    `- passedReports: \`${String(index.passedReports)}\``,
    `- failedReports: \`${String(index.failedReports)}\``,
    `- inputDir: \`${index.inputDir}\``,
    `- conclusion: ${index.conclusion}`,
    "",
    "Failed reports:",
    ...(index.failedItems.length > 0
      ? index.failedItems.map(
          (item) => `- \`${item.source}\`: \`${item.reportPath}\``,
        )
      : ["- none"]),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (index: ReportsIndex) => [
  `generator_reports_index_status=${index.overallStatus}`,
  `generator_reports_index_total_reports=${String(index.totalReports)}`,
  `generator_reports_index_failed_reports=${String(index.failedReports)}`,
  `generator_reports_index_failed_sources=${index.failedItems.map((item) => item.source).join(",")}`,
]

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

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderIndexSummaryMarkdown(index), "utf8")
    console.log(`[e2e-generator-reports-index] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(index).join("\n")}\n`,
      "utf8",
    )
    console.log(
      `[e2e-generator-reports-index] github-output: ${githubOutputPath}`,
    )
  }

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

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-generator-reports-index] failed: ${message}`)
    process.exitCode = 1
  }
}
