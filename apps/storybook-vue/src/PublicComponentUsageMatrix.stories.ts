import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicEmptyState,
  ElyPublicImage,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const decisionLanes = [
  {
    title: "Need the user to act",
    components: ["Button", "Link", "Empty State"],
    guidance:
      "Use one primary Button for the next step, Link for low-pressure route exits, and Empty State when absence needs recovery.",
    risk: "Multiple strong CTAs in one surface make the page feel noisy and less elegant.",
  },
  {
    title: "Need the user to decide",
    components: ["Input", "Select", "Checkbox", "Radio Group", "Switch"],
    guidance:
      "Use field primitives for explicit choices; switch only when the setting applies immediately.",
    risk: "Decorative fields without labels or helper copy fail before visual polish even matters.",
  },
  {
    title: "Need the user to understand state",
    components: ["Alert", "Badge", "Progress", "Skeleton"],
    guidance:
      "Use status components as evidence: explain what happened, how far along it is, and what to do next.",
    risk: "Color-only status cues are fragile across dark mode, accessibility, and theme families.",
  },
  {
    title: "Need the page to feel authored",
    components: ["Card", "Image", "Stat", "Text", "Divider", "Avatar"],
    guidance:
      "Use content primitives to create cadence: one focal media moment, one summary cluster, then quiet text rhythm.",
    risk: "More cards, bigger radius, or louder gradients are not substitutes for hierarchy.",
  },
] as const

const patternRecipes = [
  {
    name: "Creator Center",
    components: "Tabs, Input, Switch, Stat, Progress",
    rule: "Keep editing local and reversible; theme settings should feel curated, not like an admin form.",
  },
  {
    name: "Member Rewards",
    components: "Button, Progress, Badge, Alert, Link",
    rule: "Make the claim path singular, explain scarcity calmly, and keep support/history as low-pressure recovery.",
  },
  {
    name: "Editorial Collection",
    components: "Image, Card, Text, Divider, Empty State",
    rule: "Let imagery carry mood, but require visible reading order and archive recovery.",
  },
  {
    name: "Event Landing",
    components: "Image, Button, Progress, Stat, Link",
    rule: "One registration action, one seat/progress explanation, and policy links that do not compete with the CTA.",
  },
  {
    name: "Forms & Feedback",
    components: "Input, Select, Checkbox, Alert, Progress",
    rule: "Every field needs label, help, validation, consent, and a recovery path before decorative treatment.",
  },
] as const

const componentChoiceRows = [
  {
    decision: "Button vs Link",
    chooseA: "Button",
    whenA:
      "The action mutates state, submits a flow, opens a dialog, or starts the primary next step.",
    chooseB: "Link",
    whenB:
      "The action navigates, explains, opens support, or lets the user leave without pressure.",
    blocker:
      "A Link styled as the main submit action hides commitment; a Button used for route reading creates false urgency.",
  },
  {
    decision: "Checkbox vs Switch",
    chooseA: "Checkbox",
    whenA:
      "The user is making an explicit, reviewable selection that can wait for form submit.",
    chooseB: "Switch",
    whenB:
      "The setting applies immediately and the current on/off state is the whole decision.",
    blocker:
      "Switches inside long forms imply instant effects; checkboxes used for live toggles feel inert.",
  },
  {
    decision: "Select vs Radio Group",
    chooseA: "Select",
    whenA:
      "The choice list is long, secondary, or not worth occupying permanent page space.",
    chooseB: "Radio Group",
    whenB:
      "The user must compare a small set of visible options before committing.",
    blocker:
      "Do not hide a strategic choice inside Select; do not use Radio Group for a menu-sized list.",
  },
  {
    decision: "Badge vs Alert",
    chooseA: "Badge",
    whenA:
      "A compact status label supports existing content and does not require action.",
    chooseB: "Alert",
    whenB:
      "The state needs explanation, recovery, or a visible interruption in the reading path.",
    blocker:
      "Badges cannot carry errors alone; Alerts should not become decorative banners.",
  },
  {
    decision: "Skeleton vs Progress",
    chooseA: "Skeleton",
    whenA:
      "The layout is temporarily loading and the final content shape is already known.",
    chooseB: "Progress",
    whenB:
      "The user needs measurable completion, upload, tier, or staged readiness evidence.",
    blocker:
      "Skeleton is never final content; Progress must not pretend to be decorative ornament.",
  },
  {
    decision: "Dialog vs Card",
    chooseA: "Dialog",
    whenA:
      "The user must resolve a short interruptive decision before returning to the page.",
    chooseB: "Card",
    whenB:
      "The content belongs in the normal reading flow and does not block the page.",
    blocker:
      "Dialogs should not become full page shells; Cards should not hide destructive confirmation.",
  },
  {
    decision: "Image vs Avatar",
    chooseA: "Image",
    whenA:
      "The surface needs governed media ratio, atmosphere, or editorial context.",
    chooseB: "Avatar",
    whenB: "The user or entity identity needs a compact fallback-safe marker.",
    blocker:
      "Avatar is not a mood image; Image needs alt text, aspect, and fallback rules.",
  },
] as const

