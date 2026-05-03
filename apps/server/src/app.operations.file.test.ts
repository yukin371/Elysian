import { describe, expect, it } from "bun:test"
import { errorCodes } from "./errors/registry"
import {
  createAuthTestFixture,
  createFileSeedRecords,
  createTestApp,
  loginAsAdmin,
} from "./app.operations.test-helpers"
import {
  createFileModule,
  createInMemoryFileRepository,
  createInMemoryFileStorage,
} from "./modules"

describe("createServerApp files", () => {
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
    const createdFile = (await uploadResponse.json()) as {
      id: string
      originalName: string
      mimeType?: string
      size: number
      uploaderUserId?: string
      createdAt: string
    }
    expect(createdFile.id).toEqual(expect.any(String))
    expect(createdFile.originalName).toBe("hello.txt")
    expect(createdFile.mimeType).toContain("text/plain")
    expect(createdFile.size).toBe(17)
    expect(createdFile.uploaderUserId).toEqual(expect.any(String))
    expect(createdFile.createdAt).toEqual(expect.any(String))

    const getResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createdFile)

    const downloadResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}/download`, {
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
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(deleteResponse.status).toBe(204)

    const missingAfterDeleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
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
