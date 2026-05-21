import {
  type ChildProcessWithoutNullStreams,
  spawn,
  spawnSync,
} from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { type Page, type Route, chromium } from "playwright"
import {
  type GeneratorReportBase,
  createGeneratorReportRuntimeMetadata,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

import type {
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
} from "../apps/example-vue/src/lib/platform-api"

type BrowserScenarioStatus = "passed" | "failed"

interface BrowserScenarioResult {
  name: string
  status: BrowserScenarioStatus
  message?: string
  screenshotPath?: string
}

interface BrowserSmokeReport extends GeneratorReportBase {
  appUrl: string
  scenarios: BrowserScenarioResult[]
}

const reportDir =
  process.env.ELYSIAN_BROWSER_SMOKE_REPORT_DIR ??
  process.env.ELYSIAN_REPORT_DIR ??
  ".ci-reports/generator-browser-smoke"
const successScreenshotDir =
  process.env.ELYSIAN_BROWSER_SMOKE_SUCCESS_SCREENSHOT_DIR
const browserSmokeActorDisplayName =
  process.env.ELYSIAN_BROWSER_SMOKE_ACTOR_DISPLAY_NAME ?? "Browser Smoke"
const browserSmokeActorUsername =
  process.env.ELYSIAN_BROWSER_SMOKE_ACTOR_USERNAME ?? "browser-smoke"

const appPort = Number.parseInt(
  process.env.ELYSIAN_BROWSER_SMOKE_PORT ?? "4176",
  10,
)
const appUrl = `http://127.0.0.1:${appPort}`

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const jsonResponse = (payload: unknown, status = 200) => ({
  body: status === 204 ? "" : JSON.stringify(payload),
  contentType: "application/json",
  status,
})

const createAuthPayload = () => ({
  accessToken: "browser-smoke-token",
  dataAccess: {
    accessibleDeptIds: [],
    allowSelf: true,
    hasAllAccess: true,
    userId: "browser-smoke-user",
  },
  dataScopes: [],
  deptIds: [],
  menus: [],
  permissionCodes: ["*"],
  roles: ["admin"],
  user: {
    displayName: browserSmokeActorDisplayName,
    id: "browser-smoke-user",
    isSuperAdmin: true,
    tenantId: "default",
    username: browserSmokeActorUsername,
  },
})

const createEmptyPage = () => ({
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
})

const createApplyEvidence = (sessionId: string) => ({
  actorDisplayName: browserSmokeActorDisplayName,
  actorUserId: "browser-smoke-user",
  actorUsername: browserSmokeActorUsername,
  appliedAt: "2026-05-16T08:30:00.000Z",
  manifestPath: `generated/reports/${sessionId}.manifest.json`,
  reportPath: `generated/reports/${sessionId}.preview.json`,
  requestId: `${sessionId}-apply-request`,
  sessionId,
})

const createDiffSummary = () => ({
  actionCounts: {
    block: 0,
    create: 1,
    overwrite: 0,
    skip: 0,
  },
  changedFileCount: 1,
  totalFileCount: 1,
  unchangedFileCount: 0,
})

const createReport = (
  overrides?: Partial<GeneratorPreviewReport>,
): GeneratorPreviewReport => ({
  conflictStrategy: overrides?.conflictStrategy ?? "fail",
  databaseChangePlan: {
    operations: [],
  },
  files: [
    {
      absolutePath: "E:/Github/Elysian/generated/browser-smoke.ts",
      contents: "export const browserSmoke = true\n",
      currentContents: null,
      exists: false,
      hasChanges: true,
      isManaged: true,
      mergeStrategy: "create",
      path: "generated/browser-smoke.ts",
      plannedAction: "create",
      plannedReason: "new file",
      reason: "new file",
    },
  ],
  frontendTarget: overrides?.frontendTarget ?? "vue",
  generatedAt: "2026-05-16T08:00:00.000Z",
  outputDir: "generated",
  schemaName: overrides?.schemaName ?? "browser-smoke",
  sqlPreview: {
    contents: "create table browser_smoke (...);",
    tableName: "browser_smoke",
  },
  targetPreset: "staging",
})

const createSqlProposal = () => ({
  canonicalMigrationOwner: "packages/persistence" as const,
  dialect: "postgresql" as const,
  drizzleImportSnippet:
    'import { pgTable, text, uuid } from "drizzle-orm/pg-core"',
  drizzleSchemaSnippet:
    'export const browserSmoke = pgTable("browser_smoke", { id: uuid("id").primaryKey() })',
  operationCount: 1,
  risks: [
    {
      code: "review-required" as const,
      message: "Review manually.",
      severity: "warning" as const,
    },
  ],
  sourceSchemaName: "browser-smoke",
  sqlDraft: "create table browser_smoke (...);",
  tableName: "browser_smoke",
})

const createSqlProposalHandoff = () => ({
  canonicalMigrationOwner: "packages/persistence" as const,
  confirmationChecklist: [
    "Review the SQL draft.",
    "Review the target-directory diff.",
    "Run db:generate before db:migrate.",
  ],
  migrationProposalSnapshot: {
    generatedAt: "2026-05-16T08:00:00.000Z",
    migrationProposalResolution: {
      proposal: createSqlProposal(),
      unsupportedReason: null,
    },
    reportPath: "/tmp/browser-smoke.preview.json",
    schemaName: "browser-smoke",
    sessionId: "browser-smoke",
    snapshotPath: "/tmp/browser-smoke.migration-proposal.json",
  },
  migrationProposalSnapshotPath: "/tmp/browser-smoke.migration-proposal.json",
  migrationProposalSnapshotRecovery: {
    archivedSnapshotPath: null,
    status: "none" as const,
  },
  proposalStatus: "ready" as const,
  reviewMode: "manual" as const,
  sourceSchemaName: "browser-smoke",
  steps: ["Review draft", "Update schema", "Run migration"],
  suggestedCommands: ["bun run db:generate", "bun run db:migrate"],
  targetPaths: {
    drizzleDir: "packages/persistence/drizzle",
    persistenceIndexFile: "packages/persistence/src/index.ts",
    schemaDir: "packages/persistence/src/schema",
    schemaIndexFile: "packages/persistence/src/schema/index.ts",
  },
  unsupportedReason: null,
})

const createSession = (
  overrides?: Partial<GeneratorPreviewSessionRecord>,
): GeneratorPreviewSessionRecord => ({
  actorDisplayName: browserSmokeActorDisplayName,
  actorUserId: "browser-smoke-user",
  actorUsername: browserSmokeActorUsername,
  appliedAt: null,
  appliedByDisplayName: null,
  appliedByUserId: null,
  appliedByUsername: null,
  appliedFileCount: null,
  applyEvidence: null,
  applyManifestPath: null,
  applyRequestId: null,
  blockerReasons: [],
  confirmationEvidence: null,
  confirmedAt: null,
  confirmedByDisplayName: null,
  confirmedByUserId: null,
  confirmedByUsername: null,
  conflictStrategy: "fail",
  createdAt: "2026-05-16T08:00:00.000Z",
  driftStatus: "clean",
  frontendTarget: "vue",
  hasBlockingConflicts: false,
  id: "browser-smoke",
  outputDir: "generated",
  previewFileCount: 1,
  recoveryStatus: "none",
  reportPath: "generated/reports/browser-smoke.preview.json",
  reviewComment: null,
  reviewEvidence: null,
  reviewedAt: null,
  reviewedByDisplayName: null,
  reviewedByUserId: null,
  reviewedByUsername: null,
  schemaName: "browser-smoke",
  skippedFileCount: null,
  sourceType: "manual-schema-json",
  sourceValue:
    '{"name":"browserSmoke","label":"浏览器烟测","fields":[{"key":"id","label":"ID","kind":"id","required":true}]}',
  status: "pending_review",
  targetPreset: "staging",
  tenantId: null,
  ...overrides,
})

const createSessionDetail = (
  overrides?: Partial<GeneratorPreviewSessionDetail>,
): GeneratorPreviewSessionDetail => {
  const session = createSession(overrides)

  return {
    ...session,
    diffSummary: overrides?.diffSummary ?? createDiffSummary(),
    report:
      overrides?.report ??
      createReport({
        conflictStrategy: session.conflictStrategy,
        frontendTarget: session.frontendTarget,
        schemaName: session.schemaName,
      }),
    sqlProposal: overrides?.sqlProposal ?? createSqlProposal(),
    sqlProposalHandoff:
      overrides?.sqlProposalHandoff ?? createSqlProposalHandoff(),
  }
}

class BrowserSmokeApi {
  private previewCount = 0
  private readonly sessions = new Map<
    string,
    ReturnType<typeof createSession>
  >()

  async handle(route: Route) {
    const request = route.request()
    const url = new URL(request.url())

    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      await route.continue()
      return
    }

    if (url.port !== "3000") {
      await route.continue()
      return
    }

    const method = request.method()
    const path = url.pathname

    if (path === "/platform" && method === "GET") {
      await route.fulfill(
        jsonResponse({
          capabilities: ["generator-preview"],
          manifest: {
            displayName: "Elysian",
            name: "elysian",
            runtime: "browser-smoke",
            status: "ok",
            version: "browser-smoke",
          },
        }),
      )
      return
    }

    if (path === "/system/modules" && method === "GET") {
      await route.fulfill(
        jsonResponse({
          env: "browser-smoke",
          modules: ["auth"],
        }),
      )
      return
    }

    if (path === "/auth/refresh" && method === "POST") {
      await route.fulfill(jsonResponse(createAuthPayload()))
      return
    }

    if (path === "/auth/sessions" && method === "GET") {
      await route.fulfill(jsonResponse({ items: [] }))
      return
    }

    if (path === "/studio/generator/sessions" && method === "GET") {
      await route.fulfill(
        jsonResponse({
          items: Array.from(this.sessions.values()).reverse(),
        }),
      )
      return
    }

    if (path === "/studio/generator/sessions/preview" && method === "POST") {
      this.previewCount += 1
      const sessionId =
        this.previewCount === 1
          ? "browser-smoke-happy"
          : "browser-smoke-blocked"
      const session = createSession({
        id: sessionId,
        schemaName: sessionId,
        status: "pending_review",
      })

      this.sessions.set(sessionId, session)
      await route.fulfill(
        jsonResponse({
          diff: createDiffSummary(),
          report: createReport({ schemaName: sessionId }),
          session,
          sqlProposal: createSqlProposal(),
          sqlProposalHandoff: createSqlProposalHandoff(),
        }),
      )
      return
    }

    const sessionActionMatch = path.match(
      /^\/studio\/generator\/sessions\/([^/]+)\/(review|confirm|apply)$/,
    )

    if (sessionActionMatch) {
      const [, sessionId, action] = sessionActionMatch
      await this.handleSessionAction(route, sessionId, action, method)
      return
    }

    const sessionDetailMatch = path.match(
      /^\/studio\/generator\/sessions\/([^/]+)$/,
    )

    if (sessionDetailMatch && method === "GET") {
      const [, sessionId] = sessionDetailMatch
      const session = this.sessions.get(sessionId)

      if (!session) {
        await route.fulfill(
          jsonResponse(
            {
              code: 404,
              message: "Generator preview session not found",
              status: 404,
            },
            404,
          ),
        )
        return
      }

      await route.fulfill(jsonResponse(createSessionDetail(session)))
      return
    }

    if (method === "GET") {
      await route.fulfill(jsonResponse(createEmptyPage()))
      return
    }

    await route.fulfill(jsonResponse({}, 204))
  }

  private async handleSessionAction(
    route: Route,
    sessionId: string,
    action: string,
    method: string,
  ) {
    if (method !== "POST") {
      await route.fulfill(jsonResponse({}, 405))
      return
    }

    if (action === "review") {
      const reviewed = createSession({
        ...this.sessions.get(sessionId),
        id: sessionId,
        reviewEvidence: {
          actorDisplayName: browserSmokeActorDisplayName,
          actorUserId: "browser-smoke-user",
          actorUsername: browserSmokeActorUsername,
          comment: null,
          decision: "approve",
          reportPath: `generated/reports/${sessionId}.preview.json`,
          reviewedAt: "2026-05-16T08:10:00.000Z",
          sessionId,
        },
        reviewedAt: "2026-05-16T08:10:00.000Z",
        reviewedByDisplayName: browserSmokeActorDisplayName,
        reviewedByUserId: "browser-smoke-user",
        reviewedByUsername: browserSmokeActorUsername,
        status: "ready",
      })

      this.sessions.set(sessionId, reviewed)
      await route.fulfill(
        jsonResponse({
          diff: createDiffSummary(),
          session: reviewed,
          sqlProposal: createSqlProposal(),
          sqlProposalHandoff: createSqlProposalHandoff(),
        }),
      )
      return
    }

    if (action === "confirm") {
      const confirmed = createSession({
        ...this.sessions.get(sessionId),
        confirmationEvidence: {
          actorDisplayName: browserSmokeActorDisplayName,
          actorUserId: "browser-smoke-user",
          actorUsername: browserSmokeActorUsername,
          archivedSnapshotPath: null,
          checklist: [
            "Review file actions.",
            "Review SQL proposal.",
            "Confirm staging target.",
          ],
          confirmedAt: "2026-05-16T08:20:00.000Z",
          recoveryStatus: "none",
          reportPath: `generated/reports/${sessionId}.preview.json`,
          sessionId,
          snapshotPath: `/tmp/${sessionId}.migration-proposal.json`,
        },
        confirmedAt: "2026-05-16T08:20:00.000Z",
        confirmedByDisplayName: browserSmokeActorDisplayName,
        confirmedByUserId: "browser-smoke-user",
        confirmedByUsername: browserSmokeActorUsername,
        id: sessionId,
        status: "ready",
      })

      this.sessions.set(sessionId, confirmed)
      await route.fulfill(
        jsonResponse({
          session: confirmed,
          sqlProposalHandoff: createSqlProposalHandoff(),
        }),
      )
      return
    }

    if (action === "apply" && sessionId === "browser-smoke-blocked") {
      const blocked = createSession({
        ...this.sessions.get(sessionId),
        blockerReasons: [
          {
            code: "blocking-conflicts",
            message: "Blocking files still need manual review before apply.",
            stage: "apply",
          },
        ],
        confirmedAt: "2026-05-16T08:20:00.000Z",
        hasBlockingConflicts: true,
        id: sessionId,
        status: "ready",
      })

      this.sessions.set(sessionId, blocked)
      await route.fulfill(
        jsonResponse(
          {
            error: {
              code: "GENERATOR_SESSION_BLOCKING_CONFLICTS",
              details: {
                blockerReasons: blocked.blockerReasons,
              },
              message: "Generator session still has blocking conflicts",
              status: 409,
            },
          },
          409,
        ),
      )
      return
    }

    if (action === "apply") {
      const applyEvidence = createApplyEvidence(sessionId)
      const applied = createSession({
        ...this.sessions.get(sessionId),
        appliedAt: applyEvidence.appliedAt,
        appliedByDisplayName: browserSmokeActorDisplayName,
        appliedByUserId: "browser-smoke-user",
        appliedByUsername: browserSmokeActorUsername,
        appliedFileCount: 1,
        applyEvidence,
        applyManifestPath: applyEvidence.manifestPath,
        applyRequestId: applyEvidence.requestId,
        id: sessionId,
        status: "applied",
      })

      this.sessions.set(sessionId, applied)
      await route.fulfill(
        jsonResponse({
          apply: {
            evidence: applyEvidence,
            files: [
              {
                absolutePath: "E:/Github/Elysian/generated/browser-smoke.ts",
                mergeStrategy: "create",
                path: "generated/browser-smoke.ts",
                reason: "new file",
                written: true,
              },
            ],
            manifestPath: applyEvidence.manifestPath,
          },
          diff: createDiffSummary(),
          session: applied,
          sqlProposal: createSqlProposal(),
          sqlProposalHandoff: createSqlProposalHandoff(),
        }),
      )
    }
  }
}

