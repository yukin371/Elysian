import { ElyPublicDivider, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Divider

const meta = {
  title: "Public Luxe/Components/Divider",
  component: ElyPublicDivider,
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
      options: ["start", "center", "end"],
      description: "Label alignment when a label exists.",
    },
    label: { control: "text", description: "Optional inline divider label." },
    tone: {
      control: "select",
      options: ["default", "accent"],
      description: "Visual emphasis level.",
    },
  },
  args: {
    align: "center",
    label: "Review lane",
    tone: "default",
  },
} satisfies Meta<typeof ElyPublicDivider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicDivider },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Divider playground</p>
            <h1 class="ely-public-section-title">Tune section rhythm</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <p class="ely-public-muted-copy">Use dividers to mark a new lane without adding another title hierarchy.</p>
              <ElyPublicDivider v-bind="args" />
              <p class="ely-public-muted-copy">The label should stay lighter than the actual content heading.</p>
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

export const Alignments: Story = {
  render: () => ({
    components: { ElyPublicDivider },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Divider alignments</p>
            <h1 class="ely-public-section-title">Labels mark rhythm without becoming headings</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDivider align="start" label="Start aligned" />
              <ElyPublicDivider align="center" label="Center aligned" />
              <ElyPublicDivider align="end" label="End aligned" />
              <ElyPublicDivider align="center" label="Accent transition" tone="accent" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicDivider },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Divider states</p>
            <h1 class="ely-public-section-title">Plain, labeled, aligned, accent</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <p class="ely-public-muted-copy">Plain separators keep dense content from becoming a card stack.</p>
              <ElyPublicDivider />
              <p class="ely-public-muted-copy">Centered labels can mark a light review break.</p>
              <ElyPublicDivider label="Review lane" />
              <p class="ely-public-muted-copy">Start alignment works well for editorial or hand-off sections.</p>
              <ElyPublicDivider align="start" label="Hand-off" />
              <p class="ely-public-muted-copy">Accent labels should be reserved for product-meaningful transitions.</p>
              <ElyPublicDivider align="end" label="Approved" tone="accent" />
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

export const SectionScenarios: Story = {
  render: () => ({
    components: { ElyPublicDivider },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Divider section scenarios</p>
            <h1 class="ely-public-section-title">Use dividers to avoid card nesting</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <p class="ely-public-muted-copy">Theme family selected: rose-nocturne.</p>
              <ElyPublicDivider label="Review evidence" align="start" />
              <p class="ely-public-muted-copy">Light and dark snapshots have paired text tokens.</p>
              <ElyPublicDivider label="Recovery path" align="start" />
              <p class="ely-public-muted-copy">Restore previous family remains available from the same review surface.</p>
              <ElyPublicDivider label="Approved" align="end" tone="accent" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RhythmBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicDivider },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Divider boundary</p>
            <h1 class="ely-public-section-title">Dividers create rhythm; they do not create information architecture</h1>
            <p class="ely-public-copy">
              Use dividers to reduce card nesting, not to hide missing headings, missing grouping, or weak content order.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Good rhythm</p>
              <h2 class="ely-public-section-title">One card, several review lanes</h2>
              <div class="ely-public-stack">
                <p class="ely-public-muted-copy">Theme family: Rose Nocturne.</p>
                <ElyPublicDivider align="start" label="Mode proof" />
                <p class="ely-public-muted-copy">Light and dark snapshots remain paired.</p>
                <ElyPublicDivider align="start" label="Recovery" />
                <p class="ely-public-muted-copy">Restore previous family is still reachable.</p>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Accent boundary</p>
              <h2 class="ely-public-section-title">Accent is a transition, not confetti</h2>
              <div class="ely-public-stack">
                <p class="ely-public-muted-copy">Use accent only when the lane carries real product meaning.</p>
                <ElyPublicDivider align="center" label="Approved evidence" tone="accent" />
                <p class="ely-public-muted-copy">The label supports the heading instead of replacing it.</p>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected structure</p>
              <h2 class="ely-public-section-title">Do not use dividers as headings</h2>
              <p class="ely-public-muted-copy">
                If a section needs navigation, hierarchy, or a decision title, write the heading and use the divider only for rhythm.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
