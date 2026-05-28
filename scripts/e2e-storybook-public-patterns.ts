import {
  type ChildProcessWithoutNullStreams,
  spawn,
  spawnSync,
} from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { type Browser, type Page, chromium } from "playwright"

import {
  createGeneratorReportRuntimeMetadata,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"
import {
  type StorybookConsoleIssue,
  assertNoStorybookConsoleIssues,
  countStorybookConsoleIssues,
  createStorybookConsoleWatcher,
} from "./_shared/storybook-console-watch"

type ScenarioStatus = "failed" | "passed"

interface ScenarioResult {
  consoleIssues?: StorybookConsoleIssue[]
  name: string
  status: ScenarioStatus
  message?: string
  screenshotPath?: string
}

interface StorybookPatternSmokeReport {
  storyUrl: string
  gitSha: string
  runtime: ReturnType<typeof createGeneratorReportRuntimeMetadata>
  startedAt: string
  finishedAt: string
  durationMs: number
  status: "failed" | "passed"
  passedCount: number
  failedCount: number
  consoleIssueCount: number
  scenarios: ScenarioResult[]
  errorMessage?: string
}

const reportDir =
  process.env.ELYSIAN_STORYBOOK_PATTERN_REPORT_DIR ??
  process.env.ELYSIAN_REPORT_DIR ??
  ".ci-reports/storybook-public-patterns"
const storybookPort = Number.parseInt(
  process.env.ELYSIAN_STORYBOOK_PUBLIC_PORT ?? "6006",
  10,
)
const storybookBaseUrl = `http://127.0.0.1:${storybookPort}/iframe.html`
const themeAtelierStoryId = "public-luxe-patterns-theme-atelier--showcase"
const creatorCenterStoryId = "public-luxe-patterns-creator-center--showcase"
const patternIndexStoryId = "public-luxe-patterns-index--coverage"
const patternEvidenceAtlasStoryId =
  "public-luxe-patterns-evidence-atlas--coverage"
const patternReadinessBoardStoryId =
  "public-luxe-patterns-readiness-board--coverage"
const patternFailureGalleryStoryId =
  "public-luxe-patterns-pattern-failure-gallery--overview"
const storyUrl = `${storybookBaseUrl}?id=${themeAtelierStoryId}`

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const waitForServer = async () => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(storyUrl)

      if (response.ok) {
        return
      }
    } catch {
      // Storybook is still compiling.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Timed out waiting for Storybook at ${storyUrl}`)
}

const startStorybookServer = (): ChildProcessWithoutNullStreams => {
  const child = spawn(
    "bun",
    [
      "--filter",
      "@elysian/storybook-vue",
      "dev",
      "--",
      "-p",
      String(storybookPort),
      "--host",
      "127.0.0.1",
      "--exact-port",
      "--ci",
      "--no-open",
    ],
    {
      env: {
        ...process.env,
        CI: "1",
      },
      shell: process.platform === "win32",
    },
  )

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[storybook-pattern] ${chunk}`)
  })
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[storybook-pattern] ${chunk}`)
  })

  return child
}

