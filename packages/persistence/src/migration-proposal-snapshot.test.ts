import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildMigrationProposalSnapshot,
  type BuildMigrationProposalSnapshotInput,
  readMigrationProposalSnapshot,
  writeMigrationProposalSnapshot,
} from "./migration-proposal-snapshot"

const buildSnapshotInput = (
  reportPath: string,
): BuildMigrationProposalSnapshotInput => ({
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
  reportPath,
  schemaName: "customer",
  sessionId: "session-123",
})

describe("buildMigrationProposalSnapshot", () => {
  it("builds a stable snapshot payload for review handoff", () => {
    const snapshot = buildMigrationProposalSnapshot(
      buildSnapshotInput("/tmp/reports/customer.preview.json"),
    )

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

  it("writes and reads a snapshot roundtrip", async () => {
    const reportRootDir = await mkdtemp(join(tmpdir(), "elysian-snapshot-"))
    const snapshot = buildMigrationProposalSnapshot(
      buildSnapshotInput(join(reportRootDir, "customer.preview.json")),
    )

    await writeMigrationProposalSnapshot(snapshot)

    const readSnapshot = await readMigrationProposalSnapshot(
      snapshot.snapshotPath,
    )

    expect(readSnapshot).toEqual(snapshot)
  })

  it("rejects a snapshot file whose embedded path does not match the file path", async () => {
    const reportRootDir = await mkdtemp(join(tmpdir(), "elysian-snapshot-"))
    const snapshot = buildMigrationProposalSnapshot(
      buildSnapshotInput(join(reportRootDir, "customer.preview.json")),
    )

    await writeFile(
      snapshot.snapshotPath,
      `${JSON.stringify(
        {
          ...snapshot,
          snapshotPath: join(reportRootDir, "other.migration-proposal.json"),
        },
        null,
        2,
      )}\n`,
      "utf8",
    )

    await expect(
      readMigrationProposalSnapshot(snapshot.snapshotPath),
    ).rejects.toThrow(
      "Migration proposal snapshot path does not match file path.",
    )
  })
})
