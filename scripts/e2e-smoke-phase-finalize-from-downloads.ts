import { run as runFinalize } from "./e2e-smoke-phase-finalize"
import { run as runCollect } from "./e2e-smoke-stability-collect"

interface PhaseFinalizeFromDownloadsReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    collect: "passed" | "failed"
    finalize: "passed" | "failed"
  }
  outputs: {
    collectOutputDir: string
  }
}

export const run = async (): Promise<PhaseFinalizeFromDownloadsReport> => {
  const collect = await runCollect()
  const finalize = await runFinalize()
  const status: "passed" | "failed" = finalize.status

  const report: PhaseFinalizeFromDownloadsReport = {
    generatedAt: new Date().toISOString(),
    status,
    steps: {
      collect: "passed",
      finalize: finalize.status,
    },
    outputs: {
      collectOutputDir: collect.outputDir,
    },
  }

  console.log(
    `[e2e-smoke-phase-finalize-from-downloads] status=${report.status} collect=${report.steps.collect} finalize=${report.steps.finalize}`,
  )
  console.log(
    `[e2e-smoke-phase-finalize-from-downloads] collectOutputDir=${report.outputs.collectOutputDir}`,
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
    console.error(
      `[e2e-smoke-phase-finalize-from-downloads] failed: ${message}`,
    )
    process.exitCode = 1
  }
}