const waitForServer = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(appUrl)

      if (response.ok) {
        return
      }
    } catch {
      // Vite is still warming up.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for Vue dev server at ${appUrl}`)
}

const startVueDevServer = (): ChildProcessWithoutNullStreams => {
  const child = spawn(
    "bun",
    [
      "--filter",
      "@elysian/example-vue",
      "dev",
      "--host",
      "127.0.0.1",
      "--port",
      String(appPort),
    ],
    {
      env: {
        ...process.env,
        VITE_API_BASE_URL: "http://127.0.0.1:3000",
      },
      shell: process.platform === "win32",
    },
  )

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[vue-dev] ${chunk}`)
  })
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[vue-dev] ${chunk}`)
  })

  return child
}

const stopVueDevServer = (child: ChildProcessWithoutNullStreams) => {
  if (!child.pid) {
    child.kill()
    return
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    })
    return
  }

  child.kill()
}

const gotoGeneratorWorkspace = async (page: Page) => {
  await page.goto(`${appUrl}/#/studio/generator-preview`, {
    waitUntil: "networkidle",
  })
  await page.getByText("新建生成").first().waitFor()
  await page.getByText("最近结果").first().waitFor()
  await page.getByText("生成结果").first().waitFor()
}

const launchBrowser = async () => {
  const fallbackChannel = process.env.ELYSIAN_BROWSER_SMOKE_CHANNEL ?? "chrome"

  try {
    return await chromium.launch({ headless: true, timeout: 20_000 })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Executable doesn't exist")
    ) {
      return chromium.launch({
        channel: fallbackChannel,
        headless: true,
        timeout: 20_000,
      })
    }

    throw error
  }
}

