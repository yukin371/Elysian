import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicDocumentedComponent } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { publicComponentScenarioCoverageByName } from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const compositionLanes = [
  {
    label: "Act",
    job: "Turn the current surface into one clear next step.",
    components: [
      "Button",
      "Link",
      "EmptyState",
    ] satisfies ElyPublicDocumentedComponent[],
    proof:
      "One primary Button, quiet support Link, and recovery only when absence blocks progress.",
    blocker:
      "Multiple strong actions make the surface loud before it becomes useful.",
  },
  {
    label: "Decide",
    job: "Collect explicit input without hiding consequences.",
    components: [
      "Input",
      "Select",
      "Checkbox",
      "RadioGroup",
      "Switch",
    ] satisfies ElyPublicDocumentedComponent[],
    proof:
      "Fields carry labels, helper text, selection semantics, and visible validation.",
    blocker:
      "A beautiful field without label or repair copy is still not approval-ready.",
  },
  {
    label: "Recover",
    job: "Explain status, repair paths, and temporary uncertainty.",
    components: [
      "Alert",
      "Badge",
      "Progress",
      "Skeleton",
    ] satisfies ElyPublicDocumentedComponent[],
    proof:
      "Status is readable as text, progress is bounded, and loading resolves into content or recovery.",
    blocker:
      "Color-only status fails across dark mode, accessibility, and custom themes.",
  },
  {
    label: "Author",
    job: "Create reading rhythm without adding another visual system.",
    components: [
      "Card",
      "Image",
      "Stat",
      "Text",
      "Divider",
    ] satisfies ElyPublicDocumentedComponent[],
    proof: "Media, summary, copy, and separators preserve one focal hierarchy.",
    blocker:
      "More cards, radius, or glow cannot replace a readable content order.",
  },
  {
    label: "Orient",
    job: "Help users understand where they are inside one public surface.",
    components: [
      "Tabs",
      "Avatar",
      "Link",
      "Badge",
    ] satisfies ElyPublicDocumentedComponent[],
    proof:
      "Tabs stay local, identity remains meaningful, and links do not compete with the main action.",
    blocker:
      "Tabs used as route navigation blur owner boundaries and break recovery.",
  },
] as const

const compositionRecipes = [
  {
    title: "Claim or reserve surface",
    intent: "A ceremonial action lane where proof comes before commitment.",
    components: [
      "Card",
      "Stat",
      "Progress",
      "Button",
      "Link",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "State the reward or reservation context.",
      "Show bounded proof with Stat and Progress.",
      "Offer one primary Button.",
      "Keep history or policy as quiet Link recovery.",
    ],
    proof:
      "Works for Member Rewards, Event Landing, and launch waitlist surfaces.",
    blocker: "Do not add a second primary action to create urgency.",
  },
  {
    title: "Form repair cluster",
    intent: "A field group that stays usable when validation fails.",
    components: [
      "Input",
      "Select",
      "Checkbox",
      "Alert",
      "Progress",
      "Button",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Label the freeform field.",
      "Make structured choices visible.",
      "Keep consent explicit.",
      "Show repair and completion before submit.",
    ],
    proof:
      "Works for Forms & Feedback, Creator Center, and preference handoff.",
    blocker: "Do not hide repair instructions in placeholder text.",
  },
  {
    title: "Preference atelier",
    intent:
      "A curated settings surface that does not drift into enterprise admin UI.",
    components: [
      "RadioGroup",
      "Switch",
      "Tabs",
      "Text",
      "Badge",
      "Alert",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Use Tabs only for local sections.",
      "Use RadioGroup for small visible choices.",
      "Use Switch for immediate runtime settings.",
      "Show blocked or inherited settings with Alert and Badge.",
    ],
    proof: "Works for Theme Atelier and public account preference panels.",
    blocker: "Do not use Switch for consent or delayed submit choices.",
  },
  {
    title: "Editorial card stack",
    intent: "A content lane where imagery sets mood but copy carries meaning.",
    components: [
      "Image",
      "Card",
      "Text",
      "Badge",
      "Divider",
      "Link",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Lock media ratio before adding ornament.",
      "Place category Badge as supporting evidence.",
      "Keep Text readable and direct.",
      "Use Divider and Link for archive or support paths.",
    ],
    proof:
      "Works for Editorial Collection, content previews, and campaign cards.",
    blocker: "Do not let image mood become the only meaningful information.",
  },
  {
    title: "Identity proof row",
    intent: "A compact trust lane for creators, members, and participants.",
    components: [
      "Avatar",
      "Text",
      "Badge",
      "Stat",
      "Card",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Name the identity first.",
      "Use Avatar fallback safely.",
      "Keep presence or role as Badge evidence.",
      "Use Stat only when the metric changes trust.",
    ],
    proof: "Works for creator lists, participant cards, and member summaries.",
    blocker: "Do not use Avatar as a decorative icon container.",
  },
  {
    title: "Loading to recovery",
    intent:
      "A temporary state lane that always resolves into content, alert, or empty recovery.",
    components: [
      "Skeleton",
      "Alert",
      "EmptyState",
      "Button",
      "Link",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Use Skeleton only while known content is loading.",
      "Replace blocked loading with Alert.",
      "Use Empty State when absence is real.",
      "Offer one recovery Button and one quiet support Link.",
    ],
    proof:
      "Works for async galleries, delayed account data, and failed theme sync.",
    blocker: "Skeleton must never become final empty content.",
  },
  {
    title: "Focused confirmation",
    intent:
      "A short interruptive decision that returns users to the same flow.",
    components: [
      "Dialog",
      "Button",
      "Alert",
      "Text",
      "Link",
    ] satisfies ElyPublicDocumentedComponent[],
    order: [
      "Open from an explicit Button.",
      "Explain risk with Alert only when needed.",
      "Keep the consequence short in Text.",
      "Return focus and keep escape paths visible.",
    ],
    proof:
      "Works for destructive confirmation, publishing review, and compact interruption.",
    blocker:
      "Do not turn Dialog into a full page shell or hidden multi-step form.",
  },
] as const

