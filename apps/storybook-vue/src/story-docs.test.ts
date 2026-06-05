import { describe, expect, test } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
  type PublicComponentReviewFocus,
  publicComponentScenarioCoverage,
} from "./component-story-coverage"

const storyRoot = join(import.meta.dir)
const scriptRoot = join(storyRoot, "..", "..", "..", "scripts")

const componentStories = [
  ["Accordion", "PublicAccordion.stories.ts"],
  ["Button", "PublicButton.stories.ts"],
  ["IconButton", "PublicIconButton.stories.ts"],
  ["Link", "PublicLink.stories.ts"],
  ["Menu", "PublicMenu.stories.ts"],
  ["Toolbar", "PublicToolbar.stories.ts"],
  ["List", "PublicList.stories.ts"],
  ["DescriptionList", "PublicDescriptionList.stories.ts"],
  ["Table", "PublicTable.stories.ts"],
  ["Breadcrumb", "PublicBreadcrumb.stories.ts"],
  ["Pagination", "PublicPagination.stories.ts"],
  ["Stepper", "PublicStepper.stories.ts"],
  ["Timeline", "PublicTimeline.stories.ts"],
  ["Tooltip", "PublicTooltip.stories.ts"],
  ["Popover", "PublicPopover.stories.ts"],
  ["Stat", "PublicStat.stories.ts"],
  ["Text", "PublicText.stories.ts"],
  ["Kbd", "PublicKbd.stories.ts"],
  ["Avatar", "PublicAvatar.stories.ts"],
  ["Image", "PublicImage.stories.ts"],
  ["Input", "PublicInput.stories.ts"],
  ["SearchInput", "PublicSearchInput.stories.ts"],
  ["Fieldset", "PublicFieldset.stories.ts"],
  ["Textarea", "PublicTextarea.stories.ts"],
  ["NumberInput", "PublicNumberInput.stories.ts"],
  ["DateInput", "PublicDateInput.stories.ts"],
  ["FileInput", "PublicFileInput.stories.ts"],
  ["Chip", "PublicChip.stories.ts"],
  ["Card", "PublicCard.stories.ts"],
  ["Badge", "PublicBadge.stories.ts"],
  ["Tabs", "PublicTabs.stories.ts"],
  ["Dialog", "PublicDialog.stories.ts"],
  ["Progress", "PublicProgress.stories.ts"],
  ["Meter", "PublicMeter.stories.ts"],
  ["Spinner", "PublicSpinner.stories.ts"],
  ["Select", "PublicSelect.stories.ts"],
  ["Slider", "PublicSlider.stories.ts"],
  ["Rating", "PublicRating.stories.ts"],
  ["Switch", "PublicSwitch.stories.ts"],
  ["EmptyState", "PublicEmptyState.stories.ts"],
  ["Checkbox", "PublicCheckbox.stories.ts"],
  ["RadioGroup", "PublicRadioGroup.stories.ts"],
  ["SegmentedControl", "PublicSegmentedControl.stories.ts"],
  ["Skeleton", "PublicSkeleton.stories.ts"],
  ["Alert", "PublicAlert.stories.ts"],
  ["Toast", "PublicToast.stories.ts"],
  ["Divider", "PublicDivider.stories.ts"],
] as const

const readStory = (fileName: string) =>
  readFileSync(join(storyRoot, fileName), "utf8")

const publicStoryFiles = () =>
  readdirSync(storyRoot).filter((fileName) => fileName.endsWith(".stories.ts"))

const staticColorPattern =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bwhite\b(?!-)|\bblack\b/g
const radiusDeclarationPattern = /border-radius:\s*([^;]+);/g
const radiusPxPattern = /(-?\d*\.?\d+)px/g
const allowedRadiusValues = new Set([
  "var(--ely-public-radius-sm)",
  "var(--ely-public-radius-md)",
  "var(--ely-public-radius-lg)",
  "var(--ely-public-radius-md, 10px)",
  "999px",
  "inherit",
])
const requiredReviewRiskFocus = new Set<PublicComponentReviewFocus>([
  "accessibility",
  "feedback",
  "interaction",
  "state",
])

function collectStaticColorUsages(css: string) {
  return [...css.matchAll(staticColorPattern)].map((match) => match[0])
}

function collectOversizedRadiusDeclarations(css: string) {
  const oversized: string[] = []

  for (const declaration of css.matchAll(radiusDeclarationPattern)) {
    const value = declaration[1] ?? ""
    const pxValues = [...value.matchAll(radiusPxPattern)].map((match) =>
      Number(match[1] ?? 0),
    )

    if (pxValues.some((px) => px > 14 && px !== 999)) {
      oversized.push(`border-radius: ${value};`)
    }
  }

  return oversized
}

function collectOffScaleRadiusDeclarations(css: string) {
  return [...css.matchAll(radiusDeclarationPattern)]
    .map((declaration) => (declaration[1] ?? "").trim())
    .filter((value) => !allowedRadiusValues.has(value))
}

function readStoryCss() {
  return readdirSync(storyRoot)
    .filter(
      (fileName) =>
        fileName.startsWith("storybook-") && fileName.endsWith(".css"),
    )
    .sort()
    .map((fileName) => readFileSync(join(storyRoot, fileName), "utf8"))
    .join("\n")
}