const fillDraft = async (page: Page, moduleName: string) => {
  await page.getByText("从空白模板开始").first().waitFor()
  await page.getByText("复制现有模块结构").first().waitFor()
  await page.getByText("Schema JSON").first().waitFor()

  await page.getByPlaceholder("例如 supplier").fill(moduleName)
  await page.getByPlaceholder("例如 供应商").fill("浏览器烟测")
}

const runFullBrowserPath = async (page: Page, moduleName: string) => {
  await fillDraft(page, moduleName)
  await page.getByRole("button", { exact: true, name: "生成预览" }).click()
  await page.getByText("结果已生成，可以先进入审核判断").waitFor()
  await page.getByRole("button", { name: "审核通过" }).click()
  await page.getByText("审核已通过，先完成应用前确认").waitFor()
  await page.getByRole("button", { name: "确认清单" }).click()
  await page.getByText("当前可以继续 apply 到 staging").waitFor()
  await page.getByRole("button", { name: "应用到 staging" }).click()
  await page.getByRole("button", { name: "确认应用到 staging" }).click()
}

const assertNoInternalCopyLeak = async (page: Page) => {
  const bodyText = await page.locator("body").innerText()

  assert(
    !bodyText.includes("manual-schema-json"),
    "Internal sourceType value manual-schema-json leaked into the visible page.",
  )
  assert(
    !bodyText.toLowerCase().includes("human boundary"),
    "Internal human-boundary copy leaked into the visible page.",
  )
}

