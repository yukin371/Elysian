import { AppError } from "../../errors"
import type { FileRepository } from "./repository"
import type { FileStorage } from "./storage"

export interface UploadFilePayload {
  file: File
  uploaderUserId?: string | null
}

export const createFileService = (
  repository: FileRepository,
  storage: FileStorage,
) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const file = await repository.getById(id)

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
  async download(id: string) {
    const file = await repository.getStoredById(id)

    if (!file) {
      throw buildFileNotFoundError(id)
    }

    const stored = await storage.read(file.storageKey)

    return {
      file,
      bytes: stored.bytes,
    }
  },
  async remove(id: string) {
    const file = await repository.getStoredById(id)

    if (!file) {
      throw buildFileNotFoundError(id)
    }

    await storage.remove(file.storageKey)
    await repository.delete(id)
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
