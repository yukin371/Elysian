import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicProgress,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Button

const meta = {
  title: "Public Luxe/Components/Button",
  component: ElyPublicButton,
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
      options: ["primary", "secondary", "ghost"],
      description: "Visual hierarchy of the action.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button density and tap target scale.",
    },
    loading: {
      control: "boolean",
      description: "Shows spinner, disables interaction, and sets aria-busy.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the native button.",
    },
    block: {
      control: "boolean",
      description: "Expands to container width.",
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      description: "Native button type.",
    },
  },
  args: {
    block: false,
    disabled: false,
    loading: false,
    size: "md",
    tone: "primary",
    type: "button",
  },
} satisfies Meta<typeof ElyPublicButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicButton },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Button playground</p>
            <h1 class="ely-public-section-title">Tune one action surface through controls</h1>
            <div class="ely-public-actions">
              <ElyPublicButton v-bind="args">Open atelier</ElyPublicButton>
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

export const Variants: Story = {
  render: () => ({
    components: { ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Button variants</p>
            <h1 class="ely-public-section-title">One primary path, two supporting exits</h1>
            <p class="ely-public-copy">
              Use this story to compare hierarchy before adding page-level ornament.
              Only one button should feel like the next step.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicButton>Confirm family</ElyPublicButton>
                <ElyPublicButton tone="secondary">Preview contrast</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open notes</ElyPublicButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicButton loading>Saving snapshot</ElyPublicButton>
                <ElyPublicButton disabled tone="secondary">Locked until review</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Button sizes</p>
            <h1 class="ely-public-section-title">Density changes scale, not hierarchy</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicButton size="sm">Small action</ElyPublicButton>
                <ElyPublicButton size="md">Medium action</ElyPublicButton>
                <ElyPublicButton size="lg">Large action</ElyPublicButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicButton size="sm" tone="secondary">Small support</ElyPublicButton>
                <ElyPublicButton size="md" tone="secondary">Medium support</ElyPublicButton>
                <ElyPublicButton size="lg" tone="secondary">Large support</ElyPublicButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicButton size="sm" tone="ghost">Small recovery</ElyPublicButton>
                <ElyPublicButton size="md" tone="ghost">Medium recovery</ElyPublicButton>
                <ElyPublicButton size="lg" tone="ghost">Large recovery</ElyPublicButton>
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
    components: { ElyPublicButton },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Button states</p>
            <h1 class="ely-public-section-title">Primary, secondary, ghost, loading, disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicButton>Primary action</ElyPublicButton>
                <ElyPublicButton tone="secondary">Secondary action</ElyPublicButton>
                <ElyPublicButton tone="ghost">Ghost action</ElyPublicButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicButton size="sm">Small</ElyPublicButton>
                <ElyPublicButton size="md">Medium</ElyPublicButton>
                <ElyPublicButton size="lg">Large</ElyPublicButton>
              </div>
              <div class="ely-public-inline">
                <ElyPublicButton loading>Applying theme</ElyPublicButton>
                <ElyPublicButton disabled tone="secondary">Disabled</ElyPublicButton>
                <ElyPublicButton block tone="ghost">Mobile block action</ElyPublicButton>
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

export const UsageScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Preference studio</p>
              <h2 class="ely-public-section-title">Approve a theme family</h2>
              <p class="ely-public-muted-copy">
                Primary owns the approval moment; secondary compares evidence; ghost keeps recovery quiet.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Approve family</ElyPublicButton>
                <ElyPublicButton tone="secondary">Compare modes</ElyPublicButton>
                <ElyPublicButton tone="ghost">Restore previous</ElyPublicButton>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Mobile footer</p>
              <h2 class="ely-public-section-title">Block action without pill inflation</h2>
              <p class="ely-public-muted-copy">
                Full width is a layout decision, not a reason to change radius or invent a new CTA color.
              </p>
              <div class="ely-public-stack">
                <ElyPublicButton block>Continue review</ElyPublicButton>
                <ElyPublicButton block tone="ghost">Save as draft</ElyPublicButton>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const CriticalPathScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicProgress,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card" data-emphasis="feature">
              <p class="ely-public-eyebrow">Button critical path</p>
              <h2 class="ely-public-section-title">One surface, one commitment</h2>
              <p class="ely-public-muted-copy">
                The main action should be the only control that feels like the
                next irreversible step. Supporting evidence stays nearby, but
                it does not become a second primary CTA.
              </p>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Mode proof" tone="success" :value="86" />
                <ElyPublicAlert tone="success" title="Light and dark previews are paired">
                  The next step can approve the family. Comparison and archive access remain lower emphasis.
                </ElyPublicAlert>
                <div class="ely-public-actions">
                  <ElyPublicButton>Approve family</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Compare evidence</ElyPublicButton>
                  <ElyPublicLink href="#">Open archive</ElyPublicLink>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Blocked action</p>
              <h2 class="ely-public-section-title">Loading and disabled explain why</h2>
              <p class="ely-public-muted-copy">
                Disabled and loading states are not decoration. They need nearby
                copy that explains whether the user should wait, repair, or use
                a quieter route.
              </p>
              <div class="ely-public-stack">
                <ElyPublicAlert tone="warning" title="Approval is waiting on contrast proof">
                  Keep the action visible, but do not make the disabled state look like a decorative badge.
                </ElyPublicAlert>
                <div class="ely-public-actions">
                  <ElyPublicButton loading>Checking contrast</ElyPublicButton>
                  <ElyPublicButton disabled tone="secondary">Approve locked</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Save draft</ElyPublicButton>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
