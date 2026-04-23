import {
  publishP5aHandoffCorpusGitHubOutput,
  publishP5aHandoffCorpusGitHubSummary,
  runP5aHandoffCorpus,
  writeP5aHandoffCorpusReport,
} from "./p5a-handoff-corpus"

const parseArgs = (args: string[]) => {
  let manifestPath = ""
  let reportDir = ""

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === "--manifest") {
      manifestPath = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--report-dir") {
      reportDir = args[index + 1] ?? ""
      index += 1
    }
  }

  if (!manifestPath) {
    return null
  }

  return {
    manifestPath,
    reportDir,
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "  bun scripts/p5a-handoff-corpus-run.ts --manifest ./docs/ai-playbooks/examples/p5a-handoff-corpus.json [--report-dir ./artifacts/p5a-corpus]",
    ].join("\n"),
  )
}

try {
  const options = parseArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
  } else {
    const report = await runP5aHandoffCorpus(
      options.manifestPath,
      options.reportDir || undefined,
    )
    const paths = await writeP5aHandoffCorpusReport(report)
    const summaryPath = await publishP5aHandoffCorpusGitHubSummary(report)
    const githubOutputPath = await publishP5aHandoffCorpusGitHubOutput(report)

    console.log(`[p5a-handoff-corpus] report: ${paths.jsonPath}`)
    console.log(`[p5a-handoff-corpus] summary: ${paths.markdownPath}`)
    if (summaryPath) {
      console.log(`[p5a-handoff-corpus] github-summary: ${summaryPath}`)
    }
    if (githubOutputPath) {
      console.log(`[p5a-handoff-corpus] github-output: ${githubOutputPath}`)
    }
    console.log(
      `[p5a-handoff-corpus] status=${report.status} passed=${report.passedCount} failed=${report.failedCount}`,
    )

    for (const item of report.cases) {
      console.log(
        `[p5a-handoff-corpus] case=${item.caseId} status=${item.status} expected=${item.expectedDecision}/${item.expectedStatus}${item.actualDecision && item.actualStatus ? ` actual=${item.actualDecision}/${item.actualStatus}` : ""}`,
      )
    }

    if (report.status !== "passed") {
      process.exitCode = 1
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[p5a-handoff-corpus] failed: ${message}`)
  process.exitCode = 1
}
