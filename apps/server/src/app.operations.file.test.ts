import { describe, expect, it } from "bun:test"
import {
  createAuthTestFixture,
  createFileSeedRecords,
  createTestApp,
  loginAsAdmin,
} from "./app.operations.test-helpers"
import { errorCodes } from "./errors/registry"
import {
  createFileModule,
  createInMemoryFileRepository,
  createInMemoryFileStorage,
} from "./modules"

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

describe("createServerApp files", () => {
  it("publishes file success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:file:list",
        "system:file:upload",
        "system:file:delete",
      ],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(
          createInMemoryFileRepository(),
          createInMemoryFileStorage(),
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
      getOpenApiResponse(paths, "/system/files", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files", "post", "400"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files/{id}", "get", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files/{id}", "delete", "204"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files/{id}/download", "get", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/files/delete", "post", "200"),
    ).toBeDefined()
  })

  it("uploads, lists, gets, downloads, and deletes files", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:file:list",
        "system:file:upload",
        "system:file:download",
        "system:file:delete",
      ],
      isSuperAdmin: false,
    })
    const fileRepository = createInMemoryFileRepository(createFileSeedRecords())
    const fileStorage = createInMemoryFileStorage({
      file_storage_1: new TextEncoder().encode("platform guide bytes"),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(fileRepository, fileStorage, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "file_1",
          originalName: "platform-guide.txt",
          mimeType: "text/plain",
          size: 20,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const pagedResponse = await app.handle(
      new Request("http://localhost/system/files?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [
        {
          id: "file_1",
          originalName: "platform-guide.txt",
          mimeType: "text/plain",
          size: 20,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 1,
      totalPages: 1,
    })

    const filteredResponse = await app.handle(
      new Request(
        "http://localhost/system/files?originalName=platform&mimeType=text%2Fplain&uploaderUserId=user_admin_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(filteredResponse.status).toBe(200)
    expect(await filteredResponse.json()).toEqual({
      items: [
        {
          id: "file_1",
          originalName: "platform-guide.txt",
          mimeType: "text/plain",
          size: 20,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const exportResponse = await app.handle(
      new Request(
        "http://localhost/system/files/export?originalName=platform&mimeType=text%2Fplain&uploaderUserId=user_admin_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(exportResponse.status).toBe(200)
    expect(exportResponse.headers.get("content-type")).toContain("text/csv")

    const exportText = await exportResponse.text()
    expect(exportText).toContain(
      "id,originalName,mimeType,size,uploaderUserId,createdAt",
    )
    expect(exportText).toContain(
      "file_1,platform-guide.txt,text/plain,20,user_admin_1,2026-04-21T03:00:00.000Z",
    )

    const uploadBody = new FormData()
    uploadBody.set(
      "file",
      new File(["hello file module"], "hello.txt", {
        type: "text/plain",
      }),
    )
    const uploadResponse = await app.handle(
      new Request("http://localhost/system/files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: uploadBody,
      }),
    )

    expect(uploadResponse.status).toBe(201)
    const createdFile = await readJsonRecord(uploadResponse)
    const createdFileId = readString(createdFile, "id")

    expect(createdFileId).toEqual(expect.any(String))
    expect(readString(createdFile, "originalName")).toBe("hello.txt")
    expect(readString(createdFile, "mimeType")).toContain("text/plain")
    expect(readNumber(createdFile, "size")).toBe(17)
    expect(readString(createdFile, "uploaderUserId")).toEqual(
      expect.any(String),
    )
    expect(readString(createdFile, "createdAt")).toEqual(expect.any(String))

    const getResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFileId}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createdFile)

    const downloadResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFileId}/download`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(downloadResponse.status).toBe(200)
    expect(downloadResponse.headers.get("content-type")).toContain("text/plain")
    expect(downloadResponse.headers.get("content-disposition")).toContain(
      "hello.txt",
    )
    expect(await downloadResponse.text()).toBe("hello file module")

    const deleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFileId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(deleteResponse.status).toBe(204)

    const missingAfterDeleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFileId}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(missingAfterDeleteResponse.status).toBe(404)
  })

  it("rejects file upload requests without a multipart file", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:file:upload"],
      isSuperAdmin: false,
    })
    const fileRepository = createInMemoryFileRepository()
    const fileStorage = createInMemoryFileStorage()
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(fileRepository, fileStorage, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const body = new FormData()
    body.set("note", "missing file")
    const response = await app.handle(
      new Request("http://localhost/system/files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body,
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.FILE_UPLOAD_REQUIRED,
      message: "File upload is required",
      status: 400,
    })
  })

  it("bulk deletes files and leaves unrelated files intact", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:file:list",
        "system:file:download",
        "system:file:delete",
      ],
      isSuperAdmin: false,
    })
    const fileRepository = createInMemoryFileRepository([
      ...createFileSeedRecords(),
      {
        id: "file_2",
        originalName: "release-note.txt",
        storageKey: "file_storage_2",
        mimeType: "text/plain",
        size: 18,
        uploaderUserId: "user_admin_1",
        createdAt: "2026-04-21T04:00:00.000Z",
      },
    ])
    const fileStorage = createInMemoryFileStorage({
      file_storage_1: new TextEncoder().encode("platform guide bytes"),
      file_storage_2: new TextEncoder().encode("release note bytes"),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(fileRepository, fileStorage, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const deleteResponse = await app.handle(
      new Request("http://localhost/system/files/delete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ids: ["file_1", "file_missing", "file_1"],
        }),
      }),
    )

    expect(deleteResponse.status).toBe(200)
    expect(await deleteResponse.json()).toEqual({
      items: [
        {
          id: "file_1",
          originalName: "platform-guide.txt",
          mimeType: "text/plain",
          size: 20,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
    })

    const deletedDownloadResponse = await app.handle(
      new Request("http://localhost/system/files/file_1/download", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )
    expect(deletedDownloadResponse.status).toBe(404)

    const keptDownloadResponse = await app.handle(
      new Request("http://localhost/system/files/file_2/download", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )
    expect(keptDownloadResponse.status).toBe(200)
    expect(await keptDownloadResponse.text()).toBe("release note bytes")
  })

  it("filters files by self-only data access", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:file:list"],
      isSuperAdmin: false,
      dataScope: 5,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(
          createInMemoryFileRepository([
            {
              id: "file_visible_self_1",
              originalName: "my-file.txt",
              storageKey: "storage_visible_self_1",
              mimeType: "text/plain",
              size: 12,
              uploaderUserId: fixture.userId,
              createdAt: "2026-04-21T03:00:00.000Z",
            },
            {
              id: "file_hidden_other_1",
              originalName: "other-file.txt",
              storageKey: "storage_hidden_other_1",
              mimeType: "text/plain",
              size: 18,
              uploaderUserId: "user_other_1",
              createdAt: "2026-04-21T04:00:00.000Z",
            },
          ]),
          createInMemoryFileStorage(),
          {
            authGuard: fixture.authGuard,
          },
        ),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "file_visible_self_1",
          originalName: "my-file.txt",
          mimeType: "text/plain",
          size: 12,
          uploaderUserId: fixture.userId,
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })
})