const stopStorybookServer = (child: ChildProcessWithoutNullStreams) => {
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

const launchBrowser = async (): Promise<Browser> => {
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

const gotoStory = async (
  page: Page,
  storyId: string,
  readyText: string | RegExp,
) => {
  await page.goto(`${storybookBaseUrl}?id=${storyId}`, {
    waitUntil: "networkidle",
  })
  await page.getByText(readyText).waitFor()
}

const expectBadgeText = async (page: Page, text: RegExp) => {
  await page.getByText(text).first().waitFor()
}

const expectCheckedState = async (
  page: Page,
  role: "checkbox" | "switch",
  label: RegExp,
  expectedState: "false" | "true",
) => {
  const control = page.getByRole(role, { name: label })

  await control.waitFor()
  const state = await control.getAttribute("aria-checked")
  assert(
    state === expectedState,
    `Expected ${role} ${label} to have aria-checked=${expectedState}, received ${state}.`,
  )
}

const verifyThemeSelection = async (page: Page) => {
  const select = page.getByLabel("Theme family")

  await select.waitFor()
  await select.selectOption("rose-nocturne")
  await expectBadgeText(page, /^rose-nocturne$/i)
}

const verifyDensitySelection = async (page: Page) => {
  const balancedRadio = page.getByRole("radio", { name: /Balanced/i })

  await balancedRadio.waitFor()
  await balancedRadio.focus()
  await page.keyboard.press("ArrowRight")
  await expectBadgeText(page, /^compact$/i)
}

const verifySyncToggles = async (page: Page) => {
  const editorialCheckbox = page.getByRole("checkbox", {
    name: /Sync editorial moments/i,
  })
  const rewardCheckbox = page.getByRole("checkbox", {
    name: /Sync reward surfaces/i,
  })
  const reducedGlowSwitch = page.getByRole("switch", {
    name: /Reduced glow preview/i,
  })

  await editorialCheckbox.waitFor()
  await rewardCheckbox.waitFor()
  await reducedGlowSwitch.waitFor()

  await expectBadgeText(page, /editorial sync on/i)
  await expectBadgeText(page, /reward sync off/i)
  await expectBadgeText(page, /full glow/i)

  await editorialCheckbox.click()
  await rewardCheckbox.click()
  await reducedGlowSwitch.click()

  await expectBadgeText(page, /editorial sync off/i)
  await expectBadgeText(page, /reward sync on/i)
  await expectBadgeText(page, /reduced glow/i)
}

const expectSelectedTab = async (page: Page, label: RegExp) => {
  const tab = page.getByRole("tab", { name: label })

  await tab.waitFor()
  const state = await tab.getAttribute("aria-selected")
  assert(state === "true", `Expected tab ${label} to be selected.`)
}

const verifyCreatorCenterTabPath = async (page: Page) => {
  const momentsTab = page.getByRole("tab", { name: /Moments/i })

  await momentsTab.waitFor()
  await momentsTab.focus()
  await page.keyboard.press("ArrowRight")
  await expectSelectedTab(page, /Rewards/i)
  await page.keyboard.press("End")
  await expectSelectedTab(page, /Preferences/i)
  await page.keyboard.press("Home")
  await expectSelectedTab(page, /Moments/i)
}

const verifyCreatorCenterSwitches = async (page: Page) => {
  const notificationsSwitch = page.getByRole("switch", {
    name: /Reward pulse notifications/i,
  })
  const reducedGlowSwitch = page.getByRole("switch", {
    name: /Reduced glow mode/i,
  })

  await notificationsSwitch.waitFor()
  await reducedGlowSwitch.waitFor()

  await expectCheckedState(
    page,
    "switch",
    /Reward pulse notifications/i,
    "true",
  )
  await expectCheckedState(page, "switch", /Reduced glow mode/i, "false")

  await notificationsSwitch.click()
  await reducedGlowSwitch.click()

  await expectCheckedState(
    page,
    "switch",
    /Reward pulse notifications/i,
    "false",
  )
  await expectCheckedState(page, "switch", /Reduced glow mode/i, "true")
}

const verifyCollectorNameEditing = async (page: Page) => {
  const collectorNameInput = page.getByLabel("Collector name")

  await collectorNameInput.waitFor()
  await collectorNameInput.fill("Lyra")

  const value = await collectorNameInput.inputValue()
  assert(
    value === "Lyra",
    `Expected collector name to persist edited value, received ${value}.`,
  )
}

const verifyPatternIndexCoverage = async (page: Page) => {
  await page.getByText("Pattern stories need approval evidence").waitFor()
  await page
    .getByRole("heading", {
      name: "Choose the page grammar before composing the page",
    })
    .waitFor()
  await page.getByText("Creator Center vs Theme Atelier").waitFor()
  await page.getByText("Member Rewards vs Event Landing").waitFor()
  await page.getByText("Editorial Collection vs Forms & Feedback").waitFor()
  await page.getByText("Pattern page vs Foundation rule").waitFor()
  await page.getByText("Review map", { exact: true }).waitFor()
  await page.getByText("Approval questions", { exact: true }).waitFor()
  await page
    .getByRole("heading", {
      name: "A pattern is approved by the order of decisions",
    })
    .waitFor()
  await page.getByRole("link", { name: /Creator Center/ }).waitFor()
  await page.getByRole("link", { name: /Member Rewards/ }).waitFor()
  await page.getByRole("link", { name: /Editorial Collection/ }).waitFor()
  await page.getByRole("link", { name: /Event Landing/ }).waitFor()
  await page.getByRole("link", { name: /Forms & Feedback/ }).waitFor()
  await page.getByRole("link", { name: /Theme Atelier/ }).waitFor()
  await page
    .getByRole("link", { name: /Review pattern failure gallery/ })
    .waitFor()
  await page.getByRole("link", { name: /Review pattern composition/ }).waitFor()
  await page.getByRole("link", { name: /Review component evidence/ }).waitFor()

  const rowCount = await page.locator(".ely-story-pattern-index-row").count()
  const choiceCount = await page
    .locator(".ely-story-pattern-index-choice")
    .count()
  const gateCount = await page.locator(".ely-story-pattern-index-gate").count()
  const questionCount = await page
    .locator(".ely-story-pattern-index-question")
    .count()
  const firstRowRadius = await page
    .locator(".ely-story-pattern-index-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(rowCount === 6, "Expected the pattern index to link six pattern rows.")
  assert(choiceCount === 4, "Expected four pattern choice matrix rows.")
  assert(gateCount === 5, "Expected five pattern assembly gates.")
  assert(
    questionCount === 4,
    "Expected the pattern index to expose four approval questions.",
  )
  assert(
    firstRowRadius <= 14,
    "Expected pattern index rows to stay within the public-luxe radius scale.",
  )
}

const verifyPatternReadinessBoard = async (page: Page) => {
  await page
    .getByText("Page samples become useful when their risks are visible")
    .waitFor()
  await page
    .getByRole("heading", { name: "Approve patterns by evidence density" })
    .waitFor()
  await page.getByText("Theme proof", { exact: true }).waitFor()
  await page.getByText("Component proof", { exact: true }).waitFor()
  await page.getByText("Mobile order", { exact: true }).waitFor()
  await page.getByText("Recovery path", { exact: true }).waitFor()
  await page
    .getByRole("heading", {
      name: "Before a pattern graduates from gallery to system",
    })
    .waitFor()
  await page.getByRole("link", { name: /Creator Center/ }).waitFor()
  await page.getByRole("link", { name: /Member Rewards/ }).waitFor()
  await page.getByRole("link", { name: /Editorial Collection/ }).waitFor()
  await page.getByRole("link", { name: /Event Landing/ }).waitFor()
  await page.getByRole("link", { name: /Forms & Feedback/ }).waitFor()
  await page.getByRole("link", { name: /Theme Atelier/ }).waitFor()
  await page.getByRole("link", { name: /Return to pattern index/ }).waitFor()
  await page.getByRole("link", { name: /Review release gates/ }).waitFor()
  await page.getByRole("link", { name: /Review component evidence/ }).waitFor()

  const rowCount = await page
    .locator(".ely-story-pattern-readiness-row")
    .count()
  const gateCount = await page
    .locator(".ely-story-pattern-readiness-gate")
    .count()
  const checkCount = await page
    .locator(".ely-story-pattern-readiness-check")
    .count()
  const linkCount = await page
    .locator(".ely-story-pattern-readiness-links a")
    .count()
  const firstRowRadius = await page
    .locator(".ely-story-pattern-readiness-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(rowCount === 6, "Expected six pattern readiness rows.")
  assert(gateCount === 4, "Expected four pattern readiness gates.")
  assert(checkCount === 5, "Expected five pattern handoff checks.")
  assert(linkCount === 3, "Expected three pattern readiness review links.")
  assert(
    firstRowRadius <= 14,
    "Expected pattern readiness rows to stay within the public-luxe radius scale.",
  )
}

const verifyPatternEvidenceAtlas = async (page: Page) => {
  await page
    .getByText("Page patterns should prove one user job, one route to recovery")
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Move from page grammar to readiness without skipping proof",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Review patterns by the thing most likely to break",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Each pattern needs action, proof, recovery, and a blocker",
    })
    .waitFor()
  await page.getByText("Primary action", { exact: true }).waitFor()
  await page.getByText("Recovery", { exact: true }).waitFor()
  await page.getByText("Theme proof", { exact: true }).waitFor()
  await page.getByText("Mobile order", { exact: true }).waitFor()
  await page.getByRole("link", { name: /Pattern Index/ }).waitFor()
  await page.getByRole("link", { name: /Pattern Readiness Board/ }).waitFor()
  await page.getByRole("link", { name: /Pattern Failure Gallery/ }).waitFor()
  const atlasRows = page.locator(".ely-story-pattern-atlas-row")
  await atlasRows.filter({ hasText: "Creator Center" }).waitFor()
  await atlasRows.filter({ hasText: "Member Rewards" }).waitFor()
  await atlasRows.filter({ hasText: "Editorial Collection" }).waitFor()
  await atlasRows.filter({ hasText: "Event Landing" }).waitFor()
  await atlasRows.filter({ hasText: "Forms & Feedback" }).waitFor()
  await atlasRows.filter({ hasText: "Theme Atelier" }).waitFor()

  const rowCount = await atlasRows.count()
  const focusCount = await page
    .locator(".ely-story-pattern-atlas-focus-card")
    .count()
  const familyCount = await page
    .locator(".ely-story-pattern-atlas-family")
    .count()
  const routeCount = await page
    .locator(".ely-story-pattern-atlas-route-step")
    .count()
  const firstRowRadius = await page
    .locator(".ely-story-pattern-atlas-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(rowCount === 6, "Expected six pattern evidence atlas rows.")
  assert(focusCount === 4, "Expected four pattern evidence focus lanes.")
  assert(familyCount === 6, "Expected six pattern evidence family lanes.")
  assert(routeCount === 4, "Expected four pattern evidence route steps.")
  assert(
    firstRowRadius <= 14,
    "Expected pattern evidence rows to stay within the public-luxe radius scale.",
  )
}

const verifyPatternFailureGallery = async (page: Page) => {
  await page
    .getByText("Rejected patterns should make the next good pattern easier")
    .waitFor()
  const failureTitles = page.locator(".ely-story-pattern-failure-head h2")
  await failureTitles.filter({ hasText: "Competing primary actions" }).waitFor()
  await failureTitles.filter({ hasText: "Recovery path removed" }).waitFor()
  await failureTitles.filter({ hasText: "Form repair copy missing" }).waitFor()
  await failureTitles.filter({ hasText: "Ornament becomes layout" }).waitFor()
  await failureTitles
    .filter({ hasText: "Theme roles drift per section" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Do not fix pattern drift with more decoration",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "A beautiful page still fails if users cannot recover",
    })
    .waitFor()
  await page.getByRole("link", { name: /Return to pattern evidence/ }).waitFor()

  const caseCount = await page
    .locator(".ely-story-pattern-failure-card")
    .count()
  const stepCount = await page
    .locator(".ely-story-pattern-failure-step")
    .count()
  const checkCount = await page
    .locator(".ely-story-pattern-failure-check")
    .count()
  const specimenCount = await page
    .locator(".ely-story-pattern-failure-specimen")
    .count()
  const firstCardRadius = await page
    .locator(".ely-story-pattern-failure-card")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(caseCount === 5, "Expected five rejected pattern cases.")
  assert(stepCount === 5, "Expected five pattern failure review steps.")
  assert(checkCount === 4, "Expected four pattern repair checklist items.")
  assert(
    specimenCount === 5,
    "Expected every rejected case to show a specimen.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected pattern failure cards to stay within the public-luxe radius scale.",
  )
}

const writeReport = async (report: StorybookPatternSmokeReport) => {
  await mkdir(reportDir, { recursive: true })
  const reportPath = join(
    reportDir,
    "e2e-storybook-public-patterns-report.json",
  )
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
  return reportPath
}

const startedTimestamp = Date.now()
const startedAt = new Date(startedTimestamp).toISOString()

const run = async () => {
  const storybookServer = startStorybookServer()

  try {
    await waitForServer()

    const browser = await launchBrowser()
    const context = await browser.newContext({
      locale: "en-US",
      viewport: { height: 960, width: 1440 },
    })
    const page = await context.newPage()
    const consoleWatcher = createStorybookConsoleWatcher(page)
    const scenarios: ScenarioResult[] = []

    const recordScenario = async (
      name: string,
      storyId: string,
      readyText: string | RegExp,
      fn: () => Promise<void>,
    ) => {
      try {
        consoleWatcher.clear()
        await gotoStory(page, storyId, readyText)
        await fn()
        assertNoStorybookConsoleIssues(consoleWatcher.read())
        scenarios.push({ name, status: "passed" })
      } catch (error) {
        const consoleIssues = consoleWatcher.read()
        const screenshotPath = join(
          reportDir,
          `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`,
        )
        await mkdir(reportDir, { recursive: true })
        await page.screenshot({ fullPage: true, path: screenshotPath })
        scenarios.push({
          consoleIssues: consoleIssues.length > 0 ? consoleIssues : undefined,
          name,
          status: "failed",
          message: error instanceof Error ? error.message : String(error),
          screenshotPath,
        })
      }
    }

    await recordScenario(
      "pattern index exposes action proof and recovery review coverage",
      patternIndexStoryId,
      "Pattern stories need approval evidence",
      async () => {
        await verifyPatternIndexCoverage(page)
      },
    )

    await recordScenario(
      "pattern readiness board exposes handoff evidence and blockers",
      patternReadinessBoardStoryId,
      "Page samples become useful when their risks are visible",
      async () => {
        await verifyPatternReadinessBoard(page)
      },
    )

    await recordScenario(
      "pattern evidence atlas exposes user jobs and risk routes",
      patternEvidenceAtlasStoryId,
      "Page patterns should prove one user job",
      async () => {
        await verifyPatternEvidenceAtlas(page)
      },
    )

    await recordScenario(
      "pattern failure gallery exposes rejected composition cases",
      patternFailureGalleryStoryId,
      "Rejected patterns should make the next good pattern easier",
      async () => {
        await verifyPatternFailureGallery(page)
      },
    )

    await recordScenario(
      "theme select updates the live family badge",
      themeAtelierStoryId,
      "curated preference studio",
      async () => {
        await verifyThemeSelection(page)
      },
    )

    await recordScenario(
      "density radio path updates the rhythm summary",
      themeAtelierStoryId,
      "curated preference studio",
      async () => {
        await verifyDensitySelection(page)
      },
    )

    await recordScenario(
      "checkboxes and switch update sync and glow summaries",
      themeAtelierStoryId,
      "curated preference studio",
      async () => {
        await verifySyncToggles(page)
      },
    )

    await recordScenario(
      "creator center tabs remain keyboard navigable across lanes",
      creatorCenterStoryId,
      "ornament under control",
      async () => {
        await verifyCreatorCenterTabPath(page)
      },
    )

    await recordScenario(
      "creator center switches preserve governed aria checked states",
      creatorCenterStoryId,
      "ornament under control",
      async () => {
        await verifyCreatorCenterSwitches(page)
      },
    )

    await recordScenario(
      "creator center profile input accepts collector edits",
      creatorCenterStoryId,
      "ornament under control",
      async () => {
        await verifyCollectorNameEditing(page)
      },
    )

    await browser.close()
    return scenarios
  } finally {
    stopStorybookServer(storybookServer)
  }
}

run()
  .then(async (scenarios) => {
    const failedCount = scenarios.filter(
      (scenario) => scenario.status === "failed",
    ).length
    const passedCount = scenarios.length - failedCount
    const reportPath = await writeReport({
      durationMs: Date.now() - startedTimestamp,
      consoleIssueCount: countStorybookConsoleIssues(scenarios),
      failedCount,
      finishedAt: new Date().toISOString(),
      gitSha: resolveGeneratorReportGitSha(),
      passedCount,
      runtime: createGeneratorReportRuntimeMetadata(),
      scenarios,
      startedAt,
      status: failedCount === 0 ? "passed" : "failed",
      storyUrl,
    })

    console.log(`[e2e-storybook-public-patterns] report: ${reportPath}`)

    if (failedCount > 0) {
      for (const scenario of scenarios) {
        if (scenario.status === "failed") {
          console.error(
            `[storybook-pattern] fail ${scenario.name}: ${scenario.message}`,
          )
        }
      }

      process.exitCode = 1
      return
    }

    console.log("[e2e-storybook-public-patterns] passed")
  })
  .catch(async (error) => {
    const message = error instanceof Error ? error.message : String(error)
    const reportPath = await writeReport({
      durationMs: Date.now() - startedTimestamp,
      consoleIssueCount: 0,
      errorMessage: message,
      failedCount: 1,
      finishedAt: new Date().toISOString(),
      gitSha: resolveGeneratorReportGitSha(),
      passedCount: 0,
      runtime: createGeneratorReportRuntimeMetadata(),
      scenarios: [],
      startedAt,
      status: "failed",
      storyUrl,
    })

    console.error(`[e2e-storybook-public-patterns] report: ${reportPath}`)
    console.error(`[e2e-storybook-public-patterns] failed: ${message}`)
    process.exitCode = 1
  })
