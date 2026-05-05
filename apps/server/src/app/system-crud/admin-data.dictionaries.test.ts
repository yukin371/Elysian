import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"
import {
  createDictionaryModule,
  createInMemoryDictionaryRepository,
} from "../../modules"
import {
  createAuthTestFixture,
  createDictionaryTypeSeedRecords,
  createTestApp,
  loginAsAdmin,
  testAdminPassword,
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

describe("createServerApp system admin data", () => {
  it("publishes dictionary success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(createInMemoryDictionaryRepository(), {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(
      getOpenApiResponse(paths, "/system/dictionaries/types", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/types", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/types", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/types", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/dictionaries/types/{id}",
        "get",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/dictionaries/types/{id}",
        "put",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/items", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/items", "post", "400"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/dictionaries/items", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/dictionaries/items/{id}",
        "get",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/dictionaries/items/{id}",
        "put",
        "200",
      ),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/dictionaries/items/{id}",
        "put",
        "404",
      ),
    ).toBeDefined()
  })

  it("lists and gets dictionary types and items when the access token has dictionary-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:list"],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
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

    const listTypesResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/types", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listTypesResponse.status).toBe(200)
    expect(await listTypesResponse.json()).toEqual({
      items: [
        {
          id: "dictionary_type_status_1",
          code: "customer_status",
          name: "Customer Status",
          description: "Customer lifecycle status",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_type_priority_1",
          code: "priority_level",
          name: "Priority Level",
          description: "Priority level options",
          status: "active",
          createdAt: "2026-04-20T00:00:00.000Z",
          updatedAt: "2026-04-20T00:00:00.000Z",
        },
      ],
    })

    const getTypeResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/types/dictionary_type_status_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(getTypeResponse.status).toBe(200)
    expect(await getTypeResponse.json()).toEqual({
      id: "dictionary_type_status_1",
      code: "customer_status",
      name: "Customer Status",
      description: "Customer lifecycle status",
      status: "active",
      items: [
        {
          id: "dictionary_item_status_active_1",
          typeId: "dictionary_type_status_1",
          value: "active",
          label: "Active",
          sort: 10,
          isDefault: true,
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_item_status_inactive_1",
          typeId: "dictionary_type_status_1",
          value: "inactive",
          label: "Inactive",
          sort: 20,
          isDefault: false,
          status: "active",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })

    const listItemsResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/items?typeId=dictionary_type_status_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(listItemsResponse.status).toBe(200)
    expect(await listItemsResponse.json()).toEqual({
      items: [
        {
          id: "dictionary_item_status_active_1",
          typeId: "dictionary_type_status_1",
          value: "active",
          label: "Active",
          sort: 10,
          isDefault: true,
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_item_status_inactive_1",
          typeId: "dictionary_type_status_1",
          value: "inactive",
          label: "Inactive",
          sort: 20,
          isDefault: false,
          status: "active",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
    })

    const getItemResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/items/dictionary_item_status_active_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(getItemResponse.status).toBe(200)
    expect(await getItemResponse.json()).toEqual({
      id: "dictionary_item_status_active_1",
      typeId: "dictionary_type_status_1",
      value: "active",
      label: "Active",
      sort: 10,
      isDefault: true,
      status: "active",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })
  })

  it("exports dictionary types and items as csv when the access token has dictionary-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:list"],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const typesResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/types/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(typesResponse.status).toBe(200)
    expect(typesResponse.headers.get("content-type")).toContain("text/csv")

    const typesText = await typesResponse.text()
    expect(typesText).toContain(
      "id,code,name,description,status,createdAt,updatedAt",
    )
    expect(typesText).toContain(
      "dictionary_type_status_1,customer_status,Customer Status,Customer lifecycle status,active,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )

    const itemsResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/items/export?typeId=dictionary_type_status_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(itemsResponse.status).toBe(200)
    expect(itemsResponse.headers.get("content-type")).toContain("text/csv")

    const itemsText = await itemsResponse.text()
    expect(itemsText).toContain(
      "id,typeId,value,label,sort,isDefault,status,createdAt,updatedAt",
    )
    expect(itemsText).toContain(
      "dictionary_item_status_active_1,dictionary_type_status_1,active,Active,10,true,active,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(itemsText).not.toContain("dictionary_item_priority_low_1")
  })

  it("creates and updates dictionary types and items", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:dictionary:list",
        "system:dictionary:create",
        "system:dictionary:update",
      ],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
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

    const createTypeResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/types", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "region",
          name: "Region",
          description: "Region options",
        }),
      }),
    )

    expect(createTypeResponse.status).toBe(201)
    const createdType = await readJsonRecord(createTypeResponse)
    const createdTypeId = readString(createdType, "id")

    expect(createdType).toEqual({
      id: expect.any(String),
      code: "region",
      name: "Region",
      description: "Region options",
      status: "active",
      items: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateTypeResponse = await app.handle(
      new Request(
        `http://localhost/system/dictionaries/types/${createdTypeId}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Region Zone",
            status: "disabled",
          }),
        },
      ),
    )

    expect(updateTypeResponse.status).toBe(200)
    expect(await updateTypeResponse.json()).toEqual({
      ...createdType,
      name: "Region Zone",
      status: "disabled",
      updatedAt: expect.any(String),
    })

    const createItemResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/items", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          typeId: "dictionary_type_priority_1",
          value: "high",
          label: "High",
          sort: 10,
          isDefault: true,
        }),
      }),
    )

    expect(createItemResponse.status).toBe(201)
    const createdItem = await readJsonRecord(createItemResponse)
    const createdItemId = readString(createdItem, "id")

    expect(createdItem).toEqual({
      id: expect.any(String),
      typeId: "dictionary_type_priority_1",
      value: "high",
      label: "High",
      sort: 10,
      isDefault: true,
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateItemResponse = await app.handle(
      new Request(
        `http://localhost/system/dictionaries/items/${createdItemId}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            label: "High Priority",
            isDefault: false,
            status: "disabled",
          }),
        },
      ),
    )

    expect(updateItemResponse.status).toBe(200)
    expect(await updateItemResponse.json()).toEqual({
      ...createdItem,
      label: "High Priority",
      isDefault: false,
      status: "disabled",
      updatedAt: expect.any(String),
    })
  })

  it("rejects invalid dictionary item relations", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:create"],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
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

    const response = await app.handle(
      new Request("http://localhost/system/dictionaries/items", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          typeId: "missing-type",
          value: "archived",
          label: "Archived",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.DICTIONARY_ITEM_TYPE_INVALID,
      message: "Dictionary item type does not exist",
      status: 400,
      details: {
        typeId: "missing-type",
      },
    })
  })
})