const reviewRouteKeys = [
  "component-usage-matrix",
  "component-composition-matrix",
  "component-acceptance-board",
  "component-scenario-atlas",
  "component-operability-board",
  "pattern-composition",
] as const

const guardrailGates = [
  "Name the local user job before choosing a bundle.",
  "Keep one primary action per surface or recipe.",
  "Show text evidence for every state, not only tone.",
  "Move to pattern review only after component composition is coherent.",
] as const

const getScenarioCount = (
  components: readonly ElyPublicDocumentedComponent[],
) =>
  components.reduce(
    (total, component) =>
      total +
      (publicComponentScenarioCoverageByName.get(component)?.scenarios.length ??
        0),
    0,
  )

const componentDocs = (component: ElyPublicDocumentedComponent) =>
  publicComponentDocs[component]

const compositionRows = compositionRecipes.map((recipe) => ({
  ...recipe,
  docs: recipe.components.map(componentDocs),
  scenarioCount: getScenarioCount(recipe.components),
}))

const laneRows = compositionLanes.map((lane) => ({
  ...lane,
  docs: lane.components.map(componentDocs),
  scenarioCount: getScenarioCount(lane.components),
}))

const reviewRoutes = reviewRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const distinctComponentCount = new Set(
  compositionRecipes.flatMap((recipe) => recipe.components),
).size
const scenarioProofCount = compositionRows.reduce(
  (total, row) => total + row.scenarioCount,
  0,
)
const orderStepCount = compositionRows.reduce(
  (total, row) => total + row.order.length,
  0,
)

