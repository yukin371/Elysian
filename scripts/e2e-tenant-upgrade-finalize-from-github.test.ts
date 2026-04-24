import { describe, expect, test } from "bun:test"

import { runWith } from "./e2e-tenant-upgrade-finalize-from-github"

describe("e2e-tenant-upgrade-finalize-from-github", () => {
  test("runs download and finalize-from-downloads in sequence", async () => {
    const report = await runWith({
      download: async () => ({
        outputDir: "/tmp/downloads/tenant",
      }),
      finalizeFromDownloads: async () => ({
        status: "passed" as const,
        outputs: {
          collectOutputDir: "/tmp/collected/tenant",
        },
      }),
    })

    expect(report.status).toBe("passed")
    expect(report.steps.download).toBe("passed")
    expect(report.steps.finalizeFromDownloads).toBe("passed")
    expect(report.outputs.downloadOutputDir).toBe("/tmp/downloads/tenant")
    expect(report.outputs.collectOutputDir).toBe("/tmp/collected/tenant")
  })
})
