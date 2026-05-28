import {
  type ChildProcessWithoutNullStreams,
  spawn,
  spawnSync,
} from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { type Browser, type Page, chromium } from "playwright"

import { publicComponentScenarioCount } from "../apps/storybook-vue/src/component-story-coverage"
import { publicThemePacks } from "../packages/ui-public-vue/src/themes"
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

interface StorybookSmokeReport {
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
  process.env.ELYSIAN_STORYBOOK_PUBLIC_REPORT_DIR ??
  process.env.ELYSIAN_REPORT_DIR ??
  ".ci-reports/storybook-public-components"
const storybookPort = Number.parseInt(
  process.env.ELYSIAN_STORYBOOK_PUBLIC_PORT ?? "6006",
  10,
)
const storybookBaseUrl = `http://127.0.0.1:${storybookPort}/iframe.html`
const componentGalleryStoryId =
  "public-luxe-showcase-component-gallery--gallery"
const componentIndexStoryId = "public-luxe-components-index--coverage"
const componentThemeSpecimenWallStoryId =
  "public-luxe-components-theme-specimen-wall--overview"
const componentDecisionWorkshopStoryId =
  "public-luxe-components-decision-workshop--overview"
const componentMobileDensityReviewStoryId =
  "public-luxe-components-mobile-density-review--overview"
const componentInteractionLabStoryId =
  "public-luxe-components-theme-specimen-wall--interaction-lab"
const componentAcceptanceBoardStoryId =
  "public-luxe-components-acceptance-board--coverage"
const componentHandoffDossierStoryId =
  "public-luxe-components-handoff-dossier--coverage"
const componentApiReferenceStoryId =
  "public-luxe-components-api-reference--coverage"
const componentVariantMatrixStoryId =
  "public-luxe-components-variant-matrix--coverage"
const componentStateMatrixStoryId =
  "public-luxe-components-state-matrix--coverage"
const componentScenarioAtlasStoryId =
  "public-luxe-components-scenario-atlas--coverage"
const componentOperabilityBoardStoryId =
  "public-luxe-components-operability-board--coverage"
const componentFailureGalleryStoryId =
  "public-luxe-components-component-failure-gallery--overview"
const componentUsageMatrixStoryId =
  "public-luxe-foundations-component-usage-matrix--overview"
const componentCompositionMatrixStoryId =
  "public-luxe-foundations-component-composition-matrix--overview"
const linkNavigationStoryId =
  "public-luxe-components-link--navigation-scenarios"
const linkRouteBoundaryStoryId =
  "public-luxe-components-link--route-boundary-scenarios"
const cardSurfaceHierarchyStoryId =
  "public-luxe-components-card--surface-hierarchy-scenarios"
const badgeSemanticBoundaryStoryId =
  "public-luxe-components-badge--semantic-boundary-scenarios"
const avatarIdentityBoundaryStoryId =
  "public-luxe-components-avatar--identity-boundary-scenarios"
const imageAspectRatiosStoryId = "public-luxe-components-image--aspect-ratios"
const imageMediaBoundaryStoryId =
  "public-luxe-components-image--media-boundary-scenarios"
const textReadingBoundaryStoryId =
  "public-luxe-components-text--reading-boundary-scenarios"
const statSummaryBoundaryStoryId =
  "public-luxe-components-stat--summary-boundary-scenarios"
const dividerRhythmBoundaryStoryId =
  "public-luxe-components-divider--rhythm-boundary-scenarios"
const radioKeyboardStoryId =
  "public-luxe-components-radio-group--keyboard-scenarios"
const radioDecisionBoundaryStoryId =
  "public-luxe-components-radio-group--decision-boundary-scenarios"
const skeletonLoadingStoryId =
  "public-luxe-components-skeleton--loading-scenarios"
const skeletonTransitionStoryId =
  "public-luxe-components-skeleton--transition-scenarios"
const buttonAnatomyStoryId = "public-luxe-components-button--anatomy"
const buttonCriticalPathStoryId =
  "public-luxe-components-button--critical-path-scenarios"
const imageAnatomyStoryId = "public-luxe-components-image--anatomy"
const inputStatesStoryId = "public-luxe-components-input--states"
const inputRepairFlowStoryId =
  "public-luxe-components-input--repair-flow-scenarios"
const selectStatesStoryId = "public-luxe-components-select--states"
const selectDecisionFlowStoryId =
  "public-luxe-components-select--decision-flow-scenarios"
const switchStatesStoryId = "public-luxe-components-switch--states"
const switchRuntimeBoundaryStoryId =
  "public-luxe-components-switch--runtime-boundary-scenarios"
const checkboxStatesStoryId = "public-luxe-components-checkbox--states"
const checkboxConsentChecklistStoryId =
  "public-luxe-components-checkbox--consent-checklist-scenarios"
const dialogConfirmationFlowStoryId =
  "public-luxe-components-dialog--confirmation-flow-scenarios"
const tabsSectionBoundaryStoryId =
  "public-luxe-components-tabs--section-boundary-scenarios"
const progressBoundedReadinessStoryId =
  "public-luxe-components-progress--bounded-readiness-scenarios"
const progressMilestoneGateStoryId =
  "public-luxe-components-progress--milestone-gate-scenarios"
const emptyStateRecoveryPathStoryId =
  "public-luxe-components-empty-state--recovery-path-scenarios"
const emptyStateAbsenceBoundaryStoryId =
  "public-luxe-components-empty-state--absence-boundary-scenarios"
const alertRepairPriorityStoryId =
  "public-luxe-components-alert--repair-priority-scenarios"
const alertFeedbackChainStoryId =
  "public-luxe-components-alert--feedback-chain-scenarios"
const storyUrl = `${storybookBaseUrl}?id=${componentGalleryStoryId}`

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
    process.stdout.write(`[storybook-public] ${chunk}`)
  })
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[storybook-public] ${chunk}`)
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

const gotoStory = async (page: Page) => {
  await page.goto(storyUrl, { waitUntil: "networkidle" })
  await page.getByText("High-frequency public preset components").waitFor()
}

const gotoStoryId = async (
  page: Page,
  storyId: string,
  readyHeading: string | RegExp,
) => {
  await page.goto(`${storybookBaseUrl}?id=${storyId}`, {
    waitUntil: "networkidle",
  })
  await page.getByRole("heading", { name: readyHeading }).waitFor()
}

const expectSelectedState = async (
  page: Page,
  role: "radio" | "tab",
  label: RegExp,
) => {
  const target = page.getByRole(role, { name: label })
  await target.waitFor()

  const state =
    role === "tab"
      ? await target.getAttribute("aria-selected")
      : await target.getAttribute("aria-checked")

  assert(state === "true", `Expected ${role} ${label} to be selected.`)
}

const expectCheckedState = async (
  page: Page,
  role: "checkbox" | "switch",
  label: RegExp,
  expected: boolean,
) => {
  const target = page.getByRole(role, { name: label })
  await target.waitFor()

  const state = await target.getAttribute("aria-checked")
  const expectedState = expected ? "true" : "false"

  assert(
    state === expectedState,
    `Expected ${role} ${label} aria-checked to be ${expectedState}.`,
  )
}

const verifyTabsKeyboardPath = async (page: Page) => {
  const discoverTab = page.getByRole("tab", { name: /Discover/i })

  await discoverTab.waitFor()
  await discoverTab.focus()
  await page.keyboard.press("ArrowRight")
  await expectSelectedState(page, "tab", /Compose/i)
  await page.keyboard.press("End")
  await expectSelectedState(page, "tab", /Deliver/i)
  await page.keyboard.press("Home")
  await expectSelectedState(page, "tab", /Discover/i)
}

const verifyRadioKeyboardPath = async (page: Page) => {
  const balancedRadio = page.getByRole("radio", { name: /Balanced/i })

  await balancedRadio.waitFor()
  await balancedRadio.focus()
  await page.keyboard.press("ArrowRight")
  await expectSelectedState(page, "radio", /Compact/i)
  await page.keyboard.press("Home")
  await expectSelectedState(page, "radio", /Comfortable/i)
}

const verifyDialogInteraction = async (page: Page) => {
  const openDialogButton = page.getByRole("button", { name: "Open dialog" })

  await openDialogButton.waitFor()
  await openDialogButton.focus()
  await openDialogButton.click()
  await page.getByRole("dialog").waitFor()

  const closeButtonLabel = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-label"),
  )
  assert(
    closeButtonLabel === "Close dialog",
    "Dialog should move initial focus to the close button.",
  )

  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "hidden" })

  const activeButtonText = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? "",
  )
  assert(
    activeButtonText === "Open dialog",
    "Dialog should restore focus to the trigger after closing with Escape.",
  )

  await openDialogButton.click()
  await page.getByRole("dialog").waitFor()
  await page.locator(".ely-public-dialog").click({ position: { x: 8, y: 8 } })
  await page.getByRole("dialog").waitFor({ state: "hidden" })
}

const verifyComponentAnatomyGuidance = async (page: Page) => {
  await gotoStoryId(page, buttonAnatomyStoryId, "Button")
  await page.getByRole("heading", { name: "Decision guidance" }).waitFor()
  await page.getByRole("heading", { name: "Composition" }).waitFor()
  await page.getByRole("heading", { name: "Anti-patterns" }).waitFor()
  await page.getByText(/Do not use Button as a decorative badge/i).waitFor()

  await gotoStoryId(page, imageAnatomyStoryId, "Image")
  await page.getByRole("heading", { name: "Decision guidance" }).waitFor()
  await page.getByRole("heading", { name: "Composition" }).waitFor()
  await page.getByRole("heading", { name: "Anti-patterns" }).waitFor()
  await page.getByText(/Do not use raw img tags/i).waitFor()
}

const verifyComponentCoverageIndex = async (page: Page) => {
  await gotoStoryId(
    page,
    componentIndexStoryId,
    "A governed map for the public luxe component set",
  )
  await page.getByText("scenario stories").waitFor()
  await page.getByText("Review readiness gates").waitFor()
  await page
    .getByRole("heading", { name: "Design approval starts with evidence" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Start visual, then prove behavior" })
    .waitFor()
  await page
    .getByRole("link", { name: /Component Theme Specimen Wall/ })
    .waitFor()
  await page
    .getByRole("link", { name: /Component Mobile Density Review/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByText("review ready").first().waitFor()
  await page.getByText("Category readiness board").waitFor()
  await page
    .getByRole("heading", { name: "Review the system by component family" })
    .waitFor()
  await page.getByText("Scenario review focus coverage").waitFor()
  await page.getByRole("heading", { name: "Filter by review risk" }).waitFor()
  await page.getByText("Review lane snapshot").waitFor()
  await page.getByRole("heading", { name: "All review focus areas" }).waitFor()
  await page
    .getByRole("link", { name: /Review component failure gallery/ })
    .waitFor()
  const focusStrip = page.locator(".ely-story-index-focus")
  await focusStrip.getByText("Accessibility").waitFor()
  await focusStrip.getByText("Interaction").waitFor()
  const componentCards = page.locator(".ely-story-index-card")
  await componentCards
    .getByRole("link", { name: /Product usage scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Critical path scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Repair flow scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Decision flow scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Section boundary scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Bounded readiness scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Recovery path scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Repair priority scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Navigation scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Keyboard scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Loading scenarios/ })
    .waitFor()

  await focusStrip.getByRole("button", { name: /Accessibility/ }).click()
  await page.getByText(/visible for Accessibility/).waitFor()
  await page.getByRole("heading", { name: "Accessibility" }).waitFor()
  await page
    .locator(".ely-story-index-lane")
    .getByRole("link", { name: /Avatar Identity boundary scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Keyboard scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Navigation scenarios/ })
    .waitFor()

  await focusStrip.getByRole("button", { name: /All scenarios/ }).click()
  await page.getByText(/visible for all review focus areas/).waitFor()
  await page.getByRole("heading", { name: "All review focus areas" }).waitFor()
  await componentCards
    .getByRole("link", { name: /Product usage scenarios/ })
    .waitFor()
  await componentCards
    .getByRole("link", { name: /Critical path scenarios/ })
    .waitFor()

  const routeCount = await page
    .locator(".ely-story-index-review-route-grid a")
    .count()
  const firstRouteRadius = await page
    .locator(".ely-story-index-review-route-grid a")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    routeCount === 8,
    "Expected eight component review routes on the index.",
  )
  assert(
    firstRouteRadius <= 14,
    "Expected component index review routes to stay within the public-luxe radius scale.",
  )
}

const verifyComponentThemeSpecimenWall = async (page: Page) => {
  await gotoStoryId(
    page,
    componentThemeSpecimenWallStoryId,
    "Judge the component set from live surfaces, not only tables",
  )
  await page.getByText("Theme family proof").waitFor()
  await page
    .getByRole("heading", {
      name: "Choose the family, then inspect live components",
    })
    .waitFor()
  await page.getByText("Live active-theme specimen").waitFor()
  await page
    .getByRole("heading", {
      name: "One surface, many primitives, one visual grammar",
    })
    .waitFor()
  await page.getByText("Family coverage lanes").waitFor()
  await page
    .getByRole("heading", {
      name: "From specimen beauty to component evidence",
    })
    .waitFor()
  const themeCardTitles = page.locator(
    ".ely-story-theme-specimen-theme-card h3",
  )
  for (const theme of publicThemePacks) {
    await themeCardTitles
      .filter({ hasText: new RegExp(`^${theme.displayName}$`) })
      .waitFor()
  }
  await page.getByRole("button", { name: /Approve theme/ }).waitFor()
  await page
    .getByRole("textbox", { name: /Specimen title/i })
    .fill("Review wall")
  assert(
    (await page
      .getByRole("textbox", { name: /Specimen title/i })
      .inputValue()) === "Review wall",
    "Component theme specimen wall should keep its input editable.",
  )
  await page
    .getByRole("combobox", { name: /Theme family reference/i })
    .selectOption("rose-nocturne")
  await expectCheckedState(page, "switch", /Sync polish notes/i, true)
  await page.getByRole("switch", { name: /Sync polish notes/i }).click()
  await expectCheckedState(page, "switch", /Sync polish notes/i, false)
  await page
    .getByRole("checkbox", {
      name: /I reviewed the active theme in both modes/i,
    })
    .click()
  await expectCheckedState(
    page,
    "checkbox",
    /I reviewed the active theme in both modes/i,
    true,
  )
  await page.getByRole("tab", { name: /Repair/i }).click()
  await page
    .locator(".ely-story-theme-specimen-tab-panel")
    .getByText("Validation, warning, and recovery")
    .waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByRole("link", { name: /Component API Reference/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const themeCardCount = await page
    .locator(".ely-story-theme-specimen-theme-card")
    .count()
  const modeCardCount = await page
    .locator(".ely-story-theme-specimen-mode-card")
    .count()
  const familyCardCount = await page
    .locator(".ely-story-theme-specimen-family-card")
    .count()
  const routeCount = await page
    .locator(".ely-story-theme-specimen-route a")
    .count()
  const firstCardRadius = await page
    .locator(".ely-story-theme-specimen-theme-card")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(themeCardCount === 4, "Expected four launch theme specimen cards.")
  assert(
    modeCardCount === 8,
    "Expected light and dark preview for every theme.",
  )
  assert(familyCardCount === 4, "Expected four component specimen lanes.")
  assert(routeCount === 7, "Expected seven review routes from specimen wall.")
  assert(
    firstCardRadius <= 14,
    "Expected theme specimen cards to stay within the public-luxe radius scale.",
  )
}

const verifyCriticalPathScenarioStories = async (page: Page) => {
  await gotoStoryId(
    page,
    buttonCriticalPathStoryId,
    "One surface, one commitment",
  )
  await page.getByText("Blocked action").waitFor()
  await page.getByRole("button", { name: /Approve family/ }).waitFor()

  await gotoStoryId(
    page,
    inputRepairFlowStoryId,
    "Field errors stay close to the repair action",
  )
  const titleInput = page.getByRole("textbox", { name: /Release title/i })
  await titleInput.fill("Critical repair pass")
  assert(
    (await titleInput.inputValue()) === "Critical repair pass",
    "Input repair flow should keep the release title editable.",
  )
  await page.getByText("Two fields need attention").waitFor()

  await gotoStoryId(
    page,
    selectDecisionFlowStoryId,
    "Structured choices should not become navigation",
  )
  await page
    .getByRole("combobox", { name: /Launch family/i })
    .selectOption("rose-nocturne")
  await page.getByText("Option meaning is visible").waitFor()

  await gotoStoryId(
    page,
    dialogConfirmationFlowStoryId,
    "Confirmation overlays need evidence, not extra spectacle",
  )
  await page.getByRole("button", { name: /Review confirmation/ }).click()
  await page.getByRole("dialog").waitFor()
  await page.getByRole("heading", { name: "Publish public preview" }).waitFor()
  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "hidden" })
}

const verifyFeedbackNavigationScenarioStories = async (page: Page) => {
  await gotoStoryId(
    page,
    tabsSectionBoundaryStoryId,
    "Tabs switch local sections, not product routes",
  )
  await page.getByRole("tab", { name: /Repair/i }).click()
  await page
    .getByRole("tabpanel")
    .getByText("Show local fixes without route navigation.")
    .waitFor()
  await page.getByRole("link", { name: /Open scenario atlas/ }).waitFor()

  await gotoStoryId(
    page,
    progressBoundedReadinessStoryId,
    "Progress needs a real range and a decision",
  )
  await page.getByText("Readiness is not complete").waitFor()
  await page.getByRole("button", { name: /Publish locked/ }).waitFor()

  await gotoStoryId(
    page,
    progressMilestoneGateStoryId,
    "Progress should explain what unlocks next",
  )
  await page.getByText("Release gate waits for recovery proof").waitFor()
  await page.getByRole("button", { name: /Open remaining checks/ }).waitFor()

  await gotoStoryId(
    page,
    emptyStateRecoveryPathStoryId,
    "Absence needs one recovery action",
  )
  await page.getByText("No dark-mode snapshot is pinned").waitFor()
  await page.getByRole("button", { name: /Create snapshot/ }).waitFor()

  await gotoStoryId(
    page,
    emptyStateAbsenceBoundaryStoryId,
    "Empty states explain absence without pretending it is failure",
  )
  await page.getByRole("button", { name: /Create comparison/ }).waitFor()
  await page.getByText("Do not use empty state as a hero poster").waitFor()

  await gotoStoryId(
    page,
    alertRepairPriorityStoryId,
    "Feedback names what changed and what to do next",
  )
  await page.getByText("Dark mode evidence is incomplete").waitFor()
  await page.getByRole("button", { name: /Open dark review/ }).waitFor()

  await gotoStoryId(
    page,
    alertFeedbackChainStoryId,
    "Feedback should move from notice to repair to confirmation",
  )
  await page.getByText("Review scope changed").waitFor()
  await page.getByText("Preview evidence is ready").waitFor()
}

const verifyComponentInteractionLab = async (page: Page) => {
  await gotoStoryId(
    page,
    componentInteractionLabStoryId,
    "Operate the primitives before approving the polish",
  )
  await page
    .getByRole("heading", { name: "Edit the specimen contract" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Let state explain itself" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Move through local sections" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Confirm without changing worlds" })
    .waitFor()

  const inviteInput = page.getByRole("textbox", { name: /Invite name/i })
  await inviteInput.fill("Elysia component lab")
  assert(
    (await inviteInput.inputValue()) === "Elysia component lab",
    "Component interaction lab should keep text input editable.",
  )

  await page
    .getByRole("combobox", { name: /Theme proof family/i })
    .selectOption("azure-aria")
  await expectSelectedState(page, "radio", /Luminous/i)
  await page.getByRole("radio", { name: /Ceremonial/i }).click()
  await expectSelectedState(page, "radio", /Ceremonial/i)
  await expectCheckedState(page, "switch", /Sync component notes/i, true)
  await page.getByRole("switch", { name: /Sync component notes/i }).click()
  await expectCheckedState(page, "switch", /Sync component notes/i, false)
  await page
    .getByRole("checkbox", { name: /I checked both light and dark mode/i })
    .click()
  await expectCheckedState(
    page,
    "checkbox",
    /I checked both light and dark mode/i,
    true,
  )

  await page.getByRole("tab", { name: /Repair/i }).click()
  await page
    .locator(".ely-story-theme-specimen-tab-panel")
    .getByText("Validation, warning, and recovery")
    .waitFor()

  const openDialogButton = page.getByRole("button", {
    name: "Open lab dialog",
  })
  await openDialogButton.click()
  await page.getByRole("dialog").waitFor()
  await page
    .getByRole("heading", { name: "Interaction lab checkpoint" })
    .waitFor()
  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "hidden" })

  const labCardCount = await page
    .locator(".ely-story-theme-specimen-lab-panel")
    .count()
  const checkCount = await page
    .locator(".ely-story-theme-specimen-lab-checks span")
    .count()
  const firstCheckRadius = await page
    .locator(".ely-story-theme-specimen-lab-checks span")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(labCardCount === 4, "Expected four interaction lab component cards.")
  assert(checkCount === 4, "Expected four interaction approval checks.")
  assert(
    firstCheckRadius === 999,
    "Expected interaction approval checks to use pill radius only.",
  )
}

const verifyComponentDecisionWorkshop = async (page: Page) => {
  await gotoStoryId(
    page,
    componentDecisionWorkshopStoryId,
    "Choose components by user job, then prove the choice",
  )
  await page
    .getByRole("heading", { name: "Start from intent, not appearance" })
    .waitFor()
  await page.getByText("Active lane packet").waitFor()
  await page.getByText("Detailed scenario proof links").waitFor()
  await page.getByText("Live decision specimen").waitFor()
  await page
    .getByRole("heading", {
      name: "Every lane needs a proof packet and a blocker",
    })
    .waitFor()
  await page.getByText("If intent is unclear, stop before styling").waitFor()

  await page.getByRole("button", { name: /Decide/i }).click()
  await page.getByText("Do not hide strategic choices").first().waitFor()
  await page.getByRole("link", { name: /Input/i }).first().waitFor()

  const noteInput = page.getByRole("textbox", { name: /Review note title/i })
  await noteInput.fill("Decision workshop proof")
  assert(
    (await noteInput.inputValue()) === "Decision workshop proof",
    "Component decision workshop should keep its input editable.",
  )
  await page
    .getByRole("combobox", { name: /Theme family reference/i })
    .selectOption("azure-aria")
  await expectSelectedState(page, "radio", /Luminous/i)
  await page.getByRole("radio", { name: /Ceremonial/i }).click()
  await expectSelectedState(page, "radio", /Ceremonial/i)
  await expectCheckedState(page, "switch", /Sync review notes/i, true)
  await page.getByRole("switch", { name: /Sync review notes/i }).click()
  await expectCheckedState(page, "switch", /Sync review notes/i, false)
  await page
    .getByRole("checkbox", {
      name: /I opened at least one detailed scenario proof/i,
    })
    .click()
  await expectCheckedState(
    page,
    "checkbox",
    /I opened at least one detailed scenario proof/i,
    true,
  )
  await page.getByRole("tab", { name: /Reject/i }).click()
  await page
    .locator(".ely-story-decision-workshop-tab")
    .getByText("Refuse mismatched primitives")
    .waitFor()
  await page
    .getByRole("link", { name: /Component Theme Specimen Wall/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Scenario Atlas/ }).waitFor()

  const laneCount = await page
    .locator(".ely-story-decision-workshop-lane")
    .count()
  const routeCount = await page
    .locator(".ely-story-decision-workshop-route a")
    .count()
  const rowCount = await page
    .locator(".ely-story-decision-workshop-row")
    .count()
  const firstLaneRadius = await page
    .locator(".ely-story-decision-workshop-lane")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(laneCount === 5, "Expected five component decision lanes.")
  assert(routeCount === 6, "Expected six decision workshop review routes.")
  assert(rowCount === 5, "Expected five decision workshop table rows.")
  assert(
    firstLaneRadius <= 14,
    "Expected decision workshop lanes to stay within the public-luxe radius scale.",
  )
}

const verifyComponentMobileDensityReview = async (page: Page) => {
  await gotoStoryId(
    page,
    componentMobileDensityReviewStoryId,
    "Approve the public primitives in a narrow surface",
  )
  await page
    .getByText("Mobile approval rejects decorative compression")
    .waitFor()
  await page.getByText("Current narrow-surface decision").waitFor()
  await page.getByText("One visible primary action").waitFor()
  await page.getByText("Field label stays present").waitFor()
  await page.getByText("Recovery path is reachable").waitFor()
  await page.getByText("Ornament trims before copy").waitFor()

  const inviteInput = page.getByRole("textbox", { name: /Invite name/i })
  await inviteInput.fill("Mobile density pass")
  assert(
    (await inviteInput.inputValue()) === "Mobile density pass",
    "Component mobile density review should keep narrow input editable.",
  )

  await page
    .getByRole("combobox", { name: /Surface type/i })
    .selectOption("reward-claim")
  await expectSelectedState(page, "radio", /Balanced/i)
  await page.getByRole("radio", { name: /Compact/i }).click()
  await expectSelectedState(page, "radio", /Compact/i)
  await expectCheckedState(page, "switch", /Sync notes/i, true)
  await page.getByRole("switch", { name: /Sync notes/i }).click()
  await expectCheckedState(page, "switch", /Sync notes/i, false)
  await page.getByRole("checkbox", { name: /I reviewed both modes/i }).click()
  await expectCheckedState(page, "checkbox", /I reviewed both modes/i, true)
  await page.getByRole("tab", { name: /Repair/i }).click()
  await page
    .locator(".ely-story-mobile-review-panel")
    .getByText("Field error, alert, and recovery route.")
    .waitFor()

  const phoneCount = await page
    .locator(".ely-story-mobile-review-phone")
    .count()
  const checkCount = await page
    .locator(".ely-story-mobile-review-checks span")
    .count()
  const routeCount = await page
    .locator(".ely-story-mobile-review-routes a")
    .count()
  const firstPhoneRadius = await page
    .locator(".ely-story-mobile-review-phone")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(phoneCount === 3, "Expected three mobile density phone specimens.")
  assert(checkCount === 4, "Expected four mobile density approval checks.")
  assert(routeCount === 4, "Expected four mobile density evidence routes.")
  assert(
    firstPhoneRadius <= 14,
    "Expected mobile density phone shells to stay within the public-luxe radius scale.",
  )
}

const verifyComponentScenarioAtlas = async (page: Page) => {
  await gotoStoryId(
    page,
    componentScenarioAtlasStoryId,
    "Every detailed story should prove a review risk",
  )
  await page
    .getByRole("heading", {
      name: "Move from coverage to operability before variants",
    })
    .waitFor()
  await page
    .getByRole("heading", { name: "Scan the system by what could fail" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Detailed scenarios stay grouped by user job",
    })
    .waitFor()
  await page.getByText("State").first().waitFor()
  await page.getByText("Interaction").first().waitFor()
  await page.getByText("Accessibility").first().waitFor()
  await page.getByText("Actions").first().waitFor()
  await page.getByText("Form").first().waitFor()
  await page.getByText("Navigation").first().waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Failure Gallery/ }).waitFor()
  await page
    .locator(".ely-story-scenario-row")
    .filter({ hasText: "Input" })
    .filter({ hasText: "Validation scenarios" })
    .waitFor()
  await page
    .locator(".ely-story-scenario-row")
    .filter({ hasText: "RadioGroup" })
    .filter({ hasText: "Keyboard scenarios" })
    .waitFor()

  const focusCount = await page
    .locator(".ely-story-scenario-focus-card")
    .count()
  const familyCount = await page.locator(".ely-story-scenario-family").count()
  const rowCount = await page.locator(".ely-story-scenario-row").count()
  const routeCount = await page
    .locator(".ely-story-scenario-route-step")
    .count()
  const firstRowRadius = await page
    .locator(".ely-story-scenario-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(focusCount === 7, "Expected seven scenario review focus lanes.")
  assert(familyCount === 5, "Expected five component family lanes.")
  assert(
    rowCount === publicComponentScenarioCount,
    "Expected every detailed scenario to appear once.",
  )
  assert(routeCount === 6, "Expected six component review route steps.")
  assert(
    firstRowRadius <= 14,
    "Expected component scenario rows to stay within the public-luxe radius scale.",
  )
}

const verifyComponentApiReference = async (page: Page) => {
  await gotoStoryId(
    page,
    componentApiReferenceStoryId,
    "A fast contract table for every public primitive",
  )
  await page
    .getByRole("heading", {
      name: "Use API reference before approving new variants",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Scan by component family before opening a single docs page",
    })
    .waitFor()
  await page.getByText("Props").first().waitFor()
  await page.getByText("States").first().waitFor()
  await page.getByText("Review guidance").first().waitFor()
  await page.getByRole("link", { name: /Component Index/ }).waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Composition Matrix/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Scenario Atlas/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const apiCards = page.locator(".ely-story-api-reference-card")
  const apiCardTitles = page.locator(".ely-story-api-reference-card h4")
  await apiCardTitles.filter({ hasText: /^Button$/ }).waitFor()
  await apiCardTitles.filter({ hasText: /^Input$/ }).waitFor()
  await apiCardTitles.filter({ hasText: /^Dialog$/ }).waitFor()
  await apiCardTitles.filter({ hasText: /^Tabs$/ }).waitFor()
  await apiCardTitles.filter({ hasText: /^Skeleton$/ }).waitFor()

  const cardCount = await apiCards.count()
  const groupCount = await page
    .locator(".ely-story-api-reference-group")
    .count()
  const routeCount = await page
    .locator(".ely-story-api-reference-route-step")
    .count()
  const propRowCount = await page
    .locator(".ely-story-api-reference-prop-row")
    .count()
  const firstCardRadius = await apiCards
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    cardCount === 20,
    "Expected all twenty public primitives in API reference.",
  )
  assert(groupCount === 5, "Expected five component family groups.")
  assert(routeCount === 8, "Expected eight component review route steps.")
  assert(
    propRowCount >= 50,
    "Expected API reference to expose a substantial owner-sourced prop table.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected component API cards to stay within the public-luxe radius scale.",
  )
}

const verifyComponentAcceptanceBoard = async (page: Page) => {
  await gotoStoryId(
    page,
    componentAcceptanceBoardStoryId,
    "Approve components by gates, not by gallery presence",
  )
  await page
    .getByRole("heading", {
      name: "Review each component family as a delivery lane",
    })
    .waitFor()
  await page.getByRole("heading", { name: "Actions acceptance rows" }).waitFor()
  await page.getByText("Owner docs").first().waitFor()
  await page.getByText("Scenario depth").first().waitFor()
  await page.getByText("Risk focus").first().waitFor()
  await page.getByText("State + a11y").first().waitFor()
  await page.getByText("Misuse boundary").first().waitFor()
  await page
    .getByRole("heading", {
      name: "If a gate fails, fix the owner truth first",
    })
    .waitFor()
  await page.getByRole("link", { name: /Component Index/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Composition Matrix/ })
    .waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const rowCount = await page.locator(".ely-story-acceptance-row").count()
  const groupCount = await page
    .locator(".ely-story-acceptance-category")
    .count()
  const routeCount = await page
    .locator(".ely-story-acceptance-route-step")
    .count()
  const gateCount = await page.locator(".ely-story-acceptance-gate").count()
  const firstRowRadius = await page
    .locator(".ely-story-acceptance-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    rowCount === 20,
    "Expected all twenty public primitives in acceptance board.",
  )
  assert(groupCount === 5, "Expected five acceptance category groups.")
  assert(routeCount === 6, "Expected six component acceptance review routes.")
  assert(gateCount === 100, "Expected five acceptance gates per component.")
  assert(
    firstRowRadius <= 14,
    "Expected component acceptance rows to stay within the public-luxe radius scale.",
  )
}

const verifyComponentHandoffDossier = async (page: Page) => {
  await gotoStoryId(
    page,
    componentHandoffDossierStoryId,
    "Every primitive needs a reviewer-ready dossier",
  )
  await page
    .getByRole("heading", { name: "Scan handoff proof by the failure mode" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Review the component set as five delivery lanes",
    })
    .waitFor()
  await page
    .getByRole("heading", { name: "Actions component dossiers" })
    .waitFor()
  await page.getByText("Intent named").first().waitFor()
  await page.getByText("Contract visible").first().waitFor()
  await page.getByText("Story proof").first().waitFor()
  await page.getByText("Risk surfaced").first().waitFor()
  await page.getByText("Reject line").first().waitFor()
  await page
    .getByRole("heading", {
      name: "The dossier points to truth; it does not become truth",
    })
    .waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByRole("link", { name: /Component API Reference/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const dossierCount = await page.locator(".ely-story-dossier-card").count()
  const familyCount = await page.locator(".ely-story-dossier-family").count()
  const focusCount = await page.locator(".ely-story-dossier-focus-card").count()
  const routeCount = await page.locator(".ely-story-dossier-route-step").count()
  const checkCount = await page.locator(".ely-story-dossier-check").count()
  const scenarioLinkCount = await page
    .locator(".ely-story-dossier-links a")
    .count()
  const firstCardRadius = await page
    .locator(".ely-story-dossier-card")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    dossierCount === 20,
    "Expected all twenty public primitives in handoff dossier.",
  )
  assert(familyCount === 5, "Expected five component handoff family groups.")
  assert(focusCount === 7, "Expected seven handoff risk focus cards.")
  assert(routeCount === 7, "Expected seven component handoff review routes.")
  assert(checkCount === 100, "Expected five handoff checks per component.")
  assert(
    scenarioLinkCount === 20 + publicComponentScenarioCount,
    "Expected docs plus every detailed scenario link in handoff dossier.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected component handoff cards to stay within the public-luxe radius scale.",
  )
}

const verifyComponentVariantMatrix = async (page: Page) => {
  await gotoStoryId(
    page,
    componentVariantMatrixStoryId,
    "Approve variants by evidence, not by appetite",
  )
  await page
    .getByRole("heading", { name: "Move from contract to variant proof" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Do not add a variant until the job is named",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Scan every primitive before requesting another prop",
    })
    .waitFor()
  await page.getByText("Variant props").first().waitFor()
  await page.getByText("Risk states").first().waitFor()
  await page.getByText("Scenario proof").first().waitFor()
  await page.getByText("Expansion check").first().waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByRole("link", { name: /Component API Reference/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Composition Matrix/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Scenario Atlas/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const matrixCards = page.locator(".ely-story-variant-card")
  const matrixCardTitles = page.locator(".ely-story-variant-card h4")
  await matrixCardTitles.filter({ hasText: /^Button$/ }).waitFor()
  await matrixCardTitles.filter({ hasText: /^Input$/ }).waitFor()
  await matrixCardTitles.filter({ hasText: /^Dialog$/ }).waitFor()
  await matrixCardTitles.filter({ hasText: /^Tabs$/ }).waitFor()
  await matrixCardTitles.filter({ hasText: /^Skeleton$/ }).waitFor()

  const cardCount = await matrixCards.count()
  const groupCount = await page.locator(".ely-story-variant-group").count()
  const routeCount = await page.locator(".ely-story-variant-route-step").count()
  const gateCount = await page.locator(".ely-story-variant-gate").count()
  const chipCount = await page.locator(".ely-story-variant-chip").count()
  const scenarioLinkCount = await page
    .locator(".ely-story-variant-scenario-list a")
    .count()
  const firstCardRadius = await matrixCards
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    cardCount === 20,
    "Expected all twenty public primitives in variant matrix.",
  )
  assert(groupCount === 5, "Expected five component family groups.")
  assert(routeCount === 8, "Expected eight component review route steps.")
  assert(gateCount === 4, "Expected four variant approval gates.")
  assert(
    chipCount >= 70,
    "Expected variant matrix to expose variant and state chips.",
  )
  assert(
    scenarioLinkCount === publicComponentScenarioCount,
    "Expected every detailed component scenario to appear in variant proof.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected component variant cards to stay within the public-luxe radius scale.",
  )
}

const verifyComponentStateMatrix = async (page: Page) => {
  await gotoStoryId(
    page,
    componentStateMatrixStoryId,
    "Review states where users can actually get stuck",
  )
  await page
    .getByRole("heading", { name: "Move from API shape to state proof" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Approve the recovery path before the ornament",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Audit state, access, proof, and blocker together",
    })
    .waitFor()
  await page.getByText("State notes").first().waitFor()
  await page.getByText("Accessibility notes").first().waitFor()
  await page.getByText("Proof scenarios").first().waitFor()
  await page.getByText("State blocker").first().waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByRole("link", { name: /Component Variant Matrix/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Composition Matrix/ })
    .waitFor()
  await page.getByRole("link", { name: /Component Scenario Atlas/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()

  const stateCards = page.locator(".ely-story-state-card")
  const stateCardTitles = page.locator(".ely-story-state-card h4")
  await stateCardTitles.filter({ hasText: /^Button$/ }).waitFor()
  await stateCardTitles.filter({ hasText: /^Input$/ }).waitFor()
  await stateCardTitles.filter({ hasText: /^Dialog$/ }).waitFor()
  await stateCardTitles.filter({ hasText: /^Tabs$/ }).waitFor()
  await stateCardTitles.filter({ hasText: /^Skeleton$/ }).waitFor()

  const cardCount = await stateCards.count()
  const groupCount = await page.locator(".ely-story-state-group").count()
  const routeCount = await page.locator(".ely-story-state-route-step").count()
  const gateCount = await page.locator(".ely-story-state-gate").count()
  const noteCount = await page.locator(".ely-story-state-section li").count()
  const scenarioLinkCount = await page
    .locator(".ely-story-state-scenario-list a")
    .count()
  const firstCardRadius = await stateCards
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(
    cardCount === 20,
    "Expected all twenty public primitives in state matrix.",
  )
  assert(groupCount === 5, "Expected five component family groups.")
  assert(routeCount === 8, "Expected eight component review route steps.")
  assert(gateCount === 4, "Expected four state approval gates.")
  assert(
    noteCount === 140,
    "Expected all state and accessibility notes to appear.",
  )
  assert(
    scenarioLinkCount === publicComponentScenarioCount,
    "Expected every detailed component scenario to appear in state proof.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected component state cards to stay within the public-luxe radius scale.",
  )
}

const verifyComponentOperabilityBoard = async (page: Page) => {
  await gotoStoryId(
    page,
    componentOperabilityBoardStoryId,
    "A component is not approved until its risky states are usable",
  )
  await page
    .getByRole("heading", {
      name: "Review the state that would break the user flow",
    })
    .waitFor()
  await page.getByText("Focus trap").waitFor()
  await page.getByText("Recovery").first().waitFor()
  await page.getByText("Invalid", { exact: true }).first().waitFor()
  await page.getByText("Selection", { exact: true }).first().waitFor()
  await page.getByText("Runtime", { exact: true }).first().waitFor()
  await page.getByText("Keyboard").first().waitFor()
  await page.getByText("Loading", { exact: true }).first().waitFor()
  await page.getByText("Bounded", { exact: true }).first().waitFor()
  await page.getByText("Usefulness beats ornament").waitFor()
  await page.getByText("Do not approve from static beauty").waitFor()
  await page
    .getByRole("heading", {
      name: "Approve components from behavior back to visuals",
    })
    .waitFor()
  await page.getByRole("link", { name: /Return to component index/ }).waitFor()
  await page.getByRole("link", { name: /Review primitive choices/ }).waitFor()
  await page
    .getByRole("link", { name: /Review rejected primitive use/ })
    .waitFor()

  const rowCount = await page.locator(".ely-story-operability-row").count()
  const gateCount = await page.locator(".ely-story-operability-gate").count()
  const stepCount = await page.locator(".ely-story-operability-step").count()
  const linkCount = await page.locator(".ely-story-operability-links a").count()
  const firstRowRadius = await page
    .locator(".ely-story-operability-row")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(rowCount === 8, "Expected eight component operability rows.")
  assert(gateCount === 4, "Expected four component operability gates.")
  assert(stepCount === 4, "Expected four component operability review steps.")
  assert(linkCount === 3, "Expected three component operability review links.")
  assert(
    firstRowRadius <= 14,
    "Expected component operability rows to stay within the public-luxe radius scale.",
  )
}

const verifyComponentFailureGallery = async (page: Page) => {
  await gotoStoryId(
    page,
    componentFailureGalleryStoryId,
    "Rejected primitive use should point back to the owner contract",
  )
  const failureTitles = page.locator(".ely-story-component-failure-head h2")
  await failureTitles.filter({ hasText: "Button used as decoration" }).waitFor()
  await failureTitles.filter({ hasText: "Badge behaves like a CTA" }).waitFor()
  await failureTitles.filter({ hasText: "Placeholder-only field" }).waitFor()
  await failureTitles
    .filter({ hasText: "Dialog becomes a page shell" })
    .waitFor()
  await failureTitles
    .filter({ hasText: "Tabs replace route navigation" })
    .waitFor()
  await failureTitles
    .filter({ hasText: "Skeleton becomes final content" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Do not solve semantic drift with stronger styling",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "The right primitive should make the intent obvious",
    })
    .waitFor()
  await page
    .getByRole("link", { name: /Return to component coverage/ })
    .waitFor()

  const caseCount = await page
    .locator(".ely-story-component-failure-card")
    .count()
  const stepCount = await page
    .locator(".ely-story-component-failure-step")
    .count()
  const checkCount = await page
    .locator(".ely-story-component-failure-check")
    .count()
  const specimenCount = await page
    .locator(".ely-story-component-failure-specimen")
    .count()
  const firstCardRadius = await page
    .locator(".ely-story-component-failure-card")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(caseCount === 6, "Expected six rejected component usage cases.")
  assert(stepCount === 5, "Expected five component failure review steps.")
  assert(checkCount === 4, "Expected four component repair checklist items.")
  assert(
    specimenCount === 6,
    "Expected every rejected component case to show a specimen.",
  )
  assert(
    firstCardRadius <= 14,
    "Expected component failure cards to stay within the public-luxe radius scale.",
  )
}

const verifyComponentUsageMatrix = async (page: Page) => {
  await gotoStoryId(
    page,
    componentUsageMatrixStoryId,
    "Choose the primitive before polishing the surface",
  )
  await page
    .getByRole("heading", {
      name: "Most review mistakes are primitive mismatches",
    })
    .waitFor()
  await page.getByText("Button vs Link").waitFor()
  await page.getByText("Checkbox vs Switch").waitFor()
  await page.getByText("Select vs Radio Group").waitFor()
  await page.getByText("Badge vs Alert").waitFor()
  await page.getByText("Skeleton vs Progress").waitFor()
  await page.getByText("Dialog vs Card").waitFor()
  await page.getByText("Image vs Avatar").waitFor()
  await page.getByRole("heading", { name: "Approval red lines" }).waitFor()

  const choiceCount = await page
    .locator(".ely-story-component-usage-choice")
    .count()
  const redLineCount = await page
    .locator(".ely-story-component-usage-redline")
    .count()
  const firstChoiceRadius = await page
    .locator(".ely-story-component-usage-choice")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(choiceCount === 7, "Expected seven pairwise component choice rows.")
  assert(redLineCount === 4, "Expected four component approval red lines.")
  assert(
    firstChoiceRadius <= 14,
    "Expected component choice rows to stay within the public-luxe radius scale.",
  )
}

const verifyComponentCompositionMatrix = async (page: Page) => {
  await gotoStoryId(
    page,
    componentCompositionMatrixStoryId,
    "Assemble public primitives into reviewable user flows",
  )
  await page
    .getByRole("heading", {
      name: "Every component should know its job in the surface",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Review the order before approving the look",
    })
    .waitFor()
  await page.getByText("Claim or reserve surface").waitFor()
  await page.getByText("Form repair cluster").waitFor()
  await page.getByText("Preference atelier").waitFor()
  await page.getByText("Editorial card stack").waitFor()
  await page.getByText("Identity proof row").waitFor()
  await page.getByText("Loading to recovery").waitFor()
  await page.getByText("Focused confirmation").waitFor()
  await page
    .getByRole("heading", { name: "Reject local improvisation" })
    .waitFor()
  await page.getByRole("link", { name: /Component Usage Matrix/ }).waitFor()
  await page.getByRole("link", { name: /Component Acceptance Board/ }).waitFor()
  await page.getByRole("link", { name: /Component Scenario Atlas/ }).waitFor()
  await page
    .getByRole("link", { name: /Component Operability Board/ })
    .waitFor()
  await page.getByRole("link", { name: /Pattern Composition/ }).waitFor()

  const laneCount = await page
    .locator(".ely-story-component-composition-lane")
    .count()
  const recipeCount = await page
    .locator(".ely-story-component-composition-recipe")
    .count()
  const routeCount = await page
    .locator(".ely-story-component-composition-route-step")
    .count()
  const gateCount = await page
    .locator(".ely-story-component-composition-gate")
    .count()
  const firstRecipeRadius = await page
    .locator(".ely-story-component-composition-recipe")
    .first()
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderRadius),
    )

  assert(laneCount === 5, "Expected five component composition lanes.")
  assert(recipeCount === 7, "Expected seven component composition recipes.")
  assert(routeCount === 6, "Expected six component composition review routes.")
  assert(
    gateCount === 4,
    "Expected four component composition guardrail gates.",
  )
  assert(
    firstRecipeRadius <= 14,
    "Expected component composition recipes to stay within the public-luxe radius scale.",
  )
}

const verifyDetailedScenarioStories = async (page: Page) => {
  await gotoStoryId(page, linkNavigationStoryId, "Keep secondary routes quiet")
  await page.getByRole("link", { name: /open audit trail/i }).waitFor()

  await gotoStoryId(
    page,
    linkRouteBoundaryStoryId,
    "Links route, disclose, and reference; they do not commit state",
  )
  await page
    .getByRole("link", { name: /open external asset library/i })
    .waitFor()

  await gotoStoryId(
    page,
    cardSurfaceHierarchyStoryId,
    "One lead surface, then quieter supporting cards",
  )
  await page.getByRole("button", { name: /Approve family/i }).waitFor()
  await page.getByRole("link", { name: /Review evidence/i }).waitFor()

  await gotoStoryId(
    page,
    badgeSemanticBoundaryStoryId,
    "A badge marks state; it must not become the action",
  )
  await page.getByText("contrast blocked").waitFor()

  await gotoStoryId(
    page,
    avatarIdentityBoundaryStoryId,
    "Avatars identify people or teams; they are not ornamental stickers",
  )
  await page.getByText("Mira Lin").waitFor()
  await page.getByText("No anonymous sparkle clusters").waitFor()

  await gotoStoryId(
    page,
    imageAspectRatiosStoryId,
    "Media shape controls rhythm before ornament",
  )
  await page.getByRole("img", { name: /Landscape artwork/i }).waitFor()

  await gotoStoryId(
    page,
    imageMediaBoundaryStoryId,
    "Images carry content; decoration belongs to theme material",
  )
  await page.getByRole("img", { name: /Theme family hero artwork/i }).waitFor()
  await page.getByText("Do not use Image as a texture bucket").waitFor()

  await gotoStoryId(
    page,
    textReadingBoundaryStoryId,
    "Elegant copy still has to name the user action",
  )
  await page.getByText("Meaning before mood").waitFor()
  await page.getByText("Do not let poetry replace state").waitFor()

  await gotoStoryId(
    page,
    statSummaryBoundaryStoryId,
    "Stats summarize decisions; they do not replace charts or proof",
  )
  await page.getByText("Mode proof").waitFor()
  await page.getByText("Do not stack stats as decoration").waitFor()

  await gotoStoryId(
    page,
    dividerRhythmBoundaryStoryId,
    "Dividers create rhythm; they do not create information architecture",
  )
  await page.getByText("One card, several review lanes").waitFor()
  await page.getByText("Do not use dividers as headings").waitFor()

  await gotoStoryId(
    page,
    radioKeyboardStoryId,
    "Arrow keys should move through one decision set",
  )
  await page.getByRole("radio", { name: /Balanced/i }).waitFor()

  await gotoStoryId(
    page,
    radioDecisionBoundaryStoryId,
    "Radio groups choose one comparable option inside one decision",
  )
  await page.getByRole("radio", { name: /Editorial/i }).click()
  await expectSelectedState(page, "radio", /Editorial/i)
  await page.getByText("Route and commit elsewhere").waitFor()

  await gotoStoryId(page, skeletonLoadingStoryId, "Theme summary")
  await page.getByText("Loading summary...").waitFor()

  await gotoStoryId(
    page,
    skeletonTransitionStoryId,
    "Loading is temporary; the next state must be named",
  )
  await page.getByText("Evidence delayed").waitFor()
  await page.getByText("No theme notes yet").waitFor()
}

const verifyFormControlInteractions = async (page: Page) => {
  await gotoStoryId(page, inputStatesStoryId, /Label, helper, multiline/i)
  const titleInput = page.getByRole("textbox", { name: /Collection title/i })
  await titleInput.fill("Moonlit atelier notes")
  assert(
    (await titleInput.inputValue()) === "Moonlit atelier notes",
    "Input story should keep controlled text editable.",
  )

  await gotoStoryId(page, selectStatesStoryId, /Selected, placeholder/i)
  const themeSelect = page.getByRole("combobox", { name: /Theme family/i })
  await themeSelect.selectOption("rose-nocturne")
  assert(
    (await themeSelect.inputValue()) === "rose-nocturne",
    "Select story should update the governed theme family value.",
  )

  await gotoStoryId(page, switchStatesStoryId, /Checked, unchecked, disabled/i)
  await expectCheckedState(page, "switch", /Polished mode/i, true)
  await page.getByRole("switch", { name: /Polished mode/i }).click()
  await expectCheckedState(page, "switch", /Polished mode/i, false)

  const disabledSwitch = page.getByRole("switch", {
    name: /Experimental override/i,
  })
  await disabledSwitch.click({ force: true })
  await expectCheckedState(page, "switch", /Experimental override/i, false)

  await gotoStoryId(
    page,
    switchRuntimeBoundaryStoryId,
    "Switches are immediate preferences, not consent or publishing",
  )
  await expectCheckedState(page, "switch", /Follow system appearance/i, true)
  await page.getByRole("switch", { name: /Follow system appearance/i }).click()
  await expectCheckedState(page, "switch", /Follow system appearance/i, false)
  await page.getByText("Do not publish with a switch").waitFor()

  await gotoStoryId(
    page,
    checkboxStatesStoryId,
    /Checked, unchecked, disabled/i,
  )
  await expectCheckedState(
    page,
    "checkbox",
    /Enable compact control density/i,
    false,
  )
  await page
    .getByRole("checkbox", { name: /Enable compact control density/i })
    .click()
  await expectCheckedState(
    page,
    "checkbox",
    /Enable compact control density/i,
    true,
  )

  const disabledCheckbox = page.getByRole("checkbox", {
    name: /Locked editorial sync/i,
  })
  await disabledCheckbox.click({ force: true })
  await expectCheckedState(page, "checkbox", /Locked editorial sync/i, true)

  await gotoStoryId(
    page,
    checkboxConsentChecklistStoryId,
    "Checkboxes collect explicit inclusion and consent",
  )
  await expectCheckedState(
    page,
    "checkbox",
    /I reviewed light and dark snapshots/i,
    false,
  )
  await page
    .getByRole("checkbox", { name: /I reviewed light and dark snapshots/i })
    .click()
  await expectCheckedState(
    page,
    "checkbox",
    /I reviewed light and dark snapshots/i,
    true,
  )
  await page.getByRole("link", { name: /read release policy/i }).waitFor()
}

const writeReport = async (report: StorybookSmokeReport) => {
  await mkdir(reportDir, { recursive: true })
  const reportPath = join(
    reportDir,
    "e2e-storybook-public-components-report.json",
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

    const recordScenario = async (name: string, fn: () => Promise<void>) => {
      try {
        consoleWatcher.clear()
        await gotoStory(page)
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

    await recordScenario("tabs keyboard path stays navigable", async () => {
      await verifyTabsKeyboardPath(page)
    })

    await recordScenario(
      "radio group follows governed arrow navigation",
      async () => {
        await verifyRadioKeyboardPath(page)
      },
    )

    await recordScenario(
      "dialog restores focus and responds to escape and backdrop",
      async () => {
        await verifyDialogInteraction(page)
      },
    )

    await recordScenario(
      "component anatomy stories expose guidance and anti-patterns",
      async () => {
        await verifyComponentAnatomyGuidance(page)
      },
    )

    await recordScenario(
      "component index exposes scenario-level coverage links",
      async () => {
        await verifyComponentCoverageIndex(page)
      },
    )

    await recordScenario(
      "component theme specimen wall exposes live themed surfaces",
      async () => {
        await verifyComponentThemeSpecimenWall(page)
      },
    )

    await recordScenario(
      "component mobile density review keeps narrow surfaces usable",
      async () => {
        await verifyComponentMobileDensityReview(page)
      },
    )

    await recordScenario(
      "critical component scenario stories keep product paths usable",
      async () => {
        await verifyCriticalPathScenarioStories(page)
      },
    )

    await recordScenario(
      "feedback and navigation scenario stories keep repair paths usable",
      async () => {
        await verifyFeedbackNavigationScenarioStories(page)
      },
    )

    await recordScenario(
      "component interaction lab keeps live controls operable",
      async () => {
        await verifyComponentInteractionLab(page)
      },
    )

    await recordScenario(
      "component decision workshop maps jobs to proof links",
      async () => {
        await verifyComponentDecisionWorkshop(page)
      },
    )

    await recordScenario(
      "component api reference exposes owner docs contract table",
      async () => {
        await verifyComponentApiReference(page)
      },
    )

    await recordScenario(
      "component acceptance board exposes release-style gates",
      async () => {
        await verifyComponentAcceptanceBoard(page)
      },
    )

    await recordScenario(
      "component handoff dossier exposes reviewer packets",
      async () => {
        await verifyComponentHandoffDossier(page)
      },
    )

    await recordScenario(
      "component variant matrix exposes owner-derived expansion proof",
      async () => {
        await verifyComponentVariantMatrix(page)
      },
    )

    await recordScenario(
      "component state matrix exposes recovery and accessibility proof",
      async () => {
        await verifyComponentStateMatrix(page)
      },
    )

    await recordScenario(
      "component scenario atlas exposes detailed review routes",
      async () => {
        await verifyComponentScenarioAtlas(page)
      },
    )

    await recordScenario(
      "component operability board exposes risky state evidence",
      async () => {
        await verifyComponentOperabilityBoard(page)
      },
    )

    await recordScenario(
      "component failure gallery exposes rejected primitive usage",
      async () => {
        await verifyComponentFailureGallery(page)
      },
    )

    await recordScenario(
      "component usage matrix exposes pairwise primitive decisions",
      async () => {
        await verifyComponentUsageMatrix(page)
      },
    )

    await recordScenario(
      "component composition matrix exposes governed primitive recipes",
      async () => {
        await verifyComponentCompositionMatrix(page)
      },
    )

    await recordScenario(
      "detailed scenario stories render second-batch coverage",
      async () => {
        await verifyDetailedScenarioStories(page)
      },
    )

    await recordScenario(
      "form controls keep real input and selection paths usable",
      async () => {
        await verifyFormControlInteractions(page)
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

    console.log(`[e2e-storybook-public-components] report: ${reportPath}`)

    if (failedCount > 0) {
      for (const scenario of scenarios) {
        if (scenario.status === "failed") {
          console.error(
            `[storybook-public] fail ${scenario.name}: ${scenario.message}`,
          )
        }
      }

      process.exitCode = 1
      return
    }

    console.log("[e2e-storybook-public-components] passed")
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

    console.error(`[e2e-storybook-public-components] report: ${reportPath}`)
    console.error(`[e2e-storybook-public-components] failed: ${message}`)
    process.exitCode = 1
  })
