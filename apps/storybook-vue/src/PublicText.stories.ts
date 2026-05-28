import { ElyPublicText, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Text

const meta = {
  title: "Public Luxe/Components/Text",
  component: ElyPublicText,
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
    as: {
      control: "select",
      options: ["p", "span", "strong"],
      description: "HTML tag used for the rendered text node.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Typography scale for lead, default, and compact text.",
    },
    tone: {
      control: "select",
      options: ["primary", "muted", "subtle"],
      description: "Reading emphasis for body or supporting copy.",
    },
    weight: {
      control: "select",
      options: ["regular", "medium", "semibold"],
      description:
        "Font weight variation for inline emphasis without leaving body-copy rhythm.",
    },
  },
  args: {
    as: "p",
    size: "md",
    tone: "primary",
    weight: "regular",
  },
} satisfies Meta<typeof ElyPublicText>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicText },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Text playground</p>
            <h1 class="ely-public-section-title">Tune reading rhythm without leaving the public preset</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText v-bind="args">
                Public-facing copy should feel luminous and refined, but the reading rhythm still needs to stay controlled, reusable, and product-safe.
              </ElyPublicText>
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

export const TypeScale: Story = {
  render: () => ({
    components: { ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Text type scale</p>
            <h1 class="ely-public-section-title">Body rhythm stays readable before it becomes poetic</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText size="lg">
                Large text introduces a surface or section without becoming a marketing headline.
              </ElyPublicText>
              <ElyPublicText size="md">
                Medium text is the default reading rhythm for explanations and product copy.
              </ElyPublicText>
              <ElyPublicText size="sm" tone="muted">
                Small text supports controls, helper copy, and low-emphasis notes.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicText },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Text states</p>
            <h1 class="ely-public-section-title">Primary, muted, subtle, size, and semantic emphasis</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText size="lg">
                Lead copy can feel a little more present without becoming a headline.
              </ElyPublicText>
              <ElyPublicText tone="muted">
                Muted copy supports adjacent controls, metrics, and editorial helpers.
              </ElyPublicText>
              <ElyPublicText tone="subtle" size="sm">
                Subtle text is for low-priority notes, not for hiding essential content.
              </ElyPublicText>
              <ElyPublicText as="strong" weight="semibold">
                Strong should be used as semantic emphasis inside the same reading rhythm.
              </ElyPublicText>
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

export const VoiceScenarios: Story = {
  render: () => ({
    components: { ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Do</p>
              <h2 class="ely-public-section-title">Concrete and elegant</h2>
              <div class="ely-public-stack">
                <ElyPublicText>
                  Choose a theme family before changing accent behavior.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  This keeps light and dark mode paired during review.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Do not</p>
              <h2 class="ely-public-section-title">Poetry as a hiding place</h2>
              <div class="ely-public-stack">
                <ElyPublicText>
                  Let the moonlit resonance decide the next destiny.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  Beautiful words still need a clear action and recovery path.
                </ElyPublicText>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ReadingBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Text boundary</p>
            <h1 class="ely-public-section-title">Elegant copy still has to name the user action</h1>
            <p class="ely-public-copy">
              Public-luxe voice can be lyrical, but every control, recovery path, and warning needs plain product meaning.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Actionable copy</p>
              <h2 class="ely-public-section-title">Meaning before mood</h2>
              <div class="ely-public-stack">
                <ElyPublicText size="lg">
                  Review the theme in light and dark mode before publishing.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  This tells the reviewer exactly what evidence is missing and why the action is blocked.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Support copy</p>
              <h2 class="ely-public-section-title">Muted does not mean hidden</h2>
              <div class="ely-public-stack">
                <ElyPublicText tone="muted">
                  Restore remains available from the same review surface.
                </ElyPublicText>
                <ElyPublicText tone="subtle" size="sm">
                  Use subtle copy for secondary notes, not required instructions.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected voice</p>
              <h2 class="ely-public-section-title">Do not let poetry replace state</h2>
              <div class="ely-public-stack">
                <ElyPublicText>
                  The glimmering archive awaits its next constellation.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  If the user cannot tell whether to restore, publish, or repair, the copy fails even when it sounds on-brand.
                </ElyPublicText>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
