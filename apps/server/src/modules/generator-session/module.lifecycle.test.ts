import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "bun:test"
import { writeModuleFiles } from "@elysian/generator"
import { customerModuleSchema } from "@elysian/schema"

import {
  createGeneratorSessionModule,
  createInMemoryGeneratorSessionRepository,
} from ".."
import { errorCodes } from "../../errors/registry"
import {
  createAuthFixture,
  createAuthorizedHeaders,
  createGeneratorSessionAuthenticatedContext,
  createTestApp,
  loginAsAdmin,
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

const readNullableRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === null) {
    return null
  }

  if (!isRecord(property)) {
    throw new Error(`Expected nullable object field: ${key}`)
  }

  return property
}

const readRecordArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!Array.isArray(property) || !property.every(isRecord)) {
    throw new Error(`Expected object array field: ${key}`)
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

const readBoolean = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "boolean") {
    throw new Error(`Expected boolean field: ${key}`)
  }

  return property
}

const getOpenApiResponse = (
  paths: Record<string, unknown>,
  routePath: string,
  method: string,
  status: string,
) => {
  const route = readRecord(paths, routePath)
  const operation = readRecord(route, method)
  const responses = readRecord(operation, "responses")

  return responses[status]
}

describe("generator session module lifecycle", () => {
  it("publishes generator session success responses in the openapi spec", async () => {
    const repository = createInMemoryGeneratorSessionRepository()
    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(
      getOpenApiResponse(paths, "/studio/generator/sessions", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/studio/generator/sessions", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}",
        "get",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}",
        "get",
        "404",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/preview",
        "post",
        "201",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/preview",
        "post",
        "409",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/review",
        "post",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/review",
        "post",
        "404",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/confirm",
        "post",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/confirm",
        "post",
        "409",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/apply",
        "post",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/studio/generator/sessions/{id}/apply",
        "post",
        "500",
      ),
    ).toBeDefined()
  })

  it("does not mark identical generated files as blocking conflicts", async () => {
    const fixture = await createAuthFixture()
    const repository = createInMemoryGeneratorSessionRepository()
    const outputDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-output-"),
    )
    const reportRootDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-report-"),
    )

    await writeModuleFiles(customerModuleSchema, {
      outputDir,
      frontendTarget: "vue",
    })

    const app = createTestApp([
      fixture.authModule,
      createGeneratorSessionModule(repository, {
        authGuard: fixture.authGuard,
        reportRootDir,
        resolveOutputDir: () => outputDir,
      }),
    ])
    const accessToken = await loginAsAdmin(app)
    const response = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          ...createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
          }),
        },
        body: JSON.stringify({
          schemaName: "customer",
          frontendTarget: "vue",
          conflictStrategy: "fail",
          targetPreset: "staging",
        }),
      }),
    )

    expect(response.status).toBe(201)

    const body = await readJsonRecord(response)
    const session = readRecord(body, "session")
    const diff = readRecord(body, "diff")
    const actionCounts = readRecord(diff, "actionCounts")

    expect(readBoolean(session, "hasBlockingConflicts")).toBe(false)
    expect(diff).toMatchObject({
      changedFileCount: 0,
      unchangedFileCount: 6,
    })
    expect(actionCounts).toMatchObject({
      block: 0,
      skip: 6,
    })
  })

  it("creates, applies, lists, and gets generator preview sessions", async () => {
    const fixture = await createAuthFixture()
    const repository = createInMemoryGeneratorSessionRepository()
    const outputDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-output-"),
    )
    const reportRootDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-report-"),
    )
    const app = createTestApp([
      fixture.authModule,
      createGeneratorSessionModule(repository, {
        authGuard: fixture.authGuard,
        reportRootDir,
        resolveOutputDir: () => outputDir,
        auditLogWriter: (event) =>
          fixture.repository.createAuditLog({
            ...event,
          }),
      }),
    ])
    const accessToken = await loginAsAdmin(app)

    const createResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          ...createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
            "user-agent": "generator-session-test-agent",
            "x-request-id": "req-generator-session-1",
          }),
        },
        body: JSON.stringify({
          schemaName: "customer",
          frontendTarget: "vue",
          conflictStrategy: "fail",
          targetPreset: "staging",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createBody = await readJsonRecord(createResponse)
    const createSession = readRecord(createBody, "session")
    const createDiff = readRecord(createBody, "diff")
    const createReport = readRecord(createBody, "report")
    const createDatabaseChangePlan = readRecord(
      createReport,
      "databaseChangePlan",
    )
    const createOperations = readRecordArray(
      createDatabaseChangePlan,
      "operations",
    )
    const createSqlPreview = readRecord(createReport, "sqlPreview")
    const createSqlProposal = readRecord(createBody, "sqlProposal")
    const createSqlProposalRisks = readRecordArray(createSqlProposal, "risks")
    const createSqlProposalHandoff = readRecord(
      createBody,
      "sqlProposalHandoff",
    )
    const createMigrationProposalSnapshot = readRecord(
      createSqlProposalHandoff,
      "migrationProposalSnapshot",
    )
    const createMigrationProposalSnapshotPath = readString(
      createSqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    const createSessionId = readString(createSession, "id")
    const createSessionActorUserId = readString(createSession, "actorUserId")
    const createSessionCreatedAt = readString(createSession, "createdAt")
    const createSessionReportPath = readString(createSession, "reportPath")

    expect(createSession.schemaName).toBe("customer")
    expect(createSession.sourceType).toBe("registered-schema")
    expect(createSession.actorUsername).toBe("admin")
    expect(createSession.previewFileCount).toBe(6)
    expect(createSession.applyEvidence).toBeNull()
    expect(createSession.reviewEvidence).toBeNull()
    expect(createSession.status).toBe("pending_review")
    expect(createDiff).toEqual({
      totalFileCount: 6,
      changedFileCount: 6,
      unchangedFileCount: 0,
      actionCounts: {
        create: 6,
        overwrite: 0,
        skip: 0,
        block: 0,
      },
    })
    expect(createReport.schemaName).toBe("customer")
    expect(createOperations[0]?.tableName).toBe("customer")
    expect(createSqlPreview.tableName).toBe("customer")
    expect(createSqlProposal).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      tableName: "customer",
    })
    expect(
      createSqlProposalRisks.map((risk) => readString(risk, "code")),
    ).toContain("review-required")
    expect(createSqlProposalHandoff).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      proposalStatus: "ready",
      reviewMode: "manual",
      targetPaths: {
        drizzleDir: "packages/persistence/drizzle",
        schemaDir: "packages/persistence/src/schema",
      },
    })
    expect(createMigrationProposalSnapshotPath).toMatch(
      /\.migration-proposal\.json$/,
    )
    expect(createMigrationProposalSnapshot).toMatchObject({
      generatedAt: createSessionCreatedAt,
      migrationProposalResolution: {
        unsupportedReason: null,
      },
      snapshotPath: createMigrationProposalSnapshotPath,
    })
    expect(createSqlProposalHandoff.suggestedCommands).toContain(
      "bun run db:generate",
    )
    const migrationProposalSnapshotContents = await readFile(
      createMigrationProposalSnapshotPath,
      "utf8",
    )
    expect(migrationProposalSnapshotContents).toContain(
      '"migrationProposalResolution"',
    )
    expect(migrationProposalSnapshotContents).toContain(
      '"schemaName": "customer"',
    )
    expect(migrationProposalSnapshotContents).toContain('"snapshotPath"')

    const reportContents = await readFile(createSessionReportPath, "utf8")
    expect(reportContents).toContain('"schemaName": "customer"')
    expect(reportContents).toContain('"databaseChangePlan"')

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/review`,
        {
          method: "POST",
          headers: {
            ...createAuthorizedHeaders(accessToken, {
              "content-type": "application/json",
              "user-agent": "generator-session-test-agent",
              "x-request-id": "req-generator-session-review-1",
            }),
          },
          body: JSON.stringify({
            decision: "approve",
            comment: "Looks good for staging",
          }),
        },
      ),
    )
    expect(reviewResponse.status).toBe(200)

    const reviewBody = await readJsonRecord(reviewResponse)
    const reviewSession = readRecord(reviewBody, "session")
    const reviewDiff = readRecord(reviewBody, "diff")
    const reviewSqlProposal = readRecord(reviewBody, "sqlProposal")
    const reviewSqlProposalHandoff = readRecord(
      reviewBody,
      "sqlProposalHandoff",
    )
    const reviewMigrationProposalSnapshot = readRecord(
      reviewSqlProposalHandoff,
      "migrationProposalSnapshot",
    )
    const reviewEvidence = readRecord(reviewSession, "reviewEvidence")
    const reviewMigrationProposalSnapshotRecovery = readNullableRecord(
      reviewSqlProposalHandoff,
      "migrationProposalSnapshotRecovery",
    )
    const reviewMigrationProposalSnapshotPath = readString(
      reviewSqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )

    expect(reviewSession.id).toBe(createSessionId)
    expect(reviewSession.status).toBe("ready")
    expect(reviewSession.reviewComment).toBe("Looks good for staging")
    expect(reviewSession.reviewedByUserId).toBe(createSessionActorUserId)
    expect(reviewEvidence).toMatchObject({
      sessionId: createSessionId,
      reportPath: createSessionReportPath,
      actorUserId: createSessionActorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(reviewEvidence.reviewedAt).toBe(reviewSession.reviewedAt)
    expect(reviewDiff.totalFileCount).toBe(6)
    expect(reviewSqlProposal.tableName).toBe("customer")
    expect(reviewSqlProposalHandoff.proposalStatus).toBe("ready")
    expect(reviewMigrationProposalSnapshot).toMatchObject({
      snapshotPath: reviewMigrationProposalSnapshotPath,
    })

    const confirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
            "user-agent": "generator-session-test-agent",
            "x-request-id": "req-generator-session-confirm-1",
          }),
          body: JSON.stringify({
            displayedRecoveryStatus:
              reviewMigrationProposalSnapshotRecovery === null
                ? "none"
                : readString(reviewMigrationProposalSnapshotRecovery, "status"),
            displayedSnapshotPath: reviewMigrationProposalSnapshotPath,
          }),
        },
      ),
    )
    expect(confirmResponse.status).toBe(200)

    const confirmBody = await readJsonRecord(confirmResponse)
    const confirmSession = readRecord(confirmBody, "session")
    const confirmSqlProposalHandoff = readRecord(
      confirmBody,
      "sqlProposalHandoff",
    )
    const confirmMigrationProposalSnapshot = readRecord(
      confirmSqlProposalHandoff,
      "migrationProposalSnapshot",
    )
    const confirmEvidence = readRecord(confirmSession, "confirmationEvidence")
    const confirmMigrationProposalSnapshotPath = readString(
      confirmSqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    expect(confirmSession.id).toBe(createSessionId)
    expect(confirmSession.confirmedByUserId).toBe(createSessionActorUserId)
    expect(confirmEvidence).toMatchObject({
      sessionId: createSessionId,
      reportPath: createSessionReportPath,
      snapshotPath: confirmMigrationProposalSnapshotPath,
      recoveryStatus: "none",
      archivedSnapshotPath: null,
      actorUserId: createSessionActorUserId,
    })
    expect(confirmEvidence.confirmedAt).toBe(confirmSession.confirmedAt)
    expect(confirmEvidence.checklist).toEqual(
      confirmSqlProposalHandoff.confirmationChecklist,
    )
    expect(confirmMigrationProposalSnapshot).toMatchObject({
      snapshotPath: confirmMigrationProposalSnapshotPath,
    })
    expect(confirmSqlProposalHandoff.confirmationChecklist).toEqual([
      `Review the SQL draft and Drizzle snippet in ${confirmMigrationProposalSnapshotPath} before changing persistence files.`,
      `Verify the migration proposal snapshot at ${confirmMigrationProposalSnapshotPath} was generated from ${createSessionReportPath} at ${createSessionCreatedAt}.`,
      "Confirm the canonical owner and target paths match the intended persistence scope.",
      "Run db:generate and db:migrate only after manual sign-off.",
    ])

    const applyResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/apply`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "user-agent": "generator-session-test-agent",
            "x-request-id": "req-generator-session-apply-1",
          }),
        },
      ),
    )
    expect(applyResponse.status).toBe(200)

    const applyBody = await readJsonRecord(applyResponse)
    const applyDiff = readRecord(applyBody, "diff")
    const applySession = readRecord(applyBody, "session")
    const applyResult = readRecord(applyBody, "apply")
    const applyEvidence = readRecord(applyResult, "evidence")
    const applyFiles = readRecordArray(applyResult, "files")
    const applySqlProposal = readRecord(applyBody, "sqlProposal")
    const applySqlProposalHandoff = readRecord(applyBody, "sqlProposalHandoff")
    const applyMigrationProposalSnapshot = readRecord(
      applySqlProposalHandoff,
      "migrationProposalSnapshot",
    )
    const applyManifestPath = readString(applyResult, "manifestPath")
    const applySessionAppliedAt = readString(applySession, "appliedAt")
    const applySessionApplyManifestPath = readString(
      applySession,
      "applyManifestPath",
    )
    const applySessionId = readString(applySession, "id")
    const applySessionActorUserId = readString(applySession, "appliedByUserId")
    const applyMigrationProposalSnapshotPath = readString(
      applySqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    expect(applySessionId).toBe(createSessionId)
    expect(applySession.status).toBe("applied")
    expect(applySessionAppliedAt).toBeTruthy()
    expect(applySession.appliedFileCount).toBe(6)
    expect(applySessionActorUserId).toBe(createSessionActorUserId)
    expect(applySession.skippedFileCount).toBe(0)
    expect(applySession.applyRequestId).toBe("req-generator-session-apply-1")
    expect(applySessionApplyManifestPath).toBe(applyManifestPath)
    expect(applySession.confirmedAt).toBeTruthy()
    expect(applySession.reviewEvidence).toMatchObject({
      actorUserId: createSessionActorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(applyDiff).toEqual(createDiff)
    expect(applyEvidence).toMatchObject({
      sessionId: createSessionId,
      reportPath: createSessionReportPath,
      manifestPath: applyManifestPath,
      actorUserId: createSessionActorUserId,
      requestId: "req-generator-session-apply-1",
    })
    expect(applyEvidence.appliedAt).toBe(applySessionAppliedAt)
    expect(applySession.applyEvidence).toEqual(applyEvidence)
    expect(applyFiles.every((file) => readBoolean(file, "written"))).toBe(true)
    expect(applySqlProposal.tableName).toBe("customer")
    expect(applySqlProposalHandoff.proposalStatus).toBe("ready")
    expect(applyMigrationProposalSnapshot).toMatchObject({
      snapshotPath: applyMigrationProposalSnapshotPath,
    })

    const manifestContents = await readFile(applyManifestPath, "utf8")
    expect(manifestContents).toContain('"schemaName": "customer"')

    const listResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )
    expect(listResponse.status).toBe(200)

    const listBody = await readJsonRecord(listResponse)
    const listItems = readRecordArray(listBody, "items")
    expect(listItems).toHaveLength(1)
    const firstListItem = listItems[0]
    if (!firstListItem) {
      throw new Error("Expected list item")
    }
    const firstListItemApplyEvidence = readRecord(
      firstListItem,
      "applyEvidence",
    )
    const firstListItemReviewEvidence = readRecord(
      firstListItem,
      "reviewEvidence",
    )
    expect(firstListItem).toMatchObject({
      id: createSessionId,
      schemaName: "customer",
    })
    expect(firstListItemApplyEvidence.requestId).toBe(
      "req-generator-session-apply-1",
    )
    expect(firstListItemReviewEvidence).toMatchObject({
      comment: "Looks good for staging",
      decision: "approve",
    })

    const detailResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}`,
        {
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )
    expect(detailResponse.status).toBe(200)

    const detailBody = await readJsonRecord(detailResponse)
    const detailDiffSummary = readRecord(detailBody, "diffSummary")
    const detailDiffActionCounts = readRecord(detailDiffSummary, "actionCounts")
    const detailApplyEvidence = readRecord(detailBody, "applyEvidence")
    const detailReviewEvidence = readRecord(detailBody, "reviewEvidence")
    const detailSqlProposal = readRecord(detailBody, "sqlProposal")
    const detailSqlProposalHandoff = readRecord(
      detailBody,
      "sqlProposalHandoff",
    )
    const detailMigrationProposalSnapshot = readRecord(
      detailSqlProposalHandoff,
      "migrationProposalSnapshot",
    )
    const detailMigrationProposalSnapshotPath = readString(
      detailSqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    expect(detailBody).toMatchObject({
      id: createSessionId,
      report: {
        schemaName: "customer",
      },
    })
    expect(detailDiffSummary.totalFileCount).toBe(6)
    expect(detailDiffActionCounts.create).toBe(6)
    expect(detailApplyEvidence).toMatchObject({
      actorUserId: createSessionActorUserId,
      requestId: "req-generator-session-apply-1",
    })
    expect(detailReviewEvidence).toMatchObject({
      actorUserId: createSessionActorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(detailSqlProposal.tableName).toBe("customer")
    expect(detailSqlProposalHandoff).toMatchObject({
      proposalStatus: "ready",
      targetPaths: {
        persistenceIndexFile: "packages/persistence/src/index.ts",
      },
    })
    expect(detailMigrationProposalSnapshot).toMatchObject({
      snapshotPath: detailMigrationProposalSnapshotPath,
    })
    expect(detailMigrationProposalSnapshotPath).toBe(
      createMigrationProposalSnapshotPath,
    )

    const auditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "preview_create",
    )
    expect(auditLog).toMatchObject({
      category: "generator",
      action: "preview_create",
      actorUserId: createSessionActorUserId,
      targetType: "generator-session",
      targetId: createSessionId,
      requestId: "req-generator-session-1",
      userAgent: "generator-session-test-agent",
      result: "success",
    })

    const applyAuditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "staging_apply",
    )
    expect(applyAuditLog).toMatchObject({
      category: "generator",
      action: "staging_apply",
      actorUserId: createSessionActorUserId,
      targetType: "generator-session",
      targetId: createSessionId,
      requestId: "req-generator-session-apply-1",
      userAgent: "generator-session-test-agent",
      result: "success",
    })

    const reviewAuditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "review_approve",
    )
    expect(reviewAuditLog).toMatchObject({
      category: "generator",
      action: "review_approve",
      actorUserId: createSessionActorUserId,
      targetType: "generator-session",
      targetId: createSessionId,
      requestId: "req-generator-session-review-1",
      userAgent: "generator-session-test-agent",
      result: "success",
    })

    const confirmAuditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "review_confirm",
    )
    expect(confirmAuditLog).toMatchObject({
      category: "generator",
      action: "review_confirm",
      actorUserId: createSessionActorUserId,
      targetType: "generator-session",
      targetId: createSessionId,
      requestId: "req-generator-session-confirm-1",
      userAgent: "generator-session-test-agent",
      result: "success",
    })
  })

  it("reuses the original confirmation evidence when the same session is confirmed twice", async () => {
    const { accessToken, app } =
      await createGeneratorSessionAuthenticatedContext()

    const createResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          ...createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
          }),
        },
        body: JSON.stringify({
          schemaName: "customer",
          frontendTarget: "vue",
          conflictStrategy: "fail",
          targetPreset: "staging",
        }),
      }),
    )
    expect(createResponse.status).toBe(201)

    const createBody = await readJsonRecord(createResponse)
    const createSession = readRecord(createBody, "session")
    const createSqlProposalHandoff = readRecord(
      createBody,
      "sqlProposalHandoff",
    )
    const createSessionId = readString(createSession, "id")
    const createMigrationProposalSnapshotPath = readString(
      createSqlProposalHandoff,
      "migrationProposalSnapshotPath",
    )
    const createMigrationProposalSnapshotRecovery = readNullableRecord(
      createSqlProposalHandoff,
      "migrationProposalSnapshotRecovery",
    )

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/review`,
        {
          method: "POST",
          headers: {
            ...createAuthorizedHeaders(accessToken, {
              "content-type": "application/json",
            }),
          },
          body: JSON.stringify({
            decision: "approve",
            comment: "Ready for confirmation replay",
          }),
        },
      ),
    )
    expect(reviewResponse.status).toBe(200)

    const firstConfirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
            "x-request-id": "req-generator-session-confirm-replay-1",
          }),
          body: JSON.stringify({
            displayedRecoveryStatus:
              createMigrationProposalSnapshotRecovery === null
                ? "none"
                : readString(createMigrationProposalSnapshotRecovery, "status"),
            displayedSnapshotPath: createMigrationProposalSnapshotPath,
          }),
        },
      ),
    )
    expect(firstConfirmResponse.status).toBe(200)

    const firstConfirmBody = await readJsonRecord(firstConfirmResponse)
    const firstConfirmSession = readRecord(firstConfirmBody, "session")
    const firstConfirmEvidence = readRecord(
      firstConfirmSession,
      "confirmationEvidence",
    )

    const secondConfirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
            "x-request-id": "req-generator-session-confirm-replay-2",
          }),
          body: JSON.stringify({
            displayedRecoveryStatus:
              createMigrationProposalSnapshotRecovery === null
                ? "none"
                : readString(createMigrationProposalSnapshotRecovery, "status"),
            displayedSnapshotPath: createMigrationProposalSnapshotPath,
          }),
        },
      ),
    )
    expect(secondConfirmResponse.status).toBe(200)

    const secondConfirmBody = await readJsonRecord(secondConfirmResponse)
    const secondConfirmSession = readRecord(secondConfirmBody, "session")
    const secondConfirmEvidence = readRecord(
      secondConfirmSession,
      "confirmationEvidence",
    )

    expect(secondConfirmSession.confirmedAt).toBe(
      firstConfirmSession.confirmedAt,
    )
    expect(secondConfirmEvidence).toEqual(firstConfirmEvidence)
  })

  it("requires confirmation before applying a ready generator preview session", async () => {
    const { accessToken, app } =
      await createGeneratorSessionAuthenticatedContext()

    const createResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          ...createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
          }),
        },
        body: JSON.stringify({
          schemaName: "customer",
          frontendTarget: "vue",
          conflictStrategy: "fail",
          targetPreset: "staging",
        }),
      }),
    )
    expect(createResponse.status).toBe(201)

    const createBody = await readJsonRecord(createResponse)
    const createSession = readRecord(createBody, "session")
    const createSessionId = readString(createSession, "id")

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/review`,
        {
          method: "POST",
          headers: {
            ...createAuthorizedHeaders(accessToken, {
              "content-type": "application/json",
            }),
          },
          body: JSON.stringify({
            decision: "approve",
            comment: "Approved but not confirmed yet",
          }),
        },
      ),
    )
    expect(reviewResponse.status).toBe(200)

    const applyResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createSessionId}/apply`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )

    expect(applyResponse.status).toBe(409)
    const errorBody = await readJsonRecord(applyResponse)
    expect(errorBody.code).toBe(
      errorCodes.GENERATOR_SESSION_CONFIRMATION_REQUIRED,
    )
  })
})
