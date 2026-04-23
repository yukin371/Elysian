import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

import {
  type P5aHandoffDecision,
  type P5aHandoffReport,
  type P5aHandoffStatus,
  generateP5aHandoffReport,
  resolveP5aReportDir,
  writeP5aHandoffReport,
} from "./p5a-schema-handoff"

export interface P5aHandoffCorpusCase {
  id: string
  description: string
  inputFilePath: string
  schemaFilePath: string
  expectedDecision: P5aHandoffDecision
  expectedStatus: P5aHandoffStatus
}

export interface P5aHandoffCorpusManifest {
  cases: P5aHandoffCorpusCase[]
}

export interface P5aHandoffCorpusCaseResult {
  caseId: string
  description: string
  expectedDecision: P5aHandoffDecision
  actualDecision?: P5aHandoffDecision
  expectedStatus: P5aHandoffStatus
  actualStatus?: P5aHandoffStatus
  status: "passed" | "failed"
  reportJsonPath?: string
  reportMarkdownPath?: string
  mismatchReasons: string[]
  errorMessage?: string
}

export interface P5aHandoffCorpusReport {
  generatedAt: string
  manifestPath: string
  reportDir: string
  status: "passed" | "failed"
  passedCount: number
  failedCount: number
  cases: P5aHandoffCorpusCaseResult[]
}

const isNonEmptyString = (input: unknown): input is string =>
  typeof input === "string" && input.trim().length > 0

const isDecision = (input: unknown): input is P5aHandoffDecision =>
  input === "ready_for_generator" ||
  input === "retry_ai_generation" ||
  input === "manual_fix_required" ||
  input === "rollback_to_template"

const isStatus = (input: unknown): input is P5aHandoffStatus =>
  input === "passed" || input === "failed"

