import {
  type DataAccessContext,
  type DatabaseClient,
  type FileRow,
  buildDataAccessCondition,
  deleteFile,
  files,
  getFileById,
  insertFile,
  listFiles,
  matchesDataAccess,
} from "@elysian/persistence"
import type { FileRecord } from "@elysian/schema"

export interface CreateFileInput {
  originalName: string
  storageKey: string
  mimeType?: string
  size: number
  uploaderUserId?: string | null
  deptId?: string | null
}

export interface StoredFileRecord extends FileRecord {
  storageKey: string
  deptId?: string | null
}

export interface FileRepository {
  list: (dataAccess?: DataAccessContext) => Promise<FileRecord[]>
  getById: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<FileRecord | null>
  getStoredById: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<StoredFileRecord | null>
  create: (input: CreateFileInput) => Promise<StoredFileRecord>
  delete: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<StoredFileRecord | null>
}

export const createFileRepository = (db: DatabaseClient): FileRepository => ({
  async list(dataAccess) {
    const rows = await listFiles(db, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: files.deptId,
            creatorColumn: files.uploaderUserId,
          })
        : undefined,
    })
    return rows.map(mapPublicFileRow)
  },
  async getById(id, dataAccess) {
    const row = await getFileById(db, id, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: files.deptId,
            creatorColumn: files.uploaderUserId,
          })
        : undefined,
    })
    return row ? mapPublicFileRow(row) : null
  },
  async getStoredById(id, dataAccess) {
    const row = await getFileById(db, id, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: files.deptId,
            creatorColumn: files.uploaderUserId,
          })
        : undefined,
    })
    return row ? mapStoredFileRow(row) : null
  },
  async create(input) {
    const row = await insertFile(db, {
      originalName: input.originalName,
      storageKey: input.storageKey,
      mimeType: input.mimeType ?? null,
      size: input.size,
      uploaderUserId: input.uploaderUserId ?? null,
      deptId: input.deptId ?? null,
    })

    return mapStoredFileRow(row)
  },
  async delete(id, dataAccess) {
    const row = await deleteFile(db, id, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: files.deptId,
            creatorColumn: files.uploaderUserId,
          })
        : undefined,
    })
    return row ? mapStoredFileRow(row) : null
  },
})

export const createInMemoryFileRepository = (
  seed: StoredFileRecord[] = [],
): FileRepository => {
  const items = new Map(seed.map((item) => [item.id, item]))

  return {
    async list(dataAccess) {
      return [...items.values()]
        .filter((item) =>
          dataAccess
            ? matchesDataAccess(dataAccess, {
                deptId: item.deptId,
                creatorId: item.uploaderUserId,
              })
            : true,
        )
        .sort(compareFiles)
        .map(mapPublicStoredFile)
    },
    async getById(id, dataAccess) {
      const item = items.get(id)
      if (
        item &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: item.deptId,
          creatorId: item.uploaderUserId,
        })
      ) {
        return null
      }

      return item ? mapPublicStoredFile(item) : null
    },
    async getStoredById(id, dataAccess) {
      const item = items.get(id)
      if (
        item &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: item.deptId,
          creatorId: item.uploaderUserId,
        })
      ) {
        return null
      }

      return item ?? null
    },
    async create(input) {
      const file: StoredFileRecord = {
        id: crypto.randomUUID(),
        originalName: input.originalName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        size: input.size,
        uploaderUserId: input.uploaderUserId ?? undefined,
        deptId: input.deptId ?? null,
        createdAt: new Date().toISOString(),
      }

      items.set(file.id, file)
      return file
    },
    async delete(id, dataAccess) {
      const existing = items.get(id) ?? null
      if (
        existing &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: existing.deptId,
          creatorId: existing.uploaderUserId,
        })
      ) {
        return null
      }

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
