import { describe, expect, it } from "bun:test"

import {
  createAuthGuard,
  createAuthModule,
  createInMemoryAuthRepository,
  createInMemoryOperationLogRepository,
  createInMemoryWorkflowDefinitionRepository,
  createOperationLogModule,
  createPasswordHash,
  createWorkflowModule,
  verifyAccessToken,
} from "../../modules"
import {
  cancelWorkflowInstance,
  claimWorkflowTask,
  completeWorkflowTask,
  createAuthTestFixture,
  createAuthorizedHeaders,
  createClaimableWorkflowDefinitionSeedRecords,
  createConditionalWorkflowDefinitionSeedRecords,
  createTestApp,
  createWorkflowDefinitionSeedRecords,
  createWorkflowTestHarness,
  loginAsAdmin,
  startWorkflowInstance,
  testAccessTokenSecret,
  testAdminPassword,
  workflowAllPermissionCodes,
  workflowDefinitionPermissionCodes,
  workflowRuntimePermissionCodes,
} from "./test-support"

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

const readNumber = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "number") {
    throw new Error(`Expected number field: ${key}`)
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

describe("createServerApp workflow definitions", () => {
  it("publishes workflow definition success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowDefinitionPermissionCodes],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createWorkflowModule(
          createInMemoryWorkflowDefinitionRepository(
            createWorkflowDefinitionSeedRecords(),
          ),
          {
            authGuard: fixture.authGuard,
          },
        ),
      ],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(
      getOpenApiResponse(paths, "/workflow/definitions", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions/{id}", "get", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/workflow/definitions/{id}", "put", "404"),
    ).toBeDefined()
  })

  it("lists, gets, creates, and versions workflow definitions", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowDefinitionPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const listResponse = await app.handle(
      new Request("http://localhost/workflow/definitions", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: createWorkflowDefinitionSeedRecords(),
    })

    const getResponse = await app.handle(
      new Request(
        "http://localhost/workflow/definitions/workflow_definition_expense_v1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(
      createWorkflowDefinitionSeedRecords()[0],
    )

    const createResponse = await app.handle(
      new Request("http://localhost/workflow/definitions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key: "leave-approval",
          name: "Leave Approval",
          status: "active",
          definition: {
            nodes: [
              { id: "start", type: "start", name: "Start" },
              {
                id: "leader-review",
                type: "approval",
                name: "Leader Review",
                assignee: "role:leader",
              },
              { id: "approved", type: "end", name: "Approved" },
            ],
            edges: [
              { from: "start", to: "leader-review" },
              { from: "leader-review", to: "approved" },
            ],
          },
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdDefinition = await readJsonRecord(createResponse)
    expect(readString(createdDefinition, "id")).toEqual(expect.any(String))
    expect(readString(createdDefinition, "key")).toBe("leave-approval")
    expect(readString(createdDefinition, "name")).toBe("Leave Approval")
    expect(readNumber(createdDefinition, "version")).toBe(1)
    expect(readString(createdDefinition, "status")).toBe("active")
    expect(readRecord(createdDefinition, "definition")).toEqual({
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "leader-review",
          type: "approval",
          name: "Leader Review",
          assignee: "role:leader",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "leader-review" },
        { from: "leader-review", to: "approved" },
      ],
    })
    expect(readString(createdDefinition, "createdAt")).toEqual(
      expect.any(String),
    )
    expect(readString(createdDefinition, "updatedAt")).toEqual(
      expect.any(String),
    )

    const updateResponse = await app.handle(
      new Request(
        "http://localhost/workflow/definitions/workflow_definition_expense_v1",
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Expense Approval v2",
            definition: {
              nodes: [
                { id: "start", type: "start", name: "Start" },
                {
                  id: "manager-review",
                  type: "approval",
                  name: "Manager Review",
                  assignee: "role:manager",
                },
                {
                  id: "amount-check",
                  type: "condition",
                  name: "Amount Check",
                  conditions: [
                    {
                      expression: "${amount > 5000}",
                      target: "finance-review",
                    },
                    {
                      expression: "default",
                      target: "approved",
                    },
                  ],
                },
                {
                  id: "finance-review",
                  type: "approval",
                  name: "Finance Review",
                  assignee: "role:finance",
                },
                { id: "approved", type: "end", name: "Approved" },
              ],
              edges: [
                { from: "start", to: "manager-review" },
                { from: "manager-review", to: "amount-check" },
                { from: "amount-check", to: "finance-review" },
                { from: "amount-check", to: "approved" },
                { from: "finance-review", to: "approved" },
              ],
            },
          }),
        },
      ),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      id: expect.any(String),
      key: "expense-approval",
      name: "Expense Approval v2",
      version: 2,
      status: "active",
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "amount-check",
            type: "condition",
            name: "Amount Check",
            conditions: [
              {
                expression: "${amount > 5000}",
                target: "finance-review",
              },
              {
                expression: "default",
                target: "approved",
              },
            ],
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "amount-check" },
          { from: "amount-check", to: "finance-review" },
          { from: "amount-check", to: "approved" },
          { from: "finance-review", to: "approved" },
        ],
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })
})
