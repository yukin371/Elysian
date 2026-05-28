import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicToast,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Toast

const meta = {
  title: "Public Luxe/Components/Toast",
  component: ElyPublicToast,
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
    actionAriaLabel: {
      control: "text",
      description: "Accessible label for the optional toast action.",
    },
    actionLabel: {
      control: "text",
      description: "Optional single local action label.",
    },
    description: { control: "text", description: "Concise supporting copy." },
    dismissLabel: {
      control: "text",
      description: "Accessible label for the dismiss button.",
    },
    dismissible: {
      control: "boolean",
      description: "Show a dismiss button and emit dismiss.",
    },
    title: { control: "text", description: "Short notification headline." },
    tone: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Semantic notification tone.",
    },
  },
  args: {
    actionAriaLabel: "View saved review snapshot",
    actionLabel: "View",
    description: "The review snapshot was pinned to this theme family.",
    dismissLabel: "Dismiss saved notification",
    dismissible: true,
    title: "Snapshot saved",
    tone: "success",
  },
} satisfies Meta<typeof ElyPublicToast>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicToast },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toast playground</p>
            <h1 class="ely-public-section-title">Tune transient action feedback</h1>
            <div class="ely-story-offset-md">
              <ElyPublicToast v-bind="args" />
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
    components: { ElyPublicToast },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toast tones</p>
            <h1 class="ely-public-section-title">Short feedback uses semantic tone, not extra cards</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToast tone="info" title="Review scope changed" description="Mobile density was added to this component review." />
              <ElyPublicToast tone="success" title="Snapshot saved" description="The active theme evidence is ready to share." />
              <ElyPublicToast tone="warning" title="Sync delayed" description="Dark mode proof is still catching up." />
              <ElyPublicToast tone="danger" title="Publish failed" description="Fix the blocker before trying again." />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicToast },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toast states</p>
            <h1 class="ely-public-section-title">Info, success, warning, danger, dismissible</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToast tone="info" title="Preview refreshed" description="The selected family is now visible in this story." />
              <ElyPublicToast tone="success" title="Saved" description="The change is available in review history." dismissible dismiss-label="Dismiss saved toast" />
              <ElyPublicToast tone="warning" title="Still reviewing" description="One paired-mode proof remains incomplete." />
              <ElyPublicToast tone="danger" title="Blocked" description="Required contrast evidence is missing." />
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

export const DismissalScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicToast },
    setup() {
      const visible = ref(true)
      const restoreToast = () => {
        visible.value = true
      }

      return { restoreToast, visible }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Toast dismissal</p>
            <h1 class="ely-public-section-title">Dismissible toasts are safe to close</h1>
            <p class="ely-public-copy">
              The close button belongs to transient confirmation, not required repair instructions.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToast
                v-if="visible"
                dismissible
                dismiss-label="Dismiss snapshot saved notification"
                tone="success"
                title="Snapshot saved"
                description="The reviewer can continue without reading a persistent alert."
                @dismiss="visible = false"
              />
              <ElyPublicButton v-else tone="secondary" @click="restoreToast">
                Restore toast
              </ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ActionScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicToast },
    setup() {
      const lastAction = ref("No toast action has been used yet.")
      const undoSave = () => {
        lastAction.value = "Undo requested: the local save can be rolled back."
      }
      const openHistory = () => {
        lastAction.value =
          "History opened: the toast stayed a short feedback surface."
      }
      const reset = () => {
        lastAction.value = "No toast action has been used yet."
      }

      return { lastAction, openHistory, reset, undoSave }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Toast action</p>
            <h1 class="ely-public-section-title">One safe action can ride with transient feedback</h1>
            <p class="ely-public-copy">
              Use this for undo, view, or retry. If the action needs explanation or several choices, graduate it to Alert or Dialog.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToast
                action-label="Undo"
                action-aria-label="Undo draft save"
                dismissible
                dismiss-label="Dismiss draft saved notification"
                tone="success"
                title="Draft saved"
                description="The change is local and can be reversed from this short confirmation."
                @action="undoSave"
              />
              <ElyPublicToast
                action-label="View"
                action-aria-label="View sync history"
                tone="info"
                title="Sync complete"
                description="The handoff note is available in recent history."
                @action="openHistory"
              />
              <p class="ely-public-copy">{{ lastAction }}</p>
              <ElyPublicButton tone="ghost" @click="reset">Reset action proof</ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const AlertBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicToast },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toast vs Alert</p>
            <h1 class="ely-public-section-title">Transient feedback does not replace visible repair</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToast
                dismissible
                tone="success"
                title="Draft saved"
                description="This is safe to close because it confirms a completed local action."
              />
              <ElyPublicAlert
                tone="warning"
                title="Dark mode proof is required before publish"
              >
                This instruction must remain visible because it blocks the user's next step.
                <template #actions>
                  <ElyPublicButton size="sm" tone="secondary">Open dark proof</ElyPublicButton>
                </template>
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