export const readP5aHandoffCorpusManifest = async (
  manifestPath: string,
): Promise<P5aHandoffCorpusManifest> => {
  const manifestRaw = await readFile(resolve(manifestPath), "utf8")
  const parsed = JSON.parse(manifestRaw) as unknown

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("cases" in parsed) ||
    !Array.isArray(parsed.cases)
  ) {
    throw new Error("P5A handoff corpus manifest must contain a cases array.")
  }

  const cases = parsed.cases.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Corpus case at index ${index} must be an object.`)
    }

    const candidate = item as Record<string, unknown>

    if (!isNonEmptyString(candidate.id)) {
      throw new Error(`Corpus case at index ${index} is missing a valid id.`)
    }

    if (!isNonEmptyString(candidate.description)) {
      throw new Error(
        `Corpus case "${candidate.id}" is missing a valid description.`,
      )
    }

    if (!isNonEmptyString(candidate.inputFilePath)) {
      throw new Error(
        `Corpus case "${candidate.id}" is missing a valid inputFilePath.`,
      )
    }

    if (!isNonEmptyString(candidate.schemaFilePath)) {
      throw new Error(
        `Corpus case "${candidate.id}" is missing a valid schemaFilePath.`,
      )
    }

    if (!isDecision(candidate.expectedDecision)) {
      throw new Error(
        `Corpus case "${candidate.id}" has an invalid expectedDecision.`,
      )
    }

    if (!isStatus(candidate.expectedStatus)) {
      throw new Error(
        `Corpus case "${candidate.id}" has an invalid expectedStatus.`,
      )
    }

    return {
      id: candidate.id,
      description: candidate.description,
      inputFilePath: candidate.inputFilePath,
      schemaFilePath: candidate.schemaFilePath,
      expectedDecision: candidate.expectedDecision,
      expectedStatus: candidate.expectedStatus,
    }
  })

  return { cases }
}

const buildMismatchReasons = (
  expectedDecision: P5aHandoffDecision,
  actualDecision: P5aHandoffDecision,
  expectedStatus: P5aHandoffStatus,
  actualStatus: P5aHandoffStatus,
) => {
  const mismatchReasons: string[] = []

  if (expectedDecision !== actualDecision) {
    mismatchReasons.push(
      `Expected decision=${expectedDecision}, got ${actualDecision}.`,
    )
  }

  if (expectedStatus !== actualStatus) {
    mismatchReasons.push(
      `Expected status=${expectedStatus}, got ${actualStatus}.`,
    )
  }

  return mismatchReasons
}

const runCorpusCase = async (
  corpusCase: P5aHandoffCorpusCase,
  outputDir: string,
): Promise<P5aHandoffCorpusCaseResult> => {
  try {
    const caseReport = await generateP5aHandoffReport(
      corpusCase.inputFilePath,
      corpusCase.schemaFilePath,
      outputDir,
    )
    const paths = await writeP5aHandoffReport(caseReport)
    const mismatchReasons = buildMismatchReasons(
      corpusCase.expectedDecision,
      caseReport.decision,
      corpusCase.expectedStatus,
      caseReport.status,
    )

    return {
      caseId: corpusCase.id,
      description: corpusCase.description,
      expectedDecision: corpusCase.expectedDecision,
      actualDecision: caseReport.decision,
      expectedStatus: corpusCase.expectedStatus,
      actualStatus: caseReport.status,
      status: mismatchReasons.length === 0 ? "passed" : "failed",
      reportJsonPath: paths.jsonPath,
      reportMarkdownPath: paths.markdownPath,
      mismatchReasons,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return {
      caseId: corpusCase.id,
      description: corpusCase.description,
      expectedDecision: corpusCase.expectedDecision,
      expectedStatus: corpusCase.expectedStatus,
      status: "failed",
      mismatchReasons: [
        "Case execution failed before a handoff decision was produced.",
      ],
      errorMessage: message,
    }
  }
}

export const renderP5aHandoffCorpusSummaryMarkdown = (
  report: P5aHandoffCorpusReport,
) =>
  [
    "# P5A Handoff Corpus Summary",
    "",
    `- status: ${report.status}`,
    `- manifestPath: ${report.manifestPath}`,
    `- passedCount: ${report.passedCount}`,
    `- failedCount: ${report.failedCount}`,
    "",
    "## Cases",
    ...report.cases.map((item) => {
      const details = [
        `- ${item.caseId}: ${item.status}`,
        `  expected=${item.expectedDecision}/${item.expectedStatus}`,
        item.actualDecision && item.actualStatus
          ? `  actual=${item.actualDecision}/${item.actualStatus}`
          : "  actual=unavailable",
      ]

      if (item.mismatchReasons.length > 0) {
        details.push(
          ...item.mismatchReasons.map((reason) => `  mismatch=${reason}`),
        )
      }

      if (item.errorMessage) {
        details.push(`  error=${item.errorMessage}`)
      }

      return details.join("\n")
    }),
  ].join("\n")

export const writeP5aHandoffCorpusReport = async (
  report: P5aHandoffCorpusReport,
) => {
  const outputDir = report.reportDir
  const jsonPath = join(outputDir, "p5a-handoff-corpus-report.json")
  const markdownPath = join(outputDir, "p5a-handoff-corpus-summary.md")

  await mkdir(outputDir, { recursive: true })
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8")
  await writeFile(
    markdownPath,
    renderP5aHandoffCorpusSummaryMarkdown(report),
    "utf8",
  )

  return {
    jsonPath,
    markdownPath,
  }
}

export const runP5aHandoffCorpus = async (
  manifestPath: string,
  reportDir = join(resolveP5aReportDir(), "corpus"),
): Promise<P5aHandoffCorpusReport> => {
  const resolvedManifestPath = resolve(manifestPath)
  const manifest = await readP5aHandoffCorpusManifest(resolvedManifestPath)
  const resolvedReportDir = resolve(reportDir)
  const caseResults: P5aHandoffCorpusCaseResult[] = []

  for (const corpusCase of manifest.cases) {
    const caseReportDir = join(resolvedReportDir, corpusCase.id)
    const result = await runCorpusCase(corpusCase, caseReportDir)

    caseResults.push(result)
  }

  const passedCount = caseResults.filter(
    (item) => item.status === "passed",
  ).length
  const failedCount = caseResults.length - passedCount

  return {
    generatedAt: new Date().toISOString(),
    manifestPath: resolvedManifestPath,
    reportDir: resolvedReportDir,
    status: failedCount === 0 ? "passed" : "failed",
    passedCount,
    failedCount,
    cases: caseResults,
  }
}
