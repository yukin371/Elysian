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
  ElyPublicComponentPropDoc,
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

const variantPropNames = new Set([
  "align",
  "aspect",
  "emphasis",
  "fit",
  "shape",
  "size",
  "tone",
  "trend",
  "type",
  "underline",
])

const statePropNames = new Set([
  "closeOnBackdrop",
  "closeOnEscape",
  "disabled",
  "invalidMessage",
  "loading",
  "max",
  "modelValue",
  "open",
  "showSkeleton",
  "showValue",
  "status",
  "value",
])

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

const isVariantProp = (prop: ElyPublicComponentPropDoc) =>
  variantPropNames.has(prop.name) || prop.type.includes("|")

const isStateProp = (prop: ElyPublicComponentPropDoc) =>
  statePropNames.has(prop.name) ||
  prop.type === "boolean" ||
  prop.name.toLowerCase().includes("invalid")

const componentDocsRoute = (component: ElyPublicComponentDoc) =>
  `/docs/public-luxe-components-${component.name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const componentEntries = Object.entries(publicComponentDocs).map(
  ([key, component]) => {
    const scenarioCoverage = publicComponentScenarioCoverageByName.get(
      key as keyof typeof publicComponentDocs,
    )
    const reviewFocus = Array.from(
      new Set(
        scenarioCoverage?.scenarios.flatMap(
          (scenario) => scenario.reviewFocus,
        ) ?? [],
      ),
    ) as PublicComponentReviewFocus[]
    const variantProps = component.props.filter(isVariantProp)
    const stateProps = component.props.filter(isStateProp)

    return {
      component,
      key,
      reviewFocus,
      scenarioCoverage,
      stateProps,
      variantProps,
      variantScore:
        variantProps.length +
        component.states.length +
        (scenarioCoverage?.scenarios.length ?? 0),
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
      scenarioCount: components.reduce(
        (total, entry) =>
          total + (entry.scenarioCoverage?.scenarios.length ?? 0),
        0,
      ),
      variantPropCount: components.reduce(
        (total, entry) => total + entry.variantProps.length,
        0,
      ),
    }
  })
  .filter((group) => group.components.length > 0)

const variantComponentCount = componentEntries.filter(
  (entry) => entry.variantProps.length > 0,
).length
const totalVariantProps = componentEntries.reduce(
  (total, entry) => total + entry.variantProps.length,
  0,
)
const totalStateProps = componentEntries.reduce(
  (total, entry) => total + entry.stateProps.length,
  0,
)
const totalScenarioLinks = componentEntries.reduce(
  (total, entry) => total + (entry.scenarioCoverage?.scenarios.length ?? 0),
  0,
)

const approvalGates = [
  {
    label: "Variant source",
    proof:
      "A proposed variant must map to an owner-documented prop or state, not a one-off class in Storybook.",
  },
  {
    label: "Scenario proof",
    proof:
      "At least one detailed story should show the variant in context before it is treated as reusable.",
  },
  {
    label: "Interaction risk",
    proof:
      "Variants that change focus, selection, loading, validation, or dismissal need operability evidence.",
  },
  {
    label: "Anti-pattern check",
    proof:
      "If the variant encourages a documented anti-pattern, reject the variant before polishing it.",
  },
] as const

const focusLabel = (focus: PublicComponentReviewFocus) =>
  publicComponentReviewFocusLabels[focus]

const meta = {
  title: "Public Luxe/Components/Variant Matrix",
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
        approvalGates,
        categoryGroups,
        componentDocsRoute,
        createStoryPath,
        focusLabel,
        reviewRoutes,
        totalScenarioLinks: String(totalScenarioLinks),
        totalStateProps: String(totalStateProps),
        totalVariantProps: String(totalVariantProps),
        variantComponentCount: String(variantComponentCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-variant-hero-panel">
            <p class="ely-public-eyebrow">Component variant matrix</p>
            <h1 class="ely-public-section-title">Approve variants by evidence, not by appetite</h1>
            <p class="ely-public-copy">
              This matrix turns owner-documented props, states, and detailed
              scenario coverage into a review path for new component variants.
              It should make expansion slower in the right places: variant
              props, risky states, and anti-patterns must all be visible before
              adding another visual option.
            </p>

            <div class="ely-story-variant-stats" aria-label="Component variant coverage">
              <ElyPublicStat
                :value="variantComponentCount"
                eyebrow="Variant-ready"
                helper="Components with at least one owner-documented variant prop."
                tone="primary"
              >
                components
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalVariantProps"
                eyebrow="Variant props"
                helper="Union or role props that change visible component shape."
                tone="accent"
              >
                owner props
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalStateProps"
                eyebrow="State props"
                helper="Runtime props that can change behavior or feedback."
                tone="success"
              >
                risk props
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalScenarioLinks"
                eyebrow="Scenario links"
                helper="Detailed stories that prove variants in context."
                tone="primary"
              >
                proof stories
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-variant-layout">
            <article class="ely-story-variant-route-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from contract to variant proof</h2>
              <div class="ely-story-variant-route ely-story-offset-md">
                <a
                  v-for="(entry, index) in reviewRoutes"
                  :key="entry.key"
                  class="ely-story-variant-route-step"
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

            <article class="ely-story-variant-gate-panel">
              <p class="ely-public-eyebrow">Approval gates</p>
              <h2 class="ely-public-section-title">Do not add a variant until the job is named</h2>
              <div class="ely-story-variant-gates ely-story-offset-md">
                <div
                  v-for="gate in approvalGates"
                  :key="gate.label"
                  class="ely-story-variant-gate"
                >
                  <ElyPublicBadge tone="warning">{{ gate.label }}</ElyPublicBadge>
                  <ElyPublicText tone="muted">{{ gate.proof }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-variant-family-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Variant families</p>
                <h2 class="ely-public-section-title">Scan every primitive before requesting another prop</h2>
              </div>
              <p>
                Groups show whether each component already has variant knobs,
                runtime state knobs, scenario proof, and a visible anti-pattern
                that should block decorative expansion.
              </p>
            </div>

            <div class="ely-story-variant-group-list">
              <article
                v-for="group in categoryGroups"
                :key="group.category"
                class="ely-story-variant-group"
              >
                <div class="ely-story-variant-group-head">
                  <div>
                    <span>{{ group.category }}</span>
                    <h3>{{ group.label }}</h3>
                  </div>
                  <ElyPublicBadge tone="accent">
                    {{ group.variantPropCount }} variant props · {{ group.scenarioCount }} scenarios
                  </ElyPublicBadge>
                </div>

                <div class="ely-story-variant-card-list">
                  <article
                    v-for="entry in group.components"
                    :key="entry.key"
                    class="ely-story-variant-card"
                  >
                    <div class="ely-story-variant-card-head">
                      <div>
                        <span>{{ entry.component.category }}</span>
                        <h4>{{ entry.component.name }}</h4>
                      </div>
                      <ElyPublicBadge :tone="entry.variantProps.length > 0 ? 'primary' : 'warning'">
                        score {{ entry.variantScore }}
                      </ElyPublicBadge>
                    </div>

                    <ElyPublicText tone="muted">{{ entry.component.description }}</ElyPublicText>

                    <div class="ely-story-variant-columns">
                      <div class="ely-story-variant-section">
                        <strong>Variant props</strong>
                        <div class="ely-story-variant-chip-list">
                          <span
                            v-for="prop in entry.variantProps"
                            :key="entry.key + prop.name"
                            class="ely-story-variant-chip"
                          >
                            {{ prop.name }}
                          </span>
                          <span
                            v-if="entry.variantProps.length === 0"
                            class="ely-story-variant-chip"
                            data-tone="quiet"
                          >
                            no visible variant prop
                          </span>
                        </div>
                      </div>

                      <div class="ely-story-variant-section">
                        <strong>Risk states</strong>
                        <div class="ely-story-variant-chip-list">
                          <span
                            v-for="prop in entry.stateProps.slice(0, 4)"
                            :key="entry.key + prop.name"
                            class="ely-story-variant-chip"
                            data-tone="state"
                          >
                            {{ prop.name }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="ely-story-variant-proof">
                      <div>
                        <strong>Scenario proof</strong>
                        <div class="ely-story-variant-scenario-list">
                          <ElyPublicLink
                            v-for="scenario in entry.scenarioCoverage?.scenarios ?? []"
                            :key="scenario.storyId"
                            :href="createStoryPath(scenario.storyId)"
                          >
                            {{ scenario.label }}
                          </ElyPublicLink>
                        </div>
                      </div>

                      <div>
                        <strong>Review focus</strong>
                        <div class="ely-story-variant-chip-list">
                          <span
                            v-for="focus in entry.reviewFocus"
                            :key="entry.key + focus"
                            class="ely-story-variant-chip"
                            data-tone="focus"
                          >
                            {{ focusLabel(focus) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ElyPublicDivider label="Expansion check" align="start" />

                    <div class="ely-story-variant-warning">
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
