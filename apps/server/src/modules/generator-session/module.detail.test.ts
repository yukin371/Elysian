import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "bun:test"

import {
  createGeneratorSessionModule,
  createInMemoryGeneratorSessionRepository,
} from ".."
import { AppError } from "../../errors"
import { errorCodes } from "../../errors/registry"
import {
  createTestApp,
  writeMigrationProposalSnapshotFixture,
} from "./test-helpers"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonRecord = async (response: { json(): Promise<unknown> }) => {
  const body: unknown = await response.json()

  if (!isRecord(body)) {
    throw new Error("Malformed JSON response")
  }

  return body
}

const readRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!isRecord(property)) {
    throw new Error(`Expected object field: ${key}`)
  }

  return property
}

const readString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "string") {
    throw new Error(`Expected string field: ${key}`)
  }

  return property
}

describe("generator session module detail responses", () => {
  it("surfaces unsupported sql proposal reasons on the detail endpoint", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const invalidChangePlan = {
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      operations: [
        {
          columns: [],
          notes: [],
          operation: "create-table",
          sourceSchemaName: "ticket",
          tableName: "ticket",
        },
        {
          columns: [],
          notes: [],
          operation: "create-table",
          sourceSchemaName: "ticket",
          tableName: "ticket_shadow",
        },
      ],
      reviewRequired: false,
      sourceSchemaName: "ticket",
    } satisfies Parameters<typeof writeMigrationProposalSnapshotFixture>[3]
    const session = await repository.createPreviewSession({
      conflictStrategy: "skip",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: false,
      outputDir: "/tmp/generator-session-unsupported",
      previewFileCount: 1,
      report: {
        databaseChangePlan: invalidChangePlan,
        files: [],
        schemaName: "ticket",
      } as never,
      reportPath: "/tmp/generator-session-unsupported/report.json",
      schemaName: "ticket",
      sourceType: "registered-schema",
      sourceValue: "ticket",
      targetPreset: "default",
    } as never)
    await writeMigrationProposalSnapshotFixture(
      session.reportPath,
      session.schemaName,
      session.id,
      invalidChangePlan,
    )

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = await readJsonRecord(response)
    const sqlProposalHandoff = readRecord(body, "sqlProposalHandoff")
    expect(body.sqlProposal).toBeNull()
    expect(sqlProposalHandoff).toMatchObject({
      proposalStatus: "unsupported",
      unsupportedReason: "Only single create-table change plans are supported.",
    })
  })

  it("surfaces target directory diffs and conflict explanations on the detail endpoint", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const validChangePlan = {
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      operations: [
        {
          columns: [
            {
              defaultExpression: "gen_random_uuid()",
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
          tableName: "customers",
        },
      ],
      reviewRequired: false,
      sourceSchemaName: "customer",
    } satisfies Parameters<typeof writeMigrationProposalSnapshotFixture>[3]
    const session = await repository.createPreviewSession({
      conflictStrategy: "fail",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: true,
      outputDir: "/tmp/generator-session-diff",
      previewFileCount: 3,
      report: {
        databaseChangePlan: validChangePlan,
        files: [
          {
            absolutePath:
              "/tmp/generator-session-diff/modules/customer/customer.schema.ts",
            contents: "export const customer = true\n",
            currentContents: null,
            exists: false,
            hasChanges: true,
            isManaged: true,
            mergeStrategy: "overwrite",
            path: "modules/customer/customer.schema.ts",
            plannedAction: "create",
            plannedReason: "new module schema file",
            reason: "",
          },
          {
            absolutePath:
              "/tmp/generator-session-diff/modules/customer/customer.service.ts",
            contents: "export const customerService = true\n",
            currentContents: "export const customerService = false\n",
            exists: true,
            hasChanges: true,
            isManaged: true,
            mergeStrategy: "overwrite",
            path: "modules/customer/customer.service.ts",
            plannedAction: "overwrite",
            plannedReason: "generated service updates existing logic",
            reason: "tracked file will be overwritten by the generator",
          },
          {
            absolutePath:
              "/tmp/generator-session-diff/modules/customer/customer.routes.ts",
            contents: "export const customerRoutes = true\n",
            currentContents: "export const customerRoutes = drifted\n",
            exists: true,
            hasChanges: false,
            isManaged: true,
            mergeStrategy: "fail",
            path: "modules/customer/customer.routes.ts",
            plannedAction: "block",
            plannedReason: "manual review required before overwrite",
            reason:
              "tracked file has drift and cannot be overwritten automatically",
          },
        ],
        schemaName: "customer",
      } as never,
      reportPath: "/tmp/generator-session-diff/report.json",
      schemaName: "customer",
      sourceType: "registered-schema",
      sourceValue: "customer",
      targetPreset: "default",
    } as never)
    await writeMigrationProposalSnapshotFixture(
      session.reportPath,
      session.schemaName,
      session.id,
      validChangePlan,
    )

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = await readJsonRecord(response)
    const sqlProposalHandoff = readRecord(body, "sqlProposalHandoff")
    const migrationProposalSnapshotPath = readString(
      sqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    expect(body.targetDirectoryDiff).toEqual([
      {
        directory: "modules/customer",
        fileCount: 3,
        changedFileCount: 2,
        actionCounts: {
          create: 1,
          overwrite: 1,
          skip: 0,
          block: 1,
        },
      },
    ])
    expect(sqlProposalHandoff.confirmationChecklist).toEqual([
      `Review the SQL draft and Drizzle snippet in ${migrationProposalSnapshotPath} before changing persistence files.`,
      `Verify the migration proposal snapshot at ${migrationProposalSnapshotPath} was generated from ${session.reportPath} at ${session.createdAt}.`,
      "Confirm the canonical owner and target paths match the intended persistence scope.",
      "Run db:generate and db:migrate only after manual sign-off.",
    ])
    expect(body.conflictExplanations).toEqual([
      {
        mergeStrategy: "overwrite",
        path: "modules/customer/customer.service.ts",
        plannedAction: "overwrite",
        plannedReason: "generated service updates existing logic",
        reason: "tracked file will be overwritten by the generator",
      },
      {
        mergeStrategy: "fail",
        path: "modules/customer/customer.routes.ts",
        plannedAction: "block",
        plannedReason: "manual review required before overwrite",
        reason:
          "tracked file has drift and cannot be overwritten automatically",
      },
    ])
  })

  it("rebuilds a missing migration proposal snapshot on detail lookup", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const reportRootDir = await mkdtemp(
      join(tmpdir(), "generator-session-missing-"),
    )
    const changePlan = {
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      operations: [
        {
          columns: [
            {
              defaultExpression: "gen_random_uuid()",
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
          tableName: "customers",
        },
      ],
      reviewRequired: false,
      sourceSchemaName: "customer",
    }
    const session = await repository.createPreviewSession({
      conflictStrategy: "fail",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: false,
      outputDir: reportRootDir,
      previewFileCount: 1,
      report: {
        databaseChangePlan: changePlan,
        files: [],
        schemaName: "customer",
      } as never,
      reportPath: join(reportRootDir, "report.preview.json"),
      schemaName: "customer",
      sourceType: "registered-schema",
      sourceValue: "customer",
      targetPreset: "default",
    } as never)

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = await readJsonRecord(response)
    const sqlProposalHandoff = readRecord(body, "sqlProposalHandoff")
    const migrationProposalSnapshotPath = readString(
      sqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )

    expect(migrationProposalSnapshotPath).toBe(
      join(reportRootDir, "report.migration-proposal.json"),
    )
    expect(sqlProposalHandoff.migrationProposalSnapshot).toMatchObject({
      generatedAt: "2026-04-20T00:00:00.000Z",
      migrationProposalResolution: {
        unsupportedReason: null,
      },
    })
    expect(sqlProposalHandoff.migrationProposalSnapshotRecovery).toEqual({
      archivedSnapshotPath: null,
      status: "rebuilt-from-missing",
    })

    const snapshotContents = await readFile(
      migrationProposalSnapshotPath,
      "utf8",
    )
    expect(snapshotContents).toContain('"snapshotPath"')
  })

  it("rebuilds a corrupted migration proposal snapshot on detail lookup", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const reportRootDir = await mkdtemp(
      join(tmpdir(), "generator-session-corrupt-"),
    )
    const changePlan = {
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      operations: [
        {
          columns: [
            {
              defaultExpression: "gen_random_uuid()",
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
          tableName: "customers",
        },
      ],
      reviewRequired: false,
      sourceSchemaName: "customer",
    }
    const session = await repository.createPreviewSession({
      conflictStrategy: "fail",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: false,
      outputDir: reportRootDir,
      previewFileCount: 1,
      report: {
        databaseChangePlan: changePlan,
        files: [],
        schemaName: "customer",
      } as never,
      reportPath: join(reportRootDir, "report.preview.json"),
      schemaName: "customer",
      sourceType: "registered-schema",
      sourceValue: "customer",
      targetPreset: "default",
    } as never)
    const corruptedSnapshotPath = join(
      reportRootDir,
      "report.migration-proposal.json",
    )
    await writeFile(corruptedSnapshotPath, '{"broken":true}', "utf8")

    const app = createTestApp([
      createGeneratorSessionModule(repository, {
        reportRootDir,
      }),
    ])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = await readJsonRecord(response)
    const sqlProposalHandoff = readRecord(body, "sqlProposalHandoff")
    const migrationProposalSnapshotPath = readString(
      sqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )

    expect(migrationProposalSnapshotPath).toBe(corruptedSnapshotPath)
    expect(sqlProposalHandoff.migrationProposalSnapshot).toMatchObject({
      generatedAt: "2026-04-20T00:00:00.000Z",
      migrationProposalResolution: {
        unsupportedReason: null,
      },
    })
    expect(sqlProposalHandoff.migrationProposalSnapshotRecovery).toMatchObject({
      status: "rebuilt-from-corrupt",
    })

    const rebuiltSnapshotContents = await readFile(
      migrationProposalSnapshotPath,
      "utf8",
    )
    expect(rebuiltSnapshotContents).toContain('"migrationProposalResolution"')
    expect(rebuiltSnapshotContents).toContain('"snapshotPath"')

    const snapshotRecovery =
      sqlProposalHandoff.migrationProposalSnapshotRecovery
    if (!isRecord(snapshotRecovery)) {
      throw new Error("Expected snapshot recovery metadata")
    }
    const archivedSnapshotName = snapshotRecovery.archivedSnapshotPath
    expect(archivedSnapshotName).toBeDefined()
    if (typeof archivedSnapshotName !== "string") {
      throw new Error("Expected archived snapshot path to be defined")
    }

    const archivedSnapshotContents = await readFile(
      archivedSnapshotName,
      "utf8",
    )
    expect(archivedSnapshotContents).toContain('"broken":true')
  })

  it("treats missing report files as not found on the detail endpoint", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const session = await repository.createPreviewSession({
      conflictStrategy: "fail",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: false,
      outputDir: "/tmp/generator-session-missing-report",
      previewFileCount: 1,
      report: {
        databaseChangePlan: {
          canonicalMigrationOwner: "packages/persistence",
          dialect: "postgresql",
          operations: [],
          reviewRequired: false,
          sourceSchemaName: "customer",
        },
        files: [],
        schemaName: "customer",
      } as never,
      reportPath: "/tmp/generator-session-missing-report/report.preview.json",
      schemaName: "customer",
      sourceType: "registered-schema",
      sourceValue: "customer",
      targetPreset: "default",
    } as never)

    const dbRepository = {
      ...repository,
      async getPreviewSessionById(id: string) {
        if (id !== session.id) {
          return null
        }

        throw Object.assign(new Error("ENOENT: no such file or directory"), {
          code: "ENOENT",
          path: session.reportPath,
        })
      },
    }

    const app = createTestApp([createGeneratorSessionModule(dbRepository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(404)

    const body = await readJsonRecord(response)
    expect(body.code).toBe(errorCodes.GENERATOR_SESSION_NOT_FOUND)
  })

  it("keeps malformed report payload errors explicit on the detail endpoint", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const session = await repository.createPreviewSession({
      conflictStrategy: "fail",
      createdAt: "2026-04-20T00:00:00.000Z",
      frontendTarget: "vue",
      hasBlockingConflicts: false,
      outputDir: "/tmp/generator-session-malformed-report",
      previewFileCount: 1,
      report: {
        databaseChangePlan: {
          canonicalMigrationOwner: "packages/persistence",
          dialect: "postgresql",
          operations: [],
          reviewRequired: false,
          sourceSchemaName: "customer",
        },
        files: [],
        schemaName: "customer",
      } as never,
      reportPath: "/tmp/generator-session-malformed-report/report.preview.json",
      schemaName: "customer",
      sourceType: "registered-schema",
      sourceValue: "customer",
      targetPreset: "default",
    } as never)

    const dbRepository = {
      ...repository,
      async getPreviewSessionById(id: string) {
        if (id !== session.id) {
          return null
        }

        throw new AppError({
          code: "GENERATOR_SESSION_REPORT_READ_FAILED",
          message: "Generator session report read failed",
          status: 500,
          expose: true,
          details: {
            reportPath: session.reportPath,
            reason: "Malformed generator preview report payload",
          },
        })
      },
    }

    const app = createTestApp([createGeneratorSessionModule(dbRepository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(500)

    const body = await readJsonRecord(response)
    const details = readRecord(body, "details")
    expect(body.code).toBe(errorCodes.GENERATOR_SESSION_REPORT_READ_FAILED)
    expect(details.reportPath).toBe(session.reportPath)
  })
})
