import { asc, desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { type FileRow, files } from "./schema"

export interface CreateFilePersistenceInput {
  id?: string
  originalName: string
  storageKey: string
  mimeType?: string | null
  size: number
  uploaderUserId?: string | null
}

export const listFiles = async (db: DatabaseClient): Promise<FileRow[]> =>
  db
    .select()
    .from(files)
    .orderBy(desc(files.createdAt), asc(files.originalName))

export const getFileById = async (
  db: DatabaseClient,
  id: string,
): Promise<FileRow | null> => {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1)

  return row ?? null
}

export const insertFile = async (
  db: DatabaseClient,
  input: CreateFilePersistenceInput,
): Promise<FileRow> => {
  const [row] = await db
    .insert(files)
    .values({
      ...(input.id ? { id: input.id } : {}),
      originalName: input.originalName,
      storageKey: input.storageKey,
      mimeType: input.mimeType ?? null,
      size: input.size,
      uploaderUserId: input.uploaderUserId ?? null,
    })
    .returning()

  if (!row) {
    throw new Error("File insert did not return a row")
  }

  return row
}

export const deleteFile = async (
  db: DatabaseClient,
  id: string,
): Promise<FileRow | null> => {
  const [row] = await db.delete(files).where(eq(files.id, id)).returning()

  return row ?? null
}
