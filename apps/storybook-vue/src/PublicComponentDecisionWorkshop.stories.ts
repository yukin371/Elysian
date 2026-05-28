import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicStat,
  ElyPublicSwitch,
  ElyPublicTabs,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicDocumentedComponent,
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
  ElyPublicTabsItem,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCoverageByName,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

interface DecisionWorkshopLane {
  blocker: string
  components: ElyPublicDocumentedComponent[]
  focus: PublicComponentReviewFocus[]
  job: string
  key: string
  label: string
  proof: string
}

const decisionLanes: DecisionWorkshopLane[] = [
  {
    blocker: "Do not use Badge, Link, or glow as a fake primary action.",
    components: ["Button", "Link", "EmptyState"],
    focus: ["interaction", "composition", "feedback"],
    job: "The user needs one clear next step.",
    key: "act",
    label: "Act",
    proof:
      "Primary Button commits, Link exits quietly, and Empty State only appears when absence blocks progress.",
  },
  {
    blocker: "Do not hide strategic choices inside decorative fields.",
    components: ["Input", "Select", "RadioGroup", "Checkbox", "Switch"],
    focus: ["accessibility", "interaction", "state"],
    job: "The user needs to make an explicit choice.",
    key: "decide",
    label: "Decide",
    proof:
      "Fields keep labels, helper text, option meaning, immediate-state boundaries, and consent semantics separate.",
  },
  {
    blocker: "Do not let status speak through color alone.",
    components: ["Alert", "Badge", "Progress", "Skeleton", "EmptyState"],
    focus: ["feedback", "state", "accessibility"],
    job: "The user needs to understand what changed.",
    key: "recover",
    label: "Recover",
    proof:
      "Feedback explains state, progress stays bounded, loading resolves, and absence still offers a recovery path.",
  },
  {
    blocker:
      "Do not solve weak hierarchy by adding cards, radius, or louder gradients.",
    components: ["Card", "Image", "Text", "Stat", "Divider"],
    focus: ["content", "density", "composition"],
    job: "The surface needs readable authored rhythm.",
    key: "author",
    label: "Author",
    proof:
      "Media, summaries, copy, and dividers create cadence while preserving one focal hierarchy.",
  },
  {
    blocker:
      "Do not use Tabs as production route navigation or Avatar as ornament.",
    components: ["Tabs", "Avatar", "Link", "Badge"],
    focus: ["accessibility", "interaction", "content"],
    job: "The user needs to know where they are.",
    key: "orient",
    label: "Orient",
    proof:
      "Tabs stay local, identity remains meaningful, and support routes do not compete with the current task.",
  },
]

const themeOptions: ElyPublicSelectOption[] = [
  { label: "Elysia Bloom", value: "elysia-default" },
  { label: "Rose Nocturne", value: "rose-nocturne" },
  { label: "Azure Aria", value: "azure-aria" },
  { label: "Enterprise Calm", value: "enterprise-calm" },
]

const densityOptions: ElyPublicRadioGroupItem[] = [
  {
    key: "quiet",
    label: "Quiet",
    description: "Documentation and review surfaces.",
    value: "quiet",
  },
  {
    key: "luminous",
    label: "Luminous",
    description: "Default public-luxe product rhythm.",
    value: "luminous",
  },
  {
    key: "ceremonial",
    label: "Ceremonial",
    description: "Hero or high-visibility handoff moments.",
    value: "ceremonial",
  },
]

const specimenTabs: ElyPublicTabsItem[] = [
  {
    key: "intent",
    label: "Intent",
    description: "Name the user job before selecting components.",
  },
  {
    key: "proof",
    label: "Proof",
    description: "Check detailed story evidence and owner docs.",
  },
  {
    key: "reject",
    label: "Reject",
    description: "Refuse mismatched primitives before styling.",
  },
]

const routeKeys = [
  "component-index",
  "component-theme-specimen-wall",
  "component-mobile-density-review",
  "component-scenario-atlas",
  "component-operability-board",
  "component-failure-gallery",
] as const

const routeEntries = routeKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const getDoc = (component: ElyPublicDocumentedComponent) =>
  publicComponentDocs[component]

const getScenarioLinks = (component: ElyPublicDocumentedComponent) =>
  publicComponentScenarioCoverageByName.get(component)?.scenarios ?? []

const decisionRows = decisionLanes.map((lane) => ({
  ...lane,
  docs: lane.components.map(getDoc),
  scenarioCount: lane.components.reduce(
    (total, component) => total + getScenarioLinks(component).length,
    0,
  ),
  scenarioLinks: lane.components.flatMap((component) =>
    getScenarioLinks(component)
      .slice(0, 2)
      .map((scenario) => ({
        component,
        href: createStoryPath(scenario.storyId),
        label: `${component} · ${scenario.label}`,
      })),
  ),
}))

