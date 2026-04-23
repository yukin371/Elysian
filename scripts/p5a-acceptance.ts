import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises"
import { join, resolve } from "node:path"

import {
  runP5aHandoffCorpus,
  writeP5aHandoffCorpusReport,
} from "./p5a-handoff-corpus"
import { resolveP5aReportDir } from "./p5a-schema-handoff"

interface P5aAcceptanceOptions {
  manifestPath?: string
  acceptanceCasesPath?: string
  replayInputFilePath?: string
  replaySchemaFilePath?: string
  reportDir?: string
  outputDir?: string
  frontendTarget?: "vue" | "react"
  conflictStrategy?: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
}

interface P5aAcceptanceReplayCase {
  id: string
  description: string
  inputFilePath: string
  schemaFilePath: string
}

interface P5aAcceptanceCaseReport {
  caseId: string
  description: string
  inputFilePath: string
  schemaFilePath: string
  replay: "passed" | "failed"
  generator: "passed" | "failed"
  status: "passed" | "failed"
  reportPath?: string
  summaryPath?: string
  handoffReportPath?: string
  handoffSummaryPath?: string
  generatedSchemaArtifactPath?: string
  outputDir: string
  errorMessage?: string
}

interface P5aAcceptanceReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    corpus: "passed" | "failed"
    replay: "passed" | "failed"
    generator: "passed" | "failed"
  }
  inputs: {
    manifestPath: string
    acceptanceCasesPath: string | null
    frontendTarget: "vue" | "react"
    conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  }
  outputs: {
    reportDir: string
    corpusReportPath: string
    corpusSummaryPath: string
    outputDir: string
  }
  cases: P5aAcceptanceCaseReport[]
}

const defaultManifestPath =
  "./docs/ai-playbooks/examples/p5a-handoff-corpus.json"
const defaultAcceptanceCasesPath =
  "./docs/ai-playbooks/examples/p5a-acceptance-cases.json"
