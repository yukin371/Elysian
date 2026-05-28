import {
  ElyPublicAlert,
  ElyPublicEmptyState,
  ElyPublicSkeleton,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Skeleton

const meta = {
  title: "Public Luxe/Components/Skeleton",
  component: ElyPublicSkeleton,
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
    lines: {
      control: { min: 1, max: 6, type: "number" },
      description: "Number of supporting placeholder lines.",
    },
    tone: {
      control: "select",
      options: ["default", "soft"],
      description: "Placeholder contrast level.",
    },
  },
  args: {
    lines: 3,
    tone: "default",
  },
} satisfies Meta<typeof ElyPublicSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSkeleton },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Skeleton playground</p>
            <h1 class="ely-public-section-title">Tune placeholder rhythm</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSkeleton v-bind="args" />
              <p class="ely-public-muted-copy">Use controls to match the expected content density.</p>
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

export const Density: Story = {
  render: () => ({
    components: { ElyPublicSkeleton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Skeleton density</p>
            <h1 class="ely-public-section-title">Placeholder shape should match expected content</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSkeleton :lines="1" />
              <ElyPublicSkeleton :lines="3" />
              <ElyPublicSkeleton :lines="5" tone="soft" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicSkeleton },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Skeleton states</p>
            <h1 class="ely-public-section-title">Default, soft, line count, decorative</h1>
            <p class="ely-public-copy" role="status">Loading theme comparison details...</p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSkeleton />
              <ElyPublicSkeleton tone="soft" :lines="2" />
              <ElyPublicSkeleton :lines="5" />
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

export const LoadingScenarios: Story = {
  render: () => ({
    components: { ElyPublicSkeleton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Card loading</p>
              <h2 class="ely-public-section-title">Theme summary</h2>
              <p class="ely-public-copy" role="status">Loading summary...</p>
              <ElyPublicSkeleton :lines="3" />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Dense loading</p>
              <h2 class="ely-public-section-title">Review notes</h2>
              <p class="ely-public-copy" role="status">Loading notes...</p>
              <ElyPublicSkeleton :lines="5" tone="soft" />
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const TransitionScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicEmptyState, ElyPublicSkeleton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Skeleton transition</p>
            <h1 class="ely-public-section-title">Loading is temporary; the next state must be named</h1>
            <p class="ely-public-copy">
              Skeletons keep rhythm while content arrives, but approval requires a visible path to content, repair, or empty state.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Loading to content</p>
              <h2 class="ely-public-section-title">Expected summary shape</h2>
              <p class="ely-public-copy" role="status">Loading theme evidence...</p>
              <ElyPublicSkeleton :lines="3" />
              <p class="ely-public-muted-copy">
                Placeholder density mirrors the card that will replace it; it does not invent extra ornament.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Loading to repair</p>
              <h2 class="ely-public-section-title">Failure is not another skeleton</h2>
              <ElyPublicAlert
                tone="warning"
                title="Evidence delayed"
                description="Show the repair message when loading fails instead of leaving the shimmer in place."
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Loading to empty</p>
              <h2 class="ely-public-section-title">No records still needs a destination</h2>
              <ElyPublicEmptyState
                tone="neutral"
                title="No theme notes yet"
                description="Invite the next useful step once the data source returns an empty result."
              />
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
