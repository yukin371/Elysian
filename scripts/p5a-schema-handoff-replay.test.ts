import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

describe("p5a-schema-handoff-replay", () => {
  test("fails on invalid schema and passes after manual fix", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "elysian-p5a-replay-"))

    try {
      const inputPath = join(workspace, "task-input.txt")
      const invalidSchemaPath = join(workspace, "invalid.module-schema.json")
      const fixedSchemaPath = join(workspace, "fixed.module-schema.json")
      const invalidReportDir = join(workspace, "invalid-report")
      const replayReportDir = join(workspace, "replay-report")

      await writeFile(
        inputPath,
        `任务目标：
业务背景：
范围边界（必须/禁止）：
影响模块：
验收标准：
验证命令：
文档同步要求：`,
        "utf8",
      )
      await writeFile(
        invalidSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            fields: [{ key: "name", label: "Name", kind: "string" }],
          },
          null,
          2,
        ),
        "utf8",
      )
      await writeFile(
        fixedSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            fields: [
              { key: "id", label: "ID", kind: "id", required: true },
              {
                key: "name",
                label: "Name",
                kind: "string",
                required: true,
                searchable: true,
              },
            ],
          },
          null,
          2,
        ),
        "utf8",
      )

      const invalidRun = Bun.spawn(
        [
          "bun",
          "scripts/p5a-schema-handoff-report.ts",
          "--input-file",
          inputPath,
          "--schema-file",
          invalidSchemaPath,
          "--report-dir",
          invalidReportDir,
        ],
        {
          cwd: process.cwd(),
          stdout: "pipe",
          stderr: "pipe",
        },
      )
      const invalidCode = await invalidRun.exited

      expect(invalidCode).toBe(1)

      const replayRun = Bun.spawn(
        [
          "bun",
          "scripts/p5a-schema-handoff-replay.ts",
          "--input-file",
          inputPath,
          "--schema-file",
          fixedSchemaPath,
          "--report-dir",
          replayReportDir,
          "--generate",
          "--out",
          join(workspace, "generated"),
        ],
        {
          cwd: process.cwd(),
          stdout: "pipe",
          stderr: "pipe",
        },
      )
      const replayCode = await replayRun.exited

      expect(replayCode).toBe(0)

      const reportRaw = await readFile(
        join(replayReportDir, "p5a-schema-handoff-report.json"),
        "utf8",
      )
      const report = JSON.parse(reportRaw) as {
        decision: string
        status: string
      }

      expect(report.decision).toBe("ready_for_generator")
      expect(report.status).toBe("passed")

      const generatedSchema = await readFile(
        join(
          workspace,
          "generated",
          "modules",
          "supplier",
          "supplier.schema.ts",
        ),
        "utf8",
      )

      expect(generatedSchema).toContain("export const supplierModuleSchema")
    } finally {
      await rm(workspace, { recursive: true, force: true })
    }
  })
})
