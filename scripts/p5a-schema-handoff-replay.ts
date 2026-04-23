import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import {
  type P5aHandoffDecision,
  type P5aHandoffStatus,
  generateP5aHandoffReport,
  resolveP5aReportDir,
  writeP5aHandoffReport,
} from "./p5a-schema-handoff"

type P5aReplayStepStatus = "passed" | "failed" | "skipped"

interface P5aHandoffReplayReport {
  generatedAt: string
  reportDir: string
  status: P5aHandoffStatus
  decision: P5aHandoffDecision
  steps: {
    handoff: P5aHandoffStatus
    generator: P5aReplayStepStatus
  }
  inputs: {
    inputFilePath: string
    schemaFilePath: string
    shouldGenerate: boolean
    frontendTarget: "vue" | "react"
    conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  }
  outputs: {
    handoffReportPath: string
    handoffSummaryPath: string
    outputDir: string | null
    generatedSchemaArtifactPath: string | null
  }
  generator: {
    exitCode: number | null
    errorMessage: string | null
  }
  recommendedActions: string[]
}

const replayReportFileName = "p5a-schema-handoff-replay-report.json"
const replaySummaryFileName = "p5a-schema-handoff-replay-summary.md"

const parseArgs = (args: string[]) => {
  let inputFilePath = ""
  let schemaFilePath = ""
  let reportDir = ""
  let outputDir = ""
  let frontendTarget: "vue" | "react" = "vue"
  let conflictStrategy:
    | "skip"
    | "overwrite"
    | "overwrite-generated-only"
    | "fail" = "skip"
  let shouldGenerate = false

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === "--input-file") {
      inputFilePath = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--schema-file") {
      schemaFilePath = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--report-dir") {
      reportDir = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--out") {
      outputDir = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--frontend") {
      const value = args[index + 1]

      if (value === "vue" || value === "react") {
        frontendTarget = value
        index += 1
        continue
      }

      return null
    }

    if (current === "--conflict") {
      const value = args[index + 1]

      if (
        value === "skip" ||
        value === "overwrite" ||
        value === "overwrite-generated-only" ||
        value === "fail"
      ) {
        conflictStrategy = value
        index += 1
        continue
      }

      return null
    }

    if (current === "--generate") {
      shouldGenerate = true
    }
  }

  if (!inputFilePath || !schemaFilePath) {
    return null
  }

  return {
    inputFilePath,
    schemaFilePath,
    reportDir,
    outputDir,
    frontendTarget,
    conflictStrategy,
    shouldGenerate,
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "  bun scripts/p5a-schema-handoff-replay.ts --input-file ./docs/ai-playbooks/examples/p5a-failed-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-failed.module-schema.json [--generate --out ./generated/p5a]",
    ].join("\n"),
  )
}

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

