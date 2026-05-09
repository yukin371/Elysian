import { customerModuleSchema } from "@elysian/schema"

import { createServerApp } from "../apps/server/src/app"
import { createServerConfig } from "../apps/server/src/config"
import {
  createGeneratorSessionModule,
  createInMemoryGeneratorSessionRepository,
} from "../apps/server/src/modules/generator-session"

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const createSmokeApp = () =>
  createServerApp({
    config: createServerConfig({ env: "test" }),
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
    modules: [
      createGeneratorSessionModule(createInMemoryGeneratorSessionRepository()),
    ],
  })

const readJson = async (response: Response) => {
  const body: unknown = await response.json()

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Expected JSON object response.")
  }

  return body as Record<string, unknown>
}

const run = async () => {
  const app = createSmokeApp()

  const simplifiedResponse = await app.handle(
    new Request("http://localhost/studio/generator/validate-schema", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        schema: {
          name: "product",
          fields: [
            { key: "name", kind: "string", required: true },
            { key: "price", kind: "number" },
          ],
        },
      }),
    }),
  )
  assert(
    simplifiedResponse.status === 200,
    `Expected simplified schema status 200, got ${simplifiedResponse.status}.`,
  )
  const simplifiedBody = await readJson(simplifiedResponse)
  assert(
    simplifiedBody.valid === true,
    "Expected simplified schema to validate.",
  )
  const simplifiedExpanded = simplifiedBody.expandedSchema as
    | Record<string, unknown>
    | undefined
  assert(
    simplifiedExpanded?.name === "product",
    "Expanded schema name mismatch.",
  )
  assert(
    Array.isArray(simplifiedExpanded?.fields) &&
      simplifiedExpanded.fields.length === 3,
    "Expected expanded simplified schema to include auto-added id field.",
  )

  const fullResponse = await app.handle(
    new Request("http://localhost/studio/generator/validate-schema", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        schema: customerModuleSchema,
      }),
    }),
  )
  assert(
    fullResponse.status === 200,
    `Expected full schema status 200, got ${fullResponse.status}.`,
  )
  const fullBody = await readJson(fullResponse)
  assert(fullBody.valid === true, "Expected full ModuleSchema to validate.")
  const fullExpanded = fullBody.expandedSchema as
    | Record<string, unknown>
    | undefined
  assert(
    fullExpanded?.name === customerModuleSchema.name,
    "Expected full schema passthrough to preserve schema name.",
  )

  const invalidResponse = await app.handle(
    new Request("http://localhost/studio/generator/validate-schema", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        schema: {
          name: "",
          fields: [],
        },
      }),
    }),
  )
  assert(
    invalidResponse.status === 200,
    `Expected invalid schema status 200, got ${invalidResponse.status}.`,
  )
  const invalidBody = await readJson(invalidResponse)
  assert(invalidBody.valid === false, "Expected invalid schema to fail.")
  assert(
    Array.isArray(invalidBody.issues) && invalidBody.issues.length > 0,
    "Expected invalid schema response to include issues.",
  )
  assert(
    typeof invalidBody.formattedMessage === "string" &&
      invalidBody.formattedMessage.length > 0,
    "Expected invalid schema response to include formattedMessage.",
  )

  const malformedResponse = await app.handle(
    new Request("http://localhost/studio/generator/validate-schema", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: '{"schema":',
    }),
  )
  assert(
    malformedResponse.status === 400,
    `Expected malformed JSON request to return 400, got ${malformedResponse.status}.`,
  )

  console.log("[e2e-generator-studio-simplified-smoke] passed")
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-studio-simplified-smoke] failed: ${message}`)
  process.exitCode = 1
})