const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const renderP5aAcceptanceSummaryMarkdown = (report: P5aAcceptanceReport) =>
  [
    "# P5A Acceptance Summary",
    "",
    `- status: ${report.status}`,
    `- corpus: ${report.steps.corpus}`,
    `- replay: ${report.steps.replay}`,
    `- generator: ${report.steps.generator}`,
    `- manifestPath: ${report.inputs.manifestPath}`,
    `- acceptanceCasesPath: ${report.inputs.acceptanceCasesPath ?? "inline-single-case"}`,
    `- frontendTarget: ${report.inputs.frontendTarget}`,
    `- conflictStrategy: ${report.inputs.conflictStrategy}`,
    "",
    "## Outputs",
    `- corpusReportPath: ${report.outputs.corpusReportPath}`,
    `- corpusSummaryPath: ${report.outputs.corpusSummaryPath}`,
    `- outputDir: ${report.outputs.outputDir}`,
    "",
    "## Acceptance Cases",
    ...report.cases.map((item) =>
      [
        `- ${item.caseId}: ${item.status}`,
        `  replay=${item.replay}`,
        `  generator=${item.generator}`,
        `  inputFilePath=${item.inputFilePath}`,
        `  schemaFilePath=${item.schemaFilePath}`,
        item.generatedSchemaArtifactPath
          ? `  generatedSchemaArtifactPath=${item.generatedSchemaArtifactPath}`
          : "  generatedSchemaArtifactPath=n/a",
        item.summaryPath
          ? `  summaryPath=${item.summaryPath}`
          : "  summaryPath=n/a",
        item.reportPath
          ? `  reportPath=${item.reportPath}`
          : "  reportPath=n/a",
        item.errorMessage ? `  error=${item.errorMessage}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].join("\n")

export const renderP5aAcceptanceStepSummaryMarkdown = (
  report: P5aAcceptanceReport,
) => {
  const failedCases = report.cases.filter((item) => item.status === "failed")
  const lines = [
    "### P5A Acceptance",
    "",
    `- status: \`${report.status}\``,
    `- corpus: \`${report.steps.corpus}\``,
    `- replay: \`${report.steps.replay}\``,
    `- generator: \`${report.steps.generator}\``,
    `- caseCount: \`${String(report.cases.length)}\``,
    `- acceptanceCasesPath: \`${report.inputs.acceptanceCasesPath ?? "inline-single-case"}\``,
    "",
  ]

  if (failedCases.length === 0) {
    lines.push("All acceptance cases passed replay and generator.", "")
    return `${lines.join("\n")}\n`
  }

  lines.push("Failed cases:")
  lines.push(
    ...failedCases.map((item) => {
      const detail =
        item.errorMessage ??
        `${item.replay}/${item.generator} report=${item.summaryPath ?? item.reportPath ?? "n/a"}`

      return `- ${item.caseId}: replay=${item.replay}, generator=${item.generator}, detail=${detail}`
    }),
  )
  lines.push("")

  return `${lines.join("\n")}\n`
}

export const buildP5aAcceptanceGitHubOutputLines = (
  report: P5aAcceptanceReport,
) => [
  `p5a_acceptance_status=${report.status}`,
  `p5a_acceptance_case_count=${String(report.cases.length)}`,
  `p5a_acceptance_replay=${report.steps.replay}`,
  `p5a_acceptance_generator=${report.steps.generator}`,
]

export const publishP5aAcceptanceGitHubSummary = async (
  report: P5aAcceptanceReport,
) => {
  const summaryPath = resolveSummaryPath()

  if (!summaryPath) {
    return null
  }

  await appendFile(
    summaryPath,
    renderP5aAcceptanceStepSummaryMarkdown(report),
    "utf8",
  )

  return summaryPath
}

export const publishP5aAcceptanceGitHubOutput = async (
  report: P5aAcceptanceReport,
) => {
  const outputPath = resolveGitHubOutputPath()

  if (!outputPath) {
    return null
  }

  await appendFile(
    outputPath,
    `${buildP5aAcceptanceGitHubOutputLines(report).join("\n")}\n`,
    "utf8",
  )

  return outputPath
}

const isNonEmptyString = (input: unknown): input is string =>
  typeof input === "string" && input.trim().length > 0

const readP5aAcceptanceCases = async (
  acceptanceCasesPath: string,
): Promise<P5aAcceptanceReplayCase[]> => {
  const manifestRaw = await readFile(resolve(acceptanceCasesPath), "utf8")
  const parsed = JSON.parse(manifestRaw) as unknown

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("cases" in parsed) ||
    !Array.isArray(parsed.cases)
  ) {
    throw new Error("P5A acceptance manifest must contain a cases array.")
  }

  return parsed.cases.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Acceptance case at index ${index} must be an object.`)
    }

    const candidate = item as Record<string, unknown>

    if (!isNonEmptyString(candidate.id)) {
      throw new Error(
        `Acceptance case at index ${index} is missing a valid id.`,
      )
    }

    if (!isNonEmptyString(candidate.description)) {
      throw new Error(
        `Acceptance case "${candidate.id}" is missing a valid description.`,
      )
    }

    if (!isNonEmptyString(candidate.inputFilePath)) {
      throw new Error(
        `Acceptance case "${candidate.id}" is missing a valid inputFilePath.`,
      )
    }

    if (!isNonEmptyString(candidate.schemaFilePath)) {
      throw new Error(
        `Acceptance case "${candidate.id}" is missing a valid schemaFilePath.`,
      )
    }

    return {
      id: candidate.id,
      description: candidate.description,
      inputFilePath: resolve(candidate.inputFilePath),
      schemaFilePath: resolve(candidate.schemaFilePath),
    }
  })
}

const resolveAcceptanceCases = async (
  options: P5aAcceptanceOptions,
): Promise<{
  acceptanceCasesPath: string | null
  cases: P5aAcceptanceReplayCase[]
}> => {
  const hasReplayOverride =
    options.replayInputFilePath !== undefined ||
    options.replaySchemaFilePath !== undefined

  if (hasReplayOverride) {
    if (!options.replayInputFilePath || !options.replaySchemaFilePath) {
      throw new Error(
        "P5A acceptance replay override requires both replayInputFilePath and replaySchemaFilePath.",
      )
    }

    return {
      acceptanceCasesPath: null,
      cases: [
        {
          id: "single-replay-case",
          description: "single replay case from explicit acceptance options",
          inputFilePath: resolve(options.replayInputFilePath),
          schemaFilePath: resolve(options.replaySchemaFilePath),
        },
      ],
    }
  }

  const acceptanceCasesPath = resolve(
    options.acceptanceCasesPath ?? defaultAcceptanceCasesPath,
  )

  return {
    acceptanceCasesPath,
    cases: await readP5aAcceptanceCases(acceptanceCasesPath),
  }
}

const runReplayWithGenerator = async (options: {
  inputFilePath: string
  schemaFilePath: string
  reportDir: string
  outputDir: string
  frontendTarget: "vue" | "react"
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
}) => {
  const spawnedProcess = Bun.spawn(
    [
      "bun",
      "scripts/p5a-schema-handoff-replay.ts",
      "--input-file",
      options.inputFilePath,
      "--schema-file",
      options.schemaFilePath,
      "--report-dir",
      options.reportDir,
      "--generate",
      "--out",
      options.outputDir,
      "--frontend",
      options.frontendTarget,
      "--conflict",
      options.conflictStrategy,
    ],
    {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const code = await spawnedProcess.exited
  const stdout = await new Response(spawnedProcess.stdout).text()
  const stderr = await new Response(spawnedProcess.stderr).text()

  return {
    code,
    stdout,
    stderr,
  }
}

const runAcceptanceCase = async (
  acceptanceCase: P5aAcceptanceReplayCase,
  rootReplayReportDir: string,
  rootOutputDir: string,
  frontendTarget: "vue" | "react",
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail",
): Promise<P5aAcceptanceCaseReport> => {
  const reportDir = join(rootReplayReportDir, acceptanceCase.id)
  const outputDir = join(rootOutputDir, acceptanceCase.id)

  try {
    const replayResult = await runReplayWithGenerator({
      inputFilePath: acceptanceCase.inputFilePath,
      schemaFilePath: acceptanceCase.schemaFilePath,
      reportDir,
      outputDir,
      frontendTarget,
      conflictStrategy,
    })

    if (replayResult.stdout) {
      process.stdout.write(replayResult.stdout)
    }
    if (replayResult.stderr) {
      process.stderr.write(replayResult.stderr)
    }

    const reportPath = join(reportDir, "p5a-schema-handoff-replay-report.json")
    const summaryPath = join(reportDir, "p5a-schema-handoff-replay-summary.md")
    const replayReportRaw = await readFile(reportPath, "utf8")
    const replayReport = JSON.parse(replayReportRaw) as {
      status?: "passed" | "failed"
      steps?: {
        handoff?: "passed" | "failed"
        generator?: "passed" | "failed" | "skipped"
      }
      outputs?: {
        generatedSchemaArtifactPath?: string | null
        handoffReportPath?: string
        handoffSummaryPath?: string
      }
      generator?: {
        errorMessage?: string | null
      }
    }
    const replay =
      replayReport.steps?.handoff === "passed" ? "passed" : "failed"
    const generator =
      replayReport.steps?.generator === "passed" ? "passed" : "failed"
    const generatedSchemaArtifactPath =
      replayReport.outputs?.generatedSchemaArtifactPath ?? undefined

    if (generatedSchemaArtifactPath) {
      await access(generatedSchemaArtifactPath)
    }

    return {
      caseId: acceptanceCase.id,
      description: acceptanceCase.description,
      inputFilePath: acceptanceCase.inputFilePath,
      schemaFilePath: acceptanceCase.schemaFilePath,
      replay,
      generator,
      status:
        replay === "passed" && generator === "passed" ? "passed" : "failed",
      reportPath,
      summaryPath,
      handoffReportPath: replayReport.outputs?.handoffReportPath,
      handoffSummaryPath: replayReport.outputs?.handoffSummaryPath,
      generatedSchemaArtifactPath,
      outputDir,
      errorMessage:
        replayResult.code !== 0
          ? (replayReport.generator?.errorMessage ?? replayResult.stderr.trim())
          : undefined,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return {
      caseId: acceptanceCase.id,
      description: acceptanceCase.description,
      inputFilePath: acceptanceCase.inputFilePath,
      schemaFilePath: acceptanceCase.schemaFilePath,
      replay: "failed",
      generator: "failed",
      status: "failed",
      outputDir,
      errorMessage: message,
    }
  }
}

export const run = async (
  options: P5aAcceptanceOptions = {},
): Promise<P5aAcceptanceReport> => {
  const manifestPath = resolve(options.manifestPath ?? defaultManifestPath)
  const { acceptanceCasesPath, cases } = await resolveAcceptanceCases(options)
  const rootReportDir = resolve(
    options.reportDir ?? join(resolveP5aReportDir(), "acceptance"),
  )
  const corpusReportDir = join(rootReportDir, "corpus")
  const replayReportDir = join(rootReportDir, "replay")
  const outputDir = resolve(
    options.outputDir ?? join(rootReportDir, "generated-output"),
  )
  const frontendTarget = options.frontendTarget ?? "vue"
  const conflictStrategy = options.conflictStrategy ?? "skip"

  await mkdir(rootReportDir, { recursive: true })
  await mkdir(replayReportDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })

  const corpusReport = await runP5aHandoffCorpus(manifestPath, corpusReportDir)
  const corpusPaths = await writeP5aHandoffCorpusReport(corpusReport)

  const caseReports: P5aAcceptanceCaseReport[] = []

  for (const acceptanceCase of cases) {
    caseReports.push(
      await runAcceptanceCase(
        acceptanceCase,
        replayReportDir,
        outputDir,
        frontendTarget,
        conflictStrategy,
      ),
    )
  }

  const steps = {
    corpus: corpusReport.status,
    replay: caseReports.every((item) => item.replay === "passed")
      ? "passed"
      : "failed",
    generator: caseReports.every((item) => item.generator === "passed")
      ? "passed"
      : "failed",
  } satisfies P5aAcceptanceReport["steps"]

  const status: "passed" | "failed" =
    steps.corpus === "passed" &&
    steps.replay === "passed" &&
    steps.generator === "passed"
      ? "passed"
      : "failed"

  const report: P5aAcceptanceReport = {
    generatedAt: new Date().toISOString(),
    status,
    steps,
    inputs: {
      manifestPath,
      acceptanceCasesPath,
      frontendTarget,
      conflictStrategy,
    },
    outputs: {
      reportDir: rootReportDir,
      corpusReportPath: corpusPaths.jsonPath,
      corpusSummaryPath: corpusPaths.markdownPath,
      outputDir,
    },
    cases: caseReports,
  }

  const reportPath = join(rootReportDir, "p5a-acceptance-report.json")
  const summaryPath = join(rootReportDir, "p5a-acceptance-summary.md")
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  await writeFile(
    summaryPath,
    renderP5aAcceptanceSummaryMarkdown(report),
    "utf8",
  )
  const githubSummaryPath = await publishP5aAcceptanceGitHubSummary(report)
  const githubOutputPath = await publishP5aAcceptanceGitHubOutput(report)

  console.log(
    `[p5a-acceptance] status=${report.status} corpus=${report.steps.corpus} replay=${report.steps.replay} generator=${report.steps.generator} cases=${String(report.cases.length)}`,
  )
  console.log(`[p5a-acceptance] report: ${reportPath}`)
  console.log(`[p5a-acceptance] summary: ${summaryPath}`)
  if (githubSummaryPath) {
    console.log(`[p5a-acceptance] github-summary: ${githubSummaryPath}`)
  }
  if (githubOutputPath) {
    console.log(`[p5a-acceptance] github-output: ${githubOutputPath}`)
  }

  for (const caseReport of report.cases) {
    console.log(
      `[p5a-acceptance] case=${caseReport.caseId} status=${caseReport.status} replay=${caseReport.replay} generator=${caseReport.generator}${caseReport.generatedSchemaArtifactPath ? ` artifact=${caseReport.generatedSchemaArtifactPath}` : ""}`,
    )
  }

  return report
}

if (import.meta.main) {
  try {
    const report = await run()
    if (report.status === "failed") {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[p5a-acceptance] failed: ${message}`)
    process.exitCode = 1
  }
}
