import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"

import { createInMemoryFileRepository } from "./repository"
import { createFileService } from "./service"
import { createInMemoryFileStorage } from "./storage"

const createSeedFiles = () => [
  {
    id: "file_alpha_1",
    originalName: "alpha.txt",
    storageKey: "storage_alpha_1",
    mimeType: "text/plain",
    size: 5,
    uploaderUserId: "user_alpha_1",
    deptId: "dept_alpha_1",
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "file_alpha_2",
    originalName: "beta.txt",
    storageKey: "storage_alpha_2",
    mimeType: "text/plain",
    size: 4,
    uploaderUserId: "user_alpha_1",
    deptId: "dept_alpha_1",
    createdAt: "2026-04-24T01:00:00.000Z",
  },
]

describe("createFileService", () => {
  it("uploads files through storage and exposes the public record", async () => {
    const service = createFileService(
      createInMemoryFileRepository(),
      createInMemoryFileStorage(),
    )

    const file = new File(["hello"], "  hello.txt  ", {
      type: "text/plain",
    })
    const uploaded = await service.upload({
      file,
      uploaderUserId: "user_alpha_1",
      deptId: "dept_alpha_1",
    })

    expect(uploaded).toMatchObject({
      id: expect.any(String),
      originalName: "hello.txt",
      mimeType: "text/plain;charset=utf-8",
      size: 5,
      uploaderUserId: "user_alpha_1",
      createdAt: expect.any(String),
    })
  })

  it("rejects downloading unknown files", async () => {
    const service = createFileService(
      createInMemoryFileRepository(createSeedFiles()),
      createInMemoryFileStorage({
        storage_alpha_1: new Uint8Array([1, 2, 3, 4, 5]),
        storage_alpha_2: new Uint8Array([1, 2, 3, 4]),
      }),
    )

    await expect(service.download("file_missing_1")).rejects.toMatchObject({
      code: errorCodes.FILE_NOT_FOUND,
      status: 404,
      details: {
        id: "file_missing_1",
      },
    })
  })

  it("deduplicates ids when removing many files", async () => {
    const service = createFileService(
      createInMemoryFileRepository(createSeedFiles()),
      createInMemoryFileStorage({
        storage_alpha_1: new Uint8Array([1, 2, 3, 4, 5]),
        storage_alpha_2: new Uint8Array([1, 2, 3, 4]),
      }),
    )

    const items = await service.removeMany([
      " file_alpha_1 ",
      "file_alpha_1",
      "file_alpha_2",
      "",
    ])

    expect(items.map((item) => item.id).sort()).toEqual([
      "file_alpha_1",
      "file_alpha_2",
    ])
  })
})
