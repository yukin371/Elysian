import { tmpdir } from "node:os"
import { join } from "node:path"

export type GeneratorReportStatus = "passed" | "failed"

export interface GeneratorReportRuntimeMetadata {
  platform: string
  arch: string
}

export interface GeneratorReportBase {
  gitSha: string
  runtime: GeneratorReportRuntimeMetadata
  startedAt: string
  finishedAt: string
  durationMs: number
  status: GeneratorReportStatus
  passedCount: number
  failedCount: number
  errorMessage?: string
}

export const resolveGeneratorReportDir = () =>
  process.env.ELYSIAN_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "generator")

export const resolveGeneratorReportGitSha = () =>
  process.env.GITHUB_SHA ?? "local"

export const createGeneratorReportRuntimeMetadata =
  (): GeneratorReportRuntimeMetadata => ({
    platform: process.platform,
    arch: process.arch,
  })
