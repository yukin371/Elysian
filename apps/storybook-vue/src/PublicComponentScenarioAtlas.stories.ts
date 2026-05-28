import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusCounts,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCount,
  publicComponentScenarioCoverage,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const reviewFocusOrder: PublicComponentReviewFocus[] = [
  "state",
  "interaction",
  "feedback",
  "accessibility",
  "composition",
  "content",
  "density",
]

const focusIntent: Record<PublicComponentReviewFocus, string> = {
  accessibility:
    "Keyboard, labels, focus, and non-color cues must be visible before ornament is approved.",
  composition:
    "The scenario must show how the primitive behaves inside a real public surface.",
  content:
    "Copy, labels, and helper text should explain the user job without becoming marketing fog.",
  density:
    "Spacing and size choices should stay usable on compact and mobile surfaces.",
  feedback:
    "The user should see repair, status, or progress without guessing from color alone.",
  interaction:
    "The component must prove focus, selection, dismissal, or runtime control paths.",
  state:
    "Variants, disabled, selected, loading, and invalid states should be reviewable.",
}

const scenarioRows = publicComponentScenarioCoverage.flatMap((coverage) => {
  const doc = publicComponentDocs[coverage.component]

  return coverage.scenarios.map((scenario) => ({
    category: doc.category,
    component: coverage.component,
    description: doc.description,
    doc,
    fileName: coverage.fileName,
    scenario,
  }))
})

const focusLanes = reviewFocusOrder.map((focus) => {
  const rows = scenarioRows.filter((row) =>
    row.scenario.reviewFocus.includes(focus),
  )

  return {
    count:
      publicComponentReviewFocusCounts.find((item) => item.focus === focus)
        ?.count ?? rows.length,
    focus,
    intent: focusIntent[focus],
    label: publicComponentReviewFocusLabels[focus],
    previewRows: rows.slice(0, 5),
  }
})

const categoryOrder = ["actions", "form", "feedback", "navigation", "content"]
const categoryLabels = {
  actions: "Actions",
  content: "Content",
  feedback: "Feedback",
  form: "Form",
  navigation: "Navigation",
} as const

const categoryLanes = categoryOrder.map((category) => {
  const rows = scenarioRows.filter((row) => row.category === category)
  const focusSummary = reviewFocusOrder
    .map((focus) => ({
      count: rows.filter((row) => row.scenario.reviewFocus.includes(focus))
        .length,
      focus,
      label: publicComponentReviewFocusLabels[focus],
    }))
    .filter((item) => item.count > 0)

  return {
    category,
    focusSummary,
    label: categoryLabels[category as keyof typeof categoryLabels],
    rows,
  }
})

const criticalPath = [
  {
    copy: "Start from owner docs and scenario density before judging page-level polish.",
    entryKey: "component-index",
    label: "Coverage",
  },
  {
    copy: "Use the acceptance board when a reviewer needs a per-component release-style verdict.",
    entryKey: "component-acceptance-board",
    label: "Acceptance",
  },
  {
    copy: "Open the scenario atlas when a reviewer asks which exact story proves a risk.",
    entryKey: "component-scenario-atlas",
    label: "Scenario atlas",
  },
  {
    copy: "Check component bundles before treating scenario proof as page composition readiness.",
    entryKey: "component-composition-matrix",
    label: "Composition",
  },
  {
    copy: "Check risky runtime behavior after static scenario evidence looks complete.",
    entryKey: "component-operability-board",
    label: "Operability",
  },
  {
    copy: "Reject semantic drift before asking for new variants or decorative wrappers.",
    entryKey: "component-failure-gallery",
    label: "Failure gallery",
  },
] as const

const getEntry = (key: string) =>
  publicShowcaseEntries.find((entry) => entry.key === key)

