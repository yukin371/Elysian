import { run as runDownload } from "./e2e-tenant-stability-download"
import { run as runFinalizeFromDownloads } from "./e2e-tenant-upgrade-finalize-from-downloads"

interface TenantUpgradeFinalizeFromGitHubReport {
  generatedAt: string
  status: "passed" | "failed"
  steps: {
    download: "passed" | "failed"
    finalizeFromDownloads: "passed" | "failed"
  }
  outputs: {
    downloadOutputDir: string
    collectOutputDir: string
  }
}

export const runWith = async (dependencies: {
  download: () => Promise<{ outputDir: string }>
  finalizeFromDownloads: () => Promise<{
    status: "passed" | "failed"
    outputs: { collectOutputDir: string }
  }>
}) => {
  const download = await dependencies.download()
  process.env.ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR = download.outputDir
  const finalize = await dependencies.finalizeFromDownloads()

  const report: TenantUpgradeFinalizeFromGitHubReport = {
    generatedAt: new Date().toISOString(),
    status: finalize.status,
    steps: {
      download: "passed",
      finalizeFromDownloads: finalize.status,
    },
    outputs: {
      downloadOutputDir: download.outputDir,
      collectOutputDir: finalize.outputs.collectOutputDir,
    },
  }

  console.log(
    `[e2e-tenant-upgrade-finalize-from-github] status=${report.status} download=${report.steps.download} finalizeFromDownloads=${report.steps.finalizeFromDownloads}`,
  )
  console.log(
    `[e2e-tenant-upgrade-finalize-from-github] downloadOutputDir=${report.outputs.downloadOutputDir}`,
  )
  console.log(
    `[e2e-tenant-upgrade-finalize-from-github] collectOutputDir=${report.outputs.collectOutputDir}`,
  )

  return report
}

export const run = async (argv: string[] = process.argv.slice(2)) =>
  runWith({
    download: () => runDownload(argv),
    finalizeFromDownloads: () => runFinalizeFromDownloads(),
  })

if (import.meta.main) {
  try {
    const report = await run()
    if (report.status === "failed") {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(
      `[e2e-tenant-upgrade-finalize-from-github] failed: ${message}`,
    )
    process.exitCode = 1
  }
}
