import { desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { RefreshSessionRow } from "./schema"
import { refreshSessions } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateRefreshSessionPersistenceInput {
  id?: string
  userId: string
  tokenHash: string
  userAgent?: string | null
  ip?: string | null
  expiresAt: Date
  tenantId?: string
}

export const insertRefreshSession = async (
  db: DatabaseClient,
  input: CreateRefreshSessionPersistenceInput,
): Promise<RefreshSessionRow> => {
  const [row] = await db
    .insert(refreshSessions)
    .values({
      ...(input.id ? { id: input.id } : {}),
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt: input.expiresAt,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Refresh session insert did not return a row")
  }

  return row
}

export const getRefreshSessionByTokenHash = async (
  db: DatabaseClient,
  tokenHash: string,
): Promise<RefreshSessionRow | null> => {
  const [row] = await db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.tokenHash, tokenHash))
    .limit(1)

  return row ?? null
}

export const getRefreshSessionById = async (
  db: DatabaseClient,
  sessionId: string,
): Promise<RefreshSessionRow | null> => {
  const [row] = await db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.id, sessionId))
    .limit(1)

  return row ?? null
}

export const listRefreshSessionsByUserId = async (
  db: DatabaseClient,
  userId: string,
): Promise<RefreshSessionRow[]> =>
  db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.userId, userId))
    .orderBy(desc(refreshSessions.createdAt))

export const revokeRefreshSession = async (
  db: DatabaseClient,
  sessionId: string,
  revokedAt: Date,
  replacedBySessionId?: string | null,
): Promise<void> => {
  await db
    .update(refreshSessions)
    .set({
      revokedAt,
      replacedBySessionId: replacedBySessionId ?? null,
      updatedAt: revokedAt,
    })
    .where(eq(refreshSessions.id, sessionId))
}

export const touchRefreshSession = async (
  db: DatabaseClient,
  sessionId: string,
  timestamp: Date,
): Promise<void> => {
  await db
    .update(refreshSessions)
    .set({
      lastUsedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(refreshSessions.id, sessionId))
}
