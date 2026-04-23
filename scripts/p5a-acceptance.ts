import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

import {
  runP5aHandoffCorpus,
  writeP5aHandoffCorpusReport,
} from "./p5a-handoff-corpus"
import { resolveP5aReportDir } from "./p5a-schema-handoff"

interface P5aAcceptanceOptions {
  manifestPath?: string
  replayInputFilePath?: string
  replaySchemaFilePath?: string
  reportDir?: string
  outputDir?: string
  frontendTarget?: "vue" | "react"
  conflictStrategy?: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
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
    replayInputFilePath: string
    replaySchemaFilePath: string
    frontendTarget: "vue" | "react"
    conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  }
  outputs: {
    reportDir: string
    corpusReportPath: string
    corpusSummaryPath: string
    replayReportPath: string
    replaySummaryPath: string
    generatedSchemaArtifactPath: string
    outputDir: string
  }
}

const defaultManifestPath =
  "./docs/ai-playbooks/examples/p5a-handoff-corpus.json"
const defaultReplayInputFilePath =
  "./docs/ai-playbooks/examples/p5a-complete-task-input.txt"
const defaultReplaySchemaFilePath =
  "./docs/ai-playbooks/examples/p5a-fixed.module-schema.json"

const renderP5aAcceptanceSummaryMarkdown = (report: P5aAcceptanceReport) =>
  [
    "# P5A Acceptance Summary",
    "",
    `- status: ${report.status}`,
    `- corpus: ${report.steps.corpus}`,
    `- replay: ${report.steps.replay}`,
    `- generator: ${report.steps.generator}`,
    `- manifestPath: ${report.inputs.manifestPath}`,
    `- replayInputFilePath: ${report.inputs.replayInputFilePath}`,
    `- replaySchemaFilePath: ${report.inputs.replaySchemaFilePath}`,
    `- frontendTarget: ${report.inputs.frontendTarget}`,
    `- conflictStrategy: ${report.inputs.conflictStrategy}`,
    "",
    "## Outputs",
    `- corpusReportPath: ${report.outputs.corpusReportPath}`,
    `- corpusSummaryPath: ${report.outputs.corpusSummaryPath}`,
    `- replayReportPath: ${report.outputs.replayReportPath}`,
    `- replaySummaryPath: ${report.outputs.replaySummaryPath}`,
    `- generatedSchemaArtifactPath: ${report.outputs.generatedSchemaArtifactPath}`,
    `- outputDir: ${report.outputs.outputDir}`,
  ].join("\n")

const readModuleNameFromSchemaFile = async (schemaFilePath: string) => {
  const raw = await readFile(resolve(schemaFilePath), "utf8")
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, "")) as { name?: unknown }

  if (typeof parsed.name !== "string" || parsed.name.trim().length === 0) {
    throw new Error(
      `Replay schema file is missing a valid module name: ${schemaFilePath}`,
    )
  }

  return parsed.name
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

export const run = async (
  options: P5aAcceptanceOptions = {},
): Promise<P5aAcceptanceReport> => {
  const manifestPath = resolve(options.manifestPath ?? defaultManifestPath)
  const replayInputFilePath = resolve(
    options.replayInputFilePath ?? defaultReplayInputFilePath,
  )
  const replaySchemaFilePath = resolve(
    options.replaySchemaFilePath ?? defaultReplaySchemaFilePath,
  )
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

  const corpusReport = await runP5aHandoffCorpus(manifestPath, corpusReportDir)
  const corpusPaths = await writeP5aHandoffCorpusReport(corpusReport)

  const replayResult = await runReplayWithGenerator({
    inputFilePath: replayInputFilePath,
    schemaFilePath: replaySchemaFilePath,
    reportDir: replayReportDir,
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

  const replayReportPath = join(
    replayReportDir,
    "p5a-schema-handoff-report.json",
  )
  const replaySummaryPath = join(
    replayReportDir,
    "p5a-schema-handoff-summary.md",
  )
  const replayReportRaw = await readFile(replayReportPath, "utf8")
  const replayReport = JSON.parse(replayReportRaw) as {
    status?: "passed" | "failed"
  }
  const moduleName = await readModuleNameFromSchemaFile(replaySchemaFilePath)
  const generatedSchemaArtifactPath = join(
    outputDir,
    "modules",
    moduleName,
    `${moduleName}.schema.ts`,
  )

  const steps = {
    corpus: corpusReport.status,
    replay: replayReport.status === "passed" ? "passed" : "failed",
    generator: replayResult.code === 0 ? "passed" : "failed",
  } satisfies P5aAcceptanceReport["steps"]

  if (steps.generator === "passed") {
    await access(generatedSchemaArtifactPath)
  }

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
      replayInputFilePath,
      replaySchemaFilePath,
      frontendTarget,
      conflictStrategy,
    },
    outputs: {
      reportDir: rootReportDir,
      corpusReportPath: corpusPaths.jsonPath,
      corpusSummaryPath: corpusPaths.markdownPath,
      replayReportPath,
      replaySummaryPath,
      generatedSchemaArtifactPath,
      outputDir,
    },
  }

  const reportPath = join(rootReportDir, "p5a-acceptance-report.json")
  const summaryPath = join(rootReportDir, "p5a-acceptance-summary.md")
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  await writeFile(
    summaryPath,
    renderP5aAcceptanceSummaryMarkdown(report),
    "utf8",
  )

  console.log(
    `[p5a-acceptance] status=${report.status} corpus=${report.steps.corpus} replay=${report.steps.replay} generator=${report.steps.generator}`,
  )
  console.log(`[p5a-acceptance] report: ${reportPath}`)
  console.log(`[p5a-acceptance] summary: ${summaryPath}`)
  console.log(
    `[p5a-acceptance] generatedSchemaArtifactPath=${generatedSchemaArtifactPath}`,
  )

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
