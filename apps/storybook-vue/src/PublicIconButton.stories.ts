import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicIconButton,
  ElyPublicToolbar,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.IconButton

const meta = {
  title: "Public Luxe/Components/Icon Button",
  component: ElyPublicIconButton,
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
    ariaLabel: {
      control: "text",
      description: "Required accessible name for the icon-only action.",
    },
    tone: {
      control: "select",
      options: ["ghost", "primary", "secondary", "danger"],
      description: "Compact action hierarchy and risk emphasis.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Square tap target scale.",
    },
    loading: {
      control: "boolean",
      description: "Shows spinner, disables interaction, and sets aria-busy.",
    },
    pressed: {
      control: "boolean",
      description: "Optional pressed state for toggle-style icon actions.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the native button.",
    },
    type: {
      control: "select",
      options: ["button", "reset", "submit"],
      description: "Native button type.",
    },
  },
  args: {
    ariaLabel: "Save theme snapshot",
    disabled: false,
    loading: false,
    pressed: undefined,
    size: "md",
    tone: "ghost",
    type: "button",
  },
} satisfies Meta<typeof ElyPublicIconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicIconButton },
    setup() {
      const count = ref(0)

      return { args, count }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Icon button playground</p>
            <h1 class="ely-public-section-title">Compact actions still need a readable name</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicIconButton v-bind="args" @click="count += 1">+</ElyPublicIconButton>
                <span class="ely-public-muted-copy">Activated {{ count }} times.</span>
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
    components: { ElyPublicBadge, ElyPublicIconButton },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Icon button states</p>
            <h1 class="ely-public-section-title">Tone, size, pressed, loading, and disabled remain compact</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Open details" tone="ghost">i</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Save snapshot" tone="primary">+</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Compare preview" tone="secondary">=</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Remove draft" tone="danger">x</ElyPublicIconButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Small previous" size="sm">&lt;</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Medium pause">||</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Large next" size="lg">&gt;</ElyPublicIconButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Saving compact action" loading>+</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Locked compact action" disabled>x</ElyPublicIconButton>
                <ElyPublicBadge tone="primary">aria-label required</ElyPublicBadge>
              </div>
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Pin preview" pressed>p</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Favorite theme" tone="primary" pressed>*</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Mute preview sound" :pressed="false">m</ElyPublicIconButton>
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

export const ToolbarScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicIconButton,
      ElyPublicToolbar,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Toolbar scenarios</p>
            <h1 class="ely-public-section-title">Use compact actions after the primary path is clear</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Snapshot review toolbar">
                <template #leading>
                  <ElyPublicBadge tone="primary">Snapshot</ElyPublicBadge>
                </template>
                <ElyPublicButton size="sm">Approve</ElyPublicButton>
                <template #trailing>
                  <ElyPublicIconButton aria-label="Copy snapshot link">+</ElyPublicIconButton>
                  <ElyPublicIconButton aria-label="Open snapshot notes">i</ElyPublicIconButton>
                  <ElyPublicIconButton aria-label="Remove snapshot" tone="danger">x</ElyPublicIconButton>
                </template>
              </ElyPublicToolbar>
              <p class="ely-public-muted-copy">
                Icon Button keeps low-frequency local actions visible without turning every action into a text CTA.
              </p>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MediaControlScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicIconButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Media control scenarios</p>
            <h1 class="ely-public-section-title">Small controls need nearby context, not mystery icons</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Previous preview">&lt;</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Pause preview" tone="primary">||</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Next preview">&gt;</ElyPublicIconButton>
              </div>
              <ElyPublicAlert
                tone="info"
                title="The card title names the object"
                description="Icon Button names the action. Media state, captions, and gallery ownership stay outside this primitive."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ToggleScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicBadge, ElyPublicIconButton },
    setup() {
      const favorite = ref(true)
      const pinned = ref(false)

      return {
        favorite,
        pinned,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Toggle scenarios</p>
            <h1 class="ely-public-section-title">Pressed state is for local on/off icon actions</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicIconButton
                  aria-label="Favorite theme"
                  tone="primary"
                  :pressed="favorite"
                  @click="favorite = !favorite"
                >*</ElyPublicIconButton>
                <ElyPublicIconButton
                  aria-label="Pin review note"
                  :pressed="pinned"
                  @click="pinned = !pinned"
                >p</ElyPublicIconButton>
                <ElyPublicBadge tone="primary">Favorite: {{ favorite ? 'on' : 'off' }}</ElyPublicBadge>
                <ElyPublicBadge>Pin: {{ pinned ? 'on' : 'off' }}</ElyPublicBadge>
              </div>
              <ElyPublicAlert
                tone="info"
                title="Only stateful icon actions use aria-pressed"
                description="Copy, open, next, and delete remain one-shot actions. Favorite, mute, and pin can expose pressed state."
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
    components: { ElyPublicAlert, ElyPublicIconButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Icon button boundary</p>
            <h1 class="ely-public-section-title">Icon Button is not hidden navigation or a mystery CTA</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicIconButton aria-label="Vague more action">...</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Global navigation menu" tone="primary">=</ElyPublicIconButton>
                <ElyPublicIconButton aria-label="Delete without explanation" tone="danger">x</ElyPublicIconButton>
              </div>
              <ElyPublicAlert
                tone="warning"
                title="Reject ambiguous compact actions"
                description="If the user cannot predict the result from local context and a specific accessible label, use Button, Link, Menu, or a dedicated pattern instead."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
