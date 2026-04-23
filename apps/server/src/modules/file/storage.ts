import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { AppError } from "../../errors"

export interface StoredBinary {
  bytes: Uint8Array
}

export interface SaveFileResult {
  storageKey: string
  originalName: string
  mimeType?: string
  size: number
}

export interface FileStorage {
  save: (file: File) => Promise<SaveFileResult>
  read: (storageKey: string) => Promise<StoredBinary>
  remove: (storageKey: string) => Promise<void>
}

export interface LocalFileStorageOptions {
  rootDir?: string
}

export const createLocalFileStorage = (
  options: LocalFileStorageOptions = {},
): FileStorage => {
  const rootDir = options.rootDir ?? join(process.cwd(), ".elysian", "uploads")

  return {
    async save(file) {
      await mkdir(rootDir, { recursive: true })

      const storageKey = crypto.randomUUID()
      const bytes = new Uint8Array(await file.arrayBuffer())
      await writeFile(join(rootDir, storageKey), bytes)

      return {
        storageKey,
        originalName: normalizeFileName(file.name),
        mimeType: normalizeMimeType(file.type),
        size: bytes.byteLength,
      }
    },
    async read(storageKey) {
      const absolutePath = join(rootDir, storageKey)

      try {
        await access(absolutePath)
      } catch {
        throw new AppError({
          code: "FILE_CONTENT_NOT_FOUND",
          message: "File content not found",
          status: 404,
          expose: true,
          details: { storageKey },
        })
      }

      return {
        bytes: await readFile(absolutePath),
      }
    },
    async remove(storageKey) {
      const absolutePath = join(rootDir, storageKey)

      try {
        await unlink(absolutePath)
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return
        }

        throw error
      }
    },
  }
}

export const createInMemoryFileStorage = (
  seed: Record<string, Uint8Array> = {},
): FileStorage => {
  const items = new Map(
    Object.entries(seed).map(([storageKey, bytes]) => [
      storageKey,
      new Uint8Array(bytes),
    ]),
  )

  return {
    async save(file) {
      const storageKey = crypto.randomUUID()
      const bytes = new Uint8Array(await file.arrayBuffer())

      items.set(storageKey, bytes)

      return {
        storageKey,
        originalName: normalizeFileName(file.name),
        mimeType: normalizeMimeType(file.type),
        size: bytes.byteLength,
      }
    },
    async read(storageKey) {
      const bytes = items.get(storageKey)

      if (!bytes) {
        throw new AppError({
          code: "FILE_CONTENT_NOT_FOUND",
          message: "File content not found",
          status: 404,
          expose: true,
          details: { storageKey },
        })
      }

      return {
        bytes: new Uint8Array(bytes),
      }
    },
    async remove(storageKey) {
      items.delete(storageKey)
    },
  }
}

const normalizeFileName = (value: string) => {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : "unnamed"
}

const normalizeMimeType = (value: string) => {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}
