import { describe, expect, it } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import {
  createAuthGuard,
  createAuthModule,
  createGeneratorSessionModule,
  createInMemoryAuthRepository,
  createInMemoryGeneratorSessionRepository,
  createPasswordHash,
} from ".."
import { type CreateServerAppOptions, createServerApp } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const testAccessTokenSecret = ["test", "access", "secret"].join("-")
const testAdminPassword = ["admin", "123"].join("")

const createTestApp = (
  modules: NonNullable<CreateServerAppOptions["modules"]>,
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
    }),
    logger: silentLogger,
    modules,
  })

const loginAsAdmin = async (app: ReturnType<typeof createTestApp>) => {
  const response = await app.handle(
    new Request("http://localhost/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: testAdminPassword,
      }),
    }),
  )
  const body = (await response.json()) as {
    accessToken: string
  }

  return body.accessToken
}

const createAuthorizedHeaders = (
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) => ({
  authorization: `Bearer ${accessToken}`,
  ...extraHeaders,
})

const createAuthFixture = async () => {
  const adminRoleId = crypto.randomUUID()
  const userId = crypto.randomUUID()
  const userMenuId = crypto.randomUUID()
  const passwordHash = await createPasswordHash(testAdminPassword)
  const permission = {
    id: crypto.randomUUID(),
    code: "system:user:list",
    module: "system",
    resource: "user",
    action: "list",
    name: "system:user:list",
  }
  const repository = createInMemoryAuthRepository({
    users: [
      {
        id: userId,
        username: "admin",
        displayName: "Admin",
        email: "admin@example.com",
        phone: "13800000000",
        passwordHash,
        status: "active",
        isSuperAdmin: true,
        tenantId: "tenant-default",
        lastLoginAt: null,
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-20T00:00:00.000Z",
      },
    ],
    roles: [
      {
        id: adminRoleId,
        code: "admin",
        name: "Admin",
        status: "active",
        dataScope: 1,
      },
    ],
    permissions: [permission],
    menus: [
      {
        id: userMenuId,
        parentId: null,
        type: "menu",
        code: "system-user",
        name: "Users",
        path: "/system/users",
        component: "system/users/index",
        icon: "user",
        sort: 1,
        isVisible: true,
        status: "active",
        permissionCode: permission.code,
      },
    ],
    userRoles: [
      {
        userId,
        roleId: adminRoleId,
      },
    ],
    rolePermissions: [
      {
        roleId: adminRoleId,
        permissionId: permission.id,
      },
    ],
    roleMenus: [
      {
        roleId: adminRoleId,
        menuId: userMenuId,
      },
    ],
  })

  return {
    repository,
    userId,
    authGuard: createAuthGuard(repository, {
      accessTokenSecret: testAccessTokenSecret,
    }),
    authModule: createAuthModule(repository, {
      accessTokenSecret: testAccessTokenSecret,
    }),
  }
}

describe("generator session module", () => {
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
    expect(createBody.sqlProposalHandoff.suggestedCommands).toContain(
      "bun run db:generate",
    )

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

  it("refuses to apply stale generator preview sessions", async () => {
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
      }),
    ])
    const accessToken = await loginAsAdmin(app)

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
    const driftedPath = join(outputDir, "modules/customer/customer.schema.ts")

    await mkdir(dirname(driftedPath), { recursive: true })
    await writeFile(driftedPath, "export const drifted = true\n", "utf8")

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
    expect(errorBody.error.code).toBe("GENERATOR_SESSION_STALE")
  })

  it("blocks apply for rejected generator preview sessions", async () => {
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
      }),
    ])
    const accessToken = await loginAsAdmin(app)

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
            decision: "reject",
            comment: "Conflict needs manual follow-up",
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
    expect(errorBody.error.code).toBe("GENERATOR_SESSION_REJECTED")
  })

  it("requires authentication for generator preview sessions when auth guard is configured", async () => {
    const fixture = await createAuthFixture()
    const repository = createInMemoryGeneratorSessionRepository()
    const app = createTestApp([
      fixture.authModule,
      createGeneratorSessionModule(repository, {
        authGuard: fixture.authGuard,
      }),
    ])

    const response = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          schemaName: "customer",
        }),
      }),
    )

    expect(response.status).toBe(401)
  })

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
    }
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

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = (await response.json()) as {
      sqlProposal: null
      sqlProposalHandoff: {
        proposalStatus: string
        unsupportedReason: string | null
      }
    }
    expect(body.sqlProposal).toBeNull()
    expect(body.sqlProposalHandoff).toMatchObject({
      proposalStatus: "unsupported",
      unsupportedReason:
        "Only single create-table change plans are supported.",
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
          tableName: "customer",
        },
      ],
      reviewRequired: false,
      sourceSchemaName: "customer",
    }
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
            absolutePath: "/tmp/generator-session-diff/modules/customer/customer.schema.ts",
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
            absolutePath: "/tmp/generator-session-diff/modules/customer/customer.service.ts",
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
            absolutePath: "/tmp/generator-session-diff/modules/customer/customer.routes.ts",
            contents: "export const customerRoutes = true\n",
            currentContents: "export const customerRoutes = drifted\n",
            exists: true,
            hasChanges: false,
            isManaged: true,
            mergeStrategy: "fail",
            path: "modules/customer/customer.routes.ts",
            plannedAction: "block",
            plannedReason: "manual review required before overwrite",
            reason: "tracked file has drift and cannot be overwritten automatically",
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

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const response = await app.handle(
      new Request(`http://localhost/studio/generator/sessions/${session.id}`),
    )

    expect(response.status).toBe(200)

    const body = (await response.json()) as {
      conflictExplanations: Array<{
        mergeStrategy: string
        path: string
        plannedAction: string
        plannedReason: string
        reason: string
      }>
      targetDirectoryDiff: Array<{
        actionCounts: {
          block: number
          create: number
          overwrite: number
          skip: number
        }
        changedFileCount: number
        directory: string
        fileCount: number
      }>
    }
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
        reason: "tracked file has drift and cannot be overwritten automatically",
      },
    ])
  })
})
