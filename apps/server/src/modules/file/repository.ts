import {
  type DatabaseClient,
  type FileRow,
  deleteFile,
  getFileById,
  insertFile,
  listFiles,
} from "@elysian/persistence"
import type { FileRecord } from "@elysian/schema"

export interface CreateFileInput {
  originalName: string
  storageKey: string
  mimeType?: string
  size: number
  uploaderUserId?: string | null
}

export interface StoredFileRecord extends FileRecord {
  storageKey: string
}

export interface FileRepository {
  list: () => Promise<FileRecord[]>
  getById: (id: string) => Promise<FileRecord | null>
  getStoredById: (id: string) => Promise<StoredFileRecord | null>
  create: (input: CreateFileInput) => Promise<StoredFileRecord>
  delete: (id: string) => Promise<StoredFileRecord | null>
}

export const createFileRepository = (db: DatabaseClient): FileRepository => ({
  async list() {
    const rows = await listFiles(db)
    return rows.map(mapPublicFileRow)
  },
  async getById(id) {
    const row = await getFileById(db, id)
    return row ? mapPublicFileRow(row) : null
  },
  async getStoredById(id) {
    const row = await getFileById(db, id)
    return row ? mapStoredFileRow(row) : null
  },
  async create(input) {
    const row = await insertFile(db, {
      originalName: input.originalName,
      storageKey: input.storageKey,
      mimeType: input.mimeType ?? null,
      size: input.size,
      uploaderUserId: input.uploaderUserId ?? null,
    })

    return mapStoredFileRow(row)
  },
  async delete(id) {
    const row = await deleteFile(db, id)
    return row ? mapStoredFileRow(row) : null
  },
})

export const createInMemoryFileRepository = (
  seed: StoredFileRecord[] = [],
): FileRepository => {
  const items = new Map(seed.map((item) => [item.id, item]))

  return {
    async list() {
      return [...items.values()].sort(compareFiles).map(mapPublicStoredFile)
    },
    async getById(id) {
      const item = items.get(id)
      return item ? mapPublicStoredFile(item) : null
    },
    async getStoredById(id) {
      return items.get(id) ?? null
    },
    async create(input) {
      const file: StoredFileRecord = {
        id: crypto.randomUUID(),
        originalName: input.originalName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        size: input.size,
        uploaderUserId: input.uploaderUserId ?? undefined,
        createdAt: new Date().toISOString(),
      }

      items.set(file.id, file)
      return file
    },
    async delete(id) {
      const existing = items.get(id) ?? null
      if (existing) {
        items.delete(id)
      }

      return existing
    },
  }
}

const mapPublicFileRow = (row: FileRow): FileRecord => ({
  id: row.id,
  originalName: row.originalName,
  mimeType: row.mimeType ?? undefined,
  size: row.size,
  uploaderUserId: row.uploaderUserId ?? undefined,
  createdAt: row.createdAt.toISOString(),
})

const mapStoredFileRow = (row: FileRow): StoredFileRecord => ({
  ...mapPublicFileRow(row),
  storageKey: row.storageKey,
})

const mapPublicStoredFile = (row: StoredFileRecord): FileRecord => ({
  id: row.id,
  originalName: row.originalName,
  mimeType: row.mimeType,
  size: row.size,
  uploaderUserId: row.uploaderUserId,
  createdAt: row.createdAt,
})

const compareFiles = (left: StoredFileRecord, right: StoredFileRecord) =>
  right.createdAt.localeCompare(left.createdAt) ||
  left.originalName.localeCompare(right.originalName)
