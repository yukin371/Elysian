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
