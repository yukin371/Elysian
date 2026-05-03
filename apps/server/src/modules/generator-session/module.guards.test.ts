import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

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
  writeMigrationProposalSnapshotFixture,
} from "./test-helpers"

describe("generator session module guards", () => {
  it("refuses to apply stale generator preview sessions", async () => {
    const { accessToken, app, outputDir } =
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

    const confirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )
    expect(confirmResponse.status).toBe(200)

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
            decision: "reject",
            comment: "Conflict needs manual follow-up",
          }),
        },
      ),
    )
    expect(reviewResponse.status).toBe(200)

    const confirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}/confirm`,
        {
          method: "POST",
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )
    expect(confirmResponse.status).toBe(409)

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

  it("blocks confirmation when the sql proposal is unsupported", async () => {
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
      status: "ready",
      targetPreset: "default",
    } as never)
    await writeMigrationProposalSnapshotFixture(
      session.reportPath,
      session.schemaName,
      session.id,
      invalidChangePlan,
    )

    const app = createTestApp([createGeneratorSessionModule(repository)])
    const confirmResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${session.id}/confirm`,
        {
          method: "POST",
        },
      ),
    )

    expect(confirmResponse.status).toBe(409)
    const errorBody = (await confirmResponse.json()) as {
      error: {
        code: string
        details: {
          proposalStatus: string
          unsupportedReason: string
        }
      }
    }
    expect(errorBody.error.code).toBe(
      "GENERATOR_SESSION_SQL_PROPOSAL_NOT_READY",
    )
    expect(errorBody.error.details).toMatchObject({
      proposalStatus: "unsupported",
      unsupportedReason: "Only single create-table change plans are supported.",
    })
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
})
