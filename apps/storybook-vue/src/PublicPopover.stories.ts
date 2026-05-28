import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicPopover,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Popover

const meta = {
  title: "Public Luxe/Components/Popover",
  component: ElyPublicPopover,
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
    align: {
      control: "select",
      options: ["start", "end"],
      description: "Horizontal alignment relative to the trigger.",
    },
    description: {
      control: "text",
      description: "Optional panel helper text.",
    },
    open: {
      control: "boolean",
      description: "Controlled open state for static review.",
    },
    placement: {
      control: "select",
      options: ["bottom", "top"],
      description: "Vertical placement of the panel.",
    },
    title: {
      control: "text",
      description: "Optional panel title.",
    },
    tone: {
      control: "select",
      options: ["neutral", "accent"],
      description: "Visual emphasis for the local context panel.",
    },
    triggerLabel: {
      control: "text",
      description: "Fallback trigger label.",
    },
  },
  args: {
    align: "start",
    description: "A bounded context panel should explain one local decision.",
    open: true,
    placement: "bottom",
    title: "Theme context",
    tone: "neutral",
    triggerLabel: "Open theme context",
  },
} satisfies Meta<typeof ElyPublicPopover>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicPopover, ElyPublicText },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Popover playground</p>
            <h1 class="ely-public-section-title">Tune a local context panel without making a modal</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <span>Theme family</span>
                <ElyPublicPopover v-bind="args">
                  <ElyPublicText tone="muted">
                    This panel is non-modal and local. Keep required instructions visible outside the panel.
                  </ElyPublicText>
                </ElyPublicPopover>
              </div>
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

export const States: Story = {
  render: () => ({
    components: { ElyPublicPopover, ElyPublicText },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Popover states</p>
            <h1 class="ely-public-section-title">Open, aligned, neutral, and accent context</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicPopover
                  open
                  title="Neutral support"
                  description="Routine clarification beside one local trigger."
                  trigger-label="Neutral popover"
                >
                  <ElyPublicText tone="muted">Use for local explanation, not primary instruction.</ElyPublicText>
                </ElyPublicPopover>
                <ElyPublicPopover
                  open
                  align="end"
                  tone="accent"
                  title="Accent preview"
                  description="A rare branded hint for a ceremonial surface."
                  trigger-label="Accent popover"
                >
                  <ElyPublicText tone="muted">Accent belongs to one memorable proof point.</ElyPublicText>
                </ElyPublicPopover>
              </div>
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

export const ContextPreviewScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicPopover,
      ElyPublicStat,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Context preview scenarios</p>
            <h1 class="ely-public-section-title">A popover can preview one local proof without adding a card tower</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicStat value="4" eyebrow="Launch families" helper="Each has light and dark proof" />
                <ElyPublicPopover
                  open
                  tone="accent"
                  title="Why four families?"
                  description="The theme system offers expressive, narrative, clear, and calm choices without letting pages freely mix colors."
                  trigger-label="Review theme family context"
                >
                  <div class="ely-public-stack">
                    <ElyPublicBadge tone="accent">elysia-default</ElyPublicBadge>
                    <ElyPublicText tone="muted">
                      The default role-inspired palette keeps petal pink, thin blue, and champagne accent in separate jobs.
                    </ElyPublicText>
                  </div>
                </ElyPublicPopover>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SupportActionScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicPopover,
      ElyPublicText,
    },
    setup() {
      const open = ref(true)

      return { open }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Support action scenarios</p>
            <h1 class="ely-public-section-title">One support action is acceptable; a hidden workflow is not</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <span>Review route</span>
                <ElyPublicPopover
                  v-model:open="open"
                  title="Open the proof packet"
                  description="Use one low-friction support action when the user needs extra evidence before continuing."
                  trigger-label="Open proof packet"
                >
                  <ElyPublicText tone="muted">
                    Keep the primary page action outside. The popover only helps interpret the nearby route.
                  </ElyPublicText>
                  <template #actions>
                    <ElyPublicLink href="#component-scenario-atlas">Scenario atlas</ElyPublicLink>
                    <ElyPublicButton tone="ghost" size="sm" @click="open = false">Close</ElyPublicButton>
                  </template>
                </ElyPublicPopover>
              </div>
              <ElyPublicAlert
                tone="info"
                title="Popover is not a modal"
                description="If the user must complete a task before returning, use Dialog or a page-owned flow."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicPopover,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject hidden navigation, forms, and modal work inside Popover</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicPopover
                open
                title="Acceptable local context"
                description="This panel explains one term and offers no competing main action."
                trigger-label="Open local context"
              >
                <ElyPublicText tone="muted">
                  Keep required repair copy, legal consent, and destructive consequences visible in the page flow.
                </ElyPublicText>
              </ElyPublicPopover>
              <ElyPublicAlert
                tone="warning"
                title="Do not turn Popover into a hidden page"
                description="Use Menu for action lists, Tooltip for short hints, Dialog for interruption, and visible form lanes for required input."
              />
              <div class="ely-public-inline">
                <ElyPublicButton>Primary page action stays visible</ElyPublicButton>
                <ElyPublicButton tone="ghost">Secondary exit</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
