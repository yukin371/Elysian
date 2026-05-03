import {
  buildMigrationProposalSnapshot,
  type BuildMigrationProposalSnapshotInput,
} from "./migration-proposal-snapshot"

const snapshotInput: BuildMigrationProposalSnapshotInput = {
  databaseChangePlan: {
    canonicalMigrationOwner: "packages/persistence",
    dialect: "postgresql",
    operations: [
      {
        columns: [
          {
            defaultExpression: null,
            dictionaryTypeCode: null,
            enumOptions: [],
            name: "id",
            primaryKey: true,
            required: true,
            sourceFieldKey: "id",
            sourceFieldKind: "id",
            sqlType: "uuid",
          },
        ],
        notes: [],
        operation: "create-table",
        sourceSchemaName: "customer",
        tableName: "customer",
      },
    ],
    reviewRequired: true,
    sourceSchemaName: "customer",
  },
  generatedAt: "2026-05-03T00:00:00.000Z",
  reportPath: "/tmp/reports/customer.preview.json",
  schemaName: "customer",
  sessionId: "session-123",
}

describe("buildMigrationProposalSnapshot", () => {
  it("builds a stable snapshot payload for review handoff", () => {
    const snapshot = buildMigrationProposalSnapshot(snapshotInput)

    expect(snapshot).toMatchObject({
      generatedAt: "2026-05-03T00:00:00.000Z",
      reportPath: "/tmp/reports/customer.preview.json",
      schemaName: "customer",
      sessionId: "session-123",
      snapshotPath: "/tmp/reports/customer.migration-proposal.json",
    })
    expect(snapshot.migrationProposalResolution).toMatchObject({
      unsupportedReason: null,
      proposal: {
        canonicalMigrationOwner: "packages/persistence",
        tableName: "customer",
      },
    })
  })
})
