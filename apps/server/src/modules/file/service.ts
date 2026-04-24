import type { DataAccessContext } from "@elysian/persistence"
import { AppError } from "../../errors"
import type { FileRepository } from "./repository"
import type { FileStorage } from "./storage"

export interface UploadFilePayload {
  file: File
  uploaderUserId?: string | null
  deptId?: string | null
}

export const createFileService = (
  repository: FileRepository,
  storage: FileStorage,
) => ({
  list: (dataAccess?: DataAccessContext) => repository.list(dataAccess),
  async getById(id: string, dataAccess?: DataAccessContext) {
    const file = await repository.getById(id, dataAccess)

    if (!file) {
      throw buildFileNotFoundError(id)
    }

    return file
  },
  async upload(payload: UploadFilePayload) {
    const saved = await storage.save(payload.file)
    const record = await repository.create({
      originalName: saved.originalName,
      storageKey: saved.storageKey,
      mimeType: saved.mimeType,
      size: saved.size,
      uploaderUserId: payload.uploaderUserId ?? null,
      deptId: payload.deptId ?? null,
    })

    return {
      id: record.id,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      uploaderUserId: record.uploaderUserId,
      createdAt: record.createdAt,
    }
  },
  async download(id: string, dataAccess?: DataAccessContext) {
    const file = await repository.getStoredById(id, dataAccess)

    if (!file) {
      throw buildFileNotFoundError(id)
    }

    const stored = await storage.read(file.storageKey)

    return {
      file,
      bytes: stored.bytes,
    }
  },
  async remove(id: string, dataAccess?: DataAccessContext) {
    const file = await repository.getStoredById(id, dataAccess)

    if (!file) {
      throw buildFileNotFoundError(id)
    }

    await storage.remove(file.storageKey)
    await repository.delete(id, dataAccess)
  },
})

const buildFileNotFoundError = (id: string) =>
  new AppError({
    code: "FILE_NOT_FOUND",
    message: "File not found",
    status: 404,
    expose: true,
    details: { id },
  })

export type FileService = ReturnType<typeof createFileService>
