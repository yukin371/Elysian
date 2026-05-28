import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicProgress,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Progress

const meta = {
  title: "Public Luxe/Components/Progress",
  component: ElyPublicProgress,
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
      description:
        "Visible and accessible context label for the progress task.",
    },
    max: {
      control: { min: 1, max: 200, type: "number" },
      description: "Upper bound used to calculate completion percentage.",
    },
    showValue: {
      control: "boolean",
      description: "Shows the rounded percentage beside the label.",
    },
    tone: {
      control: "select",
      options: ["primary", "accent", "success", "warning"],
      description: "Semantic emphasis for the fill treatment.",
    },
    value: {
      control: { min: 0, max: 200, type: "number" },
      description: "Current progress value before percentage normalization.",
    },
  },
  args: {
    label: "Theme pack rollout",
    max: 100,
    showValue: true,
    tone: "primary",
    value: 64,
  },
} satisfies Meta<typeof ElyPublicProgress>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicProgress },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Progress playground</p>
            <h1 class="ely-public-section-title">Tune a completion surface with explicit semantics</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicProgress v-bind="args" />
              <p class="ely-public-muted-copy">
                Use controls to inspect label, tone, percentage, and clamped range behavior.
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

export const Tones: Story = {
  render: () => ({
    components: { ElyPublicProgress },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Progress tones</p>
            <h1 class="ely-public-section-title">Progress communicates task state, not decoration</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicProgress label="Theme audit" :value="28" tone="primary" />
              <ElyPublicProgress label="Mood direction sign-off" :value="52" tone="accent" />
              <ElyPublicProgress label="Asset migration" :value="81" tone="success" />
              <ElyPublicProgress label="Accessibility fixes remaining" :value="14" tone="warning" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicProgress },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Progress states</p>
            <h1 class="ely-public-section-title">Primary, accent, success, warning, and clamped range</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicProgress label="Theme audit" :value="28" tone="primary" />
              <ElyPublicProgress label="Mood direction sign-off" :value="52" tone="accent" />
              <ElyPublicProgress label="Asset migration" :value="81" tone="success" />
              <ElyPublicProgress label="Accessibility fixes remaining" :value="14" tone="warning" />
              <ElyPublicProgress label="Overflow clamp example" :value="180" :max="120" />
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

export const ProductScenarios: Story = {
  render: () => ({
    components: { ElyPublicProgress },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Publishing flow</p>
              <h2 class="ely-public-section-title">Release readiness</h2>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Light mode snapshot" :value="100" tone="success" />
                <ElyPublicProgress label="Dark mode snapshot" :value="72" tone="primary" />
                <ElyPublicProgress label="Accessibility notes" :value="36" tone="warning" />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Member surface</p>
              <h2 class="ely-public-section-title">Reward tier progress</h2>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Current tier" :value="64" tone="accent" />
                <ElyPublicProgress label="Next reward unlock" :value="42" tone="primary" />
                <ElyPublicProgress label="Monthly quests" :value="7" :max="10" tone="success" />
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundedReadinessScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicProgress,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card" data-emphasis="feature">
              <p class="ely-public-eyebrow">Progress bounded readiness</p>
              <h2 class="ely-public-section-title">Progress needs a real range and a decision</h2>
              <p class="ely-public-muted-copy">
                Use Progress when the task has a known upper bound. If the user
                cannot tell what the percentage unlocks, the bar is only ornament.
              </p>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Theme pairing proof" tone="success" :value="100" />
                <ElyPublicProgress label="Mobile density review" tone="primary" :value="75" />
                <ElyPublicProgress label="Accessibility repair" tone="warning" :value="40" />
                <ElyPublicAlert tone="warning" title="Readiness is not complete">
                  Finish accessibility repair before publishing. The progress bars explain why the primary action is still gated.
                </ElyPublicAlert>
                <div class="ely-public-actions">
                  <ElyPublicButton tone="secondary">Open repair list</ElyPublicButton>
                  <ElyPublicButton disabled>Publish locked</ElyPublicButton>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Clamp proof</p>
              <h2 class="ely-public-section-title">Overflow remains bounded</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">known max</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">visible label</ElyPublicBadge>
                <ElyPublicBadge tone="accent">decision nearby</ElyPublicBadge>
              </div>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Ten-review checklist" tone="success" :value="12" :max="10" />
                <ElyPublicProgress label="Hidden percentage example" tone="primary" :value="6" :max="10" :show-value="false" />
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MilestoneGateScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicProgress,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Progress milestone gates</p>
            <h1 class="ely-public-section-title">Progress should explain what unlocks next</h1>
            <p class="ely-public-copy">
              A progress bar is approved when the task has a known range, visible label, and nearby decision about what happens at the next milestone.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Release path</p>
              <h2 class="ely-public-section-title">Every bar has a named task</h2>
              <div class="ely-public-stack">
                <ElyPublicProgress label="Theme role proof" tone="success" :value="100" />
                <ElyPublicProgress label="Component operability proof" tone="primary" :value="78" />
                <ElyPublicProgress label="Pattern recovery proof" tone="warning" :value="46" />
                <ElyPublicAlert tone="warning" title="Release gate waits for recovery proof">
                  Progress explains why publish remains locked and which review lane should be opened next.
                </ElyPublicAlert>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Milestone action</p>
              <h2 class="ely-public-section-title">The next step is not hidden in the bar</h2>
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">known max</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">decision nearby</ElyPublicBadge>
                </div>
                <ElyPublicProgress label="Reviewer checklist" tone="accent" :value="7" :max="10" />
                <div class="ely-public-actions">
                  <ElyPublicButton tone="secondary">Open remaining checks</ElyPublicButton>
                  <ElyPublicButton disabled>Approve after 10 checks</ElyPublicButton>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected use</p>
              <h2 class="ely-public-section-title">Do not use progress for unknown waiting</h2>
              <p class="ely-public-muted-copy">
                If the duration, max, or next milestone is unknown, use loading or status feedback instead of a decorative percentage.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
