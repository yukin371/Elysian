import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicProgress,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Alert

const meta = {
  title: "Public Luxe/Components/Alert",
  component: ElyPublicAlert,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: doc.description,
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Semantic alert tone.",
    },
    title: { control: "text", description: "Alert heading." },
    eyebrow: { control: "text", description: "Optional label above title." },
    dismissible: {
      control: "boolean",
      description: "Shows a close control for safely removable alerts.",
    },
    dismissLabel: {
      control: "text",
      description: "Accessible label for the close control.",
    },
  },
  args: {
    dismissible: false,
    dismissLabel: "Dismiss alert",
    eyebrow: "Preview status",
    title: "Theme snapshot updated",
    tone: "info",
  },
} satisfies Meta<typeof ElyPublicAlert>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicAlert, ElyPublicButton },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Alert playground</p>
            <h1 class="ely-public-section-title">Tune semantic feedback</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert v-bind="args">
                The active surface now reflects the selected theme family and resolved mode.

                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Review snapshot</ElyPublicButton>
                </template>
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const Anatomy: Story = {
  render: () => ({
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-doc-grid">
            <div class="ely-story-doc-panel">
              <p class="ely-public-eyebrow">{{ doc.category }}</p>
              <h2>{{ doc.name }}</h2>
              <p class="ely-story-offset-sm">{{ doc.description }}</p>
              <ul class="ely-story-doc-list">
                <li v-for="item in doc.usage" :key="item">{{ item }}</li>
              </ul>
              <div class="ely-story-doc-guidance">
                <h3>Decision guidance</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.decision" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="ely-story-doc-guidance">
                <h3>Composition</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.composition" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="ely-story-doc-guidance" data-kind="avoid">
                <h3>Anti-patterns</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.antiPatterns" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
            <div class="ely-story-demo-frame">
              <div class="ely-story-doc-panel">
                <h3>State matrix</h3>
                <div class="ely-story-doc-matrix">
                  <div v-for="state in doc.states" :key="state.name" class="ely-story-doc-state">
                    <strong>{{ state.name }}</strong>
                    <span>{{ state.description }}</span>
                  </div>
                </div>
              </div>
              <div class="ely-story-doc-panel">
                <h3>Props</h3>
                <div class="ely-story-doc-table">
                  <div class="ely-story-doc-row" data-heading="true">
                    <span>Name</span><span>Type</span><span>Default</span><span>Description</span>
                  </div>
                  <div v-for="prop in doc.props" :key="prop.name" class="ely-story-doc-row">
                    <span class="ely-story-doc-code">{{ prop.name }}{{ prop.required ? ' *' : '' }}</span>
                    <span class="ely-story-doc-code">{{ prop.type }}</span>
                    <span class="ely-story-doc-cell">{{ prop.defaultValue ?? '-' }}</span>
                    <span class="ely-story-doc-cell">{{ prop.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Alert tones</p>
            <h1 class="ely-public-section-title">Status color keeps fixed meaning</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert tone="info" title="Review note added">
                Information explains context without becoming a brand accent.
              </ElyPublicAlert>
              <ElyPublicAlert tone="success" title="Snapshot pinned">
                Success confirms completion and can stay calm.
              </ElyPublicAlert>
              <ElyPublicAlert tone="warning" title="Dark mode still needs review">
                Warning names recoverable risk and gives a next action.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Open dark review</ElyPublicButton>
                </template>
              </ElyPublicAlert>
              <ElyPublicAlert tone="danger" title="Contrast gate failed">
                Danger is reserved for blocking or destructive risk, not emphasis.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Inspect failures</ElyPublicButton>
                </template>
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Alert states</p>
            <h1 class="ely-public-section-title">Info, success, warning, danger</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert tone="info" title="Preview updated">
                The active surface now reflects the selected theme family and resolved mode.
              </ElyPublicAlert>
              <ElyPublicAlert tone="success" title="Preset saved">
                The comparison snapshot has been pinned for review.
              </ElyPublicAlert>
              <ElyPublicAlert tone="warning" title="Guardrail active">
                Open-ended overrides remain locked until the governed roster is approved.

                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Review token scope</ElyPublicButton>
                </template>
              </ElyPublicAlert>
              <ElyPublicAlert tone="danger" title="Unpaired mode detected">
                A selected override does not yet have a verified dark variant.
              </ElyPublicAlert>
            </div>
          </section>

          <section class="ely-story-doc-panel">
            <h3>Accessibility notes</h3>
            <ul class="ely-story-doc-list">
              <li v-for="item in doc.accessibility" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RecoveryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Alert recovery scenarios</p>
            <h1 class="ely-public-section-title">Feedback should name the repair path</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert
                tone="warning"
                eyebrow="Theme review"
                title="Accent is competing with primary"
              >
                Move the decorative accent back to a badge or supporting illustration before approving the page.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Open action hierarchy</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">Keep reviewing</ElyPublicButton>
                </template>
              </ElyPublicAlert>

              <ElyPublicAlert
                tone="danger"
                eyebrow="Accessibility gate"
                title="Invalid state is color-only"
              >
                Add structural text, aria description, or a visible border change before the component can ship.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Review invalid state</ElyPublicButton>
                </template>
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RepairPriorityScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicProgress,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card" data-emphasis="feature">
              <p class="ely-public-eyebrow">Alert repair priority</p>
              <h2 class="ely-public-section-title">Feedback names what changed and what to do next</h2>
              <p class="ely-public-muted-copy">
                Alerts are not colored decoration. The title names the state,
                the body explains consequence, and the action points to one
                repair path.
              </p>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Release evidence" tone="warning" :value="68" />
                <ElyPublicAlert
                  eyebrow="Blocked gate"
                  title="Dark mode evidence is incomplete"
                  tone="warning"
                >
                  Finish the paired dark preview before approving the public theme.
                  <template v-slot:actions>
                    <ElyPublicButton size="sm" tone="secondary">Open dark review</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Keep editing</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Escalation ladder</p>
              <h2 class="ely-public-section-title">Tone changes severity, not ornament budget</h2>
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="neutral">info explains</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">warning repairs</ElyPublicBadge>
                  <ElyPublicBadge tone="danger">danger blocks</ElyPublicBadge>
                </div>
                <ElyPublicAlert tone="danger" title="Contrast failure blocks publish">
                  Danger must state the blocker and the review route; it should never be used only for stronger color.
                  <template v-slot:actions>
                    <ElyPublicButton size="sm" tone="secondary">Inspect contrast</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const DismissibleScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicBadge, ElyPublicButton },
    setup() {
      const hidden = ref(false)
      return { hidden }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Alert dismissible scenarios</p>
            <h1 class="ely-public-section-title">Only advisory feedback can be safely dismissed</h1>
            <p class="ely-public-copy">
              Dismissible Alert is for local, non-blocking feedback that has already been understood. Required repairs stay visible until the state is fixed.
            </p>

            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert
                v-if="!hidden"
                dismissible
                dismiss-label="Hide saved snapshot notice"
                eyebrow="Review saved"
                title="Snapshot is pinned for this session"
                tone="success"
                @dismiss="hidden = true"
              >
                The note can disappear because the saved state is already visible in the surrounding surface.
              </ElyPublicAlert>

              <div v-else class="ely-public-inline">
                <ElyPublicBadge tone="success">notice dismissed</ElyPublicBadge>
                <ElyPublicButton size="sm" tone="ghost" @click="hidden = false">
                  Restore advisory alert
                </ElyPublicButton>
              </div>

              <ElyPublicAlert
                eyebrow="Still required"
                title="Contrast repair remains visible"
                tone="warning"
              >
                This alert is not dismissible because the user still needs the repair path before approval.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Open contrast review</ElyPublicButton>
                </template>
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const FeedbackChainScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicProgress,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Alert feedback chain</p>
            <h1 class="ely-public-section-title">Feedback should move from notice to repair to confirmation</h1>
            <p class="ely-public-copy">
              A polished alert is not just a colored box. It names the state, explains consequence, offers one repair path, and confirms completion.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Notice</p>
              <h2 class="ely-public-section-title">Information changes context</h2>
              <ElyPublicAlert tone="info" title="Review scope changed">
                The mobile density lane was added to this component review.
              </ElyPublicAlert>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Repair</p>
              <h2 class="ely-public-section-title">Warning gives one route</h2>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Mode pairing evidence" tone="warning" :value="62" />
                <ElyPublicAlert tone="warning" title="Dark snapshot still missing">
                  Add the paired dark preview before approving the theme family.
                  <template v-slot:actions>
                    <ElyPublicButton size="sm" tone="secondary">Open dark preview</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Keep editing</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Confirmation</p>
              <h2 class="ely-public-section-title">Success closes the loop</h2>
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">paired modes</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">recovery visible</ElyPublicBadge>
                </div>
                <ElyPublicAlert tone="success" title="Preview evidence is ready">
                  The reviewer can now continue to release gates without guessing what changed.
                </ElyPublicAlert>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