describe("public component stories", () => {
  test("component index consumes owner docs and exposes coverage metrics", () => {
    const story = readStory("PublicComponentIndex.stories.ts")

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("buildComponentGroups")
    expect(story).toContain("documentedComponents.length")
    expect(story).toContain("totalProps")
    expect(story).toContain("totalStates")
    expect(story).toContain("totalAccessibilityNotes")
    expect(story).toContain("totalDecisionNotes")
    expect(story).toContain("totalAntiPatterns")
    expect(story).toContain("publicComponentScenarioCount")
    expect(story).toContain("publicComponentReviewFocusCounts")
    expect(story).toContain("publicComponentReviewFocusLabels")
    expect(story).toContain("visibleComponentGroups")
    expect(story).toContain("selectedFocus")
    expect(story).toContain("selectFocus")
    expect(story).toContain("filterScenariosByFocus")
    expect(story).toContain("buildReviewLaneSnapshot")
    expect(story).toContain("selectedReviewLane")
    expect(story).toContain("buildComponentReadiness")
    expect(story).toContain("componentReadinessByKey")
    expect(story).toContain("readinessSummary")
    expect(story).toContain("getComponentReadiness")
    expect(story).toContain("categoryReviewSummaries")
    expect(story).toContain("componentFailureEntry")
    expect(story).toContain("componentReviewRoutes")
    expect(story).toContain("createStoryPath")
    expect(story).toContain("getScenarioCoverage")
    expect(story).toContain("Review readiness gates")
    expect(story).toContain("Design approval starts with evidence")
    expect(story).toContain("Start visual, then prove behavior")
    expect(story).toContain("component-theme-specimen-wall")
    expect(story).toContain("component-decision-workshop")
    expect(story).toContain("component-mobile-density-review")
    expect(story).toContain("Review ready")
    expect(story).toContain("Category readiness board")
    expect(story).toContain("Review component failure gallery")
    expect(story).toContain("Review the system by component family")
    expect(story).toContain("Scenario review focus coverage")
    expect(story).toContain("Filter by review risk")
    expect(story).toContain("Review lane snapshot")
    expect(story).toContain(':aria-pressed="selectedFocus === focus.focus"')
    expect(story).toContain("Detailed stories")
    expect(story).toContain("component.decision")
    expect(story).toContain("component.antiPatterns")
    expect(story).toContain("getComponentRoute")
  })

  test("component mobile density review proves narrow component rhythm without local palette values", () => {
    const story = readStory("PublicComponentMobileDensityReview.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("densityOptions")
    expect(story).toContain("reviewTabs")
    expect(story).toContain("mobileReviewChecks")
    expect(story).toContain("componentReviewRoutes")
    expect(story).toContain("Approve the public primitives in a narrow surface")
    expect(story).toContain("Mobile approval rejects decorative compression")
    expect(story).toContain("Current narrow-surface decision")
    expect(story).toContain("One visible primary action")
    expect(story).toContain("Field label stays present")
    expect(story).toContain("Recovery path is reachable")
    expect(story).toContain("Ornament trims before copy")
    expect(story).toContain("component-theme-specimen-wall")
    expect(story).toContain("component-operability-board")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(1)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain("storybook-component-mobile-density-review.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component decision workshop maps user jobs to proof and rejection boundaries", () => {
    const story = readStory("PublicComponentDecisionWorkshop.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )
    const showcase = readFileSync(
      join(storyRoot, "public-luxe-showcase.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("decisionLanes")
    expect(story).toContain("routeEntries")
    expect(story).toContain(
      "Choose components by user job, then prove the choice",
    )
    expect(story).toContain("Start from intent, not appearance")
    expect(story).toContain("Active lane packet")
    expect(story).toContain("Detailed scenario proof links")
    expect(story).toContain("Live decision specimen")
    expect(story).toContain("Every lane needs a proof packet and a blocker")
    expect(story).toContain("If intent is unclear, stop before styling")
    expect(story).toContain("component-theme-specimen-wall")
    expect(story).toContain("component-mobile-density-review")
    expect(story).toContain("component-scenario-atlas")
    expect(story).toContain("component-failure-gallery")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(1)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain("storybook-component-decision-workshop.css")
    expect(showcase).toContain("Component Decision Workshop")
    expect(showcase).toContain(
      "public-luxe-components-decision-workshop--overview",
    )
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component failure gallery documents rejected primitive usage without local palette values", () => {
    const story = readStory("PublicComponentFailureGallery.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("componentFailureCases")
    expect(story).toContain("componentFailureReviewOrder")
    expect(story).toContain("componentRepairChecklist")
    expect(story).toContain(
      "Rejected primitive use should point back to the owner contract",
    )
    expect(story).toContain("Button used as decoration")
    expect(story).toContain("Badge behaves like a CTA")
    expect(story).toContain("Placeholder-only field")
    expect(story).toContain("Dialog becomes a page shell")
    expect(story).toContain("Tabs replace route navigation")
    expect(story).toContain("Skeleton becomes final content")
    expect(story).toContain("Do not solve semantic drift with stronger styling")
    expect(story).toContain("Return to component coverage")
    expect(preview).toContain("storybook-component-failure-gallery.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component index css does not re-own operability or failure gallery selectors", () => {
    const indexCss = readFileSync(
      join(storyRoot, "storybook-component-index.css"),
      "utf8",
    )
    const operabilityCss = readFileSync(
      join(storyRoot, "storybook-component-operability-board.css"),
      "utf8",
    )
    const failureCss = readFileSync(
      join(storyRoot, "storybook-component-failure-gallery.css"),
      "utf8",
    )

    expect(indexCss).not.toContain("ely-story-operability-")
    expect(indexCss).not.toContain("ely-story-component-failure-")
    expect(operabilityCss).toContain("ely-story-operability-")
    expect(failureCss).toContain("ely-story-component-failure-")
  })

  test("component theme specimen wall exposes live component proof without local palette values", () => {
    const story = readStory("PublicComponentThemeSpecimenWall.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicComponentScenarioCoverage")
    expect(story).toContain("specimenFamilies")
    expect(story).toContain("themeModes")
    expect(story).toContain("getThemePreviewStyle")
    expect(story).toContain("Judge the component set from live surfaces")
    expect(story).toContain("Theme family proof")
    expect(story).toContain("Live active-theme specimen")
    expect(story).toContain("One surface, many primitives, one visual grammar")
    expect(story).toContain("Theme personality strip")
    expect(story).toContain(
      "The same primitives should carry different moods clearly",
    )
    expect(story).toContain("Family coverage lanes")
    expect(story).toContain("From specimen beauty to component evidence")
    expect(story).toContain("theme.personality")
    expect(story).toContain("theme.bestFor")
    expect(story).toContain("theme.designCue")
    expect(story).toContain("theme.expressionLevel")
    expect(story).toContain("theme-chooser")
    expect(story).toContain("export const InteractionLab")
    expect(story).toContain(
      "Operate the primitives before approving the polish",
    )
    expect(story).toContain("Do not approve from a still screenshot")
    expect(story).toContain("Interaction lab checkpoint")
    expect(story).toContain("component-acceptance-board")
    expect(story).toContain("component-operability-board")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(2)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain("storybook-component-theme-specimen-wall.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component operability board documents high-risk interaction evidence without local palette values", () => {
    const story = readStory("PublicComponentOperabilityBoard.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("operabilityRows")
    expect(story).toContain("operabilityGates")
    expect(story).toContain("reviewSequence")
    expect(story).toContain(
      "A component is not approved until its risky states are usable",
    )
    expect(story).toContain("Review the state that would break the user flow")
    expect(story).toContain("Usefulness beats ornament")
    expect(story).toContain("Focus trap")
    expect(story).toContain("Recovery")
    expect(story).toContain("Invalid")
    expect(story).toContain("Keyboard")
    expect(story).toContain("Return to component index")
    expect(story).toContain("Review primitive choices")
    expect(story).toContain("Review rejected primitive use")
    expect(story).toContain("ely-story-operability-hero-panel")
    expect(story).toContain("ely-story-operability-board-panel")
    expect(story).toContain("ely-story-operability-gate-panel")
    expect(story).toContain("ely-story-operability-sequence-panel")
    expect(preview).toContain("storybook-component-operability-board.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component api reference exposes owner docs as a contract table without local palette values", () => {
    const story = readStory("PublicComponentApiReference.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("categoryGroups")
    expect(story).toContain("referenceRoutes")
    expect(story).toContain("A fast contract table for every public primitive")
    expect(story).toContain("Use API reference before approving new variants")
    expect(story).toContain(
      "Scan by component family before opening a single docs page",
    )
    expect(story).toContain("Props")
    expect(story).toContain("States")
    expect(story).toContain("Review guidance")
    expect(story).toContain("componentDocsRoute")
    expect(story).toContain("totalRequiredProps")
    expect(story).toContain("Storybook may sort and present docs")
    expect(story).toContain("ely-story-api-reference-hero-panel")
    expect(story).toContain("ely-story-api-reference-route-panel")
    expect(story).toContain("ely-story-api-reference-summary-panel")
    expect(story).toContain("ely-story-api-reference-groups-panel")
    expect(preview).toContain("storybook-component-api-reference.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component acceptance board exposes release-style component gates without local palette values", () => {
    const story = readStory("PublicComponentAcceptanceBoard.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("buildGates")
    expect(story).toContain("AcceptanceGate")
    expect(story).toContain("categoryGroups")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain(
      "Approve components by gates, not by gallery presence",
    )
    expect(story).toContain("Review each component family as a delivery lane")
    expect(story).toContain("Owner docs")
    expect(story).toContain("Scenario depth")
    expect(story).toContain("Risk focus")
    expect(story).toContain("State + a11y")
    expect(story).toContain("Misuse boundary")
    expect(story).toContain("If a gate fails, fix the owner truth first")
    expect(story).toContain("ely-story-acceptance-hero-panel")
    expect(story).toContain("ely-story-acceptance-category-panel")
    expect(story).toContain("ely-story-acceptance-boundary-panel")
    expect(preview).toContain("storybook-component-acceptance-board.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component handoff dossier exposes reviewer packets without local palette values", () => {
    const story = readStory("PublicComponentHandoffDossier.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("buildHandoffChecks")
    expect(story).toContain("HandoffCheck")
    expect(story).toContain("componentDossiers")
    expect(story).toContain("categoryGroups")
    expect(story).toContain("focusDossiers")
    expect(story).toContain("handoffRoutes")
    expect(story).toContain("Every primitive needs a reviewer-ready dossier")
    expect(story).toContain("Scan handoff proof by the failure mode")
    expect(story).toContain("Review the component set as five delivery lanes")
    expect(story).toContain("Intent named")
    expect(story).toContain("Contract visible")
    expect(story).toContain("Story proof")
    expect(story).toContain("Risk surfaced")
    expect(story).toContain("Reject line")
    expect(story).toContain(
      "The dossier points to truth; it does not become truth",
    )
    expect(story).toContain("ely-story-dossier-hero-panel")
    expect(story).toContain("ely-story-dossier-focus-panel")
    expect(story).toContain("ely-story-dossier-family-panel")
    expect(story).toContain("ely-story-dossier-boundary-panel")
    expect(preview).toContain("storybook-component-handoff-dossier.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component variant matrix exposes owner-derived variant review without local palette values", () => {
    const story = readStory("PublicComponentVariantMatrix.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("variantPropNames")
    expect(story).toContain("statePropNames")
    expect(story).toContain("categoryGroups")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain("Approve variants by evidence, not by appetite")
    expect(story).toContain("Move from contract to variant proof")
    expect(story).toContain("Do not add a variant until the job is named")
    expect(story).toContain(
      "Scan every primitive before requesting another prop",
    )
    expect(story).toContain("Variant props")
    expect(story).toContain("Risk states")
    expect(story).toContain("Scenario proof")
    expect(story).toContain("Expansion check")
    expect(story).toContain("ely-story-variant-hero-panel")
    expect(story).toContain("ely-story-variant-route-panel")
    expect(story).toContain("ely-story-variant-gate-panel")
    expect(story).toContain("ely-story-variant-family-panel")
    expect(preview).toContain("storybook-component-variant-matrix.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component state matrix exposes owner state and accessibility review without local palette values", () => {
    const story = readStory("PublicComponentStateMatrix.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("riskFocusOrder")
    expect(story).toContain("stateReviewGates")
    expect(story).toContain("categoryGroups")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain("Review states where users can actually get stuck")
    expect(story).toContain("Move from API shape to state proof")
    expect(story).toContain("Approve the recovery path before the ornament")
    expect(story).toContain("Audit state, access, proof, and blocker together")
    expect(story).toContain("State notes")
    expect(story).toContain("Accessibility notes")
    expect(story).toContain("Proof scenarios")
    expect(story).toContain("State blocker")
    expect(story).toContain("ely-story-state-hero-panel")
    expect(story).toContain("ely-story-state-route-panel")
    expect(story).toContain("ely-story-state-gate-panel")
    expect(story).toContain("ely-story-state-family-panel")
    expect(preview).toContain("storybook-component-state-matrix.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test.each(componentStories)(
    "%s consumes owner docs and exposes the required documentation stories",
    (componentName, fileName) => {
      const story = readStory(fileName)

      expect(story).toContain("publicComponentDocs")
      expect(story).toContain(`publicComponentDocs.${componentName}`)
      expect(story).toContain('tags: ["autodocs"]')
      expect(story).toContain("parameters:")
      expect(story).toContain("component: doc.description")
      expect(story).toContain("argTypes:")
      expect(story).toContain("args:")
      expect(story).toContain("export const Playground")
      expect(story).toContain("export const Anatomy")
      expect(story).toContain("export const States")
      expect(story).toContain("State matrix")
      expect(story).toContain("Props")
      expect(story).toContain("Decision guidance")
      expect(story).toContain("doc.decision")
      expect(story).toContain("Composition")
      expect(story).toContain("doc.composition")
      expect(story).toContain("Anti-patterns")
      expect(story).toContain("doc.antiPatterns")
      expect(story).toContain("Accessibility notes")
    },
  )

  for (const coverage of publicComponentScenarioCoverage) {
    test(`${coverage.component} keeps detailed scenario-level stories for high-frequency review`, () => {
      const story = readStory(coverage.fileName)

      for (const scenario of coverage.scenarios) {
        expect(story).toContain(`export const ${scenario.exportName}`)
        expect(scenario.reviewFocus.length).toBeGreaterThan(0)
      }
    })
  }

  test("component scenario coverage keeps every component review-ready", () => {
    for (const coverage of publicComponentScenarioCoverage) {
      const reviewFocus = new Set(
        coverage.scenarios.flatMap((scenario) => scenario.reviewFocus),
      )

      expect(
        coverage.scenarios.length,
        `${coverage.component} should keep at least two detailed scenarios`,
      ).toBeGreaterThanOrEqual(2)
      expect(
        [...requiredReviewRiskFocus].some((focus) => reviewFocus.has(focus)),
        `${coverage.component} should cover state, interaction, feedback, or accessibility review risk`,
      ).toBe(true)
      expect(
        coverage.scenarios.every((scenario) => scenario.storyId.length > 0),
        `${coverage.component} should keep concrete Storybook links`,
      ).toBe(true)
    }
  })
})

describe("public story visual contract", () => {
  test("showcase navigation exposes the design governance entry", () => {
    const showcase = readFileSync(
      join(storyRoot, "public-luxe-showcase.ts"),
      "utf8",
    )

    expect(showcase).toContain("Design Principles")
    expect(showcase).toContain(
      "public-luxe-foundations-design-principles--overview",
    )
    expect(showcase).toContain("Design Review Checklist")
    expect(showcase).toContain(
      "public-luxe-foundations-design-review-checklist--overview",
    )
    expect(showcase).toContain("Release Gate Dashboard")
    expect(showcase).toContain(
      "public-luxe-foundations-release-gate-dashboard--overview",
    )
    expect(showcase).toContain("Radius & Color Discipline")
    expect(showcase).toContain(
      "public-luxe-foundations-radius-color-discipline--overview",
    )
    expect(showcase).toContain("Theme Failure Gallery")
    expect(showcase).toContain(
      "public-luxe-foundations-theme-failure-gallery--overview",
    )
    expect(showcase).toContain("Foundations Index")
    expect(showcase).toContain("public-luxe-foundations-index--coverage")
    expect(showcase).toContain("Theme Composition")
    expect(showcase).toContain("Theme System Spec")
    expect(showcase).toContain("Token Pairing Ledger")
    expect(showcase).toContain("Theme Role Matrix")
    expect(showcase).toContain("Theme Family Dossier")
    expect(showcase).toContain("Theme Selection Playbook")
    expect(showcase).toContain("Theme Readiness")
    expect(showcase).toContain("Theme Customization Guardrails")
    expect(showcase).toContain("Mode Pairing Lab")
    expect(showcase).toContain("Theme Application Recipes")
    expect(showcase).toContain(
      "public-luxe-foundations-theme-system-spec--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-token-pairing-ledger--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-role-matrix--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-family-dossier--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-selection-playbook--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-composition--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-readiness--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-customization-guardrails--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-mode-pairing-lab--overview",
    )
    expect(showcase).toContain(
      "public-luxe-foundations-theme-application-recipes--overview",
    )
    expect(showcase).toContain("Component Anatomy")
    expect(showcase).toContain(
      "public-luxe-foundations-component-anatomy--overview",
    )
    expect(showcase).toContain("Component Usage Matrix")
    expect(showcase).toContain(
      "public-luxe-foundations-component-usage-matrix--overview",
    )
    expect(showcase).toContain("Component Composition Matrix")
    expect(showcase).toContain(
      "public-luxe-foundations-component-composition-matrix--overview",
    )
    expect(showcase).toContain("Component Index")
    expect(showcase).toContain("public-luxe-components-index--coverage")
    expect(showcase).toContain("Component Theme Specimen Wall")
    expect(showcase).toContain(
      "public-luxe-components-theme-specimen-wall--overview",
    )
    expect(showcase).toContain("Component Acceptance Board")
    expect(showcase).toContain(
      "public-luxe-components-acceptance-board--coverage",
    )
    expect(showcase).toContain("Component Handoff Dossier")
    expect(showcase).toContain(
      "public-luxe-components-handoff-dossier--coverage",
    )
    expect(showcase).toContain("Component API Reference")
    expect(showcase).toContain("public-luxe-components-api-reference--coverage")
    expect(showcase).toContain("Component Variant Matrix")
    expect(showcase).toContain(
      "public-luxe-components-variant-matrix--coverage",
    )
    expect(showcase).toContain("Component State Matrix")
    expect(showcase).toContain("public-luxe-components-state-matrix--coverage")
    expect(showcase).toContain("Component Scenario Atlas")
    expect(showcase).toContain(
      "public-luxe-components-scenario-atlas--coverage",
    )
    expect(showcase).toContain("Component Operability Board")
    expect(showcase).toContain(
      "public-luxe-components-operability-board--coverage",
    )
    expect(showcase).toContain("Component Failure Gallery")
    expect(showcase).toContain(
      "public-luxe-components-component-failure-gallery--overview",
    )
    expect(showcase).toContain("Pattern Composition")
    expect(showcase).toContain(
      "public-luxe-foundations-pattern-composition--overview",
    )
    expect(showcase).toContain("Pattern Index")
    expect(showcase).toContain("public-luxe-patterns-index--coverage")
    expect(showcase).toContain("Pattern Evidence Atlas")
    expect(showcase).toContain("public-luxe-patterns-evidence-atlas--coverage")
    expect(showcase).toContain("Pattern Readiness Board")
    expect(showcase).toContain("public-luxe-patterns-readiness-board--coverage")
    expect(showcase).toContain("Pattern Failure Gallery")
    expect(showcase).toContain(
      "public-luxe-patterns-pattern-failure-gallery--overview",
    )
    expect(showcase).toContain("Surface Rhythm")
    expect(showcase).toContain(
      "public-luxe-foundations-surface-rhythm--overview",
    )
    expect(showcase).toContain("Interaction States")
    expect(showcase).toContain(
      "public-luxe-foundations-interaction-states--overview",
    )
    expect(showcase).toContain("Action Hierarchy")
    expect(showcase).toContain(
      "public-luxe-foundations-action-hierarchy--overview",
    )
    expect(showcase).toContain("Navigation & Wayfinding")
    expect(showcase).toContain(
      "public-luxe-foundations-navigation-wayfinding--overview",
    )
    expect(showcase).toContain("Data Display & Summary")
    expect(showcase).toContain(
      "public-luxe-foundations-data-display-summary--overview",
    )
    expect(showcase).toContain("Typography & Voice")
    expect(showcase).toContain(
      "public-luxe-foundations-typography-voice--overview",
    )
    expect(showcase).toContain("Material & Motion")
    expect(showcase).toContain(
      "public-luxe-foundations-material-motion--overview",
    )
    expect(showcase).toContain("Ornament Budget")
    expect(showcase).toContain(
      "public-luxe-foundations-ornament-budget--overview",
    )
    expect(showcase).toContain("Layout & Density")
    expect(showcase).toContain(
      "public-luxe-foundations-layout-density--overview",
    )
    expect(showcase).toContain("Imagery & Iconography")
    expect(showcase).toContain(
      "public-luxe-foundations-imagery-iconography--overview",
    )
    expect(showcase).toContain("Accessibility & Inclusion")
    expect(showcase).toContain(
      "public-luxe-foundations-accessibility-inclusion--overview",
    )
    expect(showcase).toContain("Forms & Feedback")
    expect(showcase).toContain("public-luxe-patterns-forms-feedback--showcase")
    expect(showcase).toContain("Member Rewards")
    expect(showcase).toContain("public-luxe-patterns-member-rewards--showcase")
    expect(showcase).toContain("Editorial Collection")
    expect(showcase).toContain(
      "public-luxe-patterns-editorial-collection--showcase",
    )
    expect(showcase).toContain("Event Landing")
    expect(showcase).toContain("public-luxe-patterns-event-landing--showcase")
  })

  test("preview exposes an iframe story review map for core pages", () => {
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(preview).toContain("publicShowcaseEntries")
    expect(preview).toContain("reviewEntryKeys")
    expect(preview).toContain("createStoryHref")
    expect(preview).toContain("Review map")
    expect(preview).toContain("Story review map")
    expect(preview).toContain("showcase-hub")
    expect(preview).toContain("foundations-index")
    expect(preview).toContain("theme-chooser")
    expect(preview).toContain("component-index")
    expect(preview).toContain("component-theme-specimen-wall")
    expect(preview).toContain("component-operability-board")
    expect(preview).toContain("component-failure-gallery")
    expect(preview).toContain("pattern-index")
  })

  test("stories do not define their own hex color palette", () => {
    const directHexColor = /#[0-9a-fA-F]{3,8}(?=[\s"',);])/

    for (const fileName of publicStoryFiles()) {
      const story = readStory(fileName)

      expect(
        story,
        `${fileName} should consume theme tokens or theme pack metadata`,
      ).not.toMatch(directHexColor)
    }
  })

  test("theme artwork helper derives color from public theme packs", () => {
    const helper = readFileSync(
      join(storyRoot, "publicThemeArtwork.ts"),
      "utf8",
    )

    expect(helper).toContain("publicThemePacks")
    expect(helper).toContain("pack.preview.dark")
    expect(helper).toContain("useResolvedPublicThemePacks")
    expect(helper).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme preview stories resolve cards from the active mode", () => {
    for (const fileName of [
      "PublicThemeGallery.stories.ts",
      "PublicShowcaseHub.stories.ts",
    ]) {
      const story = readStory(fileName)

      expect(story).toContain("useResolvedPublicThemePacks")
      expect(story).not.toContain("publicThemePacks")
    }

    const themeGallery = readStory("PublicThemeGallery.stories.ts")

    expect(themeGallery).toContain("theme.personality")
    expect(themeGallery).toContain("theme.bestFor")
    expect(themeGallery).toContain("theme.designCue")
    expect(themeGallery).toContain("theme.expressionLevel")
    expect(themeGallery).toContain("ely-story-theme-gallery-rule-panel")
    expect(themeGallery.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
  })

  test("showcase hub exposes approval cockpit without owning theme truth", () => {
    const story = readStory("PublicShowcaseHub.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("categoryCoverage")
    expect(story).toContain("reviewGateways")
    expect(story).toContain("reviewRiskLanes")
    expect(story).toContain("Review cockpit")
    expect(story).toContain("Approval gateways")
    expect(story).toContain("Blocking risks")
    expect(story).toContain("foundations-index")
    expect(story).toContain("component-index")
    expect(story).toContain("component-api-reference")
    expect(story).toContain("component-variant-matrix")
    expect(story).toContain("component-state-matrix")
    expect(story).toContain("component-scenario-atlas")
    expect(story).toContain("pattern-evidence-atlas")
    expect(story).toContain("design-review-checklist")
    expect(story).toContain("theme-atelier")
    expect(story).toContain("getEntryByKey")
    expect(story).toContain("useResolvedPublicThemePacks")
    expect(story).toContain("ely-story-hub-review")
    expect(preview).toContain("storybook-showcase-hub.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("publicThemePacks")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component scenario atlas exposes detailed scenario routes without local palette values", () => {
    const story = readStory("PublicComponentScenarioAtlas.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverage")
    expect(story).toContain("publicComponentReviewFocusCounts")
    expect(story).toContain("focusLanes")
    expect(story).toContain("categoryLanes")
    expect(story).toContain("criticalPath")
    expect(story).toContain("Every detailed story should prove a review risk")
    expect(story).toContain("Move from coverage to operability before variants")
    expect(story).toContain("Scan the system by what could fail")
    expect(story).toContain("Detailed scenarios stay grouped by user job")
    expect(story).toContain("ely-story-scenario-atlas-hero-panel")
    expect(story).toContain("ely-story-scenario-route-panel")
    expect(story).toContain("ely-story-scenario-approval-panel")
    expect(story).toContain("ely-story-scenario-focus-panel")
    expect(story).toContain("ely-story-scenario-family-panel")
    expect(story).toContain("component-operability-board")
    expect(story).toContain("component-failure-gallery")
    expect(preview).toContain("storybook-component-scenario-atlas.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("pattern evidence atlas exposes user job evidence routes without local palette values", () => {
    const story = readStory("PublicPatternEvidenceAtlas.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("patternEvidenceRows")
    expect(story).toContain("evidenceFocusLanes")
    expect(story).toContain("evidenceRoute")
    expect(story).toContain("familyReviewOrder")
    expect(story).toContain(
      "Page patterns should prove one user job, one route to recovery",
    )
    expect(story).toContain(
      "Move from page grammar to readiness without skipping proof",
    )
    expect(story).toContain("Review patterns by the thing most likely to break")
    expect(story).toContain(
      "Each pattern needs action, proof, recovery, and a blocker",
    )
    expect(story).toContain("ely-story-pattern-atlas-hero")
    expect(story).toContain("ely-story-pattern-atlas-route-panel")
    expect(story).toContain("ely-story-pattern-atlas-approval-panel")
    expect(story).toContain("ely-story-pattern-atlas-focus-panel")
    expect(story).toContain("ely-story-pattern-atlas-evidence-panel")
    expect(story).toContain("pattern-index")
    expect(story).toContain("pattern-readiness-board")
    expect(story).toContain("pattern-failure-gallery")
    expect(preview).toContain("storybook-pattern-evidence-atlas.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme composition story consumes owner theme packs for paired previews", () => {
    const story = readStory("PublicThemeComposition.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("theme.preview.dark")
    expect(story).toContain("familyUseCases")
    expect(story).toContain("familyRisks")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme readiness story turns launch themes into approval decisions", () => {
    const story = readStory("PublicThemeReadiness.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("readinessChecks")
    expect(story).toContain("familyGuidance")
    expect(story).toContain("Approve the family before polishing the page")
    expect(story).toContain("Family fit")
    expect(story).toContain("Mode pair")
    expect(story).toContain("Role discipline")
    expect(story).toContain("Surface majority")
    expect(story).toContain("Approve theme family")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme customization guardrails story defines safe personalization boundaries", () => {
    const story = readStory("PublicThemeCustomizationGuardrails.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("customizationLanes")
    expect(story).toContain("tokenRoleLocks")
    expect(story).toContain("radiusLocks")
    expect(story).toContain("approvalFlow")
    expect(story).toContain(
      "Personalization stays elegant when roles stay fixed",
    )
    expect(story).toContain("Safe to tune")
    expect(story).toContain("Needs proof")
    expect(story).toContain("Do not localize")
    expect(story).toContain("Reject early")
    expect(story).toContain("--ely-public-radius-sm")
    expect(story).toContain("--ely-public-radius-md")
    expect(story).toContain("--ely-public-radius-lg")
    expect(story).toContain("999px")
    expect(story).toContain("Approve theme family")
    expect(story).toContain("ely-story-theme-custom-hero-panel")
    expect(story).toContain("ely-story-theme-custom-family-panel")
    expect(story).toContain("ely-story-theme-custom-flow-panel")
    expect(story).toContain("ely-story-theme-custom-role-panel")
    expect(story).toContain("ely-story-theme-custom-radius-panel")
    expect(story).toContain("ely-story-theme-custom-live-panel")
    expect(preview).toContain("storybook-foundations-theme-customization.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme application recipes story turns theme roles into page recipes", () => {
    const story = readStory("PublicThemeApplicationRecipes.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("recipeLanes")
    expect(story).toContain("familyRecipeGuidance")
    expect(story).toContain("approvalChecks")
    expect(story).toContain(
      "A theme is approved by how it behaves on real surfaces",
    )
    expect(story).toContain("Hero ceremony")
    expect(story).toContain("Data summary")
    expect(story).toContain("Form recovery")
    expect(story).toContain("Editorial glint")
    expect(story).toContain("One primary path, one accent memory")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("mode pairing lab story proves light and dark theme behavior", () => {
    const story = readStory("PublicModePairingLab.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("modeProofChecks")
    expect(story).toContain("familyModeRisks")
    expect(story).toContain("approvalQuestions")
    expect(story).toContain(
      "A theme family is only launch-ready when both modes prove the same job",
    )
    expect(story).toContain("Action contrast")
    expect(story).toContain("State evidence")
    expect(story).toContain("Surface majority")
    expect(story).toContain("Recovery path")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("radius and color discipline story makes visual scale reviewable", () => {
    const story = readStory("PublicRadiusColorDiscipline.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("colorRoleRules")
    expect(story).toContain("radiusRules")
    expect(story).toContain("approvalChecks")
    expect(story).toContain("blockedExamples")
    expect(story).toContain(
      "The theme stays elegant because the rules stay narrow",
    )
    expect(story).toContain("--ely-public-radius-sm")
    expect(story).toContain("--ely-public-radius-md")
    expect(story).toContain("--ely-public-radius-lg")
    expect(story).toContain("999px")
    expect(story).toContain("Color is a job")
    expect(story).toContain("Reject visual polish")
    expect(story).toContain("ely-story-radius-color-hero-panel")
    expect(story).toContain("ely-story-radius-color-role-panel")
    expect(story).toContain("ely-story-radius-color-scale-panel")
    expect(story).toContain("ely-story-radius-color-blocker-panel")
    expect(preview).toContain("storybook-foundations-radius-color.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme failure gallery story documents rejected theme examples", () => {
    const story = readStory("PublicThemeFailureGallery.stories.ts")

    expect(story).toContain("failureCases")
    expect(story).toContain("failureReviewOrder")
    expect(story).toContain("repairChecklist")
    expect(story).toContain(
      "A rejected design should teach the system what to protect",
    )
    expect(story).toContain("Color drift")
    expect(story).toContain("Mode mismatch")
    expect(story).toContain("Ornament overspend")
    expect(story).toContain("Action conflict")
    expect(story).toContain("Radius drift")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme system spec story consumes owner semantic token definitions", () => {
    const story = readStory("PublicThemeSystemSpec.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicThemeSemanticTokenDefinitions")
    expect(story).toContain("tokenGroups")
    expect(story).toContain("approvalRules")
    expect(story).toContain("Paired text")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("token pairing ledger exposes semantic pair review without local palette values", () => {
    const story = readStory("PublicTokenPairingLedger.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicThemeSemanticTokenDefinitions")
    expect(story).toContain("pairedTokenRows")
    expect(story).toContain("unpairedTokenRows")
    expect(story).toContain("pairingGates")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain(
      "Luxury color stays safe when every surface knows its text partner",
    )
    expect(story).toContain("Every container role names the text it expects")
    expect(story).toContain("Not every token needs a partner")
    expect(story).toContain("Pairs should survive real component composition")
    expect(story).toContain("not calculate contrast")
    expect(preview).toContain("storybook-foundations-token-pairing-ledger.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme role matrix compares launch roles without local palette values", () => {
    const story = readStory("PublicThemeRoleMatrix.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicThemeSemanticTokenDefinitions")
    expect(story).toContain("roleGroupCopy")
    expect(story).toContain("familyRoleGuidance")
    expect(story).toContain("routeSteps")
    expect(story).toContain(
      "Every theme family changes mood, not responsibility",
    )
    expect(story).toContain("Five responsibilities that prevent color drift")
    expect(story).toContain("One matrix, four moods, fixed responsibilities")
    expect(story).toContain("Light role proof")
    expect(story).toContain("Dark role proof")
    expect(story).toContain(
      "Do not approve a theme that only works as a mood board",
    )
    expect(preview).toContain("storybook-foundations-theme-role-matrix.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme family dossier exposes reviewer packets without local palette values", () => {
    const story = readStory("PublicThemeFamilyDossier.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("familyDossierCopy")
    expect(story).toContain("dossierChecks")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain(
      "A theme family is approved when its mood has a job",
    )
    expect(story).toContain("Best-fit surfaces")
    expect(story).toContain("Light proof")
    expect(story).toContain("Dark proof")
    expect(story).toContain("Ornament budget")
    expect(story).toContain("Blocker")
    expect(story).toContain("Mood must pass the same gates as structure")
    expect(story).toContain("Move from family dossier to proof")
    expect(story).toContain("A dossier should end in an operable surface")
    expect(story).toContain("does not create another palette")
    expect(preview).toContain("storybook-foundations-theme-family-dossier.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme selection playbook exposes family choice rules without local palette values", () => {
    const story = readStory("PublicThemeSelectionPlaybook.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("selectionLanes")
    expect(story).toContain("familySelectionGuidance")
    expect(story).toContain("selectionChecks")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain(
      "Choose the theme by user job before choosing the shine",
    )
    expect(story).toContain("Public launch")
    expect(story).toContain("Editorial campaign")
    expect(story).toContain("Clarity workspace")
    expect(story).toContain("Bridge surface")
    expect(story).toContain(
      "The four families are choices, not decoration presets",
    )
    expect(story).toContain(
      "A beautiful theme choice still needs a written reason",
    )
    expect(story).toContain("Selection only counts when proof is reachable")
    expect(story).toContain(
      "The chosen family must still operate like a product",
    )
    expect(story).toContain("does not create a second")
    expect(story).toContain("Petal rose action")
    expect(story).toContain("theme.personality")
    expect(story).toContain("theme.bestFor")
    expect(story).toContain("theme.designCue")
    expect(story).toContain("theme.expressionLevel")
    expect(story).toContain("ely-story-theme-selection-hero-panel")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain(
      "storybook-foundations-theme-selection-playbook.css",
    )
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme chooser provides user-facing theme selection without owning palette truth", () => {
    const story = readStory("PublicThemeChooser.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )
    const showcase = readFileSync(
      join(storyRoot, "public-luxe-showcase.ts"),
      "utf8",
    )

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("selectedThemeKey")
    expect(story).toContain("createStoryPath")
    expect(story).toContain("createThemeGlobalHref")
    expect(story).toContain("getPreviewStyle")
    expect(story).toContain("personalityChecks")
    expect(story).toContain("Let users choose a")
    expect(story).toContain("personality, not just a color")
    expect(story).toContain("Apply to Storybook toolbar")
    expect(story).toContain("Compare family roles")
    expect(story).toContain("Open component proof")
    expect(story).toContain(
      "public-luxe-foundations-theme-role-matrix--overview",
    )
    expect(story).toContain(
      "public-luxe-components-theme-specimen-wall--overview",
    )
    expect(story).toContain("Pick the identity first")
    expect(story).toContain("Theme personality strength")
    expect(story).toContain("The identity must survive light and dark")
    expect(story).toContain("Personalization still needs discipline")
    expect(story).toContain("theme.personality")
    expect(story).toContain("theme.bestFor")
    expect(story).toContain("theme.designCue")
    expect(story).toContain("theme.expressionLevel")
    expect(story).toContain("ely-story-theme-chooser-hero")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain("storybook-foundations-theme-chooser.css")
    expect(showcase).toContain("Theme Chooser")
    expect(showcase).toContain(
      "public-luxe-foundations-theme-chooser--overview",
    )
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("surface rhythm story documents layer hierarchy without local palette values", () => {
    const story = readStory("PublicSurfaceRhythm.stories.ts")

    expect(story).toContain("surfaceLayers")
    expect(story).toContain("densityBands")
    expect(story).toContain("spacingRules")
    expect(story).toContain("reviewQuestions")
    expect(story).toContain("ely-story-surface-principle")
    expect(story).toContain("ely-story-surface-anti-pattern")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("pattern composition story documents page assembly without local palette values", () => {
    const story = readStory("PublicPatternComposition.stories.ts")

    expect(story).toContain("compositionSlots")
    expect(story).toContain("assemblyRules")
    expect(story).toContain("patternMatrix")
    expect(story).toContain("ElyPublicImage")
    expect(story).toContain("ElyPublicEmptyState")
    expect(story).toContain("usePublicThemeArtwork")
    expect(story).toContain("ely-story-pattern-principle")
    expect(story).toContain("ely-story-pattern-recovery-panel")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("pattern index story exposes pattern approval evidence without local palette values", () => {
    const story = readStory("PublicPatternIndex.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicShowcaseEntries")
    expect(story).toContain("patternEntries")
    expect(story).toContain("patternReviewProfiles")
    expect(story).toContain("patternChoiceRows")
    expect(story).toContain("patternAssemblyGates")
    expect(story).toContain("patternReviewQuestions")
    expect(story).toContain("Pattern stories need approval evidence")
    expect(story).toContain("Choose the page grammar before composing the page")
    expect(story).toContain("Creator Center vs Theme Atelier")
    expect(story).toContain("Member Rewards vs Event Landing")
    expect(story).toContain("Editorial Collection vs Forms & Feedback")
    expect(story).toContain("Pattern page vs Foundation rule")
    expect(story).toContain("Primary action")
    expect(story).toContain("Blocking risk")
    expect(story).toContain("A pattern is approved by the order of decisions")
    expect(story).toContain("ely-story-pattern-index-hero")
    expect(story).toContain("ely-story-pattern-index-choice-panel")
    expect(story).toContain("ely-story-pattern-index-review-panel")
    expect(story).toContain("ely-story-pattern-index-question-panel")
    expect(story).toContain("ely-story-pattern-index-gate-panel")
    expect(story).toContain("patternFailureEntry")
    expect(story).toContain("Review pattern failure gallery")
    expect(story).toContain("Review pattern composition")
    expect(story).toContain("Review component evidence")
    expect(preview).toContain("storybook-pattern-index.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("pattern readiness board documents scenario handoff evidence without local palette values", () => {
    const story = readStory("PublicPatternReadinessBoard.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("patternReadinessRows")
    expect(story).toContain("readinessGates")
    expect(story).toContain("handoffChecks")
    expect(story).toContain(
      "Page samples become useful when their risks are visible",
    )
    expect(story).toContain("Approve patterns by evidence density")
    expect(story).toContain("Theme proof")
    expect(story).toContain("Component proof")
    expect(story).toContain("Mobile order")
    expect(story).toContain("Recovery path")
    expect(story).toContain("Before a pattern graduates from gallery to system")
    expect(story).toContain("Return to pattern index")
    expect(story).toContain("Review release gates")
    expect(story).toContain("Review component evidence")
    expect(preview).toContain("storybook-pattern-index.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("pattern failure gallery documents rejected page compositions without local palette values", () => {
    const story = readStory("PublicPatternFailureGallery.stories.ts")

    expect(story).toContain("patternFailureCases")
    expect(story).toContain("patternFailureReviewOrder")
    expect(story).toContain("repairChecklist")
    expect(story).toContain(
      "Rejected patterns should make the next good pattern easier",
    )
    expect(story).toContain("Competing primary actions")
    expect(story).toContain("Recovery path removed")
    expect(story).toContain("Form repair copy missing")
    expect(story).toContain("Ornament becomes layout")
    expect(story).toContain("Theme roles drift per section")
    expect(story).toContain("Do not fix pattern drift with more decoration")
    expect(story).toContain("Return to pattern evidence")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component anatomy story documents token-to-page layers without layout-only cards", () => {
    const story = readStory("PublicComponentAnatomy.stories.ts")

    expect(story).toContain("anatomyLayers")
    expect(story).toContain("anatomyRules")
    expect(story).toContain("One visual grammar from token to page")
    expect(story).toContain("Creator membership card anatomy")
    expect(story).toContain("Show the local state before adding decoration")
    expect(story).toContain("ely-story-anatomy-hero-panel")
    expect(story).toContain("ely-story-anatomy-example-panel")
    expect(story).toContain("ely-story-anatomy-rules-panel")
    expect(story).toContain("ely-story-anatomy-progress-panel")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component usage matrix story documents primitive choice without local palette values", () => {
    const story = readStory("PublicComponentUsageMatrix.stories.ts")

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("decisionLanes")
    expect(story).toContain("componentChoiceRows")
    expect(story).toContain("approvalRedLines")
    expect(story).toContain("patternRecipes")
    expect(story).toContain("reviewQuestions")
    expect(story).toContain("ElyPublicEmptyState")
    expect(story).toContain("ElyPublicProgress")
    expect(story).toContain("ely-story-component-usage-principle")
    expect(story).toContain("ely-story-component-usage-lane-panel")
    expect(story).toContain("ely-story-component-usage-specimen-panel")
    expect(story).toContain("ely-story-component-usage-choice-panel")
    expect(story).toContain("ely-story-component-usage-recipe-panel")
    expect(story).toContain("ely-story-component-usage-approval-panel")
    expect(story).toContain("Most review mistakes are primitive mismatches")
    expect(story).toContain("Button vs Link")
    expect(story).toContain("Checkbox vs Switch")
    expect(story).toContain("Select vs Radio Group")
    expect(story).toContain("Badge vs Alert")
    expect(story).toContain("Skeleton vs Progress")
    expect(story).toContain("Dialog vs Card")
    expect(story).toContain("Image vs Avatar")
    expect(story).toContain("Approval red lines")
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toContain('class="ely-public-card"')
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("component composition matrix story documents recipe assembly without local palette values", () => {
    const story = readStory("PublicComponentCompositionMatrix.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverageByName")
    expect(story).toContain("compositionLanes")
    expect(story).toContain("compositionRecipes")
    expect(story).toContain("guardrailGates")
    expect(story).toContain("reviewRoutes")
    expect(story).toContain(
      "Assemble public primitives into reviewable user flows",
    )
    expect(story).toContain(
      "Every component should know its job in the surface",
    )
    expect(story).toContain("Review the order before approving the look")
    expect(story).toContain("Claim or reserve surface")
    expect(story).toContain("Form repair cluster")
    expect(story).toContain("Preference atelier")
    expect(story).toContain("Editorial card stack")
    expect(story).toContain("Identity proof row")
    expect(story).toContain("Loading to recovery")
    expect(story).toContain("Focused confirmation")
    expect(story).toContain("Reject local improvisation")
    expect(story).toContain("ely-story-component-composition-hero-panel")
    expect(story).toContain("ely-story-component-composition-lane-panel")
    expect(story).toContain("ely-story-component-composition-recipe-panel")
    expect(story).toContain("ely-story-component-composition-approval-panel")
    expect(preview).toContain("storybook-component-composition-matrix.css")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("design review checklist story documents approval gates without local palette values", () => {
    const story = readStory("PublicDesignReviewChecklist.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("reviewGates")
    expect(story).toContain("componentGateRows")
    expect(story).toContain("themeGateRows")
    expect(story).toContain("Approve coherence before adding polish")
    expect(story).toContain("ely-story-review-gate-hero")
    expect(story).toContain("ely-story-review-theme-panel")
    expect(story).toContain("ely-story-review-component-panel")
    expect(story).toContain("ely-story-review-approval-panel")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("design principles story keeps governance rhythm flat without layout-only cards", () => {
    const story = readStory("PublicDesignPrinciples.stories.ts")

    expect(story).toContain("eleganceRules")
    expect(story).toContain("colorRoles")
    expect(story).toContain("radiusScale")
    expect(story).toContain("reviewQuestions")
    expect(story).toContain("ely-story-principle-hero")
    expect(story).toContain("ely-story-principle-role-panel")
    expect(story).toContain("ely-story-principle-radius-panel")
    expect(story).toContain("ely-story-principle-checklist-panel")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("foundations index story exposes approval lanes without local palette values", () => {
    const story = readStory("PublicFoundationsIndex.stories.ts")

    expect(story).toContain("publicShowcaseEntries")
    expect(story).toContain("foundationEntries")
    expect(story).toContain("approvalLanes")
    expect(story).toContain("requiredReviewQuestions")
    expect(story).toContain("Contract and theme")
    expect(story).toContain("release-gate-dashboard")
    expect(story).toContain("token-pairing-ledger")
    expect(story).toContain("theme-role-matrix")
    expect(story).toContain("theme-family-dossier")
    expect(story).toContain("theme-selection-playbook")
    expect(story).toContain("theme-readiness")
    expect(story).toContain("theme-customization-guardrails")
    expect(story).toContain("mode-pairing-lab")
    expect(story).toContain("radius-color-discipline")
    expect(story).toContain("theme-failure-gallery")
    expect(story).toContain("theme-application-recipes")
    expect(story).toContain("Component review")
    expect(story).toContain("component-acceptance-board")
    expect(story).toContain("component-handoff-dossier")
    expect(story).toContain("component-api-reference")
    expect(story).toContain("component-composition-matrix")
    expect(story).toContain("component-variant-matrix")
    expect(story).toContain("component-state-matrix")
    expect(story).toContain("component-scenario-atlas")
    expect(story).toContain("component-operability-board")
    expect(story).toContain("component-failure-gallery")
    expect(story).toContain("Composition rhythm")
    expect(story).toContain("pattern-index")
    expect(story).toContain("pattern-evidence-atlas")
    expect(story).toContain("pattern-readiness-board")
    expect(story).toContain("pattern-failure-gallery")
    expect(story).toContain("Expression and access")
    expect(story).toContain("ornament-budget")
    expect(story).toContain("Governance should be reviewable")
    expect(story).toContain("ely-story-foundation-index-hero")
    expect(story).toContain("ely-story-foundation-index-lane-panel")
    expect(story).toContain("ely-story-foundation-index-question-panel")
    expect(story).toContain("ely-story-foundation-index-map-panel")
    expect(story).toContain("Foundation story map")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("release gate dashboard summarizes launch evidence without local palette values", () => {
    const story = readStory("PublicReleaseGateDashboard.stories.ts")

    expect(story).toContain("publicThemePacks")
    expect(story).toContain("publicComponentDocs")
    expect(story).toContain("publicComponentScenarioCoverage")
    expect(story).toContain("releaseGateRows")
    expect(story).toContain("releaseReviewSequence")
    expect(story).toContain("evidenceChainKeys")
    expect(story).toContain("evidenceChain")
    expect(story).toContain("Approve the system by evidence, not by mood")
    expect(story).toContain("Theme family")
    expect(story).toContain("token-pairing-ledger")
    expect(story).toContain("theme-role-matrix")
    expect(story).toContain("theme-family-dossier")
    expect(story).toContain("theme-selection-playbook")
    expect(story).toContain("Visual discipline")
    expect(story).toContain("Component evidence")
    expect(story).toContain("component-acceptance-board")
    expect(story).toContain("component-api-reference")
    expect(story).toContain("component-variant-matrix")
    expect(story).toContain("component-state-matrix")
    expect(story).toContain("component-scenario-atlas")
    expect(story).toContain("component-operability-board")
    expect(story).toContain("component-composition-matrix")
    expect(story).toContain("Pattern readiness")
    expect(story).toContain("pattern-evidence-atlas")
    expect(story).toContain("pattern-readiness-board")
    expect(story).toContain("Trace approval from contract to repair")
    expect(story).toContain("Operability")
    expect(story).toContain("Do not skip straight to ornament")
    expect(story).toContain("ely-story-release-hero-panel")
    expect(story).toContain("ely-story-release-chain-panel")
    expect(story).toContain("ely-story-release-sequence-panel")
    expect(story).toContain("ely-story-release-sentence-panel")
    expect(story).toContain("public-luxe-showcase")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("typography and voice story documents content hierarchy without local palette values", () => {
    const story = readStory("PublicTypographyVoice.stories.ts")

    expect(story).toContain("typeRoles")
    expect(story).toContain("hierarchyRules")
    expect(story).toContain("voiceRules")
    expect(story).toContain("contentChecklist")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("material and motion story documents ornament rules without local palette values", () => {
    const story = readStory("PublicMaterialMotion.stories.ts")

    expect(story).toContain("materialLayers")
    expect(story).toContain("motionRules")
    expect(story).toContain("intensityScale")
    expect(story).toContain("reviewChecklist")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("ornament budget story documents restraint gates without local palette values", () => {
    const story = readStory("PublicOrnamentBudget.stories.ts")

    expect(story).toContain("budgetTiers")
    expect(story).toContain("surfaceBudgets")
    expect(story).toContain("blockers")
    expect(story).toContain("reviewQuestions")
    expect(story).toContain("Luxury becomes elegant when ornament has a limit")
    expect(story).toContain("Quiet")
    expect(story).toContain("Luminous")
    expect(story).toContain("Ceremonial")
    expect(story).toContain("Blocked")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("layout and density story documents responsive rhythm without local palette values", () => {
    const story = readStory("PublicLayoutDensity.stories.ts")

    expect(story).toContain("responsivePrinciples")
    expect(story).toContain("layoutBands")
    expect(story).toContain("mobileRules")
    expect(story).toContain("reviewChecklist")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("imagery and iconography story documents asset grammar without local palette values", () => {
    const story = readStory("PublicImageryIconography.stories.ts")

    expect(story).toContain("imageryRules")
    expect(story).toContain("imageRoles")
    expect(story).toContain("iconRules")
    expect(story).toContain("reviewChecklist")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("accessibility and inclusion story documents accessible review without local palette values", () => {
    const story = readStory("PublicAccessibilityInclusion.stories.ts")

    expect(story).toContain("accessibilityRules")
    expect(story).toContain("contrastChecks")
    expect(story).toContain("inclusionChecklist")
    expect(story).toContain("invalid-message")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("action hierarchy story documents decision order without local palette values", () => {
    const story = readStory("PublicActionHierarchy.stories.ts")

    expect(story).toContain("actionRules")
    expect(story).toContain("actionLanes")
    expect(story).toContain("reviewChecklist")
    expect(story).toContain("ely-story-action-principle")
    expect(story).toContain("ely-story-action-recovery-panel")
    expect(story).toContain("ElyPublicLink")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("data display and summary story documents summary grammar without local palette values", () => {
    const story = readStory("PublicDataDisplaySummary.stories.ts")

    expect(story).toContain("summaryRules")
    expect(story).toContain("metricClusters")
    expect(story).toContain("signalRows")
    expect(story).toContain("ElyPublicStat")
    expect(story).toContain("ElyPublicProgress")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("navigation and wayfinding story documents route hierarchy without local palette values", () => {
    const story = readStory("PublicNavigationWayfinding.stories.ts")

    expect(story).toContain("navigationRules")
    expect(story).toContain("navLanes")
    expect(story).toContain("routeStack")
    expect(story).toContain("ely-story-nav-principle")
    expect(story).toContain("ely-story-nav-hierarchy-panel")
    expect(story).toContain("ElyPublicTabs")
    expect(story).toContain("ElyPublicLink")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("forms and feedback pattern documents validation and recovery without local palette values", () => {
    const story = readStory("PublicFormsFeedback.stories.ts")
    const preview = readFileSync(
      join(storyRoot, "..", ".storybook", "preview.ts"),
      "utf8",
    )

    expect(story).toContain("publishModes")
    expect(story).toContain("reviewSteps")
    expect(story).toContain("handoffNotes")
    expect(story).toContain("ely-story-form-setup")
    expect(story).toContain("ely-story-form-handoff")
    expect(story).toContain("invalid-message")
    expect(story).toContain("ElyPublicProgress")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(preview).toContain("storybook-pattern-flat-pages.css")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("creator center pattern keeps page rhythm flat without layout-only card nesting", () => {
    const story = readStory("PublicCreatorCenter.stories.ts")

    expect(story).toContain("creatorPatternBrief")
    expect(story).toContain("ely-story-creator-layout")
    expect(story).toContain("Member cue lane")
    expect(story).toContain("Atmosphere preferences")
    expect(story).toContain("Structured sections instead of decorative sprawl")
    expect(story).toContain("ElyPublicTabs")
    expect(story).toContain("ElyPublicSwitch")
    expect(story).toContain("ElyPublicInput")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("theme atelier pattern keeps preference controls flat without layout-only card nesting", () => {
    const story = readStory("PublicThemeAtelier.stories.ts")

    expect(story).toContain("atelierPatternBrief")
    expect(story).toContain("ely-story-atelier-layout")
    expect(story).toContain("Theme and rhythm choices")
    expect(story).toContain("Live preview states")
    expect(story).toContain("ElyPublicSelect")
    expect(story).toContain("ElyPublicRadioGroup")
    expect(story).toContain("ElyPublicCheckbox")
    expect(story).toContain("ElyPublicSwitch")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("member rewards pattern documents reward hierarchy without local palette values", () => {
    const story = readStory("PublicMemberRewards.stories.ts")

    expect(story).toContain("rewardTabs")
    expect(story).toContain("rewardCards")
    expect(story).toContain("rewardPrinciples")
    expect(story).toContain("ely-story-rewards-lanes")
    expect(story).toContain("ely-story-rewards-benefit-list")
    expect(story).toContain("ely-story-rewards-rule-list")
    expect(story).toContain("ElyPublicStat")
    expect(story).toContain("ElyPublicProgress")
    expect(story.match(/class="ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("editorial collection pattern documents content hierarchy without local palette values", () => {
    const story = readStory("PublicEditorialCollection.stories.ts")

    expect(story).toContain("collectionTabs")
    expect(story).toContain("collectionCards")
    expect(story).toContain("collectionRules")
    expect(story).toContain("ely-story-editorial-lanes")
    expect(story).toContain("ely-story-editorial-guardrails")
    expect(story).toContain("ElyPublicImage")
    expect(story).toContain("usePublicThemeArtwork")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test("event landing pattern documents registration hierarchy without local palette values", () => {
    const story = readStory("PublicEventLanding.stories.ts")

    expect(story).toContain("eventTabs")
    expect(story).toContain("agendaItems")
    expect(story).toContain("eventRules")
    expect(story).toContain("ely-story-event-lanes")
    expect(story).toContain("ely-story-event-guardrails")
    expect(story).toContain("ElyPublicImage")
    expect(story).toContain("ElyPublicProgress")
    expect(story).toContain("usePublicThemeArtwork")
    expect(story.match(/class=\"ely-public-card/g)?.length ?? 0).toBe(0)
    expect(story).not.toContain("ElyPublicCard")
    expect(story).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  test.todo("stories keep static layout rhythm in showcase CSS", () => {
    const disallowedInlineStyle =
      /(?<!:)style="[^"]*(?:color:|background(?!-size|-position|-image):|font-size:|font-weight:|font-family:|margin:|padding:|border:)[^"]*"/

    for (const fileName of publicStoryFiles()) {
      const story = readStory(fileName)

      expect(
        story,
        `${fileName} should use showcase classes instead of static inline styles`,
      ).not.toMatch(disallowedInlineStyle)
    }
  })

  test("showcase CSS reuses public tokens instead of defining a second visual system", () => {
    const showcaseCss = readStoryCss()

    expect(collectStaticColorUsages(showcaseCss)).toEqual([])
    expect(collectOversizedRadiusDeclarations(showcaseCss)).toEqual([])
    expect(collectOffScaleRadiusDeclarations(showcaseCss)).toEqual([])
  })

  test("storybook display CSS stays split into reviewable files", () => {
    for (const fileName of readdirSync(storyRoot).filter(
      (fileName) =>
        fileName.startsWith("storybook-") && fileName.endsWith(".css"),
    )) {
      const css = readFileSync(join(storyRoot, fileName), "utf8")

      expect(
        css.split(/\r?\n/).length,
        `${fileName} should stay reviewable`,
      ).toBeLessThan(1500)
    }
  })

  test("storybook browser smokes fail on iframe console warnings and errors", () => {
    for (const fileName of [
      "e2e-storybook-public-components.ts",
      "e2e-storybook-public-patterns.ts",
      "e2e-storybook-theme-system.ts",
    ]) {
      const script = readFileSync(join(scriptRoot, fileName), "utf8")

      expect(script).toContain("createStorybookConsoleWatcher")
      expect(script).toContain("assertNoStorybookConsoleIssues")
      expect(script).toContain("countStorybookConsoleIssues")
      expect(script).toContain("consoleIssueCount")
      expect(script).toContain("--exact-port")
    }
  })
})