const approvalRedLines = [
  "Do not ask for a new variant before proving the existing primitive is wrong for the job.",
  "Do not solve ambiguous intent with stronger color, larger radius, or more glow.",
  "Do not let status components speak only through color; every state needs text evidence.",
  "Do not approve a surface where the primary action cannot be named without reading the whole page.",
] as const

const reviewQuestions = [
  "Can a reviewer name the primary action within three seconds?",
  "Does every status component include text that works without color?",
  "Can the surface lose its ornament and still remain usable?",
  "Are radius, color role, and density coming from the public preset instead of local improvisation?",
] as const

const categoryCounts = Object.values(publicComponentDocs).reduce(
  (counts, component) => {
    counts[component.category] = (counts[component.category] ?? 0) + 1
    return counts
  },
  {} as Record<string, number>,
)

const meta = {
  title: "Public Luxe/Foundations/Component Usage Matrix",
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
      ElyPublicButton,
      ElyPublicEmptyState,
      ElyPublicImage,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicText,
    },
    setup() {
      return {
        approvalRedLines,
        categoryCounts,
        componentChoiceRows,
        decisionLanes,
        patternRecipes,
        reviewQuestions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-component-usage-principle" data-emphasis="feature">
            <p class="ely-public-eyebrow">Component usage matrix</p>
            <h1 class="ely-public-section-title">Choose the primitive before polishing the surface</h1>
            <p class="ely-public-copy">
              This matrix turns the component catalog into a decision tool. It
              helps reviewers decide whether a public-luxe surface is using the
              right primitive, the right emphasis, and the right recovery path
              before asking for more ornament.
            </p>

            <div class="ely-story-component-usage-stats" aria-label="Component category coverage">
              <div class="ely-story-component-usage-stat">
                <span>Act</span>
                <strong>{{ categoryCounts.actions ?? 0 }}</strong>
                <p>Button and Link keep intent separate.</p>
              </div>
              <div class="ely-story-component-usage-stat">
                <span>Decide</span>
                <strong>{{ categoryCounts.form ?? 0 }}</strong>
                <p>Inputs and choices stay explicit.</p>
              </div>
              <div class="ely-story-component-usage-stat">
                <span>Recover</span>
                <strong>{{ categoryCounts.feedback ?? 0 }}</strong>
                <p>Feedback carries text, not color alone.</p>
              </div>
              <div class="ely-story-component-usage-stat">
                <span>Author</span>
                <strong>{{ categoryCounts.content ?? 0 }}</strong>
                <p>Media, text, and summary set cadence.</p>
              </div>
            </div>
          </section>

          <section class="ely-story-component-usage-layout">
            <article class="ely-story-component-usage-lane-panel">
              <p class="ely-public-eyebrow">Decision lanes</p>
              <h2 class="ely-public-section-title">Use components by job, not by decoration</h2>
              <div class="ely-story-component-usage-lanes ely-story-offset-md">
                <div
                  v-for="lane in decisionLanes"
                  :key="lane.title"
                  class="ely-story-component-usage-lane"
                >
                  <div>
                    <strong>{{ lane.title }}</strong>
                    <p>{{ lane.guidance }}</p>
                  </div>
                  <div class="ely-story-component-usage-chips" aria-label="Recommended components">
                    <ElyPublicBadge
                      v-for="component in lane.components"
                      :key="component"
                      tone="primary"
                    >
                      {{ component }}
                    </ElyPublicBadge>
                  </div>
                  <ElyPublicAlert
                    tone="warning"
                    title="Review risk"
                    eyebrow="Before approval"
                  >
                    {{ lane.risk }}
                  </ElyPublicAlert>
                </div>
              </div>
            </article>

            <article class="ely-story-component-usage-specimen-panel">
              <p class="ely-public-eyebrow">Live specimen</p>
              <h2 class="ely-public-section-title">One focal surface, one next step</h2>
              <div class="ely-story-component-usage-specimen ely-story-offset-md">
                <ElyPublicImage
                  :src="undefined"
                  alt="Abstract moonlit crystal preview"
                  aspect="landscape"
                />
                <div class="ely-story-component-usage-copy">
                  <ElyPublicBadge tone="accent">Moonlit release</ElyPublicBadge>
                  <ElyPublicText size="lg" weight="semibold">
                    A composed public surface should read like a small ritual:
                    context first, proof second, action last.
                  </ElyPublicText>
                  <ElyPublicProgress
                    label="Launch readiness"
                    tone="success"
                    :value="76"
                  />
                </div>
                <div class="ely-story-component-usage-actions">
                  <ElyPublicButton>Reserve preview</ElyPublicButton>
                  <ElyPublicLink href="/?path=/story/public-luxe-foundations-action-hierarchy--overview">
                    Check action hierarchy
                  </ElyPublicLink>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-component-usage-choice-panel">
            <p class="ely-public-eyebrow">Component choice matrix</p>
            <h2 class="ely-public-section-title">Most review mistakes are primitive mismatches</h2>
            <div class="ely-story-component-usage-choice-table ely-story-offset-md">
              <article
                v-for="row in componentChoiceRows"
                :key="row.decision"
                class="ely-story-component-usage-choice"
              >
                <div class="ely-story-component-usage-choice-head">
                  <ElyPublicBadge tone="primary">{{ row.decision }}</ElyPublicBadge>
                  <strong>{{ row.blocker }}</strong>
                </div>
                <div class="ely-story-component-usage-choice-columns">
                  <div>
                    <span>{{ row.chooseA }}</span>
                    <p>{{ row.whenA }}</p>
                  </div>
                  <div>
                    <span>{{ row.chooseB }}</span>
                    <p>{{ row.whenB }}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-component-usage-recipe-panel">
            <p class="ely-public-eyebrow">Pattern recipes</p>
            <h2 class="ely-public-section-title">Common public-luxe combinations</h2>
            <div class="ely-story-component-usage-recipes ely-story-offset-md">
              <article
                v-for="recipe in patternRecipes"
                :key="recipe.name"
                class="ely-story-component-usage-recipe"
              >
                <strong>{{ recipe.name }}</strong>
                <span>{{ recipe.components }}</span>
                <p>{{ recipe.rule }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-component-usage-approval-panel">
            <p class="ely-public-eyebrow">Approval questions</p>
            <h2 class="ely-public-section-title">Reject incoherence early, kindly, and visibly</h2>
            <div class="ely-story-component-usage-checklist ely-story-offset-md">
              <div
                v-for="question in reviewQuestions"
                :key="question"
                class="ely-story-component-usage-check"
              >
                <span aria-hidden="true"></span>
                <strong>{{ question }}</strong>
              </div>
            </div>
            <div class="ely-story-component-usage-redlines ely-story-offset-md">
              <ElyPublicAlert
                tone="danger"
                title="Approval red lines"
                eyebrow="Reject before styling"
              >
                A component choice is not ready if reviewers cannot tell
                whether it is acting, navigating, selecting, informing, loading,
                or authoring the page.
              </ElyPublicAlert>
              <div class="ely-story-component-usage-redline-list">
                <div
                  v-for="redLine in approvalRedLines"
                  :key="redLine"
                  class="ely-story-component-usage-redline"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ redLine }}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
