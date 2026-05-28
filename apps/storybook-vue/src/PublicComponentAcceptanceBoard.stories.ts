import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicComponentCategory,
  ElyPublicDocumentedComponent,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCoverageByName,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

type AcceptanceStatus = "ready" | "watch"

interface AcceptanceGate {
  detail: string
  key: string
  label: string
  passed: boolean
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

const highRiskFocus = new Set<PublicComponentReviewFocus>([
  "accessibility",
  "feedback",
  "interaction",
  "state",
])

const reviewRouteKeys = [
  "component-index",
  "component-api-reference",
  "component-composition-matrix",
  "component-state-matrix",
  "component-scenario-atlas",
  "component-operability-board",
] as const

const buildGates = (componentKey: ElyPublicDocumentedComponent) => {
  const component = publicComponentDocs[componentKey]
  const scenarios =
    publicComponentScenarioCoverageByName.get(componentKey)?.scenarios ?? []
  const focus = new Set(scenarios.flatMap((scenario) => scenario.reviewFocus))
  const gates: AcceptanceGate[] = [
    {
      detail:
        "usage, decision, composition, anti-pattern, prop, state, and accessibility notes exist in owner docs",
      key: "owner-docs",
      label: "Owner docs",
      passed:
        component.usage.length > 0 &&
        component.decision.length > 0 &&
        component.composition.length > 0 &&
        component.antiPatterns.length > 0 &&
        component.props.length > 0 &&
        component.states.length > 0 &&
        component.accessibility.length > 0,
    },
    {
      detail:
        "at least two detailed Storybook scenarios prove more than the default showcase",
      key: "scenario-depth",
      label: "Scenario depth",
      passed: scenarios.length >= 2,
    },
    {
      detail:
        "the scenario set covers state, interaction, feedback, or accessibility risk",
      key: "risk-focus",
      label: "Risk focus",
      passed: [...highRiskFocus].some((item) => focus.has(item)),
    },
    {
      detail:
        "state and accessibility evidence are both visible before visual approval",
      key: "state-access",
      label: "State + a11y",
      passed:
        component.states.length >= 3 && component.accessibility.length >= 2,
    },
    {
      detail:
        "composition guidance and anti-patterns are explicit enough to reject misuse",
      key: "misuse-boundary",
      label: "Misuse boundary",
      passed:
        component.composition.length >= 2 && component.antiPatterns.length >= 2,
    },
  ]

  return gates
}

const componentDocsRoute = (componentKey: ElyPublicDocumentedComponent) =>
  `/docs/public-luxe-components-${publicComponentDocs[componentKey].name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const componentRows = (
  Object.keys(publicComponentDocs) as ElyPublicDocumentedComponent[]
).map((componentKey) => {
  const component = publicComponentDocs[componentKey]
  const scenarioCoverage =
    publicComponentScenarioCoverageByName.get(componentKey)
  const scenarios = scenarioCoverage?.scenarios ?? []
  const gates = buildGates(componentKey)
  const passedGateCount = gates.filter((gate) => gate.passed).length
  const focus = Array.from(
    new Set(scenarios.flatMap((scenario) => scenario.reviewFocus)),
  )
  const status: AcceptanceStatus =
    passedGateCount === gates.length ? "ready" : "watch"

  return {
    component,
    componentKey,
    docsRoute: componentDocsRoute(componentKey),
    focus,
    gates,
    passedGateCount,
    scenarioCount: scenarios.length,
    scenarios,
    score: Math.round((passedGateCount / gates.length) * 100),
    status,
  }
})

const categoryGroups = categoryOrder
  .map((category) => {
    const rows = componentRows.filter(
      (row) => row.component.category === category,
    )

    return {
      category,
      label: categoryLabels[category],
      readyCount: rows.filter((row) => row.status === "ready").length,
      rows,
      scenarioCount: rows.reduce((total, row) => total + row.scenarioCount, 0),
    }
  })
  .filter((group) => group.rows.length > 0)

const reviewRoutes = reviewRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const readyCount = componentRows.filter((row) => row.status === "ready").length
const watchCount = componentRows.length - readyCount
const totalGateCount = componentRows.reduce(
  (total, row) => total + row.gates.length,
  0,
)
const passedGateCount = componentRows.reduce(
  (total, row) => total + row.passedGateCount,
  0,
)
const scenarioCount = componentRows.reduce(
  (total, row) => total + row.scenarioCount,
  0,
)
const acceptanceScore = Math.round((passedGateCount / totalGateCount) * 100)

const meta = {
  title: "Public Luxe/Components/Acceptance Board",
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
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        acceptanceScore,
        categoryGroups,
        componentRows,
        createStoryPath,
        passedGateCount: String(passedGateCount),
        readyCount: String(readyCount),
        reviewRoutes,
        scenarioCount: String(scenarioCount),
        totalGateCount: String(totalGateCount),
        watchCount: String(watchCount),
        publicComponentReviewFocusLabels,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-acceptance-hero-panel">
            <p class="ely-public-eyebrow">Component acceptance board</p>
            <h1 class="ely-public-section-title">Approve components by gates, not by gallery presence</h1>
            <p class="ely-public-copy">
              This board turns public component documentation into a release-style
              review surface. It does not define new component contracts; it
              shows whether each primitive has owner docs, scenario depth,
              risk-focused proof, state accessibility, and misuse boundaries.
            </p>

            <div class="ely-story-acceptance-hero ely-story-offset-md">
              <div class="ely-story-acceptance-score" aria-label="Component acceptance score">
                <span>{{ acceptanceScore }}%</span>
                <ElyPublicProgress
                  :value="acceptanceScore"
                  label="Acceptance gate coverage"
                  tone="success"
                />
                <ElyPublicText tone="muted">
                  {{ passedGateCount }} / {{ totalGateCount }} gates pass across
                  the documented public primitive set.
                </ElyPublicText>
              </div>
              <div class="ely-story-acceptance-stats">
                <ElyPublicStat
                  :value="readyCount"
                  eyebrow="Ready"
                  helper="Components passing every acceptance gate."
                  tone="success"
                >
                  accepted primitives
                </ElyPublicStat>
                <ElyPublicStat
                  :value="watchCount"
                  eyebrow="Watch"
                  helper="Components that would need closer review if any gate regresses."
                  tone="accent"
                >
                  watch primitives
                </ElyPublicStat>
                <ElyPublicStat
                  :value="scenarioCount"
                  eyebrow="Scenario proof"
                  helper="Detailed stories linked from component coverage."
                  tone="primary"
                >
                  story proofs
                </ElyPublicStat>
              </div>
            </div>
          </section>

          <section class="ely-story-acceptance-route">
            <a
              v-for="(entry, index) in reviewRoutes"
              :key="entry.key"
              class="ely-story-acceptance-route-step"
              :href="createStoryPath(entry.storyId)"
              target="_top"
              rel="noreferrer"
            >
              <span>0{{ index + 1 }}</span>
              <strong>{{ entry.title }}</strong>
              <p>{{ entry.description }}</p>
            </a>
          </section>

          <section class="ely-story-acceptance-category-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Category acceptance</p>
                <h2 class="ely-public-section-title">Review each component family as a delivery lane</h2>
              </div>
              <p>
                A family is only healthy when its primitives can be inspected
                through owner docs, risky stories, and rejection boundaries.
              </p>
            </div>
            <div class="ely-story-acceptance-category-grid">
              <article
                v-for="group in categoryGroups"
                :key="group.category"
                class="ely-story-acceptance-category"
              >
                <div>
                  <span>{{ group.category }}</span>
                  <h3>{{ group.label }}</h3>
                </div>
                <p>
                  {{ group.readyCount }} / {{ group.rows.length }} ready with
                  {{ group.scenarioCount }} detailed scenario proofs.
                </p>
                <div class="ely-story-acceptance-category-components">
                  <span
                    v-for="row in group.rows"
                    :key="row.componentKey"
                    :data-status="row.status"
                  >
                    {{ row.component.name }}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section
            v-for="group in categoryGroups"
            :key="group.category + '-rows'"
            class="ely-story-acceptance-group"
          >
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">{{ group.category }}</p>
                <h2 class="ely-public-section-title">{{ group.label }} acceptance rows</h2>
              </div>
              <p>
                {{ group.readyCount }} accepted component{{ group.readyCount === 1 ? '' : 's' }}
                in this family.
              </p>
            </div>

            <div class="ely-story-acceptance-row-list">
              <article
                v-for="row in group.rows"
                :key="row.componentKey"
                class="ely-story-acceptance-row"
                :data-status="row.status"
              >
                <div class="ely-story-acceptance-row-main">
                  <div>
                    <span>{{ row.component.category }}</span>
                    <h3>{{ row.component.name }}</h3>
                  </div>
                  <ElyPublicBadge :tone="row.status === 'ready' ? 'primary' : 'accent'">
                    {{ row.status === 'ready' ? 'Accepted' : 'Watch' }}
                  </ElyPublicBadge>
                </div>
                <p>{{ row.component.description }}</p>

                <div class="ely-story-acceptance-row-proof">
                  <div>
                    <strong>{{ row.score }}%</strong>
                    <span>{{ row.passedGateCount }} / {{ row.gates.length }} gates</span>
                  </div>
                  <div>
                    <strong>{{ row.scenarioCount }}</strong>
                    <span>scenario proofs</span>
                  </div>
                  <div>
                    <strong>{{ row.component.accessibility.length }}</strong>
                    <span>a11y notes</span>
                  </div>
                </div>

                <div class="ely-story-acceptance-gates">
                  <div
                    v-for="gate in row.gates"
                    :key="row.componentKey + gate.key"
                    class="ely-story-acceptance-gate"
                    :data-passed="gate.passed"
                  >
                    <strong>{{ gate.label }}</strong>
                    <span>{{ gate.detail }}</span>
                  </div>
                </div>

                <div class="ely-story-acceptance-focus">
                  <span
                    v-for="focus in row.focus"
                    :key="row.componentKey + focus"
                  >
                    {{ publicComponentReviewFocusLabels[focus] }}
                  </span>
                </div>

                <div class="ely-story-acceptance-links">
                  <ElyPublicLink :href="row.docsRoute">Open docs</ElyPublicLink>
                  <ElyPublicLink
                    v-for="scenario in row.scenarios"
                    :key="scenario.storyId"
                    :href="'/?path=/story/' + scenario.storyId"
                  >
                    {{ scenario.label }}
                  </ElyPublicLink>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-acceptance-boundary-panel">
            <p class="ely-public-eyebrow">Boundary</p>
            <h2 class="ely-public-section-title">If a gate fails, fix the owner truth first</h2>
            <ElyPublicText class="ely-story-offset-md">
              The acceptance board is intentionally strict but not authoritative
              over component behavior. If a component needs different props,
              states, accessibility language, or anti-pattern guidance, update
              ui-public-vue and the detailed scenario coverage rather than
              patching this board locally.
            </ElyPublicText>
            <ElyPublicDivider label="Review sentence" align="start" />
            <ElyPublicText tone="muted">
              A primitive is ready when its purpose, proof, operation, and
              rejection boundary can be reviewed without opening a marketing
              showcase first.
            </ElyPublicText>
          </section>
        </div>
      </section>
    `,
  }),
}
