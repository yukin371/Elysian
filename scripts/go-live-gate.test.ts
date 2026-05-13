import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { beforeEach, describe, expect, test } from "bun:test"

import { renderGateSummaryMarkdown } from "./go-live-gate"

const createReportFixture = async (status: "passed" | "failed") => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-go-live-gate-"))
  const reportPath = join(outputDir, "go-live-report.json")
  const gatePath = join(outputDir, "go-live-gate-report.json")

  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: "2026-05-06T00:00:00.000Z",
        outputPath: reportPath,
        status,
        blockers:
          status === "failed"
            ? ["database backup / restore evidence 缺失。"]
            : [],
        recommendedActions:
          status === "failed"
            ? [
                "由环境 / DBA owner 填写数据库备份与恢复模板，并补齐恢复点证据。",
              ]
            : ["No action required."],
        blockerDetails:
          status === "failed"
            ? [
                {
                  code: "backup-evidence-missing",
                  message: "database backup / restore evidence 缺失。",
                  category: "environment-prerequisite",
                  defaultOwner: "DBA / 环境 owner",
                  milestoneId: "M2",
                  envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
                },
              ]
            : [],
        milestones: [
          {
            id: "M1",
            title: "候选冻结",
            status: "passed",
            blockerCount: 0,
            blockers: [],
          },
          {
            id: "M2",
            title: "环境前提锁定",
            status: status === "failed" ? "blocked" : "passed",
            blockerCount: status === "failed" ? 1 : 0,
            blockers:
              status === "failed"
                ? ["database backup / restore evidence 缺失。"]
                : [],
          },
          {
            id: "M3",
            title: "目标环境演练",
            status: status === "failed" ? "blocked" : "passed",
            blockerCount: 0,
            blockers: [],
          },
          {
            id: "M4",
            title: "首发放行结论",
            status: status === "failed" ? "blocked" : "passed",
            blockerCount: status === "failed" ? 1 : 0,
            blockers:
              status === "failed"
                ? ["前序里程碑未全部通过，当前不可给出首发放行结论。"]
                : [],
          },
        ],
        nextMilestone: status === "failed" ? "M2" : null,
        ownerHandoffs:
          status === "failed"
            ? [
                {
                  owner: "DBA / 环境 owner",
                  blockerCount: 1,
                  blockers: ["database backup / restore evidence 缺失。"],
                  envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
                },
              ]
            : [],
        summary: {
          sourceBranch: "dev",
          targetBranch: "main",
          releaseEnvironment: "production",
          tenantImpact: false,
        },
      },
      null,
      2,
    ),
    "utf8",
  )

  return {
    reportPath,
    gatePath,
  }
}

const createMalformedReportFixture = async (rawContent: string) => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-go-live-gate-bad-"))
  const reportPath = join(outputDir, "go-live-report.json")
  const gatePath = join(outputDir, "go-live-gate-report.json")

  await writeFile(reportPath, rawContent, "utf8")

  return {
    reportPath,
    gatePath,
  }
}

const runGateProcess = async (reportPath: string, gatePath: string) => {
  const child = Bun.spawn(["bun", "scripts/go-live-gate.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELYSIAN_GO_LIVE_REPORT_PATH: reportPath,
      ELYSIAN_GO_LIVE_GATE_REPORT_PATH: gatePath,
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

describe("renderGateSummaryMarkdown", () => {
  test("renders gate status and recommended actions", () => {
    const markdown = renderGateSummaryMarkdown({
      generatedAt: "2026-05-06T00:00:00.000Z",
      reportPath: "artifacts/go-live/go-live-report.json",
      outputPath: "artifacts/go-live/go-live-gate-report.json",
      status: "failed",
      conclusion: "Go-live gate failed with 1 blocker(s).",
      blockerCount: 1,
      summary: {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseEnvironment: "production",
        tenantImpact: false,
      },
      recommendedActions: ["由发布负责人填写角色与值守模板。"],
      blockerDetails: [],
      milestones: [
        {
          id: "M1",
          title: "候选冻结",
          status: "passed",
          blockerCount: 0,
          blockers: [],
        },
        {
          id: "M2",
          title: "环境前提锁定",
          status: "blocked",
          blockerCount: 1,
          blockers: ["database backup / restore evidence 缺失。"],
        },
        {
          id: "M3",
          title: "目标环境演练",
          status: "blocked",
          blockerCount: 0,
          blockers: [],
        },
        {
          id: "M4",
          title: "首发放行结论",
          status: "blocked",
          blockerCount: 1,
          blockers: ["前序里程碑未全部通过，当前不可给出首发放行结论。"],
        },
      ],
      nextMilestone: "M2",
      ownerHandoffs: [
        {
          owner: "DBA / 环境 owner",
          blockerCount: 1,
          blockers: ["database backup / restore evidence 缺失。"],
          envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
        },
      ],
    })

    expect(markdown).toContain("### Go-live Gate")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- blockerCount: `1`")
    expect(markdown).toContain("- nextMilestone: `M2`")
    expect(markdown).toContain("- M2 环境前提锁定: `blocked` (1 blocker(s))")
    expect(markdown).toContain("- DBA / 环境 owner: 1 blocker(s)")
    expect(markdown).toContain("envKeys: ELYSIAN_GO_LIVE_BACKUP_READY")
    expect(markdown).toContain("由发布负责人填写角色与值守模板。")
  })
})

describe("run", () => {
  beforeEach(() => {
    process.env.ELYSIAN_GO_LIVE_REPORT_PATH = undefined
    process.env.ELYSIAN_GO_LIVE_GATE_REPORT_PATH = undefined
  })

  test("passes when the go-live report passed", async () => {
    const paths = await createReportFixture("passed")

    const result = await runGateProcess(paths.reportPath, paths.gatePath)

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("Go-live gate passed.")
  })

  test("fails and sets exitCode when the go-live report failed", async () => {
    const paths = await createReportFixture("failed")

    const result = await runGateProcess(paths.reportPath, paths.gatePath)

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toContain("Go-live gate failed with 1 blocker(s).")
    expect(result.stderr).toContain("suggested-action")
  })

  test("fails fast when the go-live report is malformed", async () => {
    const paths = await createMalformedReportFixture(
      JSON.stringify(
        {
          status: "unknown",
          blockers: [],
          recommendedActions: [],
          summary: {
            sourceBranch: "dev",
            targetBranch: "main",
            tenantImpact: false,
          },
        },
        null,
        2,
      ),
    )

    const result = await runGateProcess(paths.reportPath, paths.gatePath)

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("Invalid go-live report")
  })
})
