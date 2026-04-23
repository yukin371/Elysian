import { run as runPhaseGate } from "./e2e-smoke-phase-exit-gate"
import { run as runPhaseDecision } from "./e2e-smoke-phase-transition-report"
import { run as runStabilityEvidence } from "./e2e-smoke-stability-evidence"

interface PhaseFinalizeReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    evidence: "passed" | "failed"
    decision: "passed" | "failed"
    gate: "passed" | "failed"
  }
  outputs: {
    evidencePath: string
    decisionPath: string
  }
}

export const run = async (): Promise<PhaseFinalizeReport> => {
  const evidence = await runStabilityEvidence()
  const decision = await runPhaseDecision()
  const gate = await runPhaseGate()

  const status: "passed" | "failed" = gate.status
  const report: PhaseFinalizeReport = {
    generatedAt: new Date().toISOString(),
    status,
    steps: {
      evidence: "passed",
      decision: "passed",
      gate: gate.status,
    },
    outputs: {
      evidencePath: `${evidence.outputDir}/e2e-smoke-stability-evidence.json`,
      decisionPath: decision.outputPath,
    },
  }

  console.log(
    `[e2e-smoke-phase-finalize] status=${report.status} evidence=${report.steps.evidence} decision=${report.steps.decision} gate=${report.steps.gate}`,
  )
  console.log(
    `[e2e-smoke-phase-finalize] evidencePath=${report.outputs.evidencePath}`,
  )
  console.log(
    `[e2e-smoke-phase-finalize] decisionPath=${report.outputs.decisionPath}`,
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
    console.error(`[e2e-smoke-phase-finalize] failed: ${message}`)
    process.exitCode = 1
  }
}
