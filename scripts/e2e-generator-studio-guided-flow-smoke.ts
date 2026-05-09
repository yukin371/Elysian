import {
  createDiffSummary,
  createReport,
  createSession,
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

const run = async () => {
  installGeneratorPreviewWorkspaceTestEnv()

  try {
    const { workspace: initialWorkspace } = createWorkspace()

    await waitForAsyncWork()

    assert(
      initialWorkspace.currentStep.value === "configure",
      `Expected initial currentStep to be "configure", got "${initialWorkspace.currentStep.value}".`,
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession({
              id: "guided-flow-review-session",
              status: "pending_review",
            }),
            sqlProposal: createSqlProposal(),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { enabled, workspace } = createWorkspace()

    await waitForAsyncWork()

    enabled.value = true

    await waitForAsyncWork()
    await waitForAsyncWork()

    assert(
      workspace.currentStep.value === "review",
      `Expected refreshPreview success to enter "review", got "${workspace.currentStep.value}".`,
    )

    workspace.currentSession.value = createSession({
      id: "guided-flow-confirm-session",
      status: "ready",
      confirmedAt: null,
    })
    workspace.currentSqlProposalHandoff.value = createSqlProposalHandoff()

    assert(
      workspace.currentStep.value === "confirm",
      `Expected ready unconfirmed session to map to "confirm", got "${workspace.currentStep.value}".`,
    )

    workspace.currentSession.value = createSession({
      id: "guided-flow-apply-session",
      status: "ready",
      confirmedAt: "2026-05-09T10:00:00.000Z",
    })

    assert(
      workspace.currentStep.value === "apply",
      `Expected confirmed ready session to map to "apply", got "${workspace.currentStep.value}".`,
    )

    workspace.currentSession.value = createSession({
      id: "guided-flow-done-session",
      status: "applied",
      appliedAt: "2026-05-09T10:05:00.000Z",
    })

    assert(
      workspace.currentStep.value === "done",
      `Expected applied session to map to "done", got "${workspace.currentStep.value}".`,
    )

    console.log("[e2e-generator-studio-guided-flow-smoke] passed")
  } finally {
    restoreGeneratorPreviewWorkspaceTestEnv()
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-studio-guided-flow-smoke] failed: ${message}`)
  process.exitCode = 1
})
