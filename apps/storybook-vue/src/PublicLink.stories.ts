import { ElyPublicLink, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Link

const meta = {
  title: "Public Luxe/Components/Link",
  component: ElyPublicLink,
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
    href: {
      control: "text",
      description: "Destination URL for the anchor element.",
    },
    tone: {
      control: "select",
      options: ["primary", "accent", "muted"],
      description: "Visual emphasis for the inline navigation surface.",
    },
    underline: {
      control: "select",
      options: ["auto", "always", "none"],
      description: "Controls underline visibility across copy-heavy contexts.",
    },
    external: {
      control: "boolean",
      description:
        "Opens the destination in a new tab and adds external-link affordance.",
    },
  },
  args: {
    external: false,
    href: "https://example.com/theme-pack",
    tone: "primary",
    underline: "auto",
  },
} satisfies Meta<typeof ElyPublicLink>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicLink },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Link playground</p>
            <h1 class="ely-public-section-title">Tune lightweight navigation without turning it into a button</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <p class="ely-public-muted-copy">
                Theme packs are reviewed in a guided workspace before rollout.
                <ElyPublicLink v-bind="args" class="ely-story-inline-link">
                  Open review checklist
                </ElyPublicLink>
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

export const TonesAndUnderline: Story = {
  render: () => ({
    components: { ElyPublicLink },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Link tones and underline</p>
            <h1 class="ely-public-section-title">Links disclose paths without stealing button hierarchy</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <p class="ely-public-muted-copy">
                Primary links support important navigation:
                <ElyPublicLink href="https://example.com/review">open theme review</ElyPublicLink>.
              </p>
              <p class="ely-public-muted-copy">
                Accent links mark rare editorial context:
                <ElyPublicLink href="https://example.com/mood" tone="accent" underline="always">read mood notes</ElyPublicLink>.
              </p>
              <p class="ely-public-muted-copy">
                Muted links preserve low-emphasis references:
                <ElyPublicLink href="https://example.com/policy" tone="muted">view policy</ElyPublicLink>.
              </p>
              <p class="ely-public-muted-copy">
                External links announce the target behavior:
                <ElyPublicLink href="https://example.com/library" external>open external library</ElyPublicLink>.
              </p>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicLink },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Link states</p>
            <h1 class="ely-public-section-title">Primary, accent, muted, external, and underline control</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicLink href="https://example.com/primary">Open preview route</ElyPublicLink>
                <ElyPublicLink href="https://example.com/accent" tone="accent">Review visual notes</ElyPublicLink>
                <ElyPublicLink href="https://example.com/muted" tone="muted">Read supporting policy</ElyPublicLink>
              </div>
              <div class="ely-public-inline">
                <ElyPublicLink href="https://example.com/always" underline="always">Always underline</ElyPublicLink>
                <ElyPublicLink href="https://example.com/none" underline="none">No underline</ElyPublicLink>
                <ElyPublicLink href="https://example.com/external" external>Open external library</ElyPublicLink>
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

export const NavigationScenarios: Story = {
  render: () => ({
    components: { ElyPublicLink },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Support route</p>
              <h2 class="ely-public-section-title">Keep secondary routes quiet</h2>
              <p class="ely-public-muted-copy">
                Use links for support, audit, and policy surfaces:
                <ElyPublicLink href="https://example.com/audit" tone="muted">open audit trail</ElyPublicLink>.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Inline disclosure</p>
              <h2 class="ely-public-section-title">Do not turn links into buttons</h2>
              <p class="ely-public-muted-copy">
                If the action changes state, use a button. If it reveals reference material,
                <ElyPublicLink href="https://example.com/reference">use a link</ElyPublicLink>.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RouteBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicLink },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Link boundary</p>
            <h1 class="ely-public-section-title">Links route, disclose, and reference; they do not commit state</h1>
            <p class="ely-public-copy">
              This review separates product navigation from state-changing action so a beautiful inline path never steals the primary action job.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Reference route</p>
              <h2 class="ely-public-section-title">Policy and audit stay textual</h2>
              <p class="ely-public-muted-copy">
                A policy reference belongs in copy:
                <ElyPublicLink href="https://example.com/policy" tone="muted">read publishing policy</ElyPublicLink>.
                The user can continue the current task without losing the visible action hierarchy.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">External safety</p>
              <h2 class="ely-public-section-title">External destinations announce themselves</h2>
              <p class="ely-public-muted-copy">
                Resource libraries leave the current product surface:
                <ElyPublicLink href="https://example.com/library" external underline="always">
                  open external asset library
                </ElyPublicLink>.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected action</p>
              <h2 class="ely-public-section-title">Publishing is not a link</h2>
              <p class="ely-public-muted-copy">
                If the control changes availability, selection, payment, consent, or publishing state, route reviewers back to Button instead of styling a link harder.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
