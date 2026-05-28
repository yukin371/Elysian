import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicEmptyState,
  ElyPublicLink,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.EmptyState

const meta = {
  title: "Public Luxe/Components/Empty State",
  component: ElyPublicEmptyState,
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
    eyebrow: { control: "text", description: "Small category label." },
    title: { control: "text", description: "Primary empty state heading." },
    tone: {
      control: "select",
      options: ["default", "accent"],
      description: "Surface intensity for the empty state.",
    },
  },
  args: {
    eyebrow: "Empty state",
    title: "No comparison snapshot has been pinned yet",
    tone: "accent",
  },
} satisfies Meta<typeof ElyPublicEmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicButton, ElyPublicEmptyState },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <ElyPublicEmptyState v-bind="args">
            Create a saved comparison so brand, product, and engineering can review the same theme family surface.

            <template #actions>
              <ElyPublicButton>Create comparison</ElyPublicButton>
              <ElyPublicButton tone="ghost">Open recent presets</ElyPublicButton>
            </template>
          </ElyPublicEmptyState>
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
    components: { ElyPublicButton, ElyPublicEmptyState },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <div class="ely-public-stack">
            <ElyPublicEmptyState
              eyebrow="Default empty"
              title="No review notes yet"
            >
              Default empty states explain what is missing without making the absence feel like a failure.
            </ElyPublicEmptyState>

            <ElyPublicEmptyState
              eyebrow="Guided empty"
              title="No comparison snapshot has been pinned yet"
              tone="accent"
            >
              Accent empty states may guide the first recovery action, but should still keep one main path.
              <template #actions>
                <ElyPublicButton>Create comparison</ElyPublicButton>
                <ElyPublicButton tone="ghost">Browse examples</ElyPublicButton>
              </template>
            </ElyPublicEmptyState>
          </div>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicEmptyState },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <div class="ely-public-stack">
            <ElyPublicEmptyState
              eyebrow="Default"
              title="No saved theme families yet"
            >
              Start from a governed public-luxe family before introducing bespoke overrides.
            </ElyPublicEmptyState>

            <ElyPublicEmptyState
              eyebrow="Guided recovery"
              title="No comparison snapshot has been pinned yet"
              tone="accent"
            >
              Create a saved comparison so brand, product, and engineering can review the same theme family surface.

              <template #actions>
                <ElyPublicButton>Create comparison</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open recent presets</ElyPublicButton>
              </template>
            </ElyPublicEmptyState>
          </div>

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

export const ProductScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicEmptyState },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <ElyPublicEmptyState
              eyebrow="Search"
              title="No matching theme families"
            >
              Clear the filter or broaden the mood keywords before creating a new family.
              <template #actions>
                <ElyPublicButton size="sm">Clear filters</ElyPublicButton>
                <ElyPublicButton size="sm" tone="ghost">Create family</ElyPublicButton>
              </template>
            </ElyPublicEmptyState>

            <ElyPublicEmptyState
              eyebrow="Archive"
              title="No archived snapshots"
            >
              Archived snapshots will appear here when reviewers restore or supersede a theme decision.
              <template #actions>
                <ElyPublicButton size="sm" tone="ghost">Open active snapshots</ElyPublicButton>
              </template>
            </ElyPublicEmptyState>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RecoveryPathScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicEmptyState,
      ElyPublicLink,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card" data-emphasis="feature">
              <p class="ely-public-eyebrow">Empty-state recovery path</p>
              <h2 class="ely-public-section-title">Absence needs one recovery action</h2>
              <p class="ely-public-muted-copy">
                Empty states should explain what is missing, why it matters,
                and the one best next step. Support routes stay quieter.
              </p>
              <ElyPublicEmptyState
                eyebrow="No evidence"
                title="No dark-mode snapshot is pinned"
                tone="accent"
              >
                Pin a paired preview before the theme can move into release review.
                <template v-slot:actions>
                  <ElyPublicButton>Create snapshot</ElyPublicButton>
                  <ElyPublicLink href="#">Open recent previews</ElyPublicLink>
                </template>
              </ElyPublicEmptyState>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Blocked absence</p>
              <h2 class="ely-public-section-title">If absence is caused by failure, say so</h2>
              <div class="ely-public-stack">
                <ElyPublicAlert tone="warning" title="Filter hides all results">
                  Clear the filter before creating a new object. The empty state should not imply data is gone.
                </ElyPublicAlert>
                <ElyPublicEmptyState
                  eyebrow="Search"
                  title="No matching component evidence"
                >
                  Broaden the review focus or return to all scenarios.
                  <template v-slot:actions>
                    <ElyPublicButton size="sm">Clear filters</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">View all scenarios</ElyPublicButton>
                  </template>
                </ElyPublicEmptyState>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const AbsenceBoundaryScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicEmptyState,
      ElyPublicLink,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Empty-state boundary</p>
            <h1 class="ely-public-section-title">Empty states explain absence without pretending it is failure</h1>
            <p class="ely-public-copy">
              A useful empty state says what is missing, why the surface is still safe, and which single recovery action helps most.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">First-run absence</p>
              <h2 class="ely-public-section-title">Guide creation without panic</h2>
              <ElyPublicEmptyState
                eyebrow="No snapshots"
                title="No comparison snapshot exists yet"
                tone="accent"
              >
                Create the first governed comparison before adding bespoke theme overrides.
                <template v-slot:actions>
                  <ElyPublicButton>Create comparison</ElyPublicButton>
                  <ElyPublicLink href="#">Read theme selection guide</ElyPublicLink>
                </template>
              </ElyPublicEmptyState>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Filtered absence</p>
              <h2 class="ely-public-section-title">Explain when data is hidden</h2>
              <div class="ely-public-stack">
                <ElyPublicAlert tone="info" title="Filters are active">
                  The evidence may still exist outside the current review focus.
                </ElyPublicAlert>
                <ElyPublicEmptyState
                  eyebrow="Filtered result"
                  title="No accessibility stories match this filter"
                >
                  Clear filters before creating new evidence.
                  <template v-slot:actions>
                    <ElyPublicButton size="sm">Clear filters</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">View all stories</ElyPublicButton>
                  </template>
                </ElyPublicEmptyState>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected absence</p>
              <h2 class="ely-public-section-title">Do not use empty state as a hero poster</h2>
              <p class="ely-public-muted-copy">
                If nothing is missing, do not insert an empty state for decoration. Use Card, Text, Image, or a pattern-specific surface instead.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
