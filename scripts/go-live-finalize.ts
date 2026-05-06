import { run as runGoLiveGate } from "./go-live-gate"
import { run as runGoLiveReport } from "./go-live-report"

interface GoLiveFinalizeReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    report: "passed" | "failed"
    gate: "passed" | "failed"
  }
  outputs: {
    reportPath: string
    gatePath: string
  }
}

export const runWith = async (dependencies: {
  report: () => Promise<{ status: "passed" | "failed"; outputPath: string }>
  gate: () => Promise<{ status: "passed" | "failed"; outputPath: string }>
}) => {
  const report = await dependencies.report()
  const gate = await dependencies.gate()

  const finalizeReport: GoLiveFinalizeReport = {
    generatedAt: new Date().toISOString(),
    status: gate.status,
    steps: {
      report: report.status,
      gate: gate.status,
    },
    outputs: {
      reportPath: report.outputPath,
      gatePath: gate.outputPath,
    },
  }

  console.log(
    `[go-live-finalize] status=${finalizeReport.status} report=${finalizeReport.steps.report} gate=${finalizeReport.steps.gate}`,
  )
  console.log(
    `[go-live-finalize] reportPath=${finalizeReport.outputs.reportPath}`,
  )
  console.log(`[go-live-finalize] gatePath=${finalizeReport.outputs.gatePath}`)

  return finalizeReport
}

export const run = async () =>
  runWith({
    report: () => runGoLiveReport(),
    gate: () => runGoLiveGate(),
  })

if (import.meta.main) {
  try {
    const report = await run()
    if (report.status === "failed") {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[go-live-finalize] failed: ${message}`)
    process.exitCode = 1
  }
}
