import { ElyPublicStat, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Stat

const meta = {
  title: "Public Luxe/Components/Stat",
  component: ElyPublicStat,
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
    value: {
      control: "text",
      description: "Headline metric, percentage, or short summary phrase.",
    },
    eyebrow: {
      control: "text",
      description: "Optional compact label shown above the headline value.",
    },
    helper: {
      control: "text",
      description: "Supporting context shown below the main label slot.",
    },
    tone: {
      control: "select",
      options: ["primary", "accent", "muted"],
      description: "Visual emphasis within a group of summary blocks.",
    },
    trend: {
      control: "select",
      options: ["up", "flat", "down"],
      description:
        "Lightweight directional cue paired with the headline value.",
    },
    align: {
      control: "select",
      options: ["start", "center"],
      description:
        "Layout alignment for compact grids or centered feature rows.",
    },
  },
  args: {
    align: "start",
    eyebrow: "Theme signal",
    helper: "Updated from the latest governed preview review.",
    tone: "primary",
    trend: "up",
    value: "92%",
  },
} satisfies Meta<typeof ElyPublicStat>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicStat },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stat playground</p>
            <h1 class="ely-public-section-title">Tune a summary block without turning it into a chart widget</h1>
            <div class="ely-public-component-grid ely-story-offset-md">
              <ElyPublicStat v-bind="args">
                Preference sync health
              </ElyPublicStat>
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

export const TonesAndTrends: Story = {
  render: () => ({
    components: { ElyPublicStat },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stat tones and trends</p>
            <h1 class="ely-public-section-title">Summary blocks explain one signal at a time</h1>
            <div class="ely-public-component-grid ely-story-offset-md">
              <ElyPublicStat
                eyebrow="Primary"
                helper="The current key metric for the view."
                tone="primary"
                trend="up"
                value="92%"
              >
                Preference sync health
              </ElyPublicStat>
              <ElyPublicStat
                eyebrow="Accent"
                helper="A rare editorial highlight, not a CTA."
                tone="accent"
                trend="flat"
                value="04"
              >
                Featured moments
              </ElyPublicStat>
              <ElyPublicStat
                eyebrow="Muted"
                helper="Support evidence that should stay secondary."
                tone="muted"
                trend="down"
                value="03"
              >
                Open review notes
              </ElyPublicStat>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicStat },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stat states</p>
            <h1 class="ely-public-section-title">Primary, accent, muted, trend, and centered summary blocks</h1>
            <div class="ely-public-component-grid ely-story-offset-md">
              <ElyPublicStat
                eyebrow="Theme family"
                helper="Stable roster retained through the first phase."
                tone="primary"
                trend="flat"
                value="04"
              >
                Governed launch families
              </ElyPublicStat>
              <ElyPublicStat
                eyebrow="Sync"
                helper="Preference hand-off improved after token cleanup."
                tone="accent"
                trend="up"
                value="92%"
              >
                Preference sync health
              </ElyPublicStat>
              <ElyPublicStat
                eyebrow="Review risk"
                helper="Only a small number of unresolved issues remain."
                tone="muted"
                trend="down"
                value="03"
              >
                Pending polish blockers
              </ElyPublicStat>
              <ElyPublicStat
                align="center"
                eyebrow="Warm-up"
                helper="Target for first interactive preview in the atelier."
                tone="primary"
                trend="up"
                value="2.1s"
              >
                Preview readiness target
              </ElyPublicStat>
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

export const MetricScenarios: Story = {
  render: () => ({
    components: { ElyPublicStat },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Theme quality</p>
              <h2 class="ely-public-section-title">Review readiness</h2>
              <div class="ely-public-component-grid">
                <ElyPublicStat eyebrow="Contrast" helper="Across light and dark." value="Pass">Text checks</ElyPublicStat>
                <ElyPublicStat eyebrow="Tokens" helper="No local palette drift." tone="accent" value="16">Governed slots</ElyPublicStat>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Member surface</p>
              <h2 class="ely-public-section-title">Reward pulse</h2>
              <div class="ely-public-component-grid">
                <ElyPublicStat align="center" eyebrow="Tier" helper="Until next gift." trend="up" value="64%">Progress</ElyPublicStat>
                <ElyPublicStat align="center" eyebrow="History" helper="Recoverable claims." tone="muted" value="12">Entries</ElyPublicStat>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SummaryBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicStat },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Stat boundary</p>
            <h1 class="ely-public-section-title">Stats summarize decisions; they do not replace charts or proof</h1>
            <p class="ely-public-copy">
              A stat is useful when one value, one label, and one helper make the next review decision easier.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Good summary row</p>
              <h2 class="ely-public-section-title">One signal per block</h2>
              <div class="ely-public-component-grid">
                <ElyPublicStat eyebrow="Mode proof" helper="Light and dark snapshots checked." tone="primary" trend="up" value="2/2">
                  Theme modes
                </ElyPublicStat>
                <ElyPublicStat eyebrow="Repair" helper="Remaining copy fixes." tone="muted" trend="down" value="03">
                  Open blockers
                </ElyPublicStat>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Context required</p>
              <h2 class="ely-public-section-title">Numbers need helper meaning</h2>
              <ElyPublicStat
                eyebrow="Reward pulse"
                helper="Members who can recover an interrupted claim."
                tone="accent"
                trend="flat"
                value="64%"
              >
                Claim recovery
              </ElyPublicStat>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected dashboard</p>
              <h2 class="ely-public-section-title">Do not stack stats as decoration</h2>
              <p class="ely-public-muted-copy">
                If the user needs comparison, filtering, history, or drill-down, use a data pattern instead of more glowing numbers.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
