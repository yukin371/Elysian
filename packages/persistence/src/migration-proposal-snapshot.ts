import {
  type DatabaseChangePlanLike,
  type MigrationProposalResolution,
  resolveMigrationProposalFromChangePlan,
} from "./migration-proposal"

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

export const buildMigrationProposalSnapshot = (
  input: BuildMigrationProposalSnapshotInput,
): MigrationProposalSnapshot => {
  const snapshotPath = input.reportPath.replace(
    /\.preview\.json$/,
    ".migration-proposal.json",
  )

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
