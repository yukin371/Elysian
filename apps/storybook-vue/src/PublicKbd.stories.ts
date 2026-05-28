import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicKbd,
  ElyPublicLink,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Kbd

const meta = {
  title: "Public Luxe/Components/Kbd",
  component: ElyPublicKbd,
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
    keys: {
      control: "object",
      description: "Ordered key labels rendered as a shortcut sequence.",
    },
    separatorLabel: {
      control: "text",
      description: "Screen-reader phrase inserted between shortcut keys.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Keyboard hint density for inline or compact contexts.",
    },
    tone: {
      control: "select",
      options: ["neutral", "primary", "accent", "muted"],
      description: "Visual emphasis for the inline keyboard hint.",
    },
  },
  args: {
    keys: ["Ctrl", "K"],
    separatorLabel: "then",
    size: "md",
    tone: "neutral",
  },
} satisfies Meta<typeof ElyPublicKbd>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicKbd, ElyPublicText },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Kbd playground</p>
            <h1 class="ely-public-section-title">Shortcut hints should be readable, not decorative badges</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Open the command search with <ElyPublicKbd v-bind="args" /> and keep the action label visible beside it.
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

export const States: Story = {
  render: () => ({
    components: { ElyPublicKbd, ElyPublicText },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Kbd states</p>
            <h1 class="ely-public-section-title">Single key, shortcut sequence, tone, and compact size</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Press <ElyPublicKbd>Esc</ElyPublicKbd> to close the focused layer.
              </ElyPublicText>
              <ElyPublicText>
                Open command search with <ElyPublicKbd :keys="['Ctrl', 'K']" tone="primary" />.
              </ElyPublicText>
              <ElyPublicText>
                Jump to review with <ElyPublicKbd :keys="['Shift', '?']" tone="accent" size="sm" />.
              </ElyPublicText>
              <ElyPublicText tone="muted">
                Compact support hint: <ElyPublicKbd :keys="['Tab']" tone="muted" size="sm" /> moves to the next control.
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

export const ShortcutScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicKbd, ElyPublicLink, ElyPublicText },
    setup() {
      const shortcuts = [
        {
          action: "Open command search",
          keys: ["Ctrl", "K"],
          note: "Shortcut discovery sits beside the action label; it does not replace the action.",
          tone: "primary",
        },
        {
          action: "Show keyboard help",
          keys: ["Shift", "?"],
          note: "Help shortcuts can be visible in support copy without turning into a command palette.",
          tone: "accent",
        },
        {
          action: "Move to next field",
          keys: ["Tab"],
          note: "Native keyboard behavior can be documented without inventing a custom listener.",
          tone: "muted",
        },
      ] satisfies {
        action: string
        keys: string[]
        note: string
        tone: "accent" | "muted" | "neutral" | "primary"
      }[]

      return { shortcuts }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Shortcut scenarios</p>
            <h1 class="ely-public-section-title">Keyboard hints belong beside the action they explain</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div v-for="item in shortcuts" :key="item.action" class="ely-story-doc-state">
                <strong>{{ item.action }}</strong>
                <span>{{ item.note }}</span>
                <ElyPublicKbd :keys="item.keys" :tone="item.tone" />
              </div>
              <div class="ely-public-actions">
                <ElyPublicButton>Open command search</ElyPublicButton>
                <ElyPublicLink href="#" tone="muted">Review keyboard map</ElyPublicLink>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const InlineHelpScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicKbd, ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Inline help</p>
            <h1 class="ely-public-section-title">Hints stay inline when they explain reading or repair paths</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Press <ElyPublicKbd tone="primary">Enter</ElyPublicKbd> to confirm the highlighted option after the list is focused.
              </ElyPublicText>
              <ElyPublicText tone="muted">
                Use <ElyPublicKbd :keys="['ArrowDown']" size="sm" tone="muted" /> to move through options without changing the current theme family.
              </ElyPublicText>
              <ElyPublicAlert tone="info" title="Kbd explains behavior; it does not create behavior">
                The component beside this hint still owns focus handling, selection, dismissal, and repair feedback.
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
    components: { ElyPublicAlert, ElyPublicKbd, ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Kbd boundary</p>
            <h1 class="ely-public-section-title">Do not make shortcut hints act like commands, chips, or badges</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Good: <ElyPublicKbd :keys="['Ctrl', 'S']" tone="primary" /> sits near Save when the page actually supports save.
              </ElyPublicText>
              <ElyPublicText>
                Risk: <ElyPublicKbd tone="accent">VIP</ElyPublicKbd> is a status label, so it belongs in Badge instead.
              </ElyPublicText>
              <ElyPublicAlert tone="warning" title="Shortcut hints must be truthful">
                If the surrounding control does not support the keyboard path, remove the Kbd or implement the behavior in the owning component first.
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
