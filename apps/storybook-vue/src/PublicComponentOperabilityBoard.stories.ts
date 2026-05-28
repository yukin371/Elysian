import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { publicComponentScenarioCoverageByName } from "./component-story-coverage"
import { createStoryPath } from "./public-luxe-showcase"

const operabilityRows = [
  {
    blocker:
      "Block if Escape, initial focus, close action, or focus restoration is missing.",
    componentKey: "Dialog",
    evidence: "Escape path, backdrop dismissal, and trigger focus restoration.",
    job: "Interrupt without turning the modal into a page shell.",
    primaryScenario: "public-luxe-components-dialog--dismissal-rules",
    score: 86,
    state: "Focus trap",
    tone: "primary",
  },
  {
    blocker:
      "Block if warning or danger feedback only changes color without repair copy.",
    componentKey: "Alert",
    evidence: "Role mapping, concise title, and explicit next step.",
    job: "Explain status and recovery near the affected surface.",
    primaryScenario: "public-luxe-components-alert--recovery-scenarios",
    score: 82,
    state: "Recovery",
    tone: "warning",
  },
  {
    blocker:
      "Block if the field ships with placeholder-only guidance or silent invalid state.",
    componentKey: "Input",
    evidence:
      "Visible label, helper text, invalid message, and controlled value.",
    job: "Let users enter, repair, and understand freeform content.",
    primaryScenario: "public-luxe-components-input--validation-scenarios",
    score: 88,
    state: "Invalid",
    tone: "success",
  },
  {
    blocker:
      "Block if options behave like route navigation or hide the consequence of selection.",
    componentKey: "Select",
    evidence: "Label, placeholder, selected value, and disabled option proof.",
    job: "Choose one stable option without becoming a custom picker.",
    primaryScenario: "public-luxe-components-select--option-sets",
    score: 78,
    state: "Selection",
    tone: "accent",
  },
  {
    blocker: "Block if switch is used for consent or delayed submit choices.",
    componentKey: "Switch",
    evidence:
      "Immediate on/off state, aria-checked, description, and disabled state.",
    job: "Toggle a runtime preference with clear consequences.",
    primaryScenario: "public-luxe-components-switch--toggle-scenarios",
    score: 80,
    state: "Runtime",
    tone: "primary",
  },
  {
    blocker:
      "Block if tabs replace page routes or hide required sequential steps.",
    componentKey: "Tabs",
    evidence: "Arrow key navigation, Home/End path, active panel linkage.",
    job: "Switch peer sections inside one local surface.",
    primaryScenario: "public-luxe-components-tabs--keyboard-review",
    score: 84,
    state: "Keyboard",
    tone: "primary",
  },
  {
    blocker:
      "Block if the placeholder becomes final content or carries unique meaning.",
    componentKey: "Skeleton",
    evidence:
      "Known layout placeholder, quiet shimmer, and final-state replacement.",
    job: "Preserve rhythm while known content is loading.",
    primaryScenario: "public-luxe-components-skeleton--loading-scenarios",
    score: 76,
    state: "Loading",
    tone: "warning",
  },
  {
    blocker:
      "Block if progress has no readable label, percentage, or bounded task.",
    componentKey: "Progress",
    evidence:
      "Labeled bounded range, visible percentage, and nearby task meaning.",
    job: "Explain readiness or completion before a user acts.",
    primaryScenario: "public-luxe-components-progress--product-scenarios",
    score: 83,
    state: "Bounded",
    tone: "accent",
  },
] as const

const operabilityGates = [
  {
    label: "Keyboard",
    target: "Focusable controls keep native or documented keyboard paths.",
  },
  {
    label: "Repair",
    target:
      "Invalid, warning, danger, or empty states tell users what to do next.",
  },
  {
    label: "Meaning",
    target: "State is never represented by color, shimmer, or ornament alone.",
  },
  {
    label: "Ownership",
    target:
      "Every high-risk behavior points back to owner docs or detailed component stories.",
  },
] as const

const reviewSequence = [
  "Open the detailed scenario before approving a component from a showcase tile.",
  "Confirm the component's job matches the user decision on the page.",
  "Check disabled, loading, invalid, selected, and recovery states before visual polish.",
  "Reject local CSS if it changes radius, color role, or state semantics to hide an operability gap.",
] as const

const componentDocEntries = Object.entries(publicComponentDocs)
const operabilityScore = Math.round(
  operabilityRows.reduce((total, row) => total + row.score, 0) /
    operabilityRows.length,
)
const blockedRowCount = operabilityRows.filter((row) =>
  row.blocker.toLowerCase().startsWith("block"),
).length

const getDoc = (componentKey: string) =>
  componentDocEntries.find(([key]) => key === componentKey)?.[1]

const getCoverage = (componentKey: keyof typeof publicComponentDocs) =>
  publicComponentScenarioCoverageByName.get(componentKey)

