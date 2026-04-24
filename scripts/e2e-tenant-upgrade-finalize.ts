import { run as runStabilityEvidence } from "./e2e-tenant-stability-evidence"
import { run as runUpgradeDecision } from "./e2e-tenant-upgrade-decision"
import { run as runUpgradeGate } from "./e2e-tenant-upgrade-gate"

interface TenantUpgradeFinalizeReport {
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

export const run = async (): Promise<TenantUpgradeFinalizeReport> => {
  const evidence = await runStabilityEvidence()
  const decision = await runUpgradeDecision()
  const gate = await runUpgradeGate()

  const report: TenantUpgradeFinalizeReport = {
    generatedAt: new Date().toISOString(),
    status: gate.status,
    steps: {
      evidence: "passed",
      decision: "passed",
      gate: gate.status,
    },
    outputs: {
      evidencePath: `${evidence.outputDir}/e2e-tenant-stability-evidence.json`,
      decisionPath: decision.outputPath,
    },
  }

  console.log(
    `[e2e-tenant-upgrade-finalize] status=${report.status} evidence=${report.steps.evidence} decision=${report.steps.decision} gate=${report.steps.gate}`,
  )
  console.log(
    `[e2e-tenant-upgrade-finalize] evidencePath=${report.outputs.evidencePath}`,
  )
  console.log(
    `[e2e-tenant-upgrade-finalize] decisionPath=${report.outputs.decisionPath}`,
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
    console.error(`[e2e-tenant-upgrade-finalize] failed: ${message}`)
    process.exitCode = 1
  }
}
