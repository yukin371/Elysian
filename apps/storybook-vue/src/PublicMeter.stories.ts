import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicMeter,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Meter

const meta = {
  title: "Public Luxe/Components/Meter",
  component: ElyPublicMeter,
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
    helper: {
      control: "text",
      description: "Visible interpretation for the measured value.",
    },
    label: {
      control: "text",
      description: "Visible and accessible label for the measured condition.",
    },
    max: {
      control: { min: 1, max: 200, type: "number" },
      description: "Upper bound used to calculate the visual fill.",
    },
    showValue: {
      control: "boolean",
      description: "Shows the readable value beside the label.",
    },
    tone: {
      control: "select",
      options: ["primary", "accent", "success", "warning", "danger"],
      description: "Semantic emphasis for the measured condition.",
    },
    value: {
      control: { min: 0, max: 200, type: "number" },
      description: "Current scalar value before bounded normalization.",
    },
    valueText: {
      control: "text",
      description: "Optional custom readable value and aria-valuetext.",
    },
  },
  args: {
    helper: "Measures theme fit, not task completion.",
    label: "Elysia theme fit",
    max: 100,
    showValue: true,
    tone: "accent",
    value: 86,
    valueText: "86% fit",
  },
} satisfies Meta<typeof ElyPublicMeter>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicMeter },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Meter playground</p>
            <h1 class="ely-public-section-title">Tune a bounded condition without implying task progress</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicMeter v-bind="args" />
              <p class="ely-public-muted-copy">
                Use controls to inspect tone, helper copy, custom value text, and clamped scalar behavior.
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
    components: { ElyPublicMeter },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Meter states</p>
            <h1 class="ely-public-section-title">Primary, accent, success, warning, danger, and readable value</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicMeter label="Theme fit" :value="86" value-text="86% fit" tone="accent" helper="Measures role palette alignment." />
              <ElyPublicMeter label="Storage capacity" :value="62" value-text="62% used" tone="primary" helper="A condition, not upload progress." />
              <ElyPublicMeter label="Profile health" :value="92" value-text="Excellent" tone="success" helper="Enough proof to recommend publishing." />
              <ElyPublicMeter label="Ornament budget" :value="74" value-text="Near limit" tone="warning" helper="Reduce decorative layers before adding motion." />
              <ElyPublicMeter label="Contrast risk" :value="36" value-text="Needs repair" tone="danger" helper="Danger tone must be explained in text." />
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

export const CapacityScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicMeter,
      ElyPublicStat,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Capacity scenarios</p>
            <h1 class="ely-public-section-title">Capacity should read as condition, not progress</h1>
            <p class="ely-public-copy">
              Meter helps users judge a bounded state such as usage, quota, fit, or health without implying that work is currently completing.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Member quota</p>
              <h2 class="ely-public-section-title">Benefit capacity</h2>
              <div class="ely-public-stack">
                <ElyPublicStat value="8 / 12" eyebrow="Claims" helper="Remaining claims this month">Monthly reward slots</ElyPublicStat>
                <ElyPublicMeter label="Claim capacity" :value="8" :max="12" value-text="8 of 12 used" tone="primary" helper="Use Meter because this is current quota state." />
                <ElyPublicMeter label="Rare item availability" :value="2" :max="10" value-text="2 of 10 left" tone="warning" helper="Warning names scarcity without turning it into a countdown." />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Theme fit</p>
              <h2 class="ely-public-section-title">Role palette health</h2>
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="accent">elysia-default</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">bounded review</ElyPublicBadge>
                </div>
                <ElyPublicMeter label="Petal and moonlight fit" :value="88" value-text="88% fit" tone="accent" helper="Measures theme coherence after token review." />
                <ElyPublicText tone="muted">The bar informs approval; it does not replace the review notes.</ElyPublicText>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const QualityScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicMeter,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Quality scenarios</p>
            <h1 class="ely-public-section-title">Quality signals need text, not just color</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicBadge tone="success">healthy</ElyPublicBadge>
                <ElyPublicBadge tone="warning">watch</ElyPublicBadge>
                <ElyPublicBadge tone="danger">repair</ElyPublicBadge>
              </div>
              <ElyPublicMeter label="Copy clarity" :value="91" value-text="Excellent" tone="success" helper="Labels and next steps are readable without decorative copy." />
              <ElyPublicMeter label="Motion budget" :value="68" value-text="Watch" tone="warning" helper="Animation is still usable, but another shimmer would exceed the budget." />
              <ElyPublicMeter label="Contrast safety" :value="42" value-text="Repair needed" tone="danger" helper="Danger tone is paired with explicit repair meaning." />
              <ElyPublicAlert tone="warning" title="Meter does not decide alone">
                Use helper copy or nearby review notes to explain the condition before asking for approval.
              </ElyPublicAlert>
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
      ElyPublicBadge,
      ElyPublicMeter,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Do not use Meter as progress, waiting, or decoration</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicMeter label="Acceptable capacity signal" :value="72" value-text="72% used" tone="primary" helper="The measured condition is current storage usage." />
              <ElyPublicMeter label="Acceptable fit signal" :value="84" value-text="84% fit" tone="accent" helper="The measured condition is theme-role alignment." />
              <ElyPublicAlert tone="warning" title="Rejected uses">
                Use Progress for completion, Spinner for unknown waiting, Stat for one decisive number, and Table when users need row-by-row comparison.
              </ElyPublicAlert>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="neutral">not task progress</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">not loading</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">not a ranking chart</ElyPublicBadge>
              </div>
              <ElyPublicText tone="muted">
                A meter is approved only when max, value, label, and interpretation are all visible enough for users to understand the measured condition.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
