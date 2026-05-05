import { describe, expect, it } from "bun:test"

import { createServerApp } from "./app"
import { createServerConfig } from "./config"
import { errorCodes } from "./errors/registry"
import type { ServerLogger } from "./logging"
import {
  type ServerModule,
  createCustomerModule,
  createInMemoryCustomerRepository,
} from "./modules"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const createTestApp = (
  options: {
    modules?: ServerModule[]
    config?: Parameters<typeof createServerConfig>[0]
  } = {},
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
      ...options.config,
    }),
    logger: silentLogger,
    modules: options.modules,
  })

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

const readArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!Array.isArray(property)) {
    throw new Error(`Expected array field: ${key}`)
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

describe("createServerApp", () => {
  it("publishes customer success responses in the openapi spec", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(getOpenApiResponse(paths, "/customers", "get", "200")).toBeDefined()
    expect(getOpenApiResponse(paths, "/customers", "get", "401")).toBeDefined()
    expect(getOpenApiResponse(paths, "/customers", "post", "201")).toBeDefined()
    expect(getOpenApiResponse(paths, "/customers", "post", "400")).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/customers/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/customers/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/customers/{id}", "put", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/customers/{id}", "delete", "204"),
    ).toBeDefined()
  })

  it("lists customers from the customer module", async () => {
    const app = createTestApp({
      modules: [
        createCustomerModule(
          createInMemoryCustomerRepository([
            {
              id: "cust_1",
              name: "Acme Corp",
              status: "active",
              createdAt: "2026-04-21T00:00:00.000Z",
              updatedAt: "2026-04-21T00:00:00.000Z",
            },
          ]),
        ),
      ],
    })
    const response = await app.handle(new Request("http://localhost/customers"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "cust_1",
          name: "Acme Corp",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })

  it("filters and paginates customers through the customer module", async () => {
    const app = createTestApp({
      modules: [
        createCustomerModule(
          createInMemoryCustomerRepository([
            {
              id: "cust_1",
              name: "Acme Corp",
              status: "active",
              createdAt: "2026-04-21T00:00:00.000Z",
              updatedAt: "2026-04-21T00:00:00.000Z",
            },
            {
              id: "cust_2",
              name: "Acme Finance",
              status: "inactive",
              createdAt: "2026-04-22T00:00:00.000Z",
              updatedAt: "2026-04-22T00:00:00.000Z",
            },
            {
              id: "cust_3",
              name: "Northwind",
              status: "active",
              createdAt: "2026-04-23T00:00:00.000Z",
              updatedAt: "2026-04-23T00:00:00.000Z",
            },
          ]),
        ),
      ],
    })
    const response = await app.handle(
      new Request(
        "http://localhost/customers?q=acme&status=active&page=2&pageSize=1&sortBy=name&sortOrder=asc",
      ),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "cust_1",
          name: "Acme Corp",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 1,
      totalPages: 1,
    })
  })

  it("creates a customer through the customer module", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Northwind",
          status: "inactive",
        }),
      }),
    )

    expect(response.status).toBe(201)

    const body = await readJsonRecord(response)
    expect(readString(body, "name")).toBe("Northwind")
    expect(readString(body, "status")).toBe("inactive")
    expect(typeof readString(body, "id")).toBe("string")
  })

  it("returns customer not found for unknown ids", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing"),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      code: errorCodes.CUSTOMER_NOT_FOUND,
      message: "Customer not found",
      status: 404,
      details: {
        id: "missing",
      },
    })
  })

  it("updates a customer through the customer module", async () => {
    const repo = createInMemoryCustomerRepository([
      {
        id: "cust_1",
        name: "Acme Corp",
        status: "active",
        createdAt: "2026-04-21T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      },
    ])
    const app = createTestApp({
      modules: [createCustomerModule(repo)],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/cust_1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Acme Updated", status: "inactive" }),
      }),
    )

    expect(response.status).toBe(200)
    const body = await readJsonRecord(response)
    expect(readString(body, "name")).toBe("Acme Updated")
    expect(readString(body, "status")).toBe("inactive")
  })

  it("deletes a customer through the customer module", async () => {
    const repo = createInMemoryCustomerRepository([
      {
        id: "cust_1",
        name: "Acme Corp",
        status: "active",
        createdAt: "2026-04-21T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      },
    ])
    const app = createTestApp({
      modules: [createCustomerModule(repo)],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/cust_1", {
        method: "DELETE",
      }),
    )

    expect(response.status).toBe(204)

    const listResponse = await app.handle(
      new Request("http://localhost/customers"),
    )
    const body = await readJsonRecord(listResponse)
    expect(readArray(body, "items")).toHaveLength(0)
  })

  it("returns 404 when updating a missing customer", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      }),
    )

    expect(response.status).toBe(404)
  })

  it("returns 404 when deleting a missing customer", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing", {
        method: "DELETE",
      }),
    )

    expect(response.status).toBe(404)
  })
})