const writeReport = async (report: BrowserSmokeReport) => {
  await mkdir(reportDir, { recursive: true })
  const reportPath = join(reportDir, "e2e-generator-browser-smoke-report.json")
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  return reportPath
}

const captureSuccessScreenshot = async (page: Page, fileName: string) => {
  if (!successScreenshotDir) {
    return
  }

  await mkdir(successScreenshotDir, { recursive: true })
  await page.screenshot({
    fullPage: false,
    path: join(successScreenshotDir, fileName),
  })
}

const run = async () => {
  await mkdir(reportDir, { recursive: true })

  const devServer = startVueDevServer()

  try {
    await waitForServer()

    const browser = await launchBrowser()
    const context = await browser.newContext({
      locale: "zh-CN",
      viewport: { height: 900, width: 1440 },
    })
    const api = new BrowserSmokeApi()

    await context.route("**/*", (route) => api.handle(route))

    const page = await context.newPage()
    const scenarios: BrowserScenarioResult[] = []

    const recordScenario = async (name: string, fn: () => Promise<void>) => {
      try {
        await fn()
        scenarios.push({ name, status: "passed" })
      } catch (error) {
        const screenshotPath = join(
          reportDir,
          `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`,
        )
        await page.screenshot({ fullPage: true, path: screenshotPath })
        scenarios.push({
          name,
          status: "failed",
          message: error instanceof Error ? error.message : String(error),
          screenshotPath,
        })
      }
    }

    await recordScenario(
      "route renders generator workspace sections",
      async () => {
        await gotoGeneratorWorkspace(page)
        await captureSuccessScreenshot(page, "generator-workspace.png")
      },
    )

    await recordScenario(
      "happy path reaches staging apply evidence",
      async () => {
        await runFullBrowserPath(page, "browserSmokeHappy")
        await page
          .getByText(/本次预览已完成 staging apply，应用时间：.+。/)
          .waitFor()
        await page.getByText("应用时间").first().waitFor()
        await assertNoInternalCopyLeak(page)
        await captureSuccessScreenshot(page, "generator-staging-apply.png")
      },
    )

    await recordScenario(
      "blocked apply keeps blocker evidence visible",
      async () => {
        await page.evaluate(() => localStorage.clear())
        await page.reload({ waitUntil: "networkidle" })
        await gotoGeneratorWorkspace(page)
        await runFullBrowserPath(page, "browserSmokeBlocked")
        await page
          .getByText("仍有阻塞文件未处理，当前不能继续 apply。")
          .first()
          .waitFor()
        await page.getByText("当前结果的下一步建议").first().waitFor()
        await assertNoInternalCopyLeak(page)
        await captureSuccessScreenshot(page, "generator-blocked-apply.png")
      },
    )

    await browser.close()
    return scenarios
  } finally {
    stopVueDevServer(devServer)
  }
}

