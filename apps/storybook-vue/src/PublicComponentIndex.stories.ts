import { publicComponentDocs } from "@elysian/ui-public-vue"
import type {
  ElyPublicComponentCategory,
  ElyPublicComponentDoc,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusCounts,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCount,
  publicComponentScenarioCoverageByName,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

type PublicComponentIndexFocus = PublicComponentReviewFocus | "all"
type PublicComponentReadinessStatus = "needs-attention" | "review-ready"

interface PublicComponentReadinessGate {
  detail: string
  key: string
  label: string
  passed: boolean
}

interface PublicComponentReadiness {
  gateCount: number
  gates: PublicComponentReadinessGate[]
  label: string
  score: number
  status: PublicComponentReadinessStatus
}

interface PublicComponentCategoryReviewSummary {
  category: ElyPublicComponentCategory
  componentCount: number
  focusCounts: {
    count: number
    focus: PublicComponentReviewFocus
    label: string
  }[]
  label: string
  reviewReady: number
  scenarioCount: number
}

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

const documentedComponentEntries = Object.entries(publicComponentDocs).map(
  ([key, component]) => ({
    component,
    key: key as keyof typeof publicComponentDocs,
  }),
)
const documentedComponents = documentedComponentEntries.map(
  (entry) => entry.component,
)
const requiredRiskFocus = new Set<PublicComponentReviewFocus>([
  "accessibility",
  "feedback",
  "interaction",
  "state",
])
const totalProps = documentedComponents.reduce(
  (total, component) => total + component.props.length,
  0,
)
const totalStates = documentedComponents.reduce(
  (total, component) => total + component.states.length,
  0,
)
const totalAccessibilityNotes = documentedComponents.reduce(
  (total, component) => total + component.accessibility.length,
  0,
)
const totalDecisionNotes = documentedComponents.reduce(
  (total, component) => total + component.decision.length,
  0,
)
const totalAntiPatterns = documentedComponents.reduce(
  (total, component) => total + component.antiPatterns.length,
  0,
)

const buildComponentGroups = (
  entries: typeof documentedComponentEntries = documentedComponentEntries,
) =>
  categoryOrder
    .map((category) => ({
      category,
      label: categoryLabels[category],
      components: entries.filter(
        (entry) => entry.component.category === category,
      ),
    }))
    .filter((group) => group.components.length > 0)

const getComponentRoute = (component: ElyPublicComponentDoc) =>
  `/docs/public-luxe-components-${component.name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const getScenarioCoverage = (componentKey: keyof typeof publicComponentDocs) =>
  publicComponentScenarioCoverageByName.get(componentKey)

const buildComponentReadiness = (
  componentKey: keyof typeof publicComponentDocs,
  component: ElyPublicComponentDoc,
): PublicComponentReadiness => {
  const scenarioCoverage = getScenarioCoverage(componentKey)
  const scenarios = scenarioCoverage?.scenarios ?? []
  const reviewFocus = new Set(
    scenarios.flatMap((scenario) => scenario.reviewFocus),
  )
  const gates: PublicComponentReadinessGate[] = [
    {
      detail:
        "usage, decision, composition, anti-patterns, states, props, and accessibility notes are all present",
      key: "owner-docs",
      label: "Owner docs",
      passed:
        component.usage.length > 0 &&
        component.decision.length > 0 &&
        component.composition.length > 0 &&
        component.antiPatterns.length > 0 &&
        component.states.length > 0 &&
        component.props.length > 0 &&
        component.accessibility.length > 0,
    },
    {
      detail:
        "at least two detailed Storybook scenarios exist for component-level review",
      key: "scenario-depth",
      label: "Scenario depth",
      passed: scenarios.length >= 2,
    },
    {
      detail:
        "review focus covers at least one high-risk area: state, interaction, feedback, or accessibility",
      key: "risk-lane",
      label: "Risk lane",
      passed: [...requiredRiskFocus].some((focus) => reviewFocus.has(focus)),
    },
    {
      detail:
        "the index can route reviewers to concrete detailed scenarios instead of a shallow showcase",
      key: "story-links",
      label: "Story links",
      passed: scenarios.every((scenario) => scenario.storyId.length > 0),
    },
  ]
  const score = gates.filter((gate) => gate.passed).length
  const status: PublicComponentReadinessStatus =
    score === gates.length ? "review-ready" : "needs-attention"

  return {
    gateCount: gates.length,
    gates,
    label: status === "review-ready" ? "Review ready" : "Needs attention",
    score,
    status,
  }
}

const componentReadinessByKey = new Map(
  documentedComponentEntries.map((entry) => [
    entry.key,
    buildComponentReadiness(entry.key, entry.component),
  ]),
)
const readinessSummary = [...componentReadinessByKey.values()].reduce(
  (summary, readiness) => {
    if (readiness.status === "review-ready") {
      summary.reviewReady += 1
    } else {
      summary.needsAttention += 1
    }

    summary.passedGates += readiness.score
    summary.totalGates += readiness.gateCount
    return summary
  },
  {
    needsAttention: 0,
    passedGates: 0,
    reviewReady: 0,
    totalGates: 0,
  },
)

const getComponentReadiness = (
  componentKey: keyof typeof publicComponentDocs,
) => componentReadinessByKey.get(componentKey)

const categoryReviewSummaries: PublicComponentCategoryReviewSummary[] =
  categoryOrder
    .map((category) => {
      const entries = documentedComponentEntries.filter(
        (entry) => entry.component.category === category,
      )
      const scenarios = entries.flatMap(
        (entry) => getScenarioCoverage(entry.key)?.scenarios ?? [],
      )

      return {
        category,
        componentCount: entries.length,
        focusCounts: publicComponentReviewFocusCounts
          .map((focus) => ({
            ...focus,
            count: scenarios.filter((scenario) =>
              scenario.reviewFocus.includes(focus.focus),
            ).length,
          }))
          .filter((focus) => focus.count > 0),
        label: categoryLabels[category],
        reviewReady: entries.filter(
          (entry) =>
            getComponentReadiness(entry.key)?.status === "review-ready",
        ).length,
        scenarioCount: scenarios.length,
      }
    })
    .filter((summary) => summary.componentCount > 0)

const componentFailureEntry = publicShowcaseEntries.find(
  (entry) => entry.key === "component-failure-gallery",
)
const componentReviewRouteKeys = [
  "component-theme-specimen-wall",
  "component-decision-workshop",
  "component-mobile-density-review",
  "component-acceptance-board",
  "component-api-reference",
  "component-state-matrix",
  "component-operability-board",
  "component-failure-gallery",
] as const
const componentReviewRoutes = componentReviewRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

const componentHasFocus = (
  componentKey: keyof typeof publicComponentDocs,
  selectedFocus: PublicComponentIndexFocus,
) =>
  selectedFocus === "all" ||
  (getScenarioCoverage(componentKey)?.scenarios.some((scenario) =>
    scenario.reviewFocus.includes(selectedFocus),
  ) ??
    false)

const filterScenariosByFocus = (
  componentKey: keyof typeof publicComponentDocs,
  selectedFocus: PublicComponentIndexFocus,
) => {
  const scenarios = getScenarioCoverage(componentKey)?.scenarios ?? []

  if (selectedFocus === "all") {
    return scenarios
  }

  return scenarios.filter((scenario) =>
    scenario.reviewFocus.includes(selectedFocus),
  )
}

const buildReviewLaneSnapshot = (selectedFocus: PublicComponentIndexFocus) => {
  const components = documentedComponentEntries
    .map((entry) => ({
      component: entry.component.name,
      scenarios: filterScenariosByFocus(entry.key, selectedFocus),
    }))
    .filter((entry) => entry.scenarios.length > 0)
  const scenarios = components.flatMap((entry) =>
    entry.scenarios.map((scenario) => ({
      ...scenario,
      component: entry.component,
    })),
  )

  return {
    componentCount: components.length,
    components: components.map((entry) => entry.component),
    label:
      selectedFocus === "all"
        ? "All review focus areas"
        : publicComponentReviewFocusLabels[selectedFocus],
    previewScenarios: scenarios.slice(0, 6),
    scenarioCount: scenarios.length,
  }
}

const meta = {
  title: "Public Luxe/Components/Index",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Metadata-driven public component index for review coverage, component boundaries, and Storybook entry points.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Coverage: Story = {
  render: () => ({
    setup() {
      const selectedFocus = ref<PublicComponentIndexFocus>("all")
      const focusOptions = computed(() => [
        {
          count: publicComponentScenarioCount,
          focus: "all" as const,
          label: "All scenarios",
        },
        ...publicComponentReviewFocusCounts,
      ])
      const visibleComponentGroups = computed(() =>
        buildComponentGroups(
          documentedComponentEntries.filter((entry) =>
            componentHasFocus(entry.key, selectedFocus.value),
          ),
        ),
      )
      const visibleComponentCount = computed(() =>
        visibleComponentGroups.value.reduce(
          (total, group) => total + group.components.length,
          0,
        ),
      )
      const selectedReviewLane = computed(() =>
        buildReviewLaneSnapshot(selectedFocus.value),
      )
      const selectFocus = (focus: PublicComponentIndexFocus) => {
        selectedFocus.value = focus
      }

      return {
        categoryReviewSummaries,
        componentFailureEntry,
        componentReviewRoutes,
        createStoryPath,
        documentedComponents,
        filterScenariosByFocus,
        focusOptions,
        getComponentRoute,
        publicComponentReviewFocusCounts,
        publicComponentReviewFocusLabels,
        selectFocus,
        selectedReviewLane,
        selectedFocus,
        readinessSummary,
        totalAccessibilityNotes,
        totalAntiPatterns,
        totalDecisionNotes,
        totalProps,
        publicComponentScenarioCount,
        totalStates,
        getComponentReadiness,
        getScenarioCoverage,
        visibleComponentCount,
        visibleComponentGroups,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Component documentation index</p>
            <h1 class="ely-public-section-title">A governed map for the public luxe component set</h1>
            <p class="ely-public-copy">
              This story is generated from the same metadata exported by
              ui-public-vue, so it behaves like a coverage surface instead of a
              second hand-written design document. Use it to review whether the
              system has enough component depth before adding new showcase pages.
            </p>

            <div class="ely-story-index-stats" aria-label="Component documentation coverage">
              <div class="ely-story-index-stat">
                <strong>{{ documentedComponents.length }}</strong>
                <span>documented components</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ totalProps }}</strong>
                <span>documented props</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ totalStates }}</strong>
                <span>state notes</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ totalAccessibilityNotes }}</strong>
                <span>a11y notes</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ totalDecisionNotes }}</strong>
                <span>decision notes</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ totalAntiPatterns }}</strong>
                <span>anti-patterns</span>
              </div>
              <div class="ely-story-index-stat">
                <strong>{{ publicComponentScenarioCount }}</strong>
                <span>scenario stories</span>
              </div>
              <div class="ely-story-index-stat" data-kind="readiness">
                <strong>{{ readinessSummary.reviewReady }}</strong>
                <span>review ready</span>
              </div>
            </div>

            <div class="ely-story-index-readiness" aria-label="Component review readiness gates">
              <div>
                <p class="ely-public-eyebrow">Review readiness gates</p>
                <h2 class="ely-story-index-filter-title">Design approval starts with evidence</h2>
                <p>
                  {{ readinessSummary.passedGates }} of {{ readinessSummary.totalGates }}
                  component gates pass across owner docs, scenario depth, risk lanes, and story links.
                  {{ readinessSummary.needsAttention }} component{{ readinessSummary.needsAttention === 1 ? '' : 's' }}
                  still need attention before they should be treated as approved.
                </p>
              </div>
              <div class="ely-story-index-readiness-bars">
                <span
                  v-for="entry in visibleComponentGroups.flatMap((group) => group.components)"
                  :key="entry.key"
                  :data-status="getComponentReadiness(entry.key)?.status"
                  :title="entry.component.name + ' · ' + getComponentReadiness(entry.key)?.label"
                >
                  {{ entry.component.name }}
                </span>
              </div>
            </div>

            <div class="ely-story-index-review-route" aria-label="Component review route">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Review route</p>
                  <h2 class="ely-story-index-filter-title">Start visual, then prove behavior</h2>
                </div>
                <p>
                  Use the specimen wall for first-pass coherence, then move into contract, state,
                  operability, and failure evidence before approving the component set.
                </p>
              </div>
              <div class="ely-story-index-review-route-grid">
                <a
                  v-for="(entry, index) in componentReviewRoutes"
                  :key="entry.key"
                  :href="createStoryPath(entry.storyId)"
                >
                  <span>{{ String(index + 1).padStart(2, '0') }}</span>
                  <strong>{{ entry.title }}</strong>
                  <small>{{ entry.stat }}</small>
                </a>
              </div>
            </div>

            <div class="ely-story-index-category-board" aria-label="Category review board">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Category readiness board</p>
                  <h2 class="ely-story-index-filter-title">Review the system by component family</h2>
                </div>
                <p>
                  Each lane summarizes how much review evidence exists before a category is treated as coherent.
                </p>
              </div>
              <div class="ely-story-index-category-grid">
                <article
                  v-for="summary in categoryReviewSummaries"
                  :key="summary.category"
                  class="ely-story-index-category-card"
                >
                  <div>
                    <span class="ely-story-link-eyebrow">{{ summary.category }}</span>
                    <strong>{{ summary.label }}</strong>
                  </div>
                  <p>
                    {{ summary.reviewReady }} / {{ summary.componentCount }} components review-ready
                    with {{ summary.scenarioCount }} detailed scenario{{ summary.scenarioCount === 1 ? '' : 's' }}.
                  </p>
                  <div class="ely-story-index-category-focus">
                    <span
                      v-for="focus in summary.focusCounts"
                      :key="focus.focus"
                    >
                      <strong>{{ focus.count }}</strong>
                      {{ focus.label }}
                    </span>
                  </div>
                </article>
              </div>
            </div>

            <div class="ely-story-index-focus-wrap">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Scenario review focus coverage</p>
                  <h2 class="ely-story-index-filter-title">Filter by review risk</h2>
                </div>
                <p>
                  {{ visibleComponentCount }} component{{ visibleComponentCount > 1 ? 's' : '' }}
                  visible for {{ selectedFocus === 'all' ? 'all review focus areas' : publicComponentReviewFocusLabels[selectedFocus] }}.
                </p>
              </div>
              <div class="ely-story-index-focus" aria-label="Scenario review focus coverage">
                <button
                  v-for="focus in focusOptions"
                  :key="focus.focus"
                  type="button"
                  :aria-pressed="selectedFocus === focus.focus"
                  @click="selectFocus(focus.focus)"
                >
                  <strong>{{ focus.count }}</strong>
                  {{ focus.label }}
                </button>
              </div>
              <aside class="ely-story-index-lane" aria-live="polite">
                <div>
                  <p class="ely-public-eyebrow">Review lane snapshot</p>
                  <h3>{{ selectedReviewLane.label }}</h3>
                  <p>
                    {{ selectedReviewLane.componentCount }} component{{ selectedReviewLane.componentCount > 1 ? 's' : '' }}
                    and {{ selectedReviewLane.scenarioCount }} scenario{{ selectedReviewLane.scenarioCount > 1 ? 's' : '' }}
                    stay visible in this lane.
                  </p>
                </div>
                <div class="ely-story-index-lane-pills" aria-label="Components in selected review lane">
                  <span
                    v-for="component in selectedReviewLane.components"
                    :key="component"
                  >
                    {{ component }}
                  </span>
                </div>
                <div class="ely-story-index-lane-links" aria-label="Preview scenarios in selected review lane">
                  <a
                    v-for="scenario in selectedReviewLane.previewScenarios"
                    :key="scenario.storyId"
                    :href="'/?path=/story/' + scenario.storyId"
                  >
                    <strong>{{ scenario.component }}</strong>
                    <span>{{ scenario.label }}</span>
                  </a>
                </div>
              </aside>
              <div
                v-if="componentFailureEntry"
                class="ely-story-index-failure-route"
              >
                <div>
                  <p class="ely-public-eyebrow">Failure evidence</p>
                  <h3>Reject misuse before adding variants</h3>
                  <p>
                    The component failure gallery catches semantic drift before
                    it becomes another custom primitive.
                  </p>
                </div>
                <a :href="createStoryPath(componentFailureEntry.storyId)">
                  Review component failure gallery
                </a>
              </div>
            </div>
          </section>

          <section
            v-for="group in visibleComponentGroups"
            :key="group.category"
            class="ely-story-index-group"
          >
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">{{ group.category }}</p>
                <h2 class="ely-public-section-title">{{ group.label }}</h2>
              </div>
              <p>
                {{ group.components.length }} documented component{{ group.components.length > 1 ? 's' : '' }}
                owned by the public UI package.
              </p>
            </div>

            <div class="ely-story-index-grid">
              <article
                v-for="entry in group.components"
                :key="entry.key"
                class="ely-story-index-card"
              >
                <div class="ely-story-index-identity">
                  <div class="ely-story-index-card-head">
                    <span class="ely-story-link-eyebrow">{{ entry.component.category }}</span>
                    <span
                      class="ely-story-link-badge"
                      :data-status="getComponentReadiness(entry.key)?.status"
                    >
                      {{ getComponentReadiness(entry.key)?.label }}
                    </span>
                  </div>
                  <h3>{{ entry.component.name }}</h3>
                  <p>{{ entry.component.description }}</p>
                  <dl class="ely-story-index-metrics">
                    <div>
                      <dt>Props</dt>
                      <dd>{{ entry.component.props.length }}</dd>
                    </div>
                    <div>
                      <dt>Usage</dt>
                      <dd>{{ entry.component.usage.length }}</dd>
                    </div>
                    <div>
                      <dt>A11y</dt>
                      <dd>{{ entry.component.accessibility.length }}</dd>
                    </div>
                    <div>
                      <dt>Decision</dt>
                      <dd>{{ entry.component.decision.length }}</dd>
                    </div>
                    <div>
                      <dt>Avoid</dt>
                      <dd>{{ entry.component.antiPatterns.length }}</dd>
                    </div>
                  </dl>
                </div>

                <div class="ely-story-index-contract">
                  <div class="ely-story-index-guidance">
                    <strong>Choose when</strong>
                    <span>{{ entry.component.decision[0] }}</span>
                  </div>
                  <div class="ely-story-index-guidance" data-kind="avoid">
                    <strong>Avoid</strong>
                    <span>{{ entry.component.antiPatterns[0] }}</span>
                  </div>
                  <div class="ely-story-index-gates" aria-label="Component review readiness gates">
                    <div
                      v-for="gate in getComponentReadiness(entry.key)?.gates"
                      :key="gate.key"
                      :data-passed="gate.passed"
                    >
                      <strong>{{ gate.label }}</strong>
                      <span>{{ gate.detail }}</span>
                    </div>
                  </div>
                </div>

                <div class="ely-story-index-proof">
                  <div class="ely-story-index-scenarios">
                    <strong>Detailed stories</strong>
                    <div>
                      <a
                        v-for="scenario in filterScenariosByFocus(entry.key, selectedFocus)"
                        :key="scenario.storyId"
                        :href="'/?path=/story/' + scenario.storyId"
                      >
                        <span>{{ scenario.label }}</span>
                        <small>
                          {{ scenario.reviewFocus.map((focus) => publicComponentReviewFocusLabels[focus]).join(' / ') }}
                        </small>
                      </a>
                    </div>
                  </div>
                  <a class="ely-story-index-route" :href="getComponentRoute(entry.component)">
                    Open component docs
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
