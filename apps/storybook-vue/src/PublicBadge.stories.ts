import { ElyPublicBadge, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Badge

const meta = {
  title: "Public Luxe/Components/Badge",
  component: ElyPublicBadge,
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
      options: ["neutral", "primary", "accent", "danger"],
      description: "Semantic color treatment for the marker.",
    },
  },
  args: {
    tone: "neutral",
  },
} satisfies Meta<typeof ElyPublicBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicBadge },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Badge playground</p>
            <h1 class="ely-public-section-title">Tune a compact semantic marker</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicBadge v-bind="args">Curated</ElyPublicBadge>
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
    components: { ElyPublicBadge },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Badge tones</p>
            <h1 class="ely-public-section-title">Badges explain status; they do not become buttons</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicBadge tone="neutral">Draft</ElyPublicBadge>
              <ElyPublicBadge tone="primary">Selected</ElyPublicBadge>
              <ElyPublicBadge tone="accent">Featured</ElyPublicBadge>
              <ElyPublicBadge tone="danger">Blocked</ElyPublicBadge>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicBadge },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Badge states</p>
            <h1 class="ely-public-section-title">Neutral, primary, accent, danger</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicBadge tone="neutral">Neutral metadata</ElyPublicBadge>
              <ElyPublicBadge tone="primary">Selected family</ElyPublicBadge>
              <ElyPublicBadge tone="accent">Editorial highlight</ElyPublicBadge>
              <ElyPublicBadge tone="danger">Needs review</ElyPublicBadge>
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

export const StatusScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Theme roster</p>
              <h2 class="ely-public-section-title">Family metadata</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">elysia-default</ElyPublicBadge>
                <ElyPublicBadge tone="accent">launch family</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">light + dark</ElyPublicBadge>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review gate</p>
              <h2 class="ely-public-section-title">State evidence</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="neutral">draft</ElyPublicBadge>
                <ElyPublicBadge tone="primary">ready</ElyPublicBadge>
                <ElyPublicBadge tone="danger">contrast blocked</ElyPublicBadge>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SemanticBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Badge semantics</p>
            <h1 class="ely-public-section-title">A badge marks state; it must not become the action</h1>
            <p class="ely-public-copy">
              Compact status can be luminous, but the badge still only labels metadata, readiness, or blockers.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Good marker</p>
              <h2 class="ely-public-section-title">Readable release state</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">approved</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">scheduled</ElyPublicBadge>
                <ElyPublicBadge tone="accent">ceremonial hero</ElyPublicBadge>
              </div>
              <p class="ely-public-muted-copy">
                The user reads these as facts; no badge invites click, purchase, publish, or consent.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Blocker marker</p>
              <h2 class="ely-public-section-title">Danger remains explanatory</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="danger">contrast blocked</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">needs proof</ElyPublicBadge>
              </div>
              <p class="ely-public-muted-copy">
                Pair danger badges with nearby explanation or repair action; do not rely on color alone.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected CTA</p>
              <h2 class="ely-public-section-title">Do not style a badge into a button</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="accent">claim now</ElyPublicBadge>
                <ElyPublicBadge tone="primary">publish</ElyPublicBadge>
              </div>
              <p class="ely-public-muted-copy">
                These labels describe the anti-pattern: if it asks the user to do something, use Button or Link with the correct semantics.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
