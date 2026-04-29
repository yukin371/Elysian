import type { DataAccessContext } from "@elysian/persistence"
import type { FileRecord } from "@elysian/schema"
import { AppError } from "../../errors"
import type {
  FileRepository,
  ListFilesInput,
  StoredFileRecord,
} from "./repository"
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
  list: (filter?: ListFilesInput, dataAccess?: DataAccessContext) =>
    repository.list(filter, dataAccess),
  async exportCsv(filter?: ListFilesInput, dataAccess?: DataAccessContext) {
    const items = await repository.list(filter, dataAccess)

    return buildCsv(
      ["id", "originalName", "mimeType", "size", "uploaderUserId", "createdAt"],
      items.map((item) => [
        item.id,
        item.originalName,
        item.mimeType,
        item.size,
        item.uploaderUserId,
        item.createdAt,
      ]),
    )
  },
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
  async removeMany(ids: string[], dataAccess?: DataAccessContext) {
    const normalizedIds = normalizeFileIds(ids)
    const deletedFiles: FileRecord[] = []

    for (const id of normalizedIds) {
      const file = await repository.getStoredById(id, dataAccess)

      if (!file) {
        continue
      }

      await storage.remove(file.storageKey)
      const deleted = await repository.delete(id, dataAccess)

      if (deleted) {
        deletedFiles.push(mapPublicStoredFile(deleted))
      }
    }

    return deletedFiles
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

const normalizeFileIds = (ids: string[]) => [
  ...new Set(ids.map((id) => id.trim()).filter(Boolean)),
]

const mapPublicStoredFile = (file: StoredFileRecord): FileRecord => ({
  id: file.id,
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
  uploaderUserId: file.uploaderUserId,
  createdAt: file.createdAt,
})

const buildCsv = (
  header: string[],
  rows: Array<Array<string | number | null | undefined>>,
) =>
  [header.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join(
    "\n",
  )

const escapeCsv = (value: string | number | null | undefined) => {
  const normalized = value === null || value === undefined ? "" : String(value)

  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n") ||
    normalized.includes("\r")
  ) {
    return `"${normalized.replaceAll('"', '""')}"`
  }

  return normalized
}

export type FileService = ReturnType<typeof createFileService>
