import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  type GeneratorReportBase,
  createGeneratorReportRuntimeMetadata,
  resolveGeneratorReportDir,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

import {
  createDiffSummary,
  createReport,
  createSession,
  createSessionDetail,
  createSqlProposal,
  createSqlProposalHandoff,
  createWorkspace,
  installGeneratorPreviewWorkspaceTestEnv,
  restoreGeneratorPreviewWorkspaceTestEnv,
  waitForAsyncWork,
} from "../apps/example-vue/src/workspaces/use-generator-preview-workspace.test-helpers"

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

interface StudioScenarioResult {
  name: string
  status: "passed" | "failed"
  message?: string
}

interface StudioReport extends GeneratorReportBase {
  scenarios: StudioScenarioResult[]
}

const writeReport = async (report: StudioReport) => {
  const reportDir = resolveGeneratorReportDir()
  const reportPath = join(reportDir, "e2e-generator-studio-report.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  return reportPath
}

const createJsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    status,
  })

const runHappyPathScenario = async () => {
  globalThis.localStorage.clear()

  let applyRequestCount = 0
  let confirmRequestCount = 0
  let previewRequestCount = 0
  let reviewRequestCount = 0

  const applyEvidence = {
    actorDisplayName: "Admin",
    actorUserId: "user-1",
    actorUsername: "admin",
    appliedAt: "2026-05-09T10:20:00.000Z",
    manifestPath: "generated/reports/guided-flow-happy-apply.manifest.json",
    reportPath: "generated/reports/guided-flow-happy.preview.json",
    requestId: "apply-request-1",
    sessionId: "guided-flow-happy",
  }

  globalThis.fetch = (async (input, init) => {
    const url = String(input)
    const method = init?.method ?? "GET"

    if (url.endsWith("/studio/generator/sessions") && method === "GET") {
      return createJsonResponse({ items: [] })
    }

    if (
      url.endsWith("/studio/generator/sessions/preview") &&
      method === "POST"
    ) {
      previewRequestCount += 1

      return createJsonResponse({
        diff: createDiffSummary(),
        report: createReport(),
        session: createSession({
          id: "guided-flow-happy",
          status: "pending_review",
        }),
        sqlProposal: createSqlProposal(),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-happy/review") &&
      method === "POST"
    ) {
      reviewRequestCount += 1

      return createJsonResponse({
        diff: createDiffSummary(),
        session: createSession({
          id: "guided-flow-happy",
          reviewEvidence: {
            actorDisplayName: "Admin",
            actorUserId: "user-1",
            actorUsername: "admin",
            comment: null,
            decision: "approve",
            reportPath: "generated/reports/guided-flow-happy.preview.json",
            reviewedAt: "2026-05-09T10:05:00.000Z",
            sessionId: "guided-flow-happy",
          },
          reviewedAt: "2026-05-09T10:05:00.000Z",
          reviewedByDisplayName: "Admin",
          reviewedByUserId: "user-1",
          reviewedByUsername: "admin",
          status: "ready",
        }),
        sqlProposal: createSqlProposal(),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-happy/confirm") &&
      method === "POST"
    ) {
      confirmRequestCount += 1

      return createJsonResponse({
        session: createSession({
          confirmationEvidence: {
            actorDisplayName: "Admin",
            actorUserId: "user-1",
            actorUsername: "admin",
            archivedSnapshotPath: null,
            checklist: ["Review the SQL draft.", "Review the target diff."],
            confirmedAt: "2026-05-09T10:10:00.000Z",
            recoveryStatus: "none",
            reportPath: "generated/reports/guided-flow-happy.preview.json",
            sessionId: "guided-flow-happy",
            snapshotPath:
              "/tmp/generator-session-report/guided-flow-happy.migration-proposal.json",
          },
          confirmedAt: "2026-05-09T10:10:00.000Z",
          confirmedByDisplayName: "Admin",
          confirmedByUserId: "user-1",
          confirmedByUsername: "admin",
          id: "guided-flow-happy",
          status: "ready",
        }),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-happy/apply") &&
      method === "POST"
    ) {
      applyRequestCount += 1

      return createJsonResponse({
        apply: {
          evidence: applyEvidence,
          files: [
            {
              absolutePath: "E:/Github/Elysian/generated/customer.ts",
              mergeStrategy: "create",
              path: "generated/customer.ts",
              reason: "new file",
              written: true,
            },
          ],
          manifestPath: applyEvidence.manifestPath,
        },
        diff: createDiffSummary(),
        session: createSession({
          appliedAt: "2026-05-09T10:20:00.000Z",
          appliedByDisplayName: "Admin",
          appliedByUserId: "user-1",
          appliedByUsername: "admin",
          appliedFileCount: 1,
          applyEvidence,
          applyManifestPath: applyEvidence.manifestPath,
          applyRequestId: "apply-request-1",
          confirmedAt: "2026-05-09T10:10:00.000Z",
          id: "guided-flow-happy",
          status: "applied",
        }),
        sqlProposal: createSqlProposal(),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    return new Response("not found", { status: 404 })
  }) as typeof fetch

  const { enabled, workspace } = createWorkspace({ enabled: false })

  await waitForAsyncWork()

  enabled.value = true

  await waitForAsyncWork()
  await waitForAsyncWork()

  assert(
    previewRequestCount === 1,
    "Expected one preview request in happy path.",
  )
  assert(
    workspace.currentSession.value?.status === "pending_review",
    `Expected pending_review after preview, got "${workspace.currentSession.value?.status ?? "null"}".`,
  )
  assert(
    workspace.currentStep.value === "review",
    `Expected review step after preview, got "${workspace.currentStep.value}".`,
  )

  await workspace.reviewPreview("approve")

  assert(reviewRequestCount === 1, "Expected one review request in happy path.")
  assert(
    workspace.currentSession.value?.status === "ready",
    `Expected ready after review, got "${workspace.currentSession.value?.status ?? "null"}".`,
  )
  assert(
    workspace.currentSession.value?.confirmedAt === null,
    "Expected review-approved session to remain unconfirmed.",
  )
  assert(
    workspace.currentStep.value === "confirm",
    `Expected confirm step after review, got "${workspace.currentStep.value}".`,
  )

  await workspace.confirmPreview()

  assert(
    confirmRequestCount === 1,
    "Expected one confirm request in happy path.",
  )
  assert(
    workspace.currentSession.value?.confirmedAt === "2026-05-09T10:10:00.000Z",
    "Expected confirmedAt after confirmation.",
  )
  assert(
    workspace.currentSession.value?.confirmationEvidence?.checklist.length ===
      2,
    "Expected confirmation evidence checklist to be captured.",
  )
  assert(
    workspace.currentStep.value === "apply",
    `Expected apply step after confirmation, got "${workspace.currentStep.value}".`,
  )
  assert(
    workspace.canApplyPreview.value,
    "Expected apply to become available after confirmation.",
  )

  await workspace.applyPreview()

  assert(applyRequestCount === 1, "Expected one apply request in happy path.")
  assert(
    workspace.currentSession.value?.status === "applied",
    `Expected applied status after apply, got "${workspace.currentSession.value?.status ?? "null"}".`,
  )
  assert(
    workspace.currentSession.value?.applyEvidence?.requestId ===
      "apply-request-1",
    "Expected apply evidence to be stored after apply.",
  )
  assert(
    workspace.currentStep.value === "done",
    `Expected done step after apply, got "${workspace.currentStep.value}".`,
  )
}

const runBlockedApplyScenario = async () => {
  globalThis.localStorage.clear()

  let applyRequestCount = 0
  let confirmRequestCount = 0
  let detailRequestCount = 0
  let previewRequestCount = 0
  let reviewRequestCount = 0

  globalThis.fetch = (async (input, init) => {
    const url = String(input)
    const method = init?.method ?? "GET"

    if (url.endsWith("/studio/generator/sessions") && method === "GET") {
      return createJsonResponse({ items: [] })
    }

    if (
      url.endsWith("/studio/generator/sessions/preview") &&
      method === "POST"
    ) {
      previewRequestCount += 1

      return createJsonResponse({
        diff: createDiffSummary(),
        report: createReport(),
        session: createSession({
          id: "guided-flow-blocked",
          status: "pending_review",
        }),
        sqlProposal: createSqlProposal(),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-blocked/review") &&
      method === "POST"
    ) {
      reviewRequestCount += 1

      return createJsonResponse({
        diff: createDiffSummary(),
        session: createSession({
          id: "guided-flow-blocked",
          reviewedAt: "2026-05-09T10:30:00.000Z",
          reviewedByDisplayName: "Admin",
          reviewedByUserId: "user-1",
          reviewedByUsername: "admin",
          status: "ready",
        }),
        sqlProposal: createSqlProposal(),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-blocked/confirm") &&
      method === "POST"
    ) {
      confirmRequestCount += 1

      return createJsonResponse({
        session: createSession({
          confirmationEvidence: {
            actorDisplayName: "Admin",
            actorUserId: "user-1",
            actorUsername: "admin",
            archivedSnapshotPath: null,
            checklist: ["Review the SQL draft."],
            confirmedAt: "2026-05-09T10:35:00.000Z",
            recoveryStatus: "none",
            reportPath: "generated/reports/guided-flow-blocked.preview.json",
            sessionId: "guided-flow-blocked",
            snapshotPath:
              "/tmp/generator-session-report/guided-flow-blocked.migration-proposal.json",
          },
          confirmedAt: "2026-05-09T10:35:00.000Z",
          confirmedByDisplayName: "Admin",
          confirmedByUserId: "user-1",
          confirmedByUsername: "admin",
          id: "guided-flow-blocked",
          status: "ready",
        }),
        sqlProposalHandoff: createSqlProposalHandoff(),
      })
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-blocked/apply") &&
      method === "POST"
    ) {
      applyRequestCount += 1

      return createJsonResponse(
        {
          error: {
            code: "GENERATOR_SESSION_BLOCKING_CONFLICTS",
            details: {
              blockerReasons: [
                {
                  code: "blocking-conflicts",
                  message:
                    "Blocking files still need manual review before apply.",
                  stage: "apply",
                },
              ],
            },
            message: "Generator session still has blocking conflicts",
            status: 409,
          },
        },
        409,
      )
    }

    if (
      url.endsWith("/studio/generator/sessions/guided-flow-blocked") &&
      method === "GET"
    ) {
      detailRequestCount += 1

      return createJsonResponse(
        createSessionDetail({
          blockerReasons: [
            {
              code: "blocking-conflicts",
              message: "Blocking files still need manual review before apply.",
              stage: "apply",
            },
          ],
          confirmedAt: "2026-05-09T10:35:00.000Z",
          hasBlockingConflicts: true,
          id: "guided-flow-blocked",
          status: "ready",
        }),
      )
    }

    return new Response("not found", { status: 404 })
  }) as typeof fetch

  const { enabled, workspace } = createWorkspace({ enabled: false })

  enabled.value = true

  await waitForAsyncWork()
  await waitForAsyncWork()

  await workspace.reviewPreview("approve")
  await workspace.confirmPreview()
  await workspace.applyPreview()

  assert(
    previewRequestCount === 1,
    "Expected one preview request in blocked apply scenario.",
  )
  assert(
    reviewRequestCount === 1,
    "Expected one review request in blocked apply scenario.",
  )
  assert(
    confirmRequestCount === 1,
    "Expected one confirm request in blocked apply scenario.",
  )
  assert(
    applyRequestCount === 1,
    "Expected one apply attempt in blocked apply scenario.",
  )
  assert(
    detailRequestCount === 1,
    "Expected blocked apply scenario to refresh the latest session detail once.",
  )
  assert(
    workspace.currentSession.value?.status === "ready",
    `Expected blocked apply scenario to remain ready, got "${workspace.currentSession.value?.status ?? "null"}".`,
  )
  assert(
    workspace.currentSession.value?.hasBlockingConflicts === true,
    "Expected blocked apply scenario to surface blocking conflicts.",
  )
  assert(
    workspace.currentSession.value?.blockerReasons[0]?.code ===
      "blocking-conflicts",
    "Expected blocked apply scenario to keep blocker reason evidence.",
  )
  assert(
    workspace.errorMessage.value ===
      "Blocking files still need manual review before apply.",
    `Expected localized blocker message after blocked apply, got "${workspace.errorMessage.value}".`,
  )
  assert(
    workspace.currentStep.value === "apply",
    `Expected blocked apply scenario to stay in apply step, got "${workspace.currentStep.value}".`,
  )
  assert(
    workspace.canApplyPreview.value === false,
    "Expected blocked apply scenario to disable apply after refresh.",
  )
}

const run = async (): Promise<StudioScenarioResult[]> => {
  installGeneratorPreviewWorkspaceTestEnv()
  const scenarios: StudioScenarioResult[] = []

  const recordScenario = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn()
      scenarios.push({ name, status: "passed" })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      scenarios.push({ name, status: "failed", message })
    }
  }

  try {
    await recordScenario(
      "initial workspace enters configure state",
      async () => {
        globalThis.localStorage.clear()

        const { workspace: initialWorkspace } = createWorkspace()

        await waitForAsyncWork()

        assert(
          initialWorkspace.currentStep.value === "configure",
          `Expected initial currentStep to be "configure", got "${initialWorkspace.currentStep.value}".`,
        )
      },
    )

    await recordScenario(
      "guided workspace happy path reaches apply completion",
      runHappyPathScenario,
    )
    await recordScenario(
      "guided workspace blocked apply keeps evidence visible",
      runBlockedApplyScenario,
    )
  } finally {
    restoreGeneratorPreviewWorkspaceTestEnv()
  }

  return scenarios
}

const startedTimestamp = Date.now()
const startedAt = new Date(startedTimestamp).toISOString()

run()
  .then(async (scenarios) => {
    const passedCount = scenarios.filter(
      (scenario) => scenario.status === "passed",
    ).length
    const failedCount = scenarios.length - passedCount
    const reportPath = await writeReport({
      gitSha: resolveGeneratorReportGitSha(),
      runtime: createGeneratorReportRuntimeMetadata(),
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedTimestamp,
      status: failedCount === 0 ? "passed" : "failed",
      passedCount,
      failedCount,
      scenarios,
    })

    console.log(
      `[e2e-generator-studio-guided-flow-smoke] report: ${reportPath}`,
    )
    if (failedCount === 0) {
      console.log("[e2e-generator-studio-guided-flow-smoke] passed")
      return
    }

    for (const scenario of scenarios) {
      if (scenario.status === "failed") {
        console.error(`[studio] fail ${scenario.name}: ${scenario.message}`)
      }
    }
    console.error(
      `[e2e-generator-studio-guided-flow-smoke] failed: ${failedCount} studio scenario(s) failed`,
    )
    process.exitCode = 1
  })
  .catch(async (error) => {
    const message = error instanceof Error ? error.message : String(error)
    const reportPath = await writeReport({
      gitSha: resolveGeneratorReportGitSha(),
      runtime: createGeneratorReportRuntimeMetadata(),
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedTimestamp,
      status: "failed",
      passedCount: 0,
      failedCount: 1,
      scenarios: [],
      errorMessage: message,
    })

    console.error(
      `[e2e-generator-studio-guided-flow-smoke] report: ${reportPath}`,
    )
    console.error(`[e2e-generator-studio-guided-flow-smoke] failed: ${message}`)
    process.exitCode = 1
  })
