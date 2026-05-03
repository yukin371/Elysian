import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { createServerApp } from "../apps/server/src/app"
import { createServerConfig } from "../apps/server/src/config"
import type { ServerLogger } from "../apps/server/src/logging"
import { createAuthTestFixture } from "../apps/server/src/app.operations.test-helpers"
import {
  createCustomerModule,
  createDepartmentModule,
  createDictionaryModule,
  createFileModule,
  createGeneratorSessionModule,
  createInMemoryCustomerRepository,
  createInMemoryDepartmentRepository,
  createInMemoryDictionaryRepository,
  createInMemoryFileRepository,
  createInMemoryFileStorage,
  createInMemoryGeneratorSessionRepository,
  createInMemoryMenuRepository,
  createInMemoryNotificationRepository,
  createInMemoryOperationLogRepository,
  createInMemoryPostRepository,
  createInMemoryRoleRepository,
  createInMemorySettingRepository,
  createInMemoryTenantRepository,
  createInMemoryUserRepository,
  createInMemoryWorkflowDefinitionRepository,
  createMenuModule,
  createNotificationModule,
  createOperationLogModule,
  createPostModule,
  createRoleModule,
  createSettingModule,
  createTenantModule,
  createUserModule,
  createWorkflowModule,
  systemModule,
} from "../apps/server/src/modules"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const generatedDir = resolve(
  "apps/example-vue/src/lib/platform-api/generated",
)
const openapiJsonPath = join(generatedDir, "openapi.json")
const openapiTypesPath = join(generatedDir, "openapi-types.d.ts")

const createOpenApiFixtureApp = async () => {
  const authFixture = await createAuthTestFixture()
  const generatorOutputDir = await mkdtemp(
    join(tmpdir(), "elysian-openapi-generator-output-"),
  )
  const generatorReportDir = await mkdtemp(
    join(tmpdir(), "elysian-openapi-generator-report-"),
  )

  const app = createServerApp({
    config: createServerConfig({
      env: "test",
    }),
    logger: silentLogger,
    modules: [
      systemModule,
      authFixture.authModule,
      createCustomerModule(createInMemoryCustomerRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createUserModule(createInMemoryUserRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createRoleModule(createInMemoryRoleRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createMenuModule(createInMemoryMenuRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createDepartmentModule(createInMemoryDepartmentRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createPostModule(createInMemoryPostRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createDictionaryModule(createInMemoryDictionaryRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createSettingModule(createInMemorySettingRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createTenantModule(createInMemoryTenantRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createFileModule(
        createInMemoryFileRepository(),
        createInMemoryFileStorage(),
        {
          authGuard: authFixture.authGuard,
        },
      ),
      createNotificationModule(createInMemoryNotificationRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createOperationLogModule(createInMemoryOperationLogRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createWorkflowModule(createInMemoryWorkflowDefinitionRepository(), {
        authGuard: authFixture.authGuard,
      }),
      createGeneratorSessionModule(createInMemoryGeneratorSessionRepository(), {
        authGuard: authFixture.authGuard,
        reportRootDir: generatorReportDir,
        resolveOutputDir: () => generatorOutputDir,
      }),
    ],
  })

  return {
    app,
    cleanup: async () => {
      await rm(generatorOutputDir, { force: true, recursive: true })
      await rm(generatorReportDir, { force: true, recursive: true })
    },
  }
}

const run = async () => {
  await mkdir(generatedDir, { recursive: true })

  const fixture = await createOpenApiFixtureApp()

  try {
    const response = await fixture.app.handle(
      new Request("http://localhost/openapi/json"),
    )

    if (response.status !== 200) {
      throw new Error(
        `Failed to load OpenAPI spec: expected 200, received ${String(response.status)}`,
      )
    }

    const openapiDocument = await response.json()
    await writeFile(
      openapiJsonPath,
      `${JSON.stringify(openapiDocument, null, 2)}\n`,
      "utf8",
    )

    const generation = Bun.spawnSync({
      cmd: [
        process.execPath,
        "x",
        "openapi-typescript",
        openapiJsonPath,
        "-o",
        openapiTypesPath,
      ],
      cwd: resolve("."),
      stdout: "pipe",
      stderr: "pipe",
    })

    if (generation.exitCode !== 0) {
      const stderr = Buffer.from(generation.stderr).toString("utf8").trim()
      throw new Error(
        stderr.length > 0
          ? stderr
          : `openapi-typescript failed with exit code ${String(generation.exitCode)}`,
      )
    }

    const stdout = Buffer.from(generation.stdout).toString("utf8").trim()
    if (stdout.length > 0) {
      console.log(stdout)
    }

    console.log(`OpenAPI schema written to ${openapiJsonPath}`)
    console.log(`OpenAPI types written to ${openapiTypesPath}`)
  } finally {
    await fixture.cleanup()
  }
}

await run()