const runGenerator = async (
  schemaFilePath: string,
  outputDir: string,
  frontendTarget: "vue" | "react",
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail",
) => {
  const spawnedProcess = Bun.spawn(
    [
      "bun",
      "--filter",
      "@elysian/generator",
      "generate",
      "--schema-file",
      schemaFilePath,
      "--out",
      outputDir,
      "--frontend",
      frontendTarget,
      "--conflict",
      conflictStrategy,
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

const renderP5aReplaySummaryMarkdown = (report: P5aHandoffReplayReport) =>
  [
    "# P5A Handoff Replay Summary",
    "",
    `- status: ${report.status}`,
    `- decision: ${report.decision}`,
    `- handoff: ${report.steps.handoff}`,
    `- generator: ${report.steps.generator}`,
    `- inputFilePath: ${report.inputs.inputFilePath}`,
    `- schemaFilePath: ${report.inputs.schemaFilePath}`,
    `- shouldGenerate: ${String(report.inputs.shouldGenerate)}`,
    `- frontendTarget: ${report.inputs.frontendTarget}`,
    `- conflictStrategy: ${report.inputs.conflictStrategy}`,
    "",
    "## Outputs",
    `- handoffReportPath: ${report.outputs.handoffReportPath}`,
    `- handoffSummaryPath: ${report.outputs.handoffSummaryPath}`,
    `- outputDir: ${report.outputs.outputDir ?? "n/a"}`,
    `- generatedSchemaArtifactPath: ${report.outputs.generatedSchemaArtifactPath ?? "n/a"}`,
    "",
    "## Recommended Actions",
    ...report.recommendedActions.map((action) => `- ${action}`),
    ...(report.generator.errorMessage
      ? ["", "## Generator Error", `- ${report.generator.errorMessage}`]
      : []),
  ].join("\n")

const writeP5aHandoffReplayReport = async (report: P5aHandoffReplayReport) => {
  const reportPath = join(report.reportDir, replayReportFileName)
  const summaryPath = join(report.reportDir, replaySummaryFileName)

  await mkdir(report.reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  await writeFile(summaryPath, renderP5aReplaySummaryMarkdown(report), "utf8")

  return {
    reportPath,
    summaryPath,
  }
}

try {
  const options = parseArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
  } else {
    const defaultReportRoot = resolveP5aReportDir()
    await mkdir(defaultReportRoot, { recursive: true })
    const reportDir =
      options.reportDir || (await mkdtemp(join(defaultReportRoot, "replay-")))

    const report = await generateP5aHandoffReport(
      options.inputFilePath,
      options.schemaFilePath,
      reportDir,
    )
    const paths = await writeP5aHandoffReport(report)
    let generatorStatus: P5aReplayStepStatus = "skipped"
    let generatorExitCode: number | null = null
    let generatorErrorMessage: string | null = null
    let generatedSchemaArtifactPath: string | null = null
    const outputDir = options.shouldGenerate
      ? resolve(options.outputDir || join(reportDir, "generated-output"))
      : null

    console.log(`[p5a-handoff-replay] report: ${paths.jsonPath}`)
    console.log(`[p5a-handoff-replay] summary: ${paths.markdownPath}`)
    console.log(
      `[p5a-handoff-replay] decision=${report.decision} status=${report.status}`,
    )

    if (report.status !== "passed") {
      generatorStatus = "skipped"
    } else if (options.shouldGenerate) {
      const generatorResult = await runGenerator(
        options.schemaFilePath,
        outputDir,
        options.frontendTarget,
        options.conflictStrategy,
      )

      process.stdout.write(generatorResult.stdout)
      process.stderr.write(generatorResult.stderr)
      generatorExitCode = generatorResult.code

      if (generatorResult.code === 0) {
        try {
          const moduleName = await readModuleNameFromSchemaFile(
            options.schemaFilePath,
          )
          const candidateArtifactPath = join(
            outputDir,
            "modules",
            moduleName,
            `${moduleName}.schema.ts`,
          )
          await access(candidateArtifactPath)
          generatedSchemaArtifactPath = candidateArtifactPath
          generatorStatus = "passed"
        } catch (error) {
          generatorStatus = "failed"
          generatorErrorMessage =
            error instanceof Error ? error.message : String(error)
        }
      } else {
        generatorStatus = "failed"
        generatorErrorMessage =
          generatorResult.stderr.trim() ||
          `Generator exited with code ${String(generatorResult.code)}.`
      }
    }

    const replayReport: P5aHandoffReplayReport = {
      generatedAt: new Date().toISOString(),
      reportDir: resolve(reportDir),
      status:
        report.status === "passed" && generatorStatus !== "failed"
          ? "passed"
          : "failed",
      decision: report.decision,
      steps: {
        handoff: report.status,
        generator: generatorStatus,
      },
      inputs: {
        inputFilePath: report.inputFilePath,
        schemaFilePath: report.schemaFilePath,
        shouldGenerate: options.shouldGenerate,
        frontendTarget: options.frontendTarget,
        conflictStrategy: options.conflictStrategy,
      },
      outputs: {
        handoffReportPath: paths.jsonPath,
        handoffSummaryPath: paths.markdownPath,
        outputDir,
        generatedSchemaArtifactPath,
      },
      generator: {
        exitCode: generatorExitCode,
        errorMessage: generatorErrorMessage,
      },
      recommendedActions:
        report.status === "passed" && generatorStatus === "failed"
          ? [
              "Handoff replay passed, but generator failed. Fix generator output or conflict issues before continuing.",
              "Keep the validated schema file and replay report as the canonical takeover evidence.",
            ]
          : report.recommendedActions,
    }
    const replayPaths = await writeP5aHandoffReplayReport(replayReport)

    console.log(`[p5a-handoff-replay] replay-report: ${replayPaths.reportPath}`)
    console.log(
      `[p5a-handoff-replay] replay-summary: ${replayPaths.summaryPath}`,
    )
    console.log(
      `[p5a-handoff-replay] replay-status=${replayReport.status} handoff=${replayReport.steps.handoff} generator=${replayReport.steps.generator}`,
    )

    if (report.status !== "passed") {
      process.exitCode = 1
    } else if (generatorStatus === "failed") {
      process.exitCode = generatorExitCode ?? 1
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[p5a-handoff-replay] failed: ${message}`)
  process.exitCode = 1
}
