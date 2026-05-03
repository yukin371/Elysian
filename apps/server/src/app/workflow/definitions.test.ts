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
    const payload = (await response.json()) as {
      paths: Record<
        string,
        Record<string, { responses?: Record<string, unknown> }>
      >
    }

    expect(
      payload.paths["/workflow/definitions"]?.get?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions"]?.get?.responses?.["401"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions"]?.post?.responses?.["201"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions"]?.post?.responses?.["409"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions/{id}"]?.get?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions/{id}"]?.get?.responses?.["404"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions/{id}"]?.put?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/workflow/definitions/{id}"]?.put?.responses?.["404"],
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/workflow/definitions", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
            authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
    const createdDefinition = (await createResponse.json()) as {
      id: string
      key: string
      name: string
      version: number
      status: string
      definition: Record<string, unknown>
      createdAt: string
      updatedAt: string
    }
    expect(createdDefinition.id).toEqual(expect.any(String))
    expect(createdDefinition.key).toBe("leave-approval")
    expect(createdDefinition.name).toBe("Leave Approval")
    expect(createdDefinition.version).toBe(1)
    expect(createdDefinition.status).toBe("active")
    expect(createdDefinition.definition).toEqual({
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
    expect(createdDefinition.createdAt).toEqual(expect.any(String))
    expect(createdDefinition.updatedAt).toEqual(expect.any(String))

    const updateResponse = await app.handle(
      new Request(
        "http://localhost/workflow/definitions/workflow_definition_expense_v1",
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
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