const meta = {
  title: "Public Luxe/Components/Operability Board",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Coverage: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const rows = operabilityRows.map((row) => {
        const doc = getDoc(row.componentKey)
        const coverage = getCoverage(
          row.componentKey as keyof typeof publicComponentDocs,
        )

        return {
          ...row,
          antiPattern: doc?.antiPatterns[0] ?? "Do not bypass owner docs.",
          decision: doc?.decision[0] ?? "Choose the component by user job.",
          doc,
          scenarioCount: coverage?.scenarios.length ?? 0,
        }
      })

      return {
        blockedRowCount: String(blockedRowCount),
        createStoryPath,
        operabilityGates,
        operabilityScore,
        reviewSequence,
        rows,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-operability-hero-panel">
            <p class="ely-public-eyebrow">Component operability board</p>
            <h1 class="ely-public-section-title">A component is not approved until its risky states are usable</h1>
            <p class="ely-public-copy">
              This board focuses on high-risk public primitives: dialog focus,
              alert repair, form validation, selection, toggles, tabs, loading,
              and bounded progress. It consumes owner docs and detailed story
              links instead of becoming another component API source.
            </p>

            <div class="ely-story-operability-stats" aria-label="Component operability summary">
              <ElyPublicStat
                :value="String(rows.length)"
                eyebrow="Risk rows"
                helper="High-risk components that need behavior evidence."
                tone="primary"
              >
                operability checks
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(operabilityScore)"
                eyebrow="Average evidence"
                helper="Signals whether risky states have detailed proof."
                tone="accent"
              >
                review score
              </ElyPublicStat>
              <ElyPublicStat
                :value="blockedRowCount"
                eyebrow="Blocking rules"
                helper="Rows with explicit rejection criteria."
                tone="muted"
              >
                blockers named
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-operability-layout">
            <article class="ely-story-operability-board-panel">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Risk board</p>
                  <h2 class="ely-public-section-title">Review the state that would break the user flow</h2>
                </div>
                <p>
                  Each row links to a detailed story and names the blocker that
                  should stop approval if the behavior regresses.
                </p>
              </div>

              <div class="ely-story-operability-list ely-story-offset-md">
                <a
                  v-for="row in rows"
                  :key="row.componentKey"
                  class="ely-story-operability-row"
                  :href="createStoryPath(row.primaryScenario)"
                  target="_top"
                  rel="noreferrer"
                >
                  <div class="ely-story-operability-name">
                    <span>{{ row.state }}</span>
                    <strong>{{ row.componentKey }}</strong>
                    <em>{{ row.scenarioCount }} detailed stories</em>
                  </div>
                  <div class="ely-story-operability-score">
                    <ElyPublicProgress
                      :value="row.score"
                      :label="row.componentKey + ' operability evidence'"
                      :tone="row.tone"
                    />
                    <span>{{ row.score }}%</span>
                  </div>
                  <dl>
                    <div>
                      <dt>User job</dt>
                      <dd>{{ row.job }}</dd>
                    </div>
                    <div>
                      <dt>Evidence</dt>
                      <dd>{{ row.evidence }}</dd>
                    </div>
                    <div>
                      <dt>Blocker</dt>
                      <dd>{{ row.blocker }}</dd>
                    </div>
                  </dl>
                  <div class="ely-story-operability-doc">
                    <ElyPublicBadge tone="primary">Owner decision</ElyPublicBadge>
                    <ElyPublicText>{{ row.decision }}</ElyPublicText>
                    <ElyPublicBadge tone="danger">Reject</ElyPublicBadge>
                    <ElyPublicText tone="muted">{{ row.antiPattern }}</ElyPublicText>
                  </div>
                </a>
              </div>
            </article>

            <aside class="ely-story-operability-gate-panel">
              <p class="ely-public-eyebrow">Approval gates</p>
              <h2 class="ely-public-section-title">Usefulness beats ornament</h2>
              <div class="ely-story-operability-gates ely-story-offset-md">
                <article
                  v-for="gate in operabilityGates"
                  :key="gate.label"
                  class="ely-story-operability-gate"
                >
                  <ElyPublicBadge tone="accent">{{ gate.label }}</ElyPublicBadge>
                  <ElyPublicText weight="semibold">{{ gate.target }}</ElyPublicText>
                </article>
              </div>
              <ElyPublicDivider label="Blocking alert" align="start" />
              <ElyPublicAlert
                tone="warning"
                title="Do not approve from static beauty"
                eyebrow="Review rule"
              >
                A component can look elegant and still fail if focus, repair,
                disabled, loading, or recovery states are absent.
              </ElyPublicAlert>
            </aside>
          </section>

          <section class="ely-story-operability-sequence-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Review sequence</p>
                <h2 class="ely-public-section-title">Approve components from behavior back to visuals</h2>
              </div>
              <p>
                This order keeps public-luxe polished without hiding incomplete
                interaction work behind glow, gradients, or card treatment.
              </p>
            </div>
            <div class="ely-story-operability-sequence ely-story-offset-md">
              <div
                v-for="(step, index) in reviewSequence"
                :key="step"
                class="ely-story-operability-step"
              >
                <span>0{{ index + 1 }}</span>
                <ElyPublicText weight="semibold">{{ step }}</ElyPublicText>
              </div>
            </div>
            <ElyPublicDivider label="Review routes" align="start" />
            <div class="ely-story-operability-links">
              <ElyPublicLink :href="createStoryPath('public-luxe-components-index--coverage')">
                Return to component index
              </ElyPublicLink>
              <ElyPublicLink :href="createStoryPath('public-luxe-foundations-component-usage-matrix--overview')">
                Review primitive choices
              </ElyPublicLink>
              <ElyPublicLink
                :href="createStoryPath('public-luxe-components-component-failure-gallery--overview')"
                tone="muted"
              >
                Review rejected primitive use
              </ElyPublicLink>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
