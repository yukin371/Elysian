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

interface StorybookThemeSystemSmokeReport {
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
  process.env.ELYSIAN_STORYBOOK_THEME_SYSTEM_REPORT_DIR ??
  process.env.ELYSIAN_REPORT_DIR ??
  ".ci-reports/storybook-theme-system"
const storybookPort = Number.parseInt(
  process.env.ELYSIAN_STORYBOOK_PUBLIC_PORT ?? "6006",
  10,
)
const storybookBaseUrl = `http://127.0.0.1:${storybookPort}/iframe.html`
const themeSystemStoryId = "public-luxe-foundations-theme-system-spec--overview"
const tokenPairingLedgerStoryId =
  "public-luxe-foundations-token-pairing-ledger--overview"
const themeRoleMatrixStoryId =
  "public-luxe-foundations-theme-role-matrix--overview"
const themeFamilyDossierStoryId =
  "public-luxe-foundations-theme-family-dossier--overview"
const themeSelectionPlaybookStoryId =
  "public-luxe-foundations-theme-selection-playbook--overview"
const themeChooserStoryId = "public-luxe-foundations-theme-chooser--overview"
const themeReadinessStoryId =
  "public-luxe-foundations-theme-readiness--overview"
const themeCustomizationGuardrailsStoryId =
  "public-luxe-foundations-theme-customization-guardrails--overview"
const releaseGateDashboardStoryId =
  "public-luxe-foundations-release-gate-dashboard--overview"
const modePairingLabStoryId =
  "public-luxe-foundations-mode-pairing-lab--overview"
const themeApplicationRecipesStoryId =
  "public-luxe-foundations-theme-application-recipes--overview"
const radiusColorDisciplineStoryId =
  "public-luxe-foundations-radius-color-discipline--overview"
const themeFailureGalleryStoryId =
  "public-luxe-foundations-theme-failure-gallery--overview"
const foundationsIndexStoryId = "public-luxe-foundations-index--coverage"
const typographyVoiceStoryId =
  "public-luxe-foundations-typography-voice--overview"
const materialMotionStoryId =
  "public-luxe-foundations-material-motion--overview"
const ornamentBudgetStoryId =
  "public-luxe-foundations-ornament-budget--overview"
const showcaseHubStoryId = "public-luxe-showcase-showcase-hub--overview"
const storyUrl = `${storybookBaseUrl}?id=${themeSystemStoryId}`

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
    process.stdout.write(`[storybook-theme-system] ${chunk}`)
  })
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[storybook-theme-system] ${chunk}`)
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

const gotoThemeSystemStory = async (page: Page) => {
  await page.goto(storyUrl, { waitUntil: "networkidle" })
  await page
    .getByRole("heading", { name: "Semantic roles before visual flourish" })
    .waitFor()
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

const readThemeSample = async (page: Page) =>
  page.evaluate(() => {
    const root = document.documentElement
    const styles = getComputedStyle(root)
    const primaryButton = document.querySelector(".ely-public-button")

    return {
      background: styles.getPropertyValue("--color-bg").trim(),
      mode: root.getAttribute("data-resolved-mode"),
      primary: styles.getPropertyValue("--color-primary").trim(),
      primaryButtonBackground: primaryButton
        ? getComputedStyle(primaryButton).backgroundImage
        : "",
      surface: styles.getPropertyValue("--color-surface").trim(),
      theme: root.getAttribute("data-theme"),
      text: styles.getPropertyValue("--color-text").trim(),
    }
  })

const setRootTheme = async (
  page: Page,
  theme: "elysia-default" | "rose-nocturne",
  resolvedMode: "dark" | "light",
) => {
  await page.evaluate(
    ({ resolvedMode, theme }) => {
      const root = document.documentElement

      root.dataset.preset = "public-luxe"
      root.dataset.theme = theme
      root.dataset.mode = resolvedMode
      root.dataset.resolvedMode = resolvedMode
    },
    { resolvedMode, theme },
  )
}

const verifySpecContent = async (page: Page) => {
  await page.getByText("Semantic token map").waitFor()
  await page.getByText("Five stable responsibilities").waitFor()
  await page.getByText("What keeps themes coherent").waitFor()
  await page
    .getByText("Paired text: --color-on-primary", { exact: true })
    .waitFor()
  await page.getByText("--color-material-sheen").waitFor()
  await page.getByRole("button", { name: "Primary path" }).waitFor()
  await page.getByRole("button", { name: "Secondary support" }).waitFor()
  await page.getByRole("button", { name: "Quiet recovery" }).waitFor()
}

const verifyThemeTokenSwitching = async (page: Page) => {
  await setRootTheme(page, "elysia-default", "light")
  const lightSample = await readThemeSample(page)

  await setRootTheme(page, "rose-nocturne", "dark")
  const darkSample = await readThemeSample(page)

  assert(
    lightSample.theme === "elysia-default" && lightSample.mode === "light",
    "Expected the baseline sample to use elysia-default light mode.",
  )
  assert(
    darkSample.theme === "rose-nocturne" && darkSample.mode === "dark",
    "Expected root attributes to switch to rose-nocturne dark mode.",
  )
  assert(
    lightSample.background !== darkSample.background,
    "Theme switch should change the semantic page background token.",
  )
  assert(
    lightSample.primary !== darkSample.primary,
    "Theme switch should change the semantic primary token.",
  )
  assert(
    lightSample.surface !== darkSample.surface,
    "Theme switch should change the semantic surface token.",
  )
  assert(
    darkSample.primaryButtonBackground.includes(darkSample.primary),
    "Live primary button should consume the active primary token.",
  )
}

const verifyPreviewPairs = async (page: Page) => {
  const previewLabels = await page
    .locator(".ely-story-theme-system-preview-pair span")
    .allTextContents()

  assert(
    previewLabels.filter((label) => label.trim() === "Light").length === 4,
    "Expected every launch family to show a light preview strip.",
  )
  assert(
    previewLabels.filter((label) => label.trim() === "Dark").length === 4,
    "Expected every launch family to show a dark preview strip.",
  )
}

const verifyFoundationsIndexContent = async (page: Page) => {
  await gotoStoryId(
    page,
    foundationsIndexStoryId,
    "Governance should be reviewable before it becomes beautiful",
  )
  await page.getByText("Contract and theme").waitFor()
  await page.getByText("Component review").waitFor()
  await page.getByText("Composition rhythm").waitFor()
  await page.getByText("Expression and access").waitFor()
  await page.getByText("Foundation story map").waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme System Spec" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Token Pairing Ledger" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Role Matrix" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Family Dossier" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Selection Playbook" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Readiness" })
    .waitFor()
  await page
    .getByRole("link", {
      exact: true,
      name: "Theme Customization Guardrails",
    })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Release Gate Dashboard" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Component Operability Board" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Component Failure Gallery" })
    .waitFor()
  await page.getByRole("link", { exact: true, name: "Pattern Index" }).waitFor()
  await page
    .getByRole("link", { exact: true, name: "Pattern Readiness Board" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Mode Pairing Lab" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Application Recipes" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Radius & Color Discipline" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Failure Gallery" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Accessibility & Inclusion" })
    .waitFor()

  const laneCount = await page
    .locator(".ely-story-foundation-index-lane")
    .count()
  const entryCount = await page
    .locator(".ely-story-foundation-index-entry")
    .count()

  assert(
    laneCount === 4,
    "Expected the foundations index to show four approval lanes.",
  )
  assert(
    entryCount >= 24,
    "Expected the foundations index to link foundation and cross-layer evidence entries.",
  )
}

const verifyRadiusColorDisciplineContent = async (page: Page) => {
  await gotoStoryId(
    page,
    radiusColorDisciplineStoryId,
    "The theme stays elegant because the rules stay narrow",
  )
  await page.getByText("Color is a job, not decoration inventory").waitFor()
  await page
    .getByText("Soft enough for luxury, strict enough for system work")
    .waitFor()
  await page
    .getByText("Reject visual polish that breaks the contract")
    .waitFor()

  const roleCount = await page.locator(".ely-story-radius-color-role").count()
  const radiusCount = await page
    .locator(".ely-story-radius-color-radius")
    .count()
  const blockerCount = await page
    .locator(".ely-story-radius-color-blocker")
    .count()
  const approvalCount = await page
    .locator(".ely-story-radius-color-check")
    .count()

  assert(roleCount === 4, "Expected four color role rules.")
  assert(radiusCount === 4, "Expected four radius scale rules.")
  assert(blockerCount === 4, "Expected four visual discipline blockers.")
  assert(
    approvalCount === 5,
    "Expected five visual discipline approval checks.",
  )

  await verifyGovernanceSpecimenRadius(page, ".ely-story-radius-color-role")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-radius-color-radius")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-radius-color-blocker")
}

const verifyThemeFailureGalleryContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeFailureGalleryStoryId,
    "A rejected design should teach the system what to protect",
  )
  await page.getByText("Color drift").waitFor()
  await page.getByText("Mode mismatch").waitFor()
  await page.getByText("Ornament overspend").waitFor()
  await page.getByText("Action conflict").waitFor()
  await page.getByText("Radius drift").waitFor()
  await page.getByRole("button", { name: "Approve repaired surface" }).waitFor()
  await page.getByText("Do not fix drift by adding more style").waitFor()

  const stepCount = await page.locator(".ely-story-theme-failure-step").count()
  const caseCount = await page.locator(".ely-story-theme-failure-card").count()
  const specimenCount = await page
    .locator(".ely-story-theme-failure-specimen")
    .count()
  const checkCount = await page
    .locator(".ely-story-theme-failure-check")
    .count()

  assert(stepCount === 5, "Expected five failure review steps.")
  assert(caseCount === 5, "Expected five theme failure cases.")
  assert(specimenCount === 5, "Expected every failure case to show a specimen.")
  assert(checkCount === 4, "Expected four repair checklist items.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-failure-step")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-failure-card")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-failure-specimen",
  )
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-failure-check")
}

const verifyThemeReadinessContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeReadinessStoryId,
    "Approve the family before polishing the page",
  )
  const readinessGateLabels = page.locator(
    ".ely-story-theme-readiness-gate span",
  )

  await readinessGateLabels.filter({ hasText: "Family fit" }).waitFor()
  await readinessGateLabels.filter({ hasText: "Mode pair" }).waitFor()
  await readinessGateLabels.filter({ hasText: "Role discipline" }).waitFor()
  await readinessGateLabels.filter({ hasText: "Surface majority" }).waitFor()
  await page.getByText("Approve theme family").waitFor()
  await page.getByText("Request darker-mode proof").waitFor()

  const familyCount = await page
    .locator(".ely-story-theme-readiness-card")
    .count()
  const gateCount = await page
    .locator(".ely-story-theme-readiness-gate")
    .count()
  const previewCount = await page
    .locator(".ely-story-theme-readiness-preview")
    .count()

  assert(familyCount === 4, "Expected four theme readiness family cards.")
  assert(gateCount === 4, "Expected four theme readiness approval gates.")
  assert(
    previewCount === 8,
    "Expected paired light and dark proof for each theme.",
  )

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-readiness-card")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-readiness-gate")
}

const verifyThemeRoleMatrixContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeRoleMatrixStoryId,
    "Every theme family changes mood, not responsibility",
  )
  await page
    .getByRole("heading", {
      name: "Five responsibilities that prevent color drift",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "One matrix, four moods, fixed responsibilities",
    })
    .waitFor()
  const roleGroupLabels = page.locator(".ely-story-theme-role-group strong")

  await roleGroupLabels.filter({ hasText: "Surface majority" }).waitFor()
  await roleGroupLabels.filter({ hasText: "Readable content" }).waitFor()
  await roleGroupLabels.filter({ hasText: "Action hierarchy" }).waitFor()
  await roleGroupLabels.filter({ hasText: "State meaning" }).waitFor()
  await roleGroupLabels.filter({ hasText: "Ornament budget" }).waitFor()
  await page.getByText("Light role proof").first().waitFor()
  await page.getByText("Dark role proof").first().waitFor()
  const routeSteps = page.locator(".ely-story-theme-role-route-step")

  await routeSteps.getByText("Theme System Spec", { exact: true }).waitFor()
  await routeSteps
    .getByText("Theme Customization Guardrails", { exact: true })
    .waitFor()
  await page.getByRole("button", { name: "Continue journey" }).waitFor()
  await page
    .getByText("Do not approve a theme that only works as a mood board")
    .waitFor()

  const roleGroupCount = await page
    .locator(".ely-story-theme-role-group")
    .count()
  const familyCount = await page.locator(".ely-story-theme-role-family").count()
  const previewCount = await page
    .locator(".ely-story-theme-role-preview")
    .count()
  const routeCount = await page
    .locator(".ely-story-theme-role-route-step")
    .count()
  const specimenCount = await page
    .locator(".ely-story-theme-role-specimen")
    .count()

  assert(roleGroupCount === 5, "Expected five theme role groups.")
  assert(familyCount === 4, "Expected four theme role family cards.")
  assert(previewCount === 8, "Expected paired role previews for each theme.")
  assert(routeCount === 5, "Expected five theme role route steps.")
  assert(specimenCount === 1, "Expected one live role specimen.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-role-group")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-role-family")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-role-preview")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-role-route-step")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-role-specimen")
}

const verifyThemeFamilyDossierContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeFamilyDossierStoryId,
    "A theme family is approved when its mood has a job",
  )
  await page.getByText("Best-fit surfaces").first().waitFor()
  await page.getByText("Light proof").first().waitFor()
  await page.getByText("Dark proof").first().waitFor()
  await page.getByText("Ornament budget").first().waitFor()
  await page.getByText("Blocker").first().waitFor()
  await page
    .getByRole("heading", {
      name: "Mood must pass the same gates as structure",
    })
    .waitFor()
  await page
    .getByRole("heading", { name: "Move from family dossier to proof" })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "A dossier should end in an operable surface",
    })
    .waitFor()
  await page.getByRole("button", { name: "Approve family dossier" }).waitFor()

  const dossierCount = await page
    .locator(".ely-story-theme-dossier-card")
    .count()
  const previewCount = await page
    .locator(".ely-story-theme-dossier-preview")
    .count()
  const promiseCount = await page
    .locator(".ely-story-theme-dossier-check")
    .count()
  const reviewCheckCount = await page
    .locator(".ely-story-theme-dossier-review-check")
    .count()
  const routeCount = await page
    .locator(".ely-story-theme-dossier-route")
    .count()
  const blockerCount = await page
    .locator(".ely-story-theme-dossier-blocker")
    .count()
  const specimenCount = await page
    .locator(".ely-story-theme-dossier-specimen")
    .count()

  assert(dossierCount === 4, "Expected four theme family dossier cards.")
  assert(previewCount === 8, "Expected paired light and dark dossier previews.")
  assert(promiseCount === 20, "Expected five role promises per theme family.")
  assert(reviewCheckCount === 5, "Expected five dossier approval checks.")
  assert(routeCount === 5, "Expected five theme dossier review routes.")
  assert(blockerCount === 4, "Expected four theme family blockers.")
  assert(specimenCount === 1, "Expected one live theme dossier specimen.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-dossier-card")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-dossier-preview")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-dossier-check")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-dossier-review-check",
  )
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-dossier-route")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-dossier-blocker")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-dossier-specimen",
  )
}

const verifyThemeSelectionPlaybookContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeSelectionPlaybookStoryId,
    "Choose the theme by user job before choosing the shine",
  )
  await page.getByText("Public launch").waitFor()
  await page.getByText("Editorial campaign").waitFor()
  await page.getByText("Clarity workspace").waitFor()
  await page.getByText("Bridge surface").waitFor()
  await page
    .getByRole("heading", {
      name: "The four families are choices, not decoration presets",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "A beautiful theme choice still needs a written reason",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Selection only counts when proof is reachable",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "The chosen family must still operate like a product",
    })
    .waitFor()
  await page.getByRole("button", { name: "Confirm theme choice" }).waitFor()

  const laneCount = await page
    .locator(".ely-story-theme-selection-lane")
    .count()
  const choiceCount = await page
    .locator(".ely-story-theme-selection-choice")
    .count()
  const familyCount = await page
    .locator(".ely-story-theme-selection-family")
    .count()
  const checkCount = await page
    .locator(".ely-story-theme-selection-check")
    .count()
  const routeCount = await page
    .locator(".ely-story-theme-selection-route")
    .count()
  const blockerCount = await page
    .locator(".ely-story-theme-selection-blocker")
    .count()
  const specimenCount = await page
    .locator(".ely-story-theme-selection-specimen")
    .count()

  assert(laneCount === 4, "Expected four theme selection lanes.")
  assert(
    choiceCount === 8,
    "Expected recommended and alternate choices per lane.",
  )
  assert(familyCount === 4, "Expected four theme selection family rows.")
  assert(checkCount === 5, "Expected five theme selection checks.")
  assert(routeCount === 5, "Expected five theme selection review routes.")
  assert(blockerCount === 4, "Expected four theme selection blockers.")
  assert(specimenCount === 1, "Expected one live theme selection specimen.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-selection-lane")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-selection-choice",
  )
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-selection-family",
  )
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-selection-check")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-selection-route")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-selection-blocker",
  )
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-selection-specimen",
  )
}

const verifyThemeChooserContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeChooserStoryId,
    "Let users choose a personality, not just a color",
  )
  await page.getByText("Pick the identity first").waitFor()
  await page.getByText("Theme personality strength").waitFor()
  await page
    .getByRole("heading", {
      name: "The identity must survive light and dark",
    })
    .waitFor()
  await page
    .getByRole("heading", { name: "Personalization still needs discipline" })
    .waitFor()
  await page.getByRole("button", { name: /Rose Nocturne/ }).click()
  await page.getByRole("heading", { name: "Rose Nocturne" }).first().waitFor()
  await page.getByText("Rose banquet theme").first().waitFor()
  await page.getByText("Rose lacquer and candle gold").first().waitFor()

  const applyHref = await page
    .getByRole("link", { name: "Apply to Storybook toolbar" })
    .getAttribute("href")
  const optionCount = await page
    .locator(".ely-story-theme-chooser-option")
    .count()
  const pairCount = await page
    .locator(".ely-story-theme-chooser-mode-pair")
    .count()
  const previewCount = await page
    .locator(".ely-story-theme-chooser-mode-pair__previews span")
    .count()
  const checkCount = await page
    .locator(".ely-story-theme-chooser-check-list span")
    .count()

  assert(
    Boolean(
      applyHref?.includes("theme%3Arose-nocturne") ||
        applyHref?.includes("theme:rose-nocturne"),
    ),
    "Expected the theme chooser apply link to target the selected theme global.",
  )
  assert(optionCount === 4, "Expected four selectable launch theme families.")
  assert(pairCount === 4, "Expected four theme mode comparison pairs.")
  assert(
    previewCount === 8,
    "Expected light and dark preview for every chooser family.",
  )
  assert(checkCount === 4, "Expected four theme chooser approval checks.")

  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-chooser-hero__copy",
  )
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-chooser-stage")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-chooser-option")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-chooser-detail")
  await verifyGovernanceSpecimenRadius(
    page,
    ".ely-story-theme-chooser-mode-pair",
  )
}

const verifyTokenPairingLedgerContent = async (page: Page) => {
  await gotoStoryId(
    page,
    tokenPairingLedgerStoryId,
    "Luxury color stays safe when every surface knows its text partner",
  )
  await page.getByText("Review the rule before the swatch").waitFor()
  await page
    .getByRole("heading", {
      name: "Every container role names the text it expects",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Not every token needs a partner, but every token needs a job",
    })
    .waitFor()
  await page
    .getByRole("heading", {
      name: "Pairs should survive real component composition",
    })
    .waitFor()
  await page.getByText("--color-on-primary", { exact: true }).waitFor()
  await page.getByText("--color-on-danger-container", { exact: true }).waitFor()
  await page.getByRole("button", { name: "Approve pair map" }).waitFor()

  const gateCount = await page.locator(".ely-story-token-ledger-gate").count()
  const routeCount = await page.locator(".ely-story-token-ledger-route").count()
  const pairCount = await page.locator(".ely-story-token-ledger-pair").count()
  const baseCount = await page.locator(".ely-story-token-ledger-base").count()
  const surfaceCount = await page
    .locator(".ely-story-token-ledger-surface")
    .count()
  const specimenCount = await page
    .locator(".ely-story-token-ledger-specimen")
    .count()

  assert(gateCount === 4, "Expected four token pairing gates.")
  assert(routeCount === 4, "Expected four token pairing review routes.")
  assert(pairCount === 8, "Expected eight paired token rows.")
  assert(baseCount === 8, "Expected eight base token rows.")
  assert(surfaceCount === 4, "Expected four live paired surface samples.")
  assert(specimenCount === 1, "Expected one token pairing live specimen.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-gate")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-route")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-pair")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-base")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-surface")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-token-ledger-specimen")
}

const verifyThemeCustomizationGuardrailsContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeCustomizationGuardrailsStoryId,
    "Personalization stays elegant when roles stay fixed",
  )
  await page.getByText("Safe to tune").waitFor()
  await page.getByText("Needs proof").waitFor()
  await page.getByText("Do not localize").waitFor()
  await page.getByText("Reject early").waitFor()
  await page
    .getByText("Every customized family needs paired mode evidence")
    .waitFor()
  await page
    .getByText("Customization changes values, not responsibilities")
    .waitFor()
  await page
    .getByText("Elegance comes from a narrow corner vocabulary")
    .waitFor()
  await page.getByRole("button", { name: "Approve theme family" }).waitFor()

  const laneCount = await page.locator(".ely-story-theme-custom-lane").count()
  const familyCount = await page
    .locator(".ely-story-theme-custom-family")
    .count()
  const roleCount = await page.locator(".ely-story-theme-custom-role").count()
  const radiusCount = await page
    .locator(".ely-story-theme-custom-radius")
    .count()
  const stepCount = await page.locator(".ely-story-theme-custom-step").count()
  const previewCount = await page
    .locator(".ely-story-theme-custom-preview-pair span")
    .count()

  assert(laneCount === 4, "Expected four theme customization lanes.")
  assert(familyCount === 4, "Expected four launch theme family proof cards.")
  assert(roleCount === 5, "Expected five semantic role locks.")
  assert(radiusCount === 4, "Expected four radius lock entries.")
  assert(stepCount === 5, "Expected five customization approval steps.")
  assert(previewCount === 8, "Expected paired light and dark previews.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-custom-lane")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-custom-family")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-custom-role")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-custom-radius")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-custom-specimen")
}

const verifyReleaseGateDashboardContent = async (page: Page) => {
  await gotoStoryId(
    page,
    releaseGateDashboardStoryId,
    "Approve the system by evidence, not by mood",
  )
  await page.getByText("Evidence readiness").waitFor()
  const gateLabels = page.locator(".ely-story-release-gate-head span")
  await gateLabels.filter({ hasText: "Theme family" }).waitFor()
  await gateLabels.filter({ hasText: "Visual discipline" }).waitFor()
  await gateLabels.filter({ hasText: "Component evidence" }).waitFor()
  await gateLabels.filter({ hasText: "Pattern readiness" }).waitFor()
  await gateLabels.filter({ hasText: "Operability" }).waitFor()
  await page
    .getByRole("heading", { name: "Do not skip straight to ornament" })
    .waitFor()
  await page
    .getByRole("heading", { name: "The safest approval is boring to explain" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Trace approval from contract to repair" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Readiness" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Token Pairing Ledger" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Role Matrix" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Family Dossier" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Theme Selection Playbook" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Component Index" })
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Component Operability Board" })
    .first()
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Pattern Readiness Board" })
    .first()
    .waitFor()
  await page
    .getByRole("link", { exact: true, name: "Accessibility & Inclusion" })
    .waitFor()

  const gateCount = await page.locator(".ely-story-release-gate").count()
  const stepCount = await page.locator(".ely-story-release-step").count()
  const blockerCount = await page.locator(".ely-story-release-blocker").count()
  const chainCount = await page.locator(".ely-story-release-chain-item").count()

  assert(gateCount === 5, "Expected five release gate rows.")
  assert(stepCount === 5, "Expected five release review steps.")
  assert(blockerCount === 2, "Expected release blocker and watch summaries.")
  assert(chainCount === 11, "Expected eleven release evidence chain links.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-release-score")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-release-gate")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-release-step")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-release-blocker")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-release-chain-item")
}

const verifyThemeApplicationRecipesContent = async (page: Page) => {
  await gotoStoryId(
    page,
    themeApplicationRecipesStoryId,
    "A theme is approved by how it behaves on real surfaces",
  )
  await page.getByText("Hero ceremony").waitFor()
  await page.getByText("Data summary").waitFor()
  await page.getByText("Form recovery").waitFor()
  await page.getByText("Editorial glint").waitFor()
  await page
    .getByRole("heading", { name: "One primary path, one accent memory" })
    .waitFor()
  await page.getByRole("button", { name: "Continue journey" }).waitFor()
  await page.getByText("Reject the page before the colors drift").waitFor()

  const laneCount = await page.locator(".ely-story-theme-recipes-lane").count()
  const checkCount = await page
    .locator(".ely-story-theme-recipes-check")
    .count()
  const familyCount = await page
    .locator(".ely-story-theme-recipes-family")
    .count()
  const swatchCount = await page
    .locator(".ely-story-theme-recipes-family-swatch")
    .count()

  assert(laneCount === 4, "Expected four theme application recipe lanes.")
  assert(checkCount === 5, "Expected five theme application approval checks.")
  assert(familyCount === 4, "Expected four launch family recipes.")
  assert(swatchCount === 8, "Expected paired light and dark recipe swatches.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-recipes-lane")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-recipes-family")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-theme-recipes-check")
}

const verifyModePairingLabContent = async (page: Page) => {
  await gotoStoryId(
    page,
    modePairingLabStoryId,
    "A theme family is only launch-ready when both modes prove the same job",
  )
  await page.getByText("Action contrast").waitFor()
  await page.getByText("State evidence").waitFor()
  await page.getByText("Surface majority").waitFor()
  await page.getByText("Recovery path").waitFor()
  await page.getByRole("button", { name: "Save preference" }).waitFor()
  await page.getByText("Pair modes before approving theme polish").waitFor()

  const checkCount = await page.locator(".ely-story-mode-lab-check").count()
  const familyCount = await page.locator(".ely-story-mode-lab-family").count()
  const previewCount = await page.locator(".ely-story-mode-lab-preview").count()
  const questionCount = await page
    .locator(".ely-story-mode-lab-question")
    .count()

  assert(checkCount === 4, "Expected four mode proof checks.")
  assert(familyCount === 4, "Expected four mode pairing family cards.")
  assert(previewCount === 8, "Expected paired light and dark mode previews.")
  assert(questionCount === 5, "Expected five mode pairing approval questions.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-mode-lab-check")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-mode-lab-family")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-mode-lab-preview")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-mode-lab-question")
}

const verifyGovernanceSpecimenRadius = async (
  page: Page,
  selector: string,
  expectedMaxRadius = 14,
) => {
  const specimenRadius = await page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const value = getComputedStyle(element).borderRadius
      const firstRadius = value.split(" ")[0] ?? "0"
      return Number.parseFloat(firstRadius)
    })

  assert(
    specimenRadius <= expectedMaxRadius,
    `Expected ${selector} to keep ordinary radius at or below ${expectedMaxRadius}px.`,
  )
}

const verifyTypographyVoiceContent = async (page: Page) => {
  await gotoStoryId(
    page,
    typographyVoiceStoryId,
    "A luminous theme still speaks plainly",
  )
  await page.getByText("Display", { exact: true }).waitFor()
  await page.getByText("Sans", { exact: true }).waitFor()
  await page.getByText("Eyebrow", { exact: true }).waitFor()
  await page
    .getByRole("heading", { name: "Make the reading path visible" })
    .waitFor()
  await page
    .getByRole("heading", { name: "Elegant does not mean obscure" })
    .waitFor()
  await page.getByText("Review theme contrast").waitFor()

  const typeRoleCount = await page.locator(".ely-story-type-role").count()
  assert(
    typeRoleCount === 3,
    "Expected the typography page to show three type roles.",
  )

  await verifyGovernanceSpecimenRadius(page, ".ely-story-type-specimen")
}

const verifyMaterialMotionContent = async (page: Page) => {
  await gotoStoryId(
    page,
    materialMotionStoryId,
    "Crystal surfaces should glow with discipline",
  )
  await page.getByText("Atmosphere", { exact: true }).waitFor()
  await page.getByText("Crystal surface", { exact: true }).waitFor()
  await page.getByText("Sheen", { exact: true }).waitFor()
  await page.getByText("Glow", { exact: true }).waitFor()
  await page.getByRole("button", { name: "Preview surface" }).waitFor()
  await page
    .getByRole("heading", { name: "Animation should clarify rhythm" })
    .waitFor()
  await page.getByText("State-owned shimmer").waitFor()

  const materialLayerCount = await page
    .locator(".ely-story-material-layer")
    .count()
  assert(
    materialLayerCount === 4,
    "Expected the material page to show four material layers.",
  )

  await verifyGovernanceSpecimenRadius(page, ".ely-story-material-specimen")
}

const verifyOrnamentBudgetContent = async (page: Page) => {
  await gotoStoryId(
    page,
    ornamentBudgetStoryId,
    "Luxury becomes elegant when ornament has a limit",
  )
  const tierLabels = page.locator(".ely-story-ornament-tier strong")

  await tierLabels.filter({ hasText: "Quiet" }).waitFor()
  await tierLabels.filter({ hasText: "Luminous" }).waitFor()
  await tierLabels.filter({ hasText: "Ceremonial" }).waitFor()
  await tierLabels.filter({ hasText: "Blocked" }).waitFor()
  await page
    .getByRole("heading", {
      name: "One ceremonial surface, then restraint everywhere else",
    })
    .waitFor()
  await page.getByRole("button", { name: "Start the journey" }).waitFor()
  await page.getByText("Reject polish that spends beyond its budget").waitFor()

  const tierCount = await page.locator(".ely-story-ornament-tier").count()
  const surfaceCount = await page.locator(".ely-story-ornament-surface").count()
  const blockerCount = await page.locator(".ely-story-ornament-blocker").count()
  const questionCount = await page
    .locator(".ely-story-ornament-question")
    .count()

  assert(tierCount === 4, "Expected four ornament budget tiers.")
  assert(surfaceCount === 5, "Expected five surface budget assignments.")
  assert(blockerCount === 4, "Expected four ornament blockers.")
  assert(questionCount === 5, "Expected five ornament review questions.")

  await verifyGovernanceSpecimenRadius(page, ".ely-story-ornament-tier")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-ornament-surface")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-ornament-blocker")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-ornament-specimen")
}

const verifyShowcaseHubCockpit = async (page: Page) => {
  await gotoStoryId(
    page,
    showcaseHubStoryId,
    "Browse the preset as a theme system, not a pile of stories",
  )
  await page.getByText("Review cockpit").waitFor()
  await page.getByText("Approval gateways").waitFor()
  await page.getByText("Blocking risks").waitFor()
  const gatewayRoutes = page.locator(".ely-story-hub-route")

  await gatewayRoutes.getByText("Foundations Index", { exact: true }).waitFor()
  await gatewayRoutes.getByText("Component Index", { exact: true }).waitFor()
  await gatewayRoutes
    .getByText("Design Review Checklist", { exact: true })
    .waitFor()
  await gatewayRoutes.getByText("Theme Atelier", { exact: true }).waitFor()

  const gatewayCount = await gatewayRoutes.count()
  const riskCount = await page.locator(".ely-story-hub-risk").count()

  assert(
    gatewayCount === 9,
    "Expected the showcase hub to expose nine approval gateways.",
  )
  assert(
    riskCount === 4,
    "Expected the showcase hub to expose four blocking risks.",
  )
  await verifyGovernanceSpecimenRadius(page, ".ely-story-hub-panel")
  await verifyGovernanceSpecimenRadius(page, ".ely-story-hub-route")
}

const writeReport = async (report: StorybookThemeSystemSmokeReport) => {
  await mkdir(reportDir, { recursive: true })
  const reportPath = join(reportDir, "e2e-storybook-theme-system-report.json")
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
        await gotoThemeSystemStory(page)
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
      "theme system spec exposes governed semantic content",
      async () => {
        await verifySpecContent(page)
      },
    )

    await recordScenario(
      "theme family preview pairs expose light and dark strips",
      async () => {
        await verifyPreviewPairs(page)
      },
    )

    await recordScenario(
      "root theme switch updates sampled semantic tokens",
      async () => {
        await verifyThemeTokenSwitching(page)
      },
    )

    await recordScenario(
      "foundations index exposes approval lanes and linked evidence",
      async () => {
        await verifyFoundationsIndexContent(page)
      },
    )

    await recordScenario(
      "theme readiness matrix exposes family approval decisions",
      async () => {
        await verifyThemeReadinessContent(page)
      },
    )

    await recordScenario(
      "token pairing ledger exposes readable semantic pair proof",
      async () => {
        await verifyTokenPairingLedgerContent(page)
      },
    )

    await recordScenario(
      "theme role matrix compares launch theme responsibilities",
      async () => {
        await verifyThemeRoleMatrixContent(page)
      },
    )

    await recordScenario(
      "theme family dossier exposes launch theme packets",
      async () => {
        await verifyThemeFamilyDossierContent(page)
      },
    )

    await recordScenario(
      "theme selection playbook exposes family choice rules",
      async () => {
        await verifyThemeSelectionPlaybookContent(page)
      },
    )

    await recordScenario(
      "theme chooser exposes user-facing personalization controls",
      async () => {
        await verifyThemeChooserContent(page)
      },
    )

    await recordScenario(
      "theme customization guardrails expose safe personalization rules",
      async () => {
        await verifyThemeCustomizationGuardrailsContent(page)
      },
    )

    await recordScenario(
      "release gate dashboard summarizes launch evidence",
      async () => {
        await verifyReleaseGateDashboardContent(page)
      },
    )

    await recordScenario(
      "mode pairing lab proves light and dark state behavior",
      async () => {
        await verifyModePairingLabContent(page)
      },
    )

    await recordScenario(
      "theme application recipes expose page-level role assignments",
      async () => {
        await verifyThemeApplicationRecipesContent(page)
      },
    )

    await recordScenario(
      "radius and color discipline page exposes visual scale gates",
      async () => {
        await verifyRadiusColorDisciplineContent(page)
      },
    )

    await recordScenario(
      "theme failure gallery exposes rejected visual drift cases",
      async () => {
        await verifyThemeFailureGalleryContent(page)
      },
    )

    await recordScenario(
      "typography and voice governance page stays detailed and restrained",
      async () => {
        await verifyTypographyVoiceContent(page)
      },
    )

    await recordScenario(
      "material and motion governance page exposes ornament rules",
      async () => {
        await verifyMaterialMotionContent(page)
      },
    )

    await recordScenario(
      "ornament budget governance page exposes restraint gates",
      async () => {
        await verifyOrnamentBudgetContent(page)
      },
    )

    await recordScenario(
      "showcase hub exposes review cockpit and approval gateways",
      async () => {
        await verifyShowcaseHubCockpit(page)
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

    console.log(`[e2e-storybook-theme-system] report: ${reportPath}`)

    if (failedCount > 0) {
      for (const scenario of scenarios) {
        if (scenario.status === "failed") {
          console.error(
            `[storybook-theme-system] fail ${scenario.name}: ${scenario.message}`,
          )
        }
      }

      process.exitCode = 1
      return
    }

    console.log("[e2e-storybook-theme-system] passed")
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

    console.error(`[e2e-storybook-theme-system] report: ${reportPath}`)
    console.error(`[e2e-storybook-theme-system] failed: ${message}`)
    process.exitCode = 1
  })
