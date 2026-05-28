import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicEmptyState,
  ElyPublicProgress,
  ElyPublicSpinner,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Spinner

const meta = {
  title: "Public Luxe/Components/Spinner",
  component: ElyPublicSpinner,
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
    label: {
      control: "text",
      description: "Accessible loading label.",
    },
    showLabel: {
      control: "boolean",
      description: "Shows the label beside the spinner.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Spinner scale.",
    },
    tone: {
      control: "select",
      options: ["primary", "accent", "neutral"],
      description: "Semantic ring emphasis.",
    },
  },
  args: {
    label: "Loading theme preview",
    showLabel: true,
    size: "md",
    tone: "primary",
  },
} satisfies Meta<typeof ElyPublicSpinner>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSpinner },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Spinner playground</p>
            <h1 class="ely-public-section-title">Tune short waiting feedback without creating a new surface</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSpinner v-bind="args" />
              <p class="ely-public-muted-copy">
                Use controls to inspect size, tone, and visible label behavior.
              </p>
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
    components: { ElyPublicSpinner },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Spinner states</p>
            <h1 class="ely-public-section-title">Tone, size, and label visibility</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicSpinner size="sm" tone="neutral" label="Checking status" show-label />
                <ElyPublicSpinner tone="primary" label="Loading preview" show-label />
                <ElyPublicSpinner size="lg" tone="accent" label="Preparing atelier" show-label />
              </div>
              <div class="ely-public-inline">
                <ElyPublicSpinner size="sm" tone="primary" label="Saving compact choice" />
                <ElyPublicSpinner tone="accent" label="Syncing expressive theme" />
                <ElyPublicSpinner size="lg" tone="neutral" label="Loading quiet surface" />
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

export const InlineLoadingScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicSpinner,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Inline loading scenarios</p>
            <h1 class="ely-public-section-title">Spinner belongs beside the pending thing</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicButton loading>Saving</ElyPublicButton>
                <ElyPublicSpinner size="sm" tone="neutral" label="Syncing backup copy" show-label />
              </div>
              <ElyPublicText tone="muted">
                Button owns duplicate-submit prevention. Spinner only explains the adjacent secondary wait.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const LocalWaitScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicSpinner,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Local wait scenarios</p>
            <h1 class="ely-public-section-title">Short waiting can stay elegant without hiding the page</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicSpinner size="lg" tone="accent" label="Preparing theme preview" show-label />
              </div>
              <ElyPublicText tone="muted">
                Use this for compact async preparation. If waiting becomes long or blocked, replace it with visible status or repair copy.
              </ElyPublicText>
              <ElyPublicAlert
                tone="info"
                title="The page remains usable"
                description="Spinner is a local status primitive; it should not become a modal overlay or hidden workflow state."
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
      ElyPublicEmptyState,
      ElyPublicProgress,
      ElyPublicSpinner,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Do not make Spinner carry every loading state</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicSpinner tone="primary" label="Checking theme availability" show-label />
              </div>
              <ElyPublicProgress label="Theme export progress" :value="64" tone="primary" />
              <ElyPublicEmptyState
                title="No preview returned"
                description="If the wait resolves to absence, replace the spinner with a useful empty state."
              />
              <ElyPublicAlert
                tone="warning"
                title="A spinner is not a recovery path"
                description="Use Progress for known completion, Skeleton for known structure, Alert for failure, and Empty State for absence."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
