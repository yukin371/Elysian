import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

import { runWith } from "./go-live-finalize"

const createFinalizeOutputPaths = async () => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-go-live-finalize-"))

  return {
    reportPath: join(outputDir, "go-live-report.json"),
    gatePath: join(outputDir, "go-live-gate-report.json"),
  }
}

const runFinalizeProcess = async (
  env: Record<string, string | undefined>,
  paths: { reportPath: string; gatePath: string },
) => {
  const child = Bun.spawn(["bun", "scripts/go-live-finalize.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env,
      ELYSIAN_GO_LIVE_REPORT_PATH: paths.reportPath,
      ELYSIAN_GO_LIVE_GATE_REPORT_PATH: paths.gatePath,
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])

  return {
    stdout,
    stderr,
    exitCode,
  }
}

describe("runWith", () => {
  test("returns passed when report and gate both passed", async () => {
    const result = await runWith({
      report: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-report.json",
      }),
      gate: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-gate-report.json",
      }),
    })

    expect(result.status).toBe("passed")
    expect(result.steps).toEqual({
      report: "passed",
      gate: "passed",
    })
    expect(result.outputs).toEqual({
      reportPath: "artifacts/go-live/go-live-report.json",
      gatePath: "artifacts/go-live/go-live-gate-report.json",
    })
  })

  test("returns failed when gate failed", async () => {
    const result = await runWith({
      report: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-report.json",
      }),
      gate: async () => ({
        status: "failed" as const,
        outputPath: "artifacts/go-live/go-live-gate-report.json",
      }),
    })

    expect(result.status).toBe("failed")
    expect(result.steps).toEqual({
      report: "passed",
      gate: "failed",
    })
  })
})

describe("run", () => {
  test("returns zero and writes outputs when go-live gate passes", async () => {
    const paths = await createFinalizeOutputPaths()
    const result = await runFinalizeProcess(
      {
        ELYSIAN_GO_LIVE_SOURCE_BRANCH: "dev",
        ELYSIAN_GO_LIVE_TARGET_BRANCH: "main",
        ELYSIAN_GO_LIVE_RELEASE_COMMIT: "ef00233",
        ELYSIAN_GO_LIVE_RELEASE_TAG: "verify-go-live-finalize",
        ELYSIAN_GO_LIVE_ENVIRONMENT: "production",
        ELYSIAN_GO_LIVE_MIGRATIONS: "001_init",
        ELYSIAN_GO_LIVE_TENANT_IMPACT: "false",
        ELYSIAN_GO_LIVE_CHECK_PASSED: "true",
        ELYSIAN_GO_LIVE_BUILD_VUE_PASSED: "true",
        ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED: "true",
        ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED: "true",
        ELYSIAN_GO_LIVE_TENANT_FULL_PASSED: "true",
        ELYSIAN_GO_LIVE_BACKUP_READY: "true",
        ELYSIAN_GO_LIVE_RELEASE_ROLES_READY: "true",
        ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY: "true",
        ELYSIAN_GO_LIVE_HEALTH_VERIFIED: "true",
        ELYSIAN_GO_LIVE_METRICS_VERIFIED: "true",
        ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED: "true",
        ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED: "true",
        ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED: "true",
        ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED: "true",
      },
      paths,
    )

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("status=passed report=passed gate=passed")

    const gateReport = JSON.parse(await readFile(paths.gatePath, "utf8")) as {
      status: string
    }
    expect(gateReport.status).toBe("passed")
  })

  test("returns non-zero when go-live gate fails", async () => {
    const paths = await createFinalizeOutputPaths()
    const result = await runFinalizeProcess(
      {
        ELYSIAN_GO_LIVE_TENANT_IMPACT: "false",
      },
      paths,
    )

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toContain("status=failed report=failed gate=failed")
    expect(result.stderr).toContain("suggested-action")
  })
})
