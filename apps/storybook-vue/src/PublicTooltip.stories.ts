import {
  ElyPublicBadge,
  ElyPublicInput,
  ElyPublicStat,
  ElyPublicSwitch,
  ElyPublicText,
  ElyPublicTooltip,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Tooltip

const meta = {
  title: "Public Luxe/Components/Tooltip",
  component: ElyPublicTooltip,
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
    open: {
      control: "boolean",
      description: "Keep the bubble visible for static review.",
    },
    placement: {
      control: "select",
      options: ["top", "bottom", "inline"],
      description: "Position of the contextual bubble.",
    },
    text: {
      control: "text",
      description: "Fallback tooltip copy when no default slot is provided.",
    },
    tone: {
      control: "select",
      options: ["neutral", "accent"],
      description: "Visual emphasis of the contextual help trigger.",
    },
    triggerLabel: {
      control: "text",
      description: "Accessible label for the focusable trigger.",
    },
  },
  args: {
    open: true,
    placement: "top",
    text: "Supplemental context only; keep critical instructions visible.",
    tone: "neutral",
    triggerLabel: "Explain this field",
  },
} satisfies Meta<typeof ElyPublicTooltip>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicTooltip },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tooltip playground</p>
            <h1 class="ely-public-section-title">Tune contextual help without adding another surface</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <span>Theme role</span>
              <ElyPublicTooltip v-bind="args" />
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

export const Placements: Story = {
  render: () => ({
    components: { ElyPublicTooltip },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tooltip placements</p>
            <h1 class="ely-public-section-title">Context stays attached to the term it explains</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <span>Top hint</span>
              <ElyPublicTooltip
                open
                text="Use top when the row has enough vertical breathing room."
                trigger-label="Explain top placement"
              />
              <span>Bottom hint</span>
              <ElyPublicTooltip
                open
                placement="bottom"
                text="Use bottom near page headers or toolbar rows."
                trigger-label="Explain bottom placement"
              />
              <span>Inline hint</span>
              <ElyPublicTooltip
                open
                placement="inline"
                tone="accent"
                text="Use inline for short label definitions in dense settings."
                trigger-label="Explain inline placement"
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicTooltip },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tooltip states</p>
            <h1 class="ely-public-section-title">Neutral, accent, placement, open preview</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <span>Neutral</span>
              <ElyPublicTooltip text="Quiet supplemental context for a nearby label." />
              <span>Accent</span>
              <ElyPublicTooltip
                tone="accent"
                text="Accent belongs to one highlighted explanation, not every hint."
              />
              <span>Review open</span>
              <ElyPublicTooltip
                open
                text="Open preview is for documentation and screenshot review."
              />
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

export const LabelHelpScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicInput,
      ElyPublicStat,
      ElyPublicTooltip,
    },
    setup() {
      const title = ref("Moonlit invitation")

      return { title }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Tooltip label help</p>
            <h1 class="ely-public-section-title">Short explanations reduce card nesting</h1>
            <p class="ely-public-copy">
              Tooltips are useful when a phrase needs clarification but does not deserve a new nested card.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicStat
                  value="86%"
                  eyebrow="Readiness"
                  helper="Current theme proof coverage"
                  trend="up"
                />
                <span>surface majority</span>
                <ElyPublicTooltip
                  open
                  placement="inline"
                  text="Surface majority means the page mostly uses neutral surfaces; accent appears only at decision points."
                  trigger-label="Explain surface majority"
                />
              </div>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="accent">ceremonial</ElyPublicBadge>
                <span>ornament budget</span>
                <ElyPublicTooltip
                  tone="accent"
                  text="Ceremonial allows a stronger hero moment, while form and recovery areas stay quieter."
                  trigger-label="Explain ornament budget"
                />
              </div>
              <ElyPublicInput
                v-model="title"
                label="Invitation title"
                description="The visible description still carries the required instruction."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const KeyboardScenarios: Story = {
  render: () => ({
    components: { ElyPublicTooltip, ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tooltip keyboard scenarios</p>
            <h1 class="ely-public-section-title">Focus the trigger to reveal the tooltip</h1>
            <p class="ely-public-copy">
              Tab to focus the tooltip trigger. The tooltip appears on focus and dismisses when focus moves away. Escape also closes the tooltip.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTooltip
                trigger-label="Keyboard-accessible tooltip"
                title="Focus-triggered tooltip"
                description="This tooltip appears when the trigger receives keyboard focus."
              />
              <ElyPublicText>
                Tooltips follow the same pattern as Popover for keyboard interaction: focus opens, blur or Escape closes. Screen readers announce the title and description.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const AccessibilityBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicInput, ElyPublicSwitch, ElyPublicTooltip },
    setup() {
      const syncEnabled = ref(true)
      const email = ref("reviewer@example.com")

      return { email, syncEnabled }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tooltip accessibility boundary</p>
            <h1 class="ely-public-section-title">Required instructions stay visible</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <span>Optional context</span>
                <ElyPublicTooltip
                  open
                  text="This hint explains terminology; it is not the only place where the rule appears."
                  trigger-label="Explain optional context"
                />
              </div>
              <ElyPublicInput
                v-model="email"
                type="email"
                label="Reviewer email"
                description="Required for handoff confirmation."
                invalid-message="Tooltip cannot replace this visible repair message."
              />
              <ElyPublicSwitch
                v-model="syncEnabled"
                label="Sync theme choice"
                description="Applies immediately to this preview only."
              />
              <p class="ely-public-muted-copy">
                If the user must know it before acting, keep it in label, description, Alert, or visible copy.
              </p>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
