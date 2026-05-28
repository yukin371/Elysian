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
  publicComponentReviewFocusCounts,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCoverageByName,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

type HandoffStatus = "ready" | "watch"

interface HandoffCheck {
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

const handoffRouteKeys = [
  "component-index",
  "component-acceptance-board",
  "component-api-reference",
  "component-variant-matrix",
  "component-state-matrix",
  "component-scenario-atlas",
  "component-operability-board",
] as const

const componentDocsRoute = (componentKey: ElyPublicDocumentedComponent) =>
  `/docs/public-luxe-components-${publicComponentDocs[componentKey].name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const buildHandoffChecks = (componentKey: ElyPublicDocumentedComponent) => {
  const component = publicComponentDocs[componentKey]
  const scenarios =
    publicComponentScenarioCoverageByName.get(componentKey)?.scenarios ?? []
  const focus = new Set(scenarios.flatMap((scenario) => scenario.reviewFocus))
  const checks: HandoffCheck[] = [
    {
      detail:
        "usage and decision notes explain when the primitive should exist",
      key: "intent",
      label: "Intent named",
      passed: component.usage.length > 0 && component.decision.length > 0,
    },
    {
      detail:
        "props and states are visible before reviewers ask for a new variant",
      key: "contract",
      label: "Contract visible",
      passed: component.props.length > 0 && component.states.length > 0,
    },
    {
      detail: "detailed Storybook scenarios provide handoff links beyond docs",
      key: "scenario",
      label: "Story proof",
      passed: scenarios.length >= 2,
    },
    {
      detail:
        "risk focus includes state, interaction, feedback, or accessibility",
      key: "risk",
      label: "Risk surfaced",
      passed: [...highRiskFocus].some((item) => focus.has(item)),
    },
    {
      detail:
        "composition and anti-pattern notes define what reviewers should reject",
      key: "rejection",
      label: "Reject line",
      passed:
        component.composition.length > 0 && component.antiPatterns.length > 0,
    },
  ]

  return checks
}

const componentDossiers = (
  Object.keys(publicComponentDocs) as ElyPublicDocumentedComponent[]
).map((componentKey) => {
  const component = publicComponentDocs[componentKey]
  const scenarioCoverage =
    publicComponentScenarioCoverageByName.get(componentKey)
  const scenarios = scenarioCoverage?.scenarios ?? []
  const focus = Array.from(
    new Set(scenarios.flatMap((scenario) => scenario.reviewFocus)),
  )
  const checks = buildHandoffChecks(componentKey)
  const passedCheckCount = checks.filter((check) => check.passed).length
  const status: HandoffStatus =
    passedCheckCount === checks.length ? "ready" : "watch"

  return {
    checks,
    component,
    componentKey,
    docsRoute: componentDocsRoute(componentKey),
    focus,
    focusLabels: focus.map((item) => publicComponentReviewFocusLabels[item]),
    passedCheckCount,
    requiredProps: component.props.filter(
      (prop) => "required" in prop && prop.required,
    ),
    scenarioCount: scenarios.length,
    scenarios,
    score: Math.round((passedCheckCount / checks.length) * 100),
    status,
  }
})

const categoryGroups = categoryOrder
  .map((category) => {
    const dossiers = componentDossiers.filter(
      (dossier) => dossier.component.category === category,
    )

    return {
      category,
      dossiers,
      label: categoryLabels[category],
      readyCount: dossiers.filter((dossier) => dossier.status === "ready")
        .length,
      scenarioCount: dossiers.reduce(
        (total, dossier) => total + dossier.scenarioCount,
        0,
      ),
    }
  })
  .filter((group) => group.dossiers.length > 0)

const handoffRoutes = handoffRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const focusDossiers = publicComponentReviewFocusCounts.map((focus) => ({
  ...focus,
  components: componentDossiers
    .filter((dossier) => dossier.focus.includes(focus.focus))
    .map((dossier) => dossier.component.name),
}))

const readyCount = componentDossiers.filter(
  (dossier) => dossier.status === "ready",
).length
const watchCount = componentDossiers.length - readyCount
const totalCheckCount = componentDossiers.reduce(
  (total, dossier) => total + dossier.checks.length,
  0,
)
const passedCheckCount = componentDossiers.reduce(
  (total, dossier) => total + dossier.passedCheckCount,
  0,
)
const scenarioCount = componentDossiers.reduce(
  (total, dossier) => total + dossier.scenarioCount,
  0,
)
const handoffScore = Math.round((passedCheckCount / totalCheckCount) * 100)

const meta = {
  title: "Public Luxe/Components/Handoff Dossier",
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
        categoryGroups,
        componentDossiers,
        createStoryPath,
        focusDossiers,
        handoffRoutes,
        handoffScore,
        passedCheckCount: String(passedCheckCount),
        readyCount: String(readyCount),
        scenarioCount: String(scenarioCount),
        totalCheckCount: String(totalCheckCount),
        watchCount: String(watchCount),
        publicComponentReviewFocusLabels,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-dossier-hero-panel">
            <p class="ely-public-eyebrow">Component handoff dossier</p>
            <h1 class="ely-public-section-title">Every primitive needs a reviewer-ready dossier</h1>
            <p class="ely-public-copy">
              This dossier turns owner docs and detailed scenarios into a
              component-by-component handoff packet. It does not define new
              props, defaults, states, or accessibility rules; it shows whether
              a reviewer can understand intent, contract, proof, risk, and
              rejection boundaries without opening a marketing showcase first.
            </p>

            <div class="ely-story-dossier-hero ely-story-offset-md">
              <div class="ely-story-dossier-score" aria-label="Component handoff score">
                <span>{{ handoffScore }}%</span>
                <ElyPublicProgress
                  :value="handoffScore"
                  label="Handoff dossier coverage"
                  tone="success"
                />
                <ElyPublicText tone="muted">
                  {{ passedCheckCount }} / {{ totalCheckCount }} dossier checks
                  pass across the documented public primitive set.
                </ElyPublicText>
              </div>
              <div class="ely-story-dossier-stats">
                <ElyPublicStat
                  :value="readyCount"
                  eyebrow="Ready"
                  helper="Primitives with complete handoff packets."
                  tone="success"
                >
                  dossiers
                </ElyPublicStat>
                <ElyPublicStat
                  :value="watchCount"
                  eyebrow="Watch"
                  helper="Primitives that would need follow-up if evidence regresses."
                  tone="accent"
                >
                  watch items
                </ElyPublicStat>
                <ElyPublicStat
                  :value="scenarioCount"
                  eyebrow="Story proof"
                  helper="Detailed component stories linked from coverage."
                  tone="primary"
                >
                  scenario links
                </ElyPublicStat>
              </div>
            </div>
          </section>

          <section class="ely-story-dossier-route" aria-label="Component handoff review route">
            <a
              v-for="(entry, index) in handoffRoutes"
              :key="entry.key"
              class="ely-story-dossier-route-step"
              :href="createStoryPath(entry.storyId)"
              target="_top"
              rel="noreferrer"
            >
              <span>0{{ index + 1 }}</span>
              <strong>{{ entry.title }}</strong>
              <p>{{ entry.description }}</p>
            </a>
          </section>

          <section class="ely-story-dossier-focus-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Risk lanes</p>
                <h2 class="ely-public-section-title">Scan handoff proof by the failure mode</h2>
              </div>
              <p>
                A dossier is useful when the reviewer can jump from a risk
                label to the components and detailed stories that prove it.
              </p>
            </div>
            <div class="ely-story-dossier-focus-grid">
              <article
                v-for="focus in focusDossiers"
                :key="focus.focus"
                class="ely-story-dossier-focus-card"
              >
                <div>
                  <strong>{{ focus.count }}</strong>
                  <span>{{ focus.label }}</span>
                </div>
                <p>
                  {{ focus.components.length }} component{{ focus.components.length === 1 ? '' : 's' }}
                  expose this review focus.
                </p>
                <div>
                  <span
                    v-for="component in focus.components.slice(0, 8)"
                    :key="focus.focus + component"
                  >
                    {{ component }}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-dossier-family-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Family packets</p>
                <h2 class="ely-public-section-title">Review the component set as five delivery lanes</h2>
              </div>
              <p>
                Each family shows how many primitives are ready and how many
                scenario links support the handoff packet.
              </p>
            </div>
            <div class="ely-story-dossier-family-grid">
              <article
                v-for="group in categoryGroups"
                :key="group.category"
                class="ely-story-dossier-family"
              >
                <span>{{ group.category }}</span>
                <h3>{{ group.label }}</h3>
                <p>
                  {{ group.readyCount }} / {{ group.dossiers.length }} ready
                  with {{ group.scenarioCount }} scenario links.
                </p>
              </article>
            </div>
          </section>

          <section
            v-for="group in categoryGroups"
            :key="group.category + '-dossiers'"
            class="ely-story-dossier-group"
          >
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">{{ group.category }}</p>
                <h2 class="ely-public-section-title">{{ group.label }} component dossiers</h2>
              </div>
              <p>
                {{ group.dossiers.length }} primitive{{ group.dossiers.length === 1 ? '' : 's' }}
                ready for owner-doc and scenario handoff review.
              </p>
            </div>

            <div class="ely-story-dossier-list">
              <article
                v-for="dossier in group.dossiers"
                :key="dossier.componentKey"
                class="ely-story-dossier-card"
                :data-status="dossier.status"
              >
                <div class="ely-story-dossier-card-head">
                  <div>
                    <span>{{ dossier.component.category }}</span>
                    <h3>{{ dossier.component.name }}</h3>
                  </div>
                  <ElyPublicBadge :tone="dossier.status === 'ready' ? 'primary' : 'accent'">
                    {{ dossier.status === 'ready' ? 'Ready' : 'Watch' }}
                  </ElyPublicBadge>
                </div>
                <p>{{ dossier.component.description }}</p>

                <div class="ely-story-dossier-meter">
                  <strong>{{ dossier.score }}%</strong>
                  <ElyPublicProgress
                    :value="dossier.score"
                    label="Dossier checks"
                    tone="success"
                  />
                  <span>{{ dossier.passedCheckCount }} / {{ dossier.checks.length }} checks</span>
                </div>

                <div class="ely-story-dossier-evidence">
                  <div>
                    <strong>Use when</strong>
                    <span>{{ dossier.component.usage[0] }}</span>
                  </div>
                  <div>
                    <strong>Decision</strong>
                    <span>{{ dossier.component.decision[0] }}</span>
                  </div>
                  <div>
                    <strong>Reject</strong>
                    <span>{{ dossier.component.antiPatterns[0] }}</span>
                  </div>
                </div>

                <div class="ely-story-dossier-contract">
                  <div>
                    <strong>{{ dossier.component.props.length }}</strong>
                    <span>props</span>
                  </div>
                  <div>
                    <strong>{{ dossier.component.states.length }}</strong>
                    <span>states</span>
                  </div>
                  <div>
                    <strong>{{ dossier.component.accessibility.length }}</strong>
                    <span>a11y</span>
                  </div>
                  <div>
                    <strong>{{ dossier.requiredProps.length }}</strong>
                    <span>required</span>
                  </div>
                </div>

                <div class="ely-story-dossier-checks">
                  <div
                    v-for="check in dossier.checks"
                    :key="dossier.componentKey + check.key"
                    class="ely-story-dossier-check"
                    :data-passed="check.passed"
                  >
                    <strong>{{ check.label }}</strong>
                    <span>{{ check.detail }}</span>
                  </div>
                </div>

                <div class="ely-story-dossier-focus-list">
                  <span
                    v-for="focus in dossier.focusLabels"
                    :key="dossier.componentKey + focus"
                  >
                    {{ focus }}
                  </span>
                </div>

                <div class="ely-story-dossier-links">
                  <ElyPublicLink :href="dossier.docsRoute">Open docs</ElyPublicLink>
                  <ElyPublicLink
                    v-for="scenario in dossier.scenarios"
                    :key="scenario.storyId"
                    :href="'/?path=/story/' + scenario.storyId"
                  >
                    {{ scenario.label }}
                  </ElyPublicLink>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-dossier-boundary-panel">
            <p class="ely-public-eyebrow">Boundary</p>
            <h2 class="ely-public-section-title">The dossier points to truth; it does not become truth</h2>
            <ElyPublicText class="ely-story-offset-md">
              If a reviewer finds a missing prop explanation, state, accessible
              behavior, or rejection boundary, update ui-public-vue owner docs
              and the detailed scenario coverage. This story should only become
              richer because the canonical owner became clearer.
            </ElyPublicText>
            <ElyPublicDivider label="Review sentence" align="start" />
            <ElyPublicText tone="muted">
              A component handoff is ready when intent, contract, risk, proof,
              and rejection can be reviewed in one pass without inventing a
              local component policy.
            </ElyPublicText>
          </section>
        </div>
      </section>
    `,
  }),
}