const startedTimestamp = Date.now()
const startedAt = new Date(startedTimestamp).toISOString()

run()
  .then(async (scenarios) => {
    const failedCount = scenarios.filter(
      (scenario) => scenario.status === "failed",
    ).length
    const passedCount = scenarios.length - failedCount
    const reportPath = await writeReport({
      appUrl,
      durationMs: Date.now() - startedTimestamp,
      failedCount,
      finishedAt: new Date().toISOString(),
      gitSha: resolveGeneratorReportGitSha(),
      passedCount,
      runtime: createGeneratorReportRuntimeMetadata(),
      scenarios,
      startedAt,
      status: failedCount === 0 ? "passed" : "failed",
    })

    console.log(`[e2e-generator-browser-smoke] report: ${reportPath}`)

    if (failedCount > 0) {
      for (const scenario of scenarios) {
        if (scenario.status === "failed") {
          console.error(
            `[browser-smoke] fail ${scenario.name}: ${scenario.message}`,
          )
        }
      }
      process.exitCode = 1
      return
    }

    console.log("[e2e-generator-browser-smoke] passed")
  })
  .catch(async (error) => {
    const message = error instanceof Error ? error.message : String(error)
    const reportPath = await writeReport({
      appUrl,
      durationMs: Date.now() - startedTimestamp,
      errorMessage: message,
      failedCount: 1,
      finishedAt: new Date().toISOString(),
      gitSha: resolveGeneratorReportGitSha(),
      passedCount: 0,
      runtime: createGeneratorReportRuntimeMetadata(),
      scenarios: [],
      startedAt,
      status: "failed",
    })

    console.error(`[e2e-generator-browser-smoke] report: ${reportPath}`)
    console.error(`[e2e-generator-browser-smoke] failed: ${message}`)
    process.exitCode = 1
  })
