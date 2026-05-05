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

describe("createServerApp", () => {
  it("publishes customer success responses in the openapi spec", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      paths: Record<
        string,
        Record<
          string,
          {
            responses?: Record<string, unknown>
          }
        >
      >
    }

    expect(payload.paths["/customers"]?.get?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/customers"]?.get?.responses?.["401"]).toBeDefined()
    expect(payload.paths["/customers"]?.post?.responses?.["201"]).toBeDefined()
    expect(payload.paths["/customers"]?.post?.responses?.["400"]).toBeDefined()
    expect(
      payload.paths["/customers/{id}"]?.get?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/customers/{id}"]?.put?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/customers/{id}"]?.put?.responses?.["404"],
    ).toBeDefined()
    expect(
      payload.paths["/customers/{id}"]?.delete?.responses?.["204"],
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

    const body = (await response.json()) as {
      id: string
      name: string
      status: string
    }
    expect(body.name).toBe("Northwind")
    expect(body.status).toBe("inactive")
    expect(typeof body.id).toBe("string")
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
    const body = (await response.json()) as {
      name: string
      status: string
    }
    expect(body.name).toBe("Acme Updated")
    expect(body.status).toBe("inactive")
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
    const body = (await listResponse.json()) as { items: unknown[] }
    expect(body.items).toHaveLength(0)
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
