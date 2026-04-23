import { mkdir, mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  generateP5aHandoffReport,
  resolveP5aReportDir,
  writeP5aHandoffReport,
} from "./p5a-schema-handoff"

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

    console.log(`[p5a-handoff-replay] report: ${paths.jsonPath}`)
    console.log(`[p5a-handoff-replay] summary: ${paths.markdownPath}`)
    console.log(
      `[p5a-handoff-replay] decision=${report.decision} status=${report.status}`,
    )

    if (report.status !== "passed") {
      process.exitCode = 1
    } else if (options.shouldGenerate) {
      const outputDir = options.outputDir || join(reportDir, "generated-output")
      const generatorResult = await runGenerator(
        options.schemaFilePath,
        outputDir,
        options.frontendTarget,
        options.conflictStrategy,
      )

      process.stdout.write(generatorResult.stdout)
      process.stderr.write(generatorResult.stderr)

      if (generatorResult.code !== 0) {
        process.exitCode = generatorResult.code
      }
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[p5a-handoff-replay] failed: ${message}`)
  process.exitCode = 1
}
