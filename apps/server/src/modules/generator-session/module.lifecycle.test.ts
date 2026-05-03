import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "bun:test"

import {
  createGeneratorSessionModule,
  createInMemoryGeneratorSessionRepository,
} from ".."
import {
  createAuthFixture,
  createAuthorizedHeaders,
  createGeneratorSessionAuthenticatedContext,
  createTestApp,
  loginAsAdmin,
} from "./test-helpers"

describe("generator session module lifecycle", () => {
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

    const createBody = (await createResponse.json()) as {
      diff: {
        actionCounts: {
          block: number
          create: number
          overwrite: number
          skip: number
        }
        changedFileCount: number
        totalFileCount: number
        unchangedFileCount: number
      }
      session: {
        createdAt: string
        appliedAt: string | null
        appliedFileCount: number | null
        applyEvidence: null
        applyManifestPath: string | null
        id: string
        actorUserId: string
        actorUsername: string
        previewFileCount: number
        reportPath: string
        reviewEvidence: null
        schemaName: string
        sourceType: string
        status: string
      }
      report: {
        databaseChangePlan: {
          operations: Array<{
            tableName: string
          }>
        }
        schemaName: string
        sqlPreview: {
          tableName: string
        }
      }
      sqlProposal: {
        canonicalMigrationOwner: string
        risks: Array<{
          code: string
        }>
        tableName: string
      }
      sqlProposalHandoff: {
        canonicalMigrationOwner: string
        migrationProposalSnapshot: {
          generatedAt: string
          migrationProposalResolution: {
            proposal: {
              tableName: string
            } | null
            unsupportedReason: string | null
          }
          snapshotPath: string
        }
        migrationProposalSnapshotPath: string
        proposalStatus: string
        reviewMode: string
        suggestedCommands: string[]
        targetPaths: {
          drizzleDir: string
          schemaDir: string
        }
      }
    }

    expect(createBody.session.schemaName).toBe("customer")
    expect(createBody.session.sourceType).toBe("registered-schema")
    expect(createBody.session.actorUsername).toBe("admin")
    expect(createBody.session.previewFileCount).toBe(6)
    expect(createBody.session.applyEvidence).toBeNull()
    expect(createBody.session.reviewEvidence).toBeNull()
    expect(createBody.session.status).toBe("pending_review")
    expect(createBody.diff).toEqual({
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
    expect(createBody.report.schemaName).toBe("customer")
    expect(createBody.report.databaseChangePlan.operations[0]?.tableName).toBe(
      "customer",
    )
    expect(createBody.report.sqlPreview.tableName).toBe("customer")
    expect(createBody.sqlProposal).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      tableName: "customer",
    })
    expect(createBody.sqlProposal.risks.map((risk) => risk.code)).toContain(
      "review-required",
    )
    expect(createBody.sqlProposalHandoff).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      proposalStatus: "ready",
      reviewMode: "manual",
      targetPaths: {
        drizzleDir: "packages/persistence/drizzle",
        schemaDir: "packages/persistence/src/schema",
      },
    })
    expect(createBody.sqlProposalHandoff.migrationProposalSnapshotPath).toMatch(
      /\.migration-proposal\.json$/,
    )
    expect(
      createBody.sqlProposalHandoff.migrationProposalSnapshot,
    ).toMatchObject({
      generatedAt: createBody.session.createdAt,
      migrationProposalResolution: {
        unsupportedReason: null,
      },
      snapshotPath: createBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    })
    expect(createBody.sqlProposalHandoff.suggestedCommands).toContain(
      "bun run db:generate",
    )
    const migrationProposalSnapshotContents = await readFile(
      createBody.sqlProposalHandoff.migrationProposalSnapshotPath,
      "utf8",
    )
    expect(migrationProposalSnapshotContents).toContain(
      '"migrationProposalResolution"',
    )
    expect(migrationProposalSnapshotContents).toContain(
      '"schemaName": "customer"',
    )
    expect(migrationProposalSnapshotContents).toContain('"snapshotPath"')

    const reportContents = await readFile(createBody.session.reportPath, "utf8")
    expect(reportContents).toContain('"schemaName": "customer"')
    expect(reportContents).toContain('"databaseChangePlan"')

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/review`,
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

    const reviewBody = (await reviewResponse.json()) as {
      diff: {
        totalFileCount: number
      }
      session: {
        id: string
        reviewComment: string
        reviewEvidence: {
          actorUserId: string
          comment: string
          decision: string
          reviewedAt: string
          reportPath: string
          sessionId: string
        }
        reviewedAt: string
        reviewedByUserId: string
        status: string
      }
      sqlProposal: {
        tableName: string
      }
      sqlProposalHandoff: {
        proposalStatus: string
        migrationProposalSnapshot: {
          generatedAt: string
          migrationProposalResolution: {
            proposal: {
              tableName: string
            } | null
            unsupportedReason: string | null
          }
          snapshotPath: string
        }
        migrationProposalSnapshotPath: string
      }
    }
    expect(reviewBody.session.id).toBe(createBody.session.id)
    expect(reviewBody.session.status).toBe("ready")
    expect(reviewBody.session.reviewComment).toBe("Looks good for staging")
    expect(reviewBody.session.reviewedByUserId).toBe(
      createBody.session.actorUserId,
    )
    expect(reviewBody.session.reviewEvidence).toMatchObject({
      sessionId: createBody.session.id,
      reportPath: createBody.session.reportPath,
      actorUserId: createBody.session.actorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(reviewBody.session.reviewEvidence.reviewedAt).toBe(
      reviewBody.session.reviewedAt,
    )
    expect(reviewBody.diff.totalFileCount).toBe(6)
    expect(reviewBody.sqlProposal.tableName).toBe("customer")
    expect(reviewBody.sqlProposalHandoff.proposalStatus).toBe("ready")
    expect(
      reviewBody.sqlProposalHandoff.migrationProposalSnapshot,
    ).toMatchObject({
      snapshotPath: reviewBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    })

    const confirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "user-agent": "generator-session-test-agent",
            "x-request-id": "req-generator-session-confirm-1",
          }),
        },
      ),
    )
    expect(confirmResponse.status).toBe(200)

    const confirmBody = (await confirmResponse.json()) as {
      session: {
        confirmedAt: string
        confirmedByUserId: string
        confirmationEvidence: {
          actorUserId: string
          checklist: string[]
          confirmedAt: string
          reportPath: string
          sessionId: string
        }
        id: string
      }
      sqlProposalHandoff: {
        confirmationChecklist: string[]
        migrationProposalSnapshot: {
          generatedAt: string
          migrationProposalResolution: {
            proposal: {
              tableName: string
            } | null
            unsupportedReason: string | null
          }
          snapshotPath: string
        }
        migrationProposalSnapshotPath: string
      }
    }
    expect(confirmBody.session.id).toBe(createBody.session.id)
    expect(confirmBody.session.confirmedByUserId).toBe(
      createBody.session.actorUserId,
    )
    expect(confirmBody.session.confirmationEvidence).toMatchObject({
      sessionId: createBody.session.id,
      reportPath: createBody.session.reportPath,
      actorUserId: createBody.session.actorUserId,
    })
    expect(confirmBody.session.confirmationEvidence.confirmedAt).toBe(
      confirmBody.session.confirmedAt,
    )
    expect(confirmBody.session.confirmationEvidence.checklist).toEqual(
      confirmBody.sqlProposalHandoff.confirmationChecklist,
    )
    expect(
      confirmBody.sqlProposalHandoff.migrationProposalSnapshot,
    ).toMatchObject({
      snapshotPath:
        confirmBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    })
    expect(confirmBody.sqlProposalHandoff.confirmationChecklist).toEqual([
      `Review the SQL draft and Drizzle snippet in ${confirmBody.sqlProposalHandoff.migrationProposalSnapshotPath} before changing persistence files.`,
      `Verify the migration proposal snapshot at ${confirmBody.sqlProposalHandoff.migrationProposalSnapshotPath} was generated from ${createBody.session.reportPath} at ${createBody.session.createdAt}.`,
      "Confirm the canonical owner and target paths match the intended persistence scope.",
      "Run db:generate and db:migrate only after manual sign-off.",
    ])

    const applyResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/apply`,
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

    const applyBody = (await applyResponse.json()) as {
      diff: {
        actionCounts: {
          block: number
          create: number
          overwrite: number
          skip: number
        }
        changedFileCount: number
        totalFileCount: number
        unchangedFileCount: number
      }
      session: {
        appliedAt: string
        appliedFileCount: number
        appliedByUserId: string
        confirmedAt: string
        applyEvidence: {
          actorUserId: string
          appliedAt: string
          manifestPath: string
          reportPath: string
          requestId: string
          sessionId: string
        }
        applyManifestPath: string
        applyRequestId: string
        id: string
        reviewEvidence: {
          actorUserId: string
          comment: string
          decision: string
        }
        skippedFileCount: number
        status: string
      }
      apply: {
        evidence: {
          actorUserId: string
          appliedAt: string
          manifestPath: string
          reportPath: string
          requestId: string
          sessionId: string
        }
        files: Array<{ written: boolean }>
        manifestPath: string
      }
      sqlProposal: {
        tableName: string
      }
      sqlProposalHandoff: {
        proposalStatus: string
        migrationProposalSnapshot: {
          generatedAt: string
          migrationProposalResolution: {
            proposal: {
              tableName: string
            } | null
            unsupportedReason: string | null
          }
          snapshotPath: string
        }
        migrationProposalSnapshotPath: string
      }
    }
    expect(applyBody.session.id).toBe(createBody.session.id)
    expect(applyBody.session.status).toBe("applied")
    expect(applyBody.session.appliedAt).toBeTruthy()
    expect(applyBody.session.appliedFileCount).toBe(6)
    expect(applyBody.session.appliedByUserId).toBe(
      createBody.session.actorUserId,
    )
    expect(applyBody.session.skippedFileCount).toBe(0)
    expect(applyBody.session.applyRequestId).toBe(
      "req-generator-session-apply-1",
    )
    expect(applyBody.session.applyManifestPath).toBe(
      applyBody.apply.manifestPath,
    )
    expect(applyBody.session.confirmedAt).toBeTruthy()
    expect(applyBody.session.reviewEvidence).toMatchObject({
      actorUserId: createBody.session.actorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(applyBody.diff).toEqual(createBody.diff)
    expect(applyBody.apply.evidence).toMatchObject({
      sessionId: createBody.session.id,
      reportPath: createBody.session.reportPath,
      manifestPath: applyBody.apply.manifestPath,
      actorUserId: createBody.session.actorUserId,
      requestId: "req-generator-session-apply-1",
    })
    expect(applyBody.apply.evidence.appliedAt).toBe(applyBody.session.appliedAt)
    expect(applyBody.session.applyEvidence).toEqual(applyBody.apply.evidence)
    expect(applyBody.apply.files.every((file) => file.written)).toBe(true)
    expect(applyBody.sqlProposal.tableName).toBe("customer")
    expect(applyBody.sqlProposalHandoff.proposalStatus).toBe("ready")
    expect(
      applyBody.sqlProposalHandoff.migrationProposalSnapshot,
    ).toMatchObject({
      snapshotPath: applyBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    })

    const manifestContents = await readFile(
      applyBody.apply.manifestPath,
      "utf8",
    )
    expect(manifestContents).toContain('"schemaName": "customer"')

    const listResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )
    expect(listResponse.status).toBe(200)

    const listBody = (await listResponse.json()) as {
      items: Array<{
        applyEvidence: {
          requestId: string
        }
        id: string
        reviewEvidence: {
          comment: string
          decision: string
        }
        schemaName: string
      }>
    }
    expect(listBody.items).toHaveLength(1)
    expect(listBody.items[0]).toMatchObject({
      id: createBody.session.id,
      schemaName: "customer",
    })
    expect(listBody.items[0]?.applyEvidence.requestId).toBe(
      "req-generator-session-apply-1",
    )
    expect(listBody.items[0]?.reviewEvidence).toMatchObject({
      comment: "Looks good for staging",
      decision: "approve",
    })

    const detailResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}`,
        {
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )
    expect(detailResponse.status).toBe(200)

    const detailBody = (await detailResponse.json()) as {
      applyEvidence: {
        actorUserId: string
        requestId: string
      }
      diffSummary: {
        actionCounts: {
          create: number
        }
        totalFileCount: number
      }
      id: string
      report: {
        schemaName: string
      }
      reviewEvidence: {
        actorUserId: string
        comment: string
        decision: string
      }
      sqlProposal: {
        tableName: string
      }
      sqlProposalHandoff: {
        proposalStatus: string
        migrationProposalSnapshot: {
          generatedAt: string
          migrationProposalResolution: {
            proposal: {
              tableName: string
            } | null
            unsupportedReason: string | null
          }
          snapshotPath: string
        }
        migrationProposalSnapshotPath: string
        targetPaths: {
          persistenceIndexFile: string
        }
      }
    }
    expect(detailBody).toMatchObject({
      id: createBody.session.id,
      report: {
        schemaName: "customer",
      },
    })
    expect(detailBody.diffSummary.totalFileCount).toBe(6)
    expect(detailBody.diffSummary.actionCounts.create).toBe(6)
    expect(detailBody.applyEvidence).toMatchObject({
      actorUserId: createBody.session.actorUserId,
      requestId: "req-generator-session-apply-1",
    })
    expect(detailBody.reviewEvidence).toMatchObject({
      actorUserId: createBody.session.actorUserId,
      comment: "Looks good for staging",
      decision: "approve",
    })
    expect(detailBody.sqlProposal.tableName).toBe("customer")
    expect(detailBody.sqlProposalHandoff).toMatchObject({
      proposalStatus: "ready",
      targetPaths: {
        persistenceIndexFile: "packages/persistence/src/index.ts",
      },
    })
    expect(
      detailBody.sqlProposalHandoff.migrationProposalSnapshot,
    ).toMatchObject({
      snapshotPath: detailBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    })
    expect(detailBody.sqlProposalHandoff.migrationProposalSnapshotPath).toBe(
      createBody.sqlProposalHandoff.migrationProposalSnapshotPath,
    )

    const auditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "preview_create",
    )
    expect(auditLog).toMatchObject({
      category: "generator",
      action: "preview_create",
      actorUserId: createBody.session.actorUserId,
      targetType: "generator-session",
      targetId: createBody.session.id,
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
      actorUserId: createBody.session.actorUserId,
      targetType: "generator-session",
      targetId: createBody.session.id,
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
      actorUserId: createBody.session.actorUserId,
      targetType: "generator-session",
      targetId: createBody.session.id,
      requestId: "req-generator-session-review-1",
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

    const createBody = (await createResponse.json()) as {
      session: {
        id: string
      }
    }

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/review`,
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
        `http://localhost/studio/generator/sessions/${createBody.session.id}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "x-request-id": "req-generator-session-confirm-replay-1",
          }),
        },
      ),
    )
    expect(firstConfirmResponse.status).toBe(200)

    const firstConfirmBody = (await firstConfirmResponse.json()) as {
      session: {
        confirmedAt: string
        confirmationEvidence: {
          checklist: string[]
          confirmedAt: string
          reportPath: string
          sessionId: string
        }
      }
    }

    const secondConfirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken, {
            "x-request-id": "req-generator-session-confirm-replay-2",
          }),
        },
      ),
    )
    expect(secondConfirmResponse.status).toBe(200)

    const secondConfirmBody = (await secondConfirmResponse.json()) as {
      session: {
        confirmedAt: string
        confirmationEvidence: {
          checklist: string[]
          confirmedAt: string
          reportPath: string
          sessionId: string
        }
      }
    }

    expect(secondConfirmBody.session.confirmedAt).toBe(
      firstConfirmBody.session.confirmedAt,
    )
    expect(secondConfirmBody.session.confirmationEvidence).toEqual(
      firstConfirmBody.session.confirmationEvidence,
    )
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

    const createBody = (await createResponse.json()) as {
      session: {
        id: string
      }
    }

    const reviewResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/review`,
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
        `http://localhost/studio/generator/sessions/${createBody.session.id}/apply`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )

    expect(applyResponse.status).toBe(409)
    const errorBody = (await applyResponse.json()) as {
      error: {
        code: string
      }
    }
    expect(errorBody.error.code).toBe("GENERATOR_SESSION_CONFIRMATION_REQUIRED")
  })
})