const meta = {
  title: "Public Luxe/Components/Scenario Atlas",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Coverage: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const criticalEntries = criticalPath.map((step) => ({
        ...step,
        entry: getEntry(step.entryKey),
      }))

      return {
        categoryLanes,
        componentCount: String(publicComponentScenarioCoverage.length),
        createStoryPath,
        criticalEntries,
        focusLanes,
        scenarioCount: String(publicComponentScenarioCount),
        scenarioRows,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-scenario-atlas-hero-panel">
            <p class="ely-public-eyebrow">Component scenario atlas</p>
            <h1 class="ely-public-section-title">Every detailed story should prove a review risk</h1>
            <p class="ely-public-copy">
              This atlas gives reviewers a direct route through the detailed
              component scenarios. It consumes the Storybook coverage manifest
              and owner component docs; it does not own props, states, tokens,
              or a second component API.
            </p>

            <div class="ely-story-scenario-atlas-stats" aria-label="Component scenario atlas coverage">
              <ElyPublicStat
                :value="componentCount"
                eyebrow="Components"
                helper="Public primitives represented in the scenario manifest."
                tone="primary"
              >
                documented primitives
              </ElyPublicStat>
              <ElyPublicStat
                :value="scenarioCount"
                eyebrow="Detailed stories"
                helper="Scenario-level review stops beyond playground examples."
                tone="accent"
              >
                review proofs
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(focusLanes.length)"
                eyebrow="Review focuses"
                helper="Risk lanes used by Components / Index and static tests."
                tone="success"
              >
                risk lenses
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-scenario-atlas-layout">
            <article class="ely-story-scenario-route-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from coverage to operability before variants</h2>
              <div class="ely-story-scenario-route ely-story-offset-md">
                <a
                  v-for="(step, index) in criticalEntries"
                  :key="step.label"
                  class="ely-story-scenario-route-step"
                  :href="step.entry ? createStoryPath(step.entry.storyId) : '#'"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ step.entry?.title ?? step.label }}</strong>
                  <p>{{ step.copy }}</p>
                </a>
              </div>
            </article>

            <article class="ely-story-scenario-approval-panel">
              <p class="ely-public-eyebrow">Approval sentence</p>
              <h2 class="ely-public-section-title">A scenario is useful only when it blocks a bad decision</h2>
              <ElyPublicText class="ely-story-offset-md">
                Use this page when a component feels visually complete but the
                reviewer cannot name which story proves invalid, loading,
                keyboard, copy, density, or composition behavior.
              </ElyPublicText>
              <ElyPublicDivider label="Do not approve from mood" align="start" />
              <ElyPublicText tone="muted">
                Pretty primitive samples are not enough. The atlas should point
                to the concrete story that proves the risky user job.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-story-scenario-focus-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Risk lanes</p>
                <h2 class="ely-public-section-title">Scan the system by what could fail</h2>
              </div>
              <p>
                Focus lanes keep the public theme elegant by asking for proof,
                not louder decoration.
              </p>
            </div>

            <div class="ely-story-scenario-focus-grid">
              <article
                v-for="lane in focusLanes"
                :key="lane.focus"
                class="ely-story-scenario-focus-card"
              >
                <div class="ely-story-scenario-focus-head">
                  <ElyPublicBadge tone="primary">{{ lane.count }} stories</ElyPublicBadge>
                  <strong>{{ lane.label }}</strong>
                </div>
                <p>{{ lane.intent }}</p>
                <div class="ely-story-scenario-mini-list">
                  <ElyPublicLink
                    v-for="row in lane.previewRows"
                    :key="lane.focus + row.scenario.storyId"
                    :href="createStoryPath(row.scenario.storyId)"
                  >
                    {{ row.component }} · {{ row.scenario.label }}
                  </ElyPublicLink>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-scenario-family-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Component families</p>
                <h2 class="ely-public-section-title">Detailed scenarios stay grouped by user job</h2>
              </div>
              <p>
                Family lanes help compare actions, forms, feedback, navigation,
                and content without collapsing them into one generic gallery.
              </p>
            </div>

            <div class="ely-story-scenario-family-list">
              <article
                v-for="lane in categoryLanes"
                :key="lane.category"
                class="ely-story-scenario-family"
              >
                <div class="ely-story-scenario-family-head">
                  <div>
                    <span>{{ lane.category }}</span>
                    <h3>{{ lane.label }}</h3>
                  </div>
                  <ElyPublicBadge tone="accent">{{ lane.rows.length }} scenarios</ElyPublicBadge>
                </div>
                <div class="ely-story-scenario-family-focus">
                  <span
                    v-for="focus in lane.focusSummary"
                    :key="lane.category + focus.focus"
                  >
                    <strong>{{ focus.count }}</strong>
                    {{ focus.label }}
                  </span>
                </div>
                <div class="ely-story-scenario-table" role="list">
                  <a
                    v-for="row in lane.rows"
                    :key="row.scenario.storyId"
                    class="ely-story-scenario-row"
                    :href="createStoryPath(row.scenario.storyId)"
                    target="_top"
                    rel="noreferrer"
                    role="listitem"
                  >
                    <span>{{ row.component }}</span>
                    <strong>{{ row.scenario.label }}</strong>
                    <em>{{ row.fileName }}</em>
                    <small>
                      {{ row.scenario.reviewFocus.map((focus) => focus).join(' / ') }}
                    </small>
                  </a>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
