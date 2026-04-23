import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

type SmokeFailureCategory = "environment" | "dependency" | "test_case"

interface SmokeReportsIndex {
  generatedAt: string
  reportDir: string
  finalStatus: "passed" | "failed"
  recoveredByRetry: boolean
  attempts: Array<{
    attempt: "attempt1" | "attempt2"
    reportPath: string
    diagnosisPath: string | null
    status: "passed" | "failed"
    failureCategory: SmokeFailureCategory | null
    lastStage: string
    shouldRetry: boolean | null
  }>
}

interface SmokeGateReport {
  generatedAt: string
  indexPath: string
  status: "passed" | "failed"
  conclusion: string
}

interface SmokeStabilitySnapshot {
  generatedAt: string
  gitSha: string | null
  githubRunId: string | null
  githubRunNumber: string | null
  githubEventName: string | null
  githubRef: string | null
  reportDir: string
  gateStatus: "passed" | "failed" | "unknown"
  smokeFinalStatus: "passed" | "failed" | null
  recoveredByRetry: boolean | null
  attempts: number | null
  gateConclusion: string | null
  notes: string[]
}

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(process.env.RUNNER_TEMP ?? process.cwd(), "elysian-reports", "smoke")

const readJsonFile = async <T>(path: string): Promise<T | null> => {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const run = async () => {
  const reportDir = resolveSmokeReportDir()
  const gatePath = join(reportDir, "e2e-smoke-reports-gate.json")
  const indexPath = join(reportDir, "e2e-smoke-reports-index.json")

  const gate = await readJsonFile<SmokeGateReport>(gatePath)
  const index = await readJsonFile<SmokeReportsIndex>(indexPath)

  const notes: string[] = []
  if (!gate) {
    notes.push("Missing smoke gate report.")
  }
  if (!index) {
    notes.push("Missing smoke index report.")
  }

  const snapshot: SmokeStabilitySnapshot = {
    generatedAt: new Date().toISOString(),
    gitSha: process.env.GITHUB_SHA ?? null,
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
    githubRunNumber: process.env.GITHUB_RUN_NUMBER ?? null,
    githubEventName: process.env.GITHUB_EVENT_NAME ?? null,
    githubRef: process.env.GITHUB_REF ?? null,
    reportDir,
    gateStatus: gate?.status ?? "unknown",
    smokeFinalStatus: index?.finalStatus ?? null,
    recoveredByRetry: index?.recoveredByRetry ?? null,
    attempts: index?.attempts.length ?? null,
    gateConclusion: gate?.conclusion ?? null,
    notes,
  }

  const outputPath = join(reportDir, "e2e-smoke-stability-snapshot.json")
  await mkdir(reportDir, { recursive: true })
  await writeFile(outputPath, JSON.stringify(snapshot, null, 2), "utf8")

  console.log(`[e2e-smoke-stability] report: ${outputPath}`)
  console.log(
    `[e2e-smoke-stability] gateStatus=${snapshot.gateStatus} finalStatus=${snapshot.smokeFinalStatus ?? "unknown"} recoveredByRetry=${snapshot.recoveredByRetry === null ? "unknown" : String(snapshot.recoveredByRetry)}`,
  )
  for (const note of snapshot.notes) {
    console.warn(`[e2e-smoke-stability] note: ${note}`)
  }

  return snapshot
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-stability] failed: ${message}`)
    process.exitCode = 1
  }
}