const meta = {
  title: "Public Luxe/Foundations/Component Composition Matrix",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        compositionRows,
        createStoryPath,
        distinctComponentCount: String(distinctComponentCount),
        guardrailGates,
        laneRows,
        orderStepCount: String(orderStepCount),
        recipeCount: String(compositionRows.length),
        reviewRoutes,
        scenarioProofCount: String(scenarioProofCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-component-composition-hero-panel">
            <p class="ely-public-eyebrow">Component composition matrix</p>
            <h1 class="ely-public-section-title">Assemble public primitives into reviewable user flows</h1>
            <p class="ely-public-copy">
              This matrix sits between primitive choice and page pattern review.
              It consumes ui-public-vue component docs and Storybook scenario
              coverage, then shows which components can safely travel together
              before a screen asks for more ornament, variants, or page-level polish.
            </p>

            <div class="ely-story-component-composition-stats" aria-label="Component composition coverage">
              <ElyPublicStat
                :value="recipeCount"
                eyebrow="Recipes"
                helper="Reusable public-luxe assembly paths."
                tone="primary"
              >
                composition bundles
              </ElyPublicStat>
              <ElyPublicStat
                :value="distinctComponentCount"
                eyebrow="Primitives"
                helper="Distinct owner-documented components used across recipes."
                tone="accent"
              >
                component roles
              </ElyPublicStat>
              <ElyPublicStat
                :value="scenarioProofCount"
                eyebrow="Scenario proof"
                helper="Detailed stories backing the components in these bundles."
                tone="success"
              >
                proof links
              </ElyPublicStat>
              <ElyPublicStat
                :value="orderStepCount"
                eyebrow="Order"
                helper="Visible assembly steps before pattern approval."
                tone="muted"
              >
                review steps
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-component-composition-route">
            <a
              v-for="(entry, index) in reviewRoutes"
              :key="entry.key"
              class="ely-story-component-composition-route-step"
              :href="createStoryPath(entry.storyId)"
              target="_top"
              rel="noreferrer"
            >
              <span>0{{ index + 1 }}</span>
              <strong>{{ entry.title }}</strong>
              <p>{{ entry.description }}</p>
            </a>
          </section>

          <section class="ely-story-component-composition-lane-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Composition lanes</p>
                <h2 class="ely-public-section-title">Every component should know its job in the surface</h2>
              </div>
              <p>
                The same primitive can appear in several recipes, but its role
                should stay stable: act, decide, recover, author, or orient.
              </p>
            </div>
            <div class="ely-story-component-composition-lanes">
              <article
                v-for="lane in laneRows"
                :key="lane.label"
                class="ely-story-component-composition-lane"
              >
                <div>
                  <span>{{ lane.label }}</span>
                  <h3>{{ lane.job }}</h3>
                </div>
                <div class="ely-story-component-composition-chip-list">
                  <ElyPublicBadge
                    v-for="doc in lane.docs"
                    :key="doc.name"
                    tone="primary"
                  >
                    {{ doc.name }}
                  </ElyPublicBadge>
                </div>
                <p>{{ lane.proof }}</p>
                <ElyPublicAlert tone="warning" title="Composition blocker">
                  {{ lane.blocker }}
                </ElyPublicAlert>
                <small>{{ lane.scenarioCount }} detailed scenario proofs</small>
              </article>
            </div>
          </section>

          <section class="ely-story-component-composition-layout">
            <article class="ely-story-component-composition-recipe-panel">
              <p class="ely-public-eyebrow">Assembly recipes</p>
              <h2 class="ely-public-section-title">Review the order before approving the look</h2>
              <div class="ely-story-component-composition-recipes ely-story-offset-md">
                <article
                  v-for="row in compositionRows"
                  :key="row.title"
                  class="ely-story-component-composition-recipe"
                >
                  <div class="ely-story-component-composition-recipe-head">
                    <div>
                      <span>{{ row.intent }}</span>
                      <h3>{{ row.title }}</h3>
                    </div>
                    <ElyPublicBadge tone="accent">
                      {{ row.scenarioCount }} scenario proofs
                    </ElyPublicBadge>
                  </div>
                  <div class="ely-story-component-composition-chip-list">
                    <ElyPublicBadge
                      v-for="doc in row.docs"
                      :key="row.title + doc.name"
                      tone="primary"
                    >
                      {{ doc.name }}
                    </ElyPublicBadge>
                  </div>
                  <ol class="ely-story-component-composition-order">
                    <li
                      v-for="step in row.order"
                      :key="row.title + step"
                    >
                      {{ step }}
                    </li>
                  </ol>
                  <div class="ely-story-component-composition-proof">
                    <strong>Proof</strong>
                    <p>{{ row.proof }}</p>
                  </div>
                  <div class="ely-story-component-composition-proof" data-kind="blocker">
                    <strong>Blocker</strong>
                    <p>{{ row.blocker }}</p>
                  </div>
                </article>
              </div>
            </article>

            <aside class="ely-story-component-composition-approval-panel">
              <p class="ely-public-eyebrow">Approval gates</p>
              <h2 class="ely-public-section-title">A good bundle should be easy to refuse</h2>
              <div class="ely-story-component-composition-gates ely-story-offset-md">
                <div
                  v-for="gate in guardrailGates"
                  :key="gate"
                  class="ely-story-component-composition-gate"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ gate }}</ElyPublicText>
                </div>
              </div>
              <ElyPublicDivider label="Owner boundary" align="start" />
              <ElyPublicText tone="muted">
                If a recipe reveals missing component behavior, fix the
                primitive owner docs or implementation first. Do not hide the
                gap by adding a Storybook-only wrapper.
              </ElyPublicText>
              <ElyPublicAlert
                class="ely-story-offset-md"
                tone="danger"
                title="Reject local improvisation"
                eyebrow="Composition matrix"
              >
                A page should not invent local color roles, radius scales, or
                component semantics just because the bundle feels incomplete.
              </ElyPublicAlert>
            </aside>
          </section>
        </div>
      </section>
    `,
  }),
}
