import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicComponentCategory,
  ElyPublicComponentDoc,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCoverageByName,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const categoryLabels: Record<ElyPublicComponentCategory, string> = {
  actions: "Actions",
  content: "Content",
  feedback: "Feedback",
  form: "Form",
  navigation: "Navigation",
}

const categoryOrder: ElyPublicComponentCategory[] = [
  "actions",
  "form",
  "feedback",
  "navigation",
  "content",
]

const riskFocusOrder: PublicComponentReviewFocus[] = [
  "state",
  "interaction",
  "feedback",
  "accessibility",
]

const reviewRouteKeys = [
  "component-index",
  "component-acceptance-board",
  "component-api-reference",
  "component-composition-matrix",
  "component-variant-matrix",
  "component-state-matrix",
  "component-scenario-atlas",
  "component-operability-board",
] as const

const reviewRoutes = reviewRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const componentDocsRoute = (component: ElyPublicComponentDoc) =>
  `/docs/public-luxe-components-${component.name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const componentEntries = Object.entries(publicComponentDocs).map(
  ([key, component]) => {
    const scenarioCoverage = publicComponentScenarioCoverageByName.get(
      key as keyof typeof publicComponentDocs,
    )
    const scenarios = scenarioCoverage?.scenarios ?? []
    const riskFocus = riskFocusOrder.filter((focus) =>
      scenarios.some((scenario) => scenario.reviewFocus.includes(focus)),
    )
    const riskScenarioCount = scenarios.filter((scenario) =>
      scenario.reviewFocus.some((focus) => riskFocusOrder.includes(focus)),
    ).length

    return {
      component,
      key,
      riskFocus,
      riskScenarioCount,
      scenarioCoverage,
      stateScore:
        component.states.length +
        component.accessibility.length +
        riskScenarioCount,
    }
  },
)

const categoryGroups = categoryOrder
  .map((category) => {
    const components = componentEntries.filter(
      (entry) => entry.component.category === category,
    )

    return {
      category,
      components,
      label: categoryLabels[category],
      stateCount: components.reduce(
        (total, entry) => total + entry.component.states.length,
        0,
      ),
      accessCount: components.reduce(
        (total, entry) => total + entry.component.accessibility.length,
        0,
      ),
    }
  })
  .filter((group) => group.components.length > 0)

const totalStates = componentEntries.reduce(
  (total, entry) => total + entry.component.states.length,
  0,
)
const totalAccessibilityNotes = componentEntries.reduce(
  (total, entry) => total + entry.component.accessibility.length,
  0,
)
const totalRiskScenarios = componentEntries.reduce(
  (total, entry) => total + entry.riskScenarioCount,
  0,
)
const totalBlockedAntiPatterns = componentEntries.reduce(
  (total, entry) => total + entry.component.antiPatterns.length,
  0,
)

const stateReviewGates = [
  {
    label: "State named",
    proof:
      "Every approved state needs visible copy in owner docs before Storybook treats it as reusable.",
  },
  {
    label: "A11y named",
    proof:
      "Keyboard, role, focus, alert, or reading-order requirements must stay visible near the state.",
  },
  {
    label: "Scenario linked",
    proof:
      "Risky states should link to at least one detailed scenario, not only a static prop table.",
  },
  {
    label: "Repair visible",
    proof:
      "Invalid, empty, loading, disabled, and blocked states should expose a correction or explanation path.",
  },
] as const

const focusLabel = (focus: PublicComponentReviewFocus) =>
  publicComponentReviewFocusLabels[focus]

const meta = {
  title: "Public Luxe/Components/State Matrix",
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
      return {
        categoryGroups,
        componentDocsRoute,
        createStoryPath,
        focusLabel,
        reviewRoutes,
        stateReviewGates,
        totalAccessibilityNotes: String(totalAccessibilityNotes),
        totalBlockedAntiPatterns: String(totalBlockedAntiPatterns),
        totalRiskScenarios: String(totalRiskScenarios),
        totalStates: String(totalStates),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-state-hero-panel">
            <p class="ely-public-eyebrow">Component state matrix</p>
            <h1 class="ely-public-section-title">Review states where users can actually get stuck</h1>
            <p class="ely-public-copy">
              This matrix puts state notes, accessibility notes, risky scenario
              coverage, and anti-pattern blockers in the same view. It is meant
              for the uncomfortable review moment: before a primitive looks
              beautiful, can users recover, navigate, understand, and continue?
            </p>

            <div class="ely-story-state-stats" aria-label="Component state and accessibility coverage">
              <ElyPublicStat
                :value="totalStates"
                eyebrow="States"
                helper="Owner-documented visible and behavioral states."
                tone="primary"
              >
                state notes
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalAccessibilityNotes"
                eyebrow="A11y"
                helper="Owner-documented accessibility expectations."
                tone="accent"
              >
                access notes
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalRiskScenarios"
                eyebrow="Risk stories"
                helper="Detailed scenarios with state, interaction, feedback, or accessibility focus."
                tone="success"
              >
                proof links
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalBlockedAntiPatterns"
                eyebrow="Blockers"
                helper="Anti-pattern notes that should stop unsafe state expansion."
                tone="primary"
              >
                reject notes
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-state-layout">
            <article class="ely-story-state-route-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from API shape to state proof</h2>
              <div class="ely-story-state-route ely-story-offset-md">
                <a
                  v-for="(entry, index) in reviewRoutes"
                  :key="entry.key"
                  class="ely-story-state-route-step"
                  :href="createStoryPath(entry.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ entry.title }}</strong>
                  <p>{{ entry.description }}</p>
                </a>
              </div>
            </article>

            <article class="ely-story-state-gate-panel">
              <p class="ely-public-eyebrow">State gates</p>
              <h2 class="ely-public-section-title">Approve the recovery path before the ornament</h2>
              <div class="ely-story-state-gates ely-story-offset-md">
                <div
                  v-for="gate in stateReviewGates"
                  :key="gate.label"
                  class="ely-story-state-gate"
                >
                  <ElyPublicBadge tone="warning">{{ gate.label }}</ElyPublicBadge>
                  <ElyPublicText tone="muted">{{ gate.proof }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-state-family-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">State families</p>
                <h2 class="ely-public-section-title">Audit state, access, proof, and blocker together</h2>
              </div>
              <p>
                A state is not approved by naming it. It should have visible
                behavior, accessible semantics, scenario evidence, and a clear
                anti-pattern boundary.
              </p>
            </div>

            <div class="ely-story-state-group-list">
              <article
                v-for="group in categoryGroups"
                :key="group.category"
                class="ely-story-state-group"
              >
                <div class="ely-story-state-group-head">
                  <div>
                    <span>{{ group.category }}</span>
                    <h3>{{ group.label }}</h3>
                  </div>
                  <ElyPublicBadge tone="accent">
                    {{ group.stateCount }} states · {{ group.accessCount }} a11y notes
                  </ElyPublicBadge>
                </div>

                <div class="ely-story-state-card-list">
                  <article
                    v-for="entry in group.components"
                    :key="entry.key"
                    class="ely-story-state-card"
                  >
                    <div class="ely-story-state-card-head">
                      <div>
                        <span>{{ entry.component.category }}</span>
                        <h4>{{ entry.component.name }}</h4>
                      </div>
                      <ElyPublicBadge :tone="entry.riskScenarioCount > 0 ? 'primary' : 'warning'">
                        state score {{ entry.stateScore }}
                      </ElyPublicBadge>
                    </div>

                    <ElyPublicText tone="muted">{{ entry.component.description }}</ElyPublicText>

                    <div class="ely-story-state-columns">
                      <div class="ely-story-state-section">
                        <strong>State notes</strong>
                        <ul>
                          <li
                            v-for="state in entry.component.states"
                            :key="entry.key + state.name"
                          >
                            <span>{{ state.name }}</span>
                            <p>{{ state.description }}</p>
                          </li>
                        </ul>
                      </div>

                      <div class="ely-story-state-section">
                        <strong>Accessibility notes</strong>
                        <ul>
                          <li
                            v-for="note in entry.component.accessibility"
                            :key="entry.key + note"
                          >
                            <span>A11y</span>
                            <p>{{ note }}</p>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div class="ely-story-state-proof">
                      <div>
                        <strong>Risk focus</strong>
                        <div class="ely-story-state-chip-list">
                          <span
                            v-for="focus in entry.riskFocus"
                            :key="entry.key + focus"
                            class="ely-story-state-chip"
                          >
                            {{ focusLabel(focus) }}
                          </span>
                        </div>
                      </div>

                      <div>
                        <strong>Proof scenarios</strong>
                        <div class="ely-story-state-scenario-list">
                          <ElyPublicLink
                            v-for="scenario in entry.scenarioCoverage?.scenarios ?? []"
                            :key="scenario.storyId"
                            :href="createStoryPath(scenario.storyId)"
                          >
                            {{ scenario.label }}
                          </ElyPublicLink>
                        </div>
                      </div>
                    </div>

                    <ElyPublicDivider label="State blocker" align="start" />

                    <div class="ely-story-state-warning">
                      <ElyPublicBadge tone="danger">Avoid</ElyPublicBadge>
                      <ElyPublicText tone="muted">
                        {{ entry.component.antiPatterns[0] }}
                      </ElyPublicText>
                      <ElyPublicLink :href="componentDocsRoute(entry.component)">
                        Open owner docs
                      </ElyPublicLink>
                    </div>
                  </article>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
