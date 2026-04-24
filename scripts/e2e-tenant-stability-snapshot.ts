import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

type TenantFailureCategory = "environment" | "dependency" | "test_case"
type TenantE2eStatus = "passed" | "failed"

interface TenantE2eReport {
  generatedAt: string
  status: TenantE2eStatus
  baseUrl: string
  durationMs: number
  lastStage: string
  failureCategory: TenantFailureCategory | null
  failureMessage: string | null
  tenantCodes: {
    alpha: string
    beta: string
  }
}

export interface TenantStabilitySnapshot {
  generatedAt: string
  gitSha: string | null
  githubRunId: string | null
  githubRunNumber: string | null
  githubEventName: string | null
  githubRef: string | null
  reportDir: string
  tenantE2eStatus: TenantE2eStatus | null
  lastStage: string | null
  failureCategory: TenantFailureCategory | null
  durationMs: number | null
  notes: string[]
}

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value : null
}

const resolveTenantReportDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_E2E_REPORT_DIR") ??
  join(
    readNonEmptyEnv("RUNNER_TEMP") ?? process.cwd(),
    "elysian-reports",
    "tenant",
  )

const resolveTenantReportPath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_E2E_REPORT_PATH") ??
  join(resolveTenantReportDir(), "e2e-tenant-report.json")

const resolveSnapshotPath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_SNAPSHOT_PATH") ??
  join(resolveTenantReportDir(), "e2e-tenant-stability-snapshot.json")

const readJsonFile = async <T>(path: string): Promise<T | null> => {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const run = async () => {
  const reportDir = resolveTenantReportDir()
  const reportPath = resolveTenantReportPath()
  const report = await readJsonFile<TenantE2eReport>(reportPath)
  const notes: string[] = []

  if (!report) {
    notes.push("Missing tenant e2e report.")
  }

  const snapshot: TenantStabilitySnapshot = {
    generatedAt: new Date().toISOString(),
    gitSha: readNonEmptyEnv("GITHUB_SHA"),
    githubRunId: readNonEmptyEnv("GITHUB_RUN_ID"),
    githubRunNumber: readNonEmptyEnv("GITHUB_RUN_NUMBER"),
    githubEventName: readNonEmptyEnv("GITHUB_EVENT_NAME"),
    githubRef: readNonEmptyEnv("GITHUB_REF"),
    reportDir,
    tenantE2eStatus: report?.status ?? null,
    lastStage: report?.lastStage ?? null,
    failureCategory: report?.failureCategory ?? null,
    durationMs: report?.durationMs ?? null,
    notes,
  }

  const outputPath = resolveSnapshotPath()
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(snapshot, null, 2), "utf8")

  console.log(`[e2e-tenant-stability] report: ${outputPath}`)
  console.log(
    `[e2e-tenant-stability] status=${snapshot.tenantE2eStatus ?? "unknown"} lastStage=${snapshot.lastStage ?? "unknown"} failureCategory=${snapshot.failureCategory ?? "unknown"}`,
  )
  for (const note of snapshot.notes) {
    console.warn(`[e2e-tenant-stability] note: ${note}`)
  }

  return snapshot
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-stability] failed: ${message}`)
    process.exitCode = 1
  }
}
