import { describe, expect, it } from "bun:test"
import { errorCodes } from "./errors/registry"
import {
  createAuthTestFixture,
  createOperationLogSeedRecords,
  createTestApp,
  loginAsAdmin,
  withDerivedAuthFields,
} from "./app.operations.test-helpers"
import {
  createInMemoryOperationLogRepository,
  createOperationLogModule,
} from "./modules"

describe("createServerApp operation logs", () => {
  it("lists, filters, and gets operation logs", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:list"],
      isSuperAdmin: false,
    })
    const operationLogSeedRecords = createOperationLogSeedRecords()
    const firstOperationLog = operationLogSeedRecords[0]
    const filteredOperationLog = operationLogSeedRecords[1]

    if (!firstOperationLog || !filteredOperationLog) {
      throw new Error("expected seeded operation logs")
    }

    const operationLogRepository = createInMemoryOperationLogRepository(
      operationLogSeedRecords,
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/operation-logs", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: operationLogSeedRecords.map(withDerivedAuthFields),
      total: operationLogSeedRecords.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const filteredResponse = await app.handle(
      new Request(
        "http://localhost/system/operation-logs?result=failure&action=permission_denied",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(filteredResponse.status).toBe(200)
    expect(await filteredResponse.json()).toEqual({
      items: [withDerivedAuthFields(filteredOperationLog)],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const pagedOperationLog = operationLogSeedRecords[1]

    if (!pagedOperationLog) {
      throw new Error("expected a second operation log for pagination")
    }

    const pagedResponse = await app.handle(
      new Request("http://localhost/system/operation-logs?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [withDerivedAuthFields(pagedOperationLog)],
      total: operationLogSeedRecords.length,
      page: 2,
      pageSize: 1,
      totalPages: operationLogSeedRecords.length,
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/operation-logs/operation_log_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(
      withDerivedAuthFields(firstOperationLog),
    )
  })

  it("exports operation logs as csv", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:export"],
      isSuperAdmin: false,
    })
    const operationLogRepository = createInMemoryOperationLogRepository(
      createOperationLogSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request(
        "http://localhost/system/operation-logs/export?category=auth",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,category,action,actorUserId,targetType,targetId,result,requestId,ip,userAgent,createdAt",
    )
    expect(text).toContain("operation_log_1,auth,login,user_admin_1")
    expect(text).toContain(
      'operation_log_2,auth,permission_denied,user_ops_1,permission,customer:customer:update,failure,request_2,127.0.0.2,"ops-agent,desktop",2026-04-21T01:00:00.000Z',
    )
  })

  it("returns operation log not found for unknown ids", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:list"],
      isSuperAdmin: false,
    })
    const operationLogRepository = createInMemoryOperationLogRepository(
      createOperationLogSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/operation-logs/missing_log", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      code: errorCodes.OPERATION_LOG_NOT_FOUND,
      message: "Operation log not found",
      status: 404,
      details: {
        id: "missing_log",
      },
    })
  })
})
