import { platformManifest } from "@elysian/core"
import { moduleSchemaVersion } from "@elysian/schema"

import type { AnyServerApp, ServerModule } from "./module"

const buildPrometheusMetricsPayload = () => {
  const uptimeSeconds = process.uptime()
  const startTimeSeconds = Date.now() / 1000 - uptimeSeconds
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  const cpuUserSeconds = cpuUsage.user / 1_000_000
  const cpuSystemSeconds = cpuUsage.system / 1_000_000

  return [
    "# HELP process_uptime_seconds Process uptime in seconds.",
    "# TYPE process_uptime_seconds gauge",
    `process_uptime_seconds ${uptimeSeconds}`,
    "# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.",
    "# TYPE process_start_time_seconds gauge",
    `process_start_time_seconds ${startTimeSeconds}`,
    "# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.",
    "# TYPE process_cpu_user_seconds_total counter",
    `process_cpu_user_seconds_total ${cpuUserSeconds}`,
    "# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.",
    "# TYPE process_cpu_system_seconds_total counter",
    `process_cpu_system_seconds_total ${cpuSystemSeconds}`,
    "# HELP process_memory_rss_bytes Resident set size in bytes.",
    "# TYPE process_memory_rss_bytes gauge",
    `process_memory_rss_bytes ${memoryUsage.rss}`,
    "# HELP process_memory_heap_used_bytes Heap used in bytes.",
    "# TYPE process_memory_heap_used_bytes gauge",
    `process_memory_heap_used_bytes ${memoryUsage.heapUsed}`,
  ].join("\n")
}

export const systemModule: ServerModule = {
  name: "system",
  register: (app: AnyServerApp, context) =>
    app
      .get(
        "/health",
        () => ({
          status: "ok" as const,
          service: platformManifest.name,
          schemaVersion: moduleSchemaVersion,
        }),
        {
          detail: {
            tags: ["system"],
            summary: "Health check",
          },
        },
      )
      .get(
        "/platform",
        () => ({
          manifest: platformManifest,
          capabilities: [
            "schema-first code generation",
            "AI-assisted module specification",
            "pluggable frontend adapters",
          ],
        }),
        {
          detail: {
            tags: ["system"],
            summary: "Platform manifest",
          },
        },
      )
      .get(
        "/metrics",
        () => {
          const memoryUsage = process.memoryUsage()
          const cpuUsage = process.cpuUsage()

          return {
            service: platformManifest.name,
            schemaVersion: moduleSchemaVersion,
            uptimeSeconds: Math.floor(process.uptime()),
            process: {
              rssBytes: memoryUsage.rss,
              heapUsedBytes: memoryUsage.heapUsed,
            },
            cpu: {
              userMicros: cpuUsage.user,
              systemMicros: cpuUsage.system,
            },
            timestamp: new Date().toISOString(),
          }
        },
        {
          detail: {
            tags: ["system"],
            summary: "Runtime metrics snapshot",
          },
        },
      )
      .get(
        "/metrics/prometheus",
        ({ set }) => {
          set.headers["content-type"] =
            "text/plain; version=0.0.4; charset=utf-8"
          return buildPrometheusMetricsPayload()
        },
        {
          detail: {
            tags: ["system"],
            summary: "Runtime metrics snapshot (Prometheus format)",
          },
        },
      )
      .get(
        "/system/modules",
        () => ({
          env: context.config.env,
          modules: context.moduleNames,
        }),
        {
          detail: {
            tags: ["system"],
            summary: "Registered modules",
          },
        },
      ),
}
