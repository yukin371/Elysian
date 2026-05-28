import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicSwitch,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Switch

const meta = {
  title: "Public Luxe/Components/Switch",
  component: ElyPublicSwitch,
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
    modelValue: {
      control: "boolean",
      description: "Controlled checked state.",
    },
    label: { control: "text", description: "Visible switch label." },
    description: {
      control: "text",
      description: "Supporting copy under the label.",
    },
    disabled: { control: "boolean", description: "Disables state changes." },
  },
  args: {
    description: "Keep highlight layers and curated gradients enabled.",
    disabled: false,
    label: "Polished mode",
    modelValue: true,
  },
} satisfies Meta<typeof ElyPublicSwitch>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSwitch },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Switch playground</p>
            <h1 class="ely-public-section-title">Tune an immediate runtime toggle</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSwitch v-bind="args" />
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

export const ToggleScenarios: Story = {
  render: () => ({
    components: { ElyPublicSwitch },
    setup() {
      const polished = ref(true)
      const systemMode = ref(false)
      const reducedGlow = ref(false)

      return {
        polished,
        reducedGlow,
        systemMode,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Switch toggle scenarios</p>
            <h1 class="ely-public-section-title">Switches change immediate runtime preferences</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSwitch
                v-model="polished"
                label="Polished mode"
                description="Keep highlight layers and curated gradients enabled."
              />
              <ElyPublicSwitch
                v-model="systemMode"
                label="Follow system mode"
                description="Resolve light or dark mode from the device preference."
              />
              <ElyPublicSwitch
                v-model="reducedGlow"
                label="Reduced glow"
                description="Lower ornamental intensity without changing component semantics."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicSwitch },
    setup() {
      const polishedMode = ref(true)
      const syncTheme = ref(false)

      return {
        doc,
        polishedMode,
        syncTheme,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Switch states</p>
            <h1 class="ely-public-section-title">Checked, unchecked, disabled, described</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSwitch
                v-model="polishedMode"
                label="Polished mode"
                description="Keep highlight layers and curated gradients enabled."
              />
              <ElyPublicSwitch
                v-model="syncTheme"
                label="Sync system mode"
                description="Follow the user's light or dark mode preference immediately."
              />
              <ElyPublicSwitch
                :model-value="false"
                disabled
                label="Experimental override"
                description="Disabled here to show an unavailable runtime path."
              />
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

export const AvailabilityScenarios: Story = {
  render: () => ({
    components: { ElyPublicSwitch },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Available</p>
              <h2 class="ely-public-section-title">Immediate preference</h2>
              <ElyPublicSwitch
                :model-value="true"
                label="Reward pulse notifications"
                description="Available toggles can update user preference immediately."
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Unavailable</p>
              <h2 class="ely-public-section-title">Locked by owner</h2>
              <ElyPublicSwitch
                :model-value="false"
                disabled
                label="Experimental material override"
                description="Disabled toggles explain why the path is unavailable."
              />
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RuntimeBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicSwitch },
    setup() {
      const followSystem = ref(true)
      const reduceOrnament = ref(false)

      return {
        followSystem,
        reduceOrnament,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Switch boundary</p>
            <h1 class="ely-public-section-title">Switches are immediate preferences, not consent or publishing</h1>
            <p class="ely-public-copy">
              A switch is approved only when changing it updates a reversible runtime preference without asking for extra confirmation.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Good runtime toggle</p>
              <h2 class="ely-public-section-title">Theme behavior changes now</h2>
              <div class="ely-public-stack">
                <ElyPublicSwitch
                  v-model="followSystem"
                  label="Follow system appearance"
                  description="Immediately resolve light or dark mode from the device preference."
                />
                <ElyPublicSwitch
                  v-model="reduceOrnament"
                  label="Reduce ceremonial glow"
                  description="Lower ornament intensity without changing content or consent."
                />
                <p class="ely-public-muted-copy">
                  Active choices: system {{ followSystem ? 'on' : 'off' }}, reduced glow {{ reduceOrnament ? 'on' : 'off' }}.
                </p>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Unavailable toggle</p>
              <h2 class="ely-public-section-title">Locked choices explain why</h2>
              <ElyPublicSwitch
                :model-value="false"
                disabled
                label="Enable experimental theme compiler"
                description="Disabled until the owner contract and preview evidence exist."
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected use</p>
              <h2 class="ely-public-section-title">Publishing needs a button and evidence</h2>
              <ElyPublicAlert
                tone="warning"
                title="Do not publish with a switch"
                description="If the control commits state, payment, legal consent, or public availability, use an explicit action pattern."
              />
              <div class="ely-public-inline ely-story-offset-md">
                <ElyPublicButton size="sm">Review publish action</ElyPublicButton>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
