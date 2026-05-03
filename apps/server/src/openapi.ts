import { platformManifest } from "@elysian/core"
import { moduleSchemaVersion } from "@elysian/schema"
import { t } from "elysia"

export const errorResponseSchema = t.Object({
  code: t.Number(),
  message: t.String(),
  status: t.Number(),
  details: t.Optional(t.Record(t.String(), t.Unknown())),
})

export const healthResponseSchema = t.Object({
  status: t.Literal("ok"),
  service: t.Literal(platformManifest.name),
  schemaVersion: t.Literal(moduleSchemaVersion),
})

export const platformManifestSchema = t.Object({
  name: t.Literal(platformManifest.name),
  displayName: t.Literal(platformManifest.displayName),
  version: t.Literal(platformManifest.version),
  runtime: t.Literal(platformManifest.runtime),
  status: t.Literal(platformManifest.status),
})

export const platformResponseSchema = t.Object({
  manifest: platformManifestSchema,
  capabilities: t.Array(t.String()),
})

export const metricsResponseSchema = t.Object({
  service: t.Literal(platformManifest.name),
  schemaVersion: t.Literal(moduleSchemaVersion),
  uptimeSeconds: t.Number(),
  process: t.Object({
    rssBytes: t.Number(),
    heapUsedBytes: t.Number(),
  }),
  cpu: t.Object({
    userMicros: t.Number(),
    systemMicros: t.Number(),
  }),
  timestamp: t.String({
    format: "date-time",
  }),
})

export const prometheusMetricsResponseSchema = t.String()

export const systemModulesResponseSchema = t.Object({
  env: t.String(),
  modules: t.Array(t.String()),
})
