import {
  type DatabaseChangePlanLike,
  type MigrationProposalResolution,
  resolveMigrationProposalFromChangePlan,
} from "./migration-proposal"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

export interface MigrationProposalSnapshot {
  generatedAt: string
  migrationProposalResolution: MigrationProposalResolution
  reportPath: string
  schemaName: string
  sessionId: string
  snapshotPath: string
}

export interface BuildMigrationProposalSnapshotInput {
  databaseChangePlan: DatabaseChangePlanLike
  generatedAt: string
  reportPath: string
  schemaName: string
  sessionId: string
}

export const resolveMigrationProposalSnapshotPath = (
  reportPath: string,
): string => reportPath.replace(/\.preview\.json$/, ".migration-proposal.json")

export const buildMigrationProposalSnapshot = (
  input: BuildMigrationProposalSnapshotInput,
): MigrationProposalSnapshot => {
  const snapshotPath = resolveMigrationProposalSnapshotPath(input.reportPath)

  return {
    generatedAt: input.generatedAt,
    migrationProposalResolution: resolveMigrationProposalFromChangePlan(
      input.databaseChangePlan,
    ),
    reportPath: input.reportPath,
    schemaName: input.schemaName,
    sessionId: input.sessionId,
    snapshotPath,
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isString = (value: unknown): value is string =>
  typeof value === "string"

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string"

const isMigrationProposalResolution = (
  value: unknown,
): value is MigrationProposalResolution => {
  if (!isObject(value)) {
    return false
  }

  if (!isNullableString(value.unsupportedReason)) {
    return false
  }

  if (value.proposal === null) {
    return true
  }

  return (
    isObject(value.proposal) &&
    isString(value.proposal.tableName) &&
    isString(value.proposal.canonicalMigrationOwner)
  )
}

export const writeMigrationProposalSnapshot = async (
  snapshot: MigrationProposalSnapshot,
): Promise<void> => {
  await mkdir(dirname(snapshot.snapshotPath), { recursive: true })
  await writeFile(
    snapshot.snapshotPath,
    `${JSON.stringify(snapshot, null, 2)}\n`,
    "utf8",
  )
}

export const readMigrationProposalSnapshot = async (
  snapshotPath: string,
): Promise<MigrationProposalSnapshot> => {
  const contents = await readFile(snapshotPath, "utf8")
  const parsed = JSON.parse(contents) as unknown

  if (!isObject(parsed)) {
    throw new Error("Migration proposal snapshot must be a JSON object.")
  }

  if (
    !isString(parsed.generatedAt) ||
    !isMigrationProposalResolution(parsed.migrationProposalResolution) ||
    !isString(parsed.reportPath) ||
    !isString(parsed.schemaName) ||
    !isString(parsed.sessionId) ||
    !isString(parsed.snapshotPath)
  ) {
    throw new Error("Migration proposal snapshot JSON is invalid.")
  }

  if (parsed.snapshotPath !== snapshotPath) {
    throw new Error("Migration proposal snapshot path does not match file path.")
  }

  return {
    generatedAt: parsed.generatedAt,
    migrationProposalResolution: parsed.migrationProposalResolution,
    reportPath: parsed.reportPath,
    schemaName: parsed.schemaName,
    sessionId: parsed.sessionId,
    snapshotPath: parsed.snapshotPath,
  }
}
