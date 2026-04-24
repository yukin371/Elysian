import { run as runCollect } from "./e2e-tenant-stability-collect"
import { run as runFinalize } from "./e2e-tenant-upgrade-finalize"

interface TenantUpgradeFinalizeFromDownloadsReport {
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

export const run =
  async (): Promise<TenantUpgradeFinalizeFromDownloadsReport> => {
    const collect = await runCollect()
    const finalize = await runFinalize()

    const report: TenantUpgradeFinalizeFromDownloadsReport = {
      generatedAt: new Date().toISOString(),
      status: finalize.status,
      steps: {
        collect: "passed",
        finalize: finalize.status,
      },
      outputs: {
        collectOutputDir: collect.outputDir,
      },
    }

    console.log(
      `[e2e-tenant-upgrade-finalize-from-downloads] status=${report.status} collect=${report.steps.collect} finalize=${report.steps.finalize}`,
    )
    console.log(
      `[e2e-tenant-upgrade-finalize-from-downloads] collectOutputDir=${report.outputs.collectOutputDir}`,
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
      `[e2e-tenant-upgrade-finalize-from-downloads] failed: ${message}`,
    )
    process.exitCode = 1
  }
}
