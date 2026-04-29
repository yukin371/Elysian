import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "./tenant"

export const generatorPreviewSessions = pgTable("generator_preview_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  actorDisplayName: text("actor_display_name"),
  actorUserId: uuid("actor_user_id"),
  actorUsername: text("actor_username"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  appliedFileCount: integer("applied_file_count"),
  appliedByDisplayName: text("applied_by_display_name"),
  appliedByUserId: uuid("applied_by_user_id"),
  appliedByUsername: text("applied_by_username"),
  applyManifestPath: text("apply_manifest_path"),
  applyRequestId: text("apply_request_id"),
  conflictStrategy: text("conflict_strategy").notNull(),
  frontendTarget: text("frontend_target").notNull(),
  hasBlockingConflicts: boolean("has_blocking_conflicts")
    .notNull()
    .default(false),
  outputDir: text("output_dir").notNull(),
  previewFileCount: integer("preview_file_count").notNull(),
  reportPath: text("report_path").notNull(),
  schemaName: text("schema_name").notNull(),
  skippedFileCount: integer("skipped_file_count"),
  sourceType: text("source_type").notNull(),
  sourceValue: text("source_value").notNull(),
  status: text("status").notNull().default("ready"),
  targetPreset: text("target_preset").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type GeneratorPreviewSessionRow = InferSelectModel<
  typeof generatorPreviewSessions
>
export type NewGeneratorPreviewSessionRow = InferInsertModel<
  typeof generatorPreviewSessions
>
