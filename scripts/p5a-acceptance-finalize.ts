import { run as runAcceptance } from "./p5a-acceptance"
import { run as runAcceptanceGate } from "./p5a-acceptance-gate"
import { run as runAcceptanceIndex } from "./p5a-acceptance-index"

interface P5aAcceptanceFinalizeReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    acceptance: "passed" | "failed"
    gate: "passed" | "failed"
    index: "passed" | "failed"
  }
  outputs: {
    acceptanceReportPath: string
    gateReportPath: string
    indexReportPath: string
  }
}

export const run = async (): Promise<P5aAcceptanceFinalizeReport> => {
  const acceptance = await runAcceptance()
  const gate = await runAcceptanceGate()
  const index = await runAcceptanceIndex()

  const report: P5aAcceptanceFinalizeReport = {
    generatedAt: new Date().toISOString(),
    status: index.status,
    steps: {
      acceptance: acceptance.status,
      gate: gate.status,
      index: index.status,
    },
    outputs: {
      acceptanceReportPath: `${acceptance.outputs.reportDir}/p5a-acceptance-report.json`,
      gateReportPath: `${acceptance.outputs.reportDir}/p5a-acceptance-gate.json`,
      indexReportPath: `${acceptance.outputs.reportDir}/p5a-acceptance-index.json`,
    },
  }

  console.log(
    `[p5a-acceptance-finalize] status=${report.status} acceptance=${report.steps.acceptance} gate=${report.steps.gate} index=${report.steps.index}`,
  )
  console.log(
    `[p5a-acceptance-finalize] acceptanceReportPath=${report.outputs.acceptanceReportPath}`,
  )
  console.log(
    `[p5a-acceptance-finalize] gateReportPath=${report.outputs.gateReportPath}`,
  )
  console.log(
    `[p5a-acceptance-finalize] indexReportPath=${report.outputs.indexReportPath}`,
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
    console.error(`[p5a-acceptance-finalize] failed: ${message}`)
    process.exitCode = 1
  }
}