const totalScenarioLinks = decisionRows.reduce(
  (total, lane) => total + lane.scenarioCount,
  0,
)

const meta = {
  title: "Public Luxe/Components/Decision Workshop",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A component decision workshop that maps user jobs to owner-documented public primitives, detailed Storybook proof, and rejection boundaries.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicStat,
      ElyPublicSwitch,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeLaneKey = ref(decisionRows[0]?.key ?? "act")
      const activeTab = ref("intent")
      const density = ref("luminous")
      const noteTitle = ref("Moonlit preference handoff")
      const selectedTheme = ref("elysia-default")
      const syncEnabled = ref(true)
      const reviewedProof = ref(false)
      const activeLane = computed(
        () =>
          decisionRows.find((lane) => lane.key === activeLaneKey.value) ??
          decisionRows[0],
      )
      const readinessScore = computed(
        () =>
          44 +
          (reviewedProof.value ? 28 : 0) +
          (syncEnabled.value ? 12 : 0) +
          (noteTitle.value.trim().length > 0 ? 16 : 0),
      )

      return {
        activeLane,
        activeLaneKey,
        activeTab,
        createStoryPath,
        decisionRows,
        density,
        densityOptions,
        noteTitle,
        publicComponentReviewFocusLabels,
        readinessScore,
        reviewedProof,
        routeEntries,
        selectedTheme,
        specimenTabs,
        syncEnabled,
        themeOptions,
        totalScenarioLinks: String(totalScenarioLinks),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card ely-story-decision-workshop-hero" data-emphasis="feature">
            <div>
              <p class="ely-public-eyebrow">Component decision workshop</p>
              <h1 class="ely-public-section-title">Choose components by user job, then prove the choice</h1>
              <p class="ely-public-copy">
                This workshop keeps component selection practical: pick the user job,
                inspect recommended primitives, open detailed scenario proof, and
                reject semantic drift before adding more visual polish.
              </p>
            </div>
            <div class="ely-story-decision-workshop-hero__facts" aria-label="Decision workshop proof summary">
              <ElyPublicStat
                value="5"
                eyebrow="Jobs"
                tone="primary"
                helper="Act, decide, recover, author, orient."
              >
                decision lanes
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalScenarioLinks"
                eyebrow="Proof"
                tone="accent"
                helper="Detailed stories reachable from the workshop."
              >
                scenario links
              </ElyPublicStat>
              <ElyPublicProgress
                label="Current specimen readiness"
                tone="success"
                :value="readinessScore"
              />
            </div>
          </section>

          <section class="ely-story-decision-workshop-route" aria-label="Component review route">
            <a
              v-for="entry in routeEntries"
              :key="entry.key"
              :href="createStoryPath(entry.storyId)"
              target="_top"
              rel="noreferrer"
            >
              <span>{{ entry.eyebrow }}</span>
              <strong>{{ entry.title }}</strong>
              <small>{{ entry.stat }}</small>
            </a>
          </section>

          <section class="ely-story-decision-workshop-layout">
            <article class="ely-story-decision-workshop-panel">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Decision lanes</p>
                  <h2 class="ely-public-section-title">Start from intent, not appearance</h2>
                </div>
                <p>
                  Selecting a lane changes the proof packet and the live specimen notes.
                  This keeps component choice reviewable before page pattern polish.
                </p>
              </div>
              <div class="ely-story-decision-workshop-lanes">
                <button
                  v-for="lane in decisionRows"
                  :key="lane.key"
                  type="button"
                  class="ely-story-decision-workshop-lane"
                  :aria-pressed="activeLaneKey === lane.key"
                  @click="activeLaneKey = lane.key"
                >
                  <span>{{ lane.label }}</span>
                  <strong>{{ lane.job }}</strong>
                  <small>{{ lane.scenarioCount }} scenario proofs</small>
                </button>
              </div>

              <div class="ely-story-decision-workshop-packet ely-story-offset-md">
                <div>
                  <p class="ely-public-eyebrow">Active lane packet</p>
                  <h3>{{ activeLane.label }} · {{ activeLane.job }}</h3>
                  <p>{{ activeLane.proof }}</p>
                </div>
                <div class="ely-story-decision-workshop-chip-list">
                  <ElyPublicBadge
                    v-for="doc in activeLane.docs"
                    :key="doc.name"
                    tone="primary"
                  >
                    {{ doc.name }}
                  </ElyPublicBadge>
                </div>
                <div class="ely-story-decision-workshop-focus-list">
                  <span v-for="focus in activeLane.focus" :key="focus">
                    {{ publicComponentReviewFocusLabels[focus] }}
                  </span>
                </div>
                <ElyPublicAlert tone="warning" title="Reject line">
                  {{ activeLane.blocker }}
                </ElyPublicAlert>
                <p class="ely-public-eyebrow">Detailed scenario proof links</p>
                <div class="ely-story-decision-workshop-proof-list" aria-label="Detailed scenario proof links">
                  <a
                    v-for="scenario in activeLane.scenarioLinks"
                    :key="scenario.label"
                    :href="scenario.href"
                    target="_top"
                    rel="noreferrer"
                  >
                    {{ scenario.label }}
                  </a>
                </div>
              </div>
            </article>

            <aside class="ely-story-decision-workshop-rail">
              <p class="ely-public-eyebrow">Live decision specimen</p>
              <h2 class="ely-public-section-title">Operate the choice before approving it</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <ElyPublicTabs v-model="activeTab" :items="specimenTabs">
                  <template v-slot:default="{ activeItem }">
                    <div class="ely-story-decision-workshop-tab">
                      <ElyPublicBadge tone="accent">{{ activeItem?.label }}</ElyPublicBadge>
                      <ElyPublicText tone="muted">{{ activeItem?.description }}</ElyPublicText>
                    </div>
                  </template>
                </ElyPublicTabs>
                <ElyPublicInput
                  v-model="noteTitle"
                  label="Review note title"
                  description="A named surface is easier to evaluate than a vague decoration request."
                />
                <ElyPublicSelect
                  v-model="selectedTheme"
                  :options="themeOptions"
                  label="Theme family reference"
                  description="The theme family is selected as a whole; local color mixing is blocked."
                />
                <ElyPublicRadioGroup
                  v-model="density"
                  aria-label="Specimen density"
                  :items="densityOptions"
                />
                <ElyPublicSwitch
                  v-model="syncEnabled"
                  label="Sync review notes"
                  description="Switches are immediate runtime preferences."
                />
                <ElyPublicCheckbox
                  v-model="reviewedProof"
                  label="I opened at least one detailed scenario proof"
                  description="Component selection is not approved from a static preview alone."
                />
                <ElyPublicDivider label="Outcome" tone="accent" />
                <ElyPublicAlert
                  :tone="reviewedProof ? 'success' : 'warning'"
                  :title="reviewedProof ? 'Proof checked' : 'Proof still pending'"
                >
                  {{ activeLane.label }} lane uses {{ selectedTheme }} at {{ density }} density.
                </ElyPublicAlert>
                <div class="ely-public-inline">
                  <ElyPublicButton>Approve component choice</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Keep reviewing</ElyPublicButton>
                </div>
              </div>
            </aside>
          </section>

          <section class="ely-story-decision-workshop-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Decision table</p>
                <h2 class="ely-public-section-title">Every lane needs a proof packet and a blocker</h2>
              </div>
              <p>
                A component system becomes usable when reviewers can approve or reject a choice without reading implementation code.
              </p>
            </div>
            <div class="ely-story-decision-workshop-table">
              <article
                v-for="lane in decisionRows"
                :key="lane.key + '-row'"
                class="ely-story-decision-workshop-row"
              >
                <div>
                  <span>{{ lane.label }}</span>
                  <strong>{{ lane.job }}</strong>
                  <p>{{ lane.proof }}</p>
                </div>
                <div class="ely-story-decision-workshop-chip-list">
                  <ElyPublicBadge
                    v-for="doc in lane.docs"
                    :key="lane.key + doc.name"
                    tone="primary"
                  >
                    {{ doc.name }}
                  </ElyPublicBadge>
                </div>
                <ElyPublicText tone="muted">{{ lane.blocker }}</ElyPublicText>
              </article>
            </div>
          </section>

          <section class="ely-story-decision-workshop-panel ely-story-decision-workshop-empty">
            <ElyPublicEmptyState
              eyebrow="Review fallback"
              title="If intent is unclear, stop before styling"
              tone="accent"
            >
              Ask which user job the surface serves. If nobody can answer, the
              correct next step is not a new theme color, a bigger card, or a stronger glow.
              <template v-slot:actions>
                <ElyPublicButton>Write the user job</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open failure gallery</ElyPublicButton>
              </template>
            </ElyPublicEmptyState>
          </section>
        </div>
      </section>
    `,
  }),
}
