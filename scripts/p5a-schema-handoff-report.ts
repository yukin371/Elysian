import {
  generateP5aHandoffReport,
  resolveP5aReportDir,
  writeP5aHandoffReport,
} from "./p5a-schema-handoff"

const parseArgs = (args: string[]) => {
  let inputFilePath = ""
  let schemaFilePath = ""
  let reportDir = resolveP5aReportDir()

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
      reportDir = args[index + 1] ?? reportDir
      index += 1
    }
  }

  if (!inputFilePath || !schemaFilePath) {
    return null
  }

  return {
    inputFilePath,
    schemaFilePath,
    reportDir,
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "  bun scripts/p5a-schema-handoff-report.ts --input-file ./docs/ai-playbooks/task-input-template.md --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json [--report-dir ./artifacts/p5a-handoff]",
    ].join("\n"),
  )
}

try {
  const options = parseArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
  } else {
    const report = await generateP5aHandoffReport(
      options.inputFilePath,
      options.schemaFilePath,
      options.reportDir,
    )
    const paths = await writeP5aHandoffReport(report)

    console.log(`[p5a-handoff-report] report: ${paths.jsonPath}`)
    console.log(`[p5a-handoff-report] summary: ${paths.markdownPath}`)
    console.log(
      `[p5a-handoff-report] decision=${report.decision} status=${report.status}`,
    )

    if (report.status !== "passed") {
      process.exitCode = 1
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[p5a-handoff-report] failed: ${message}`)
  process.exitCode = 1
}
