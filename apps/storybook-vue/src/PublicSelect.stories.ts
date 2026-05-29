import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicSelect,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicSelectOption } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Select

const options: ElyPublicSelectOption[] = [
  { value: "elysia-default", label: "Elysia Bloom" },
  { value: "rose-nocturne", label: "Rose Nocturne" },
  { value: "azure-aria", label: "Azure Aria" },
  { value: "enterprise-calm", label: "Enterprise Calm" },
]

const meta = {
  title: "Public Luxe/Components/Select",
  component: ElyPublicSelect,
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
    modelValue: { control: "text", description: "Controlled selected value." },
    label: { control: "text", description: "Visible field label." },
    description: {
      control: "text",
      description: "Helper copy linked through aria-describedby.",
    },
    invalidMessage: {
      control: "text",
      description: "Validation message linked through aria-describedby.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible copy when the option list is empty.",
    },
    placeholder: {
      control: "text",
      description: "Disabled empty option copy.",
    },
    disabled: { control: "boolean", description: "Disable native select." },
  },
  args: {
    description: "Choose a governed family before custom overrides.",
    disabled: false,
    emptyMessage: "No governed options are available yet.",
    invalidMessage: undefined,
    label: "Theme family",
    modelValue: "elysia-default",
    options,
    placeholder: "Choose a fallback family",
  },
} satisfies Meta<typeof ElyPublicSelect>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSelect },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Select playground</p>
            <h1 class="ely-public-section-title">Governed option choice</h1>
            <div class="ely-story-offset-md">
              <ElyPublicSelect v-bind="args" />
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

export const OptionSets: Story = {
  render: () => ({
    components: { ElyPublicSelect },
    setup() {
      const theme = ref("elysia-default")
      const density = ref("comfortable")
      const reviewStage = ref("design")
      const densityOptions: ElyPublicSelectOption[] = [
        { value: "ceremonial", label: "Ceremonial" },
        { value: "comfortable", label: "Comfortable" },
        { value: "compact", label: "Compact" },
      ]
      const stageOptions: ElyPublicSelectOption[] = [
        { value: "design", label: "Design review" },
        { value: "accessibility", label: "Accessibility pass" },
        { value: "release", label: "Release candidate" },
      ]

      return {
        density,
        densityOptions,
        options,
        reviewStage,
        stageOptions,
        theme,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Select option sets</p>
            <h1 class="ely-public-section-title">Selections choose governed decisions</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSelect
                v-model="theme"
                :options="options"
                label="Theme family"
                description="Choose a complete family before page polish."
              />
              <ElyPublicSelect
                v-model="density"
                :options="densityOptions"
                label="Density rhythm"
                description="Density changes spacing, not theme roles."
              />
              <ElyPublicSelect
                v-model="reviewStage"
                :options="stageOptions"
                label="Review stage"
                description="Use select for constrained workflow state, not free-form notes."
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
    components: { ElyPublicSelect },
    setup() {
      const selectedTheme = ref("elysia-default")

      return {
        doc,
        options,
        selectedTheme,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Select states</p>
            <h1 class="ely-public-section-title">Selected, placeholder, invalid, disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSelect
                v-model="selectedTheme"
                :options="options"
                label="Theme family"
                description="Choose a family before any free-form color override."
              />
              <ElyPublicSelect
                :options="options"
                label="Guardrail"
                model-value=""
                placeholder="Choose a fallback family"
                invalid-message="A fallback family must exist before custom overrides are allowed."
              />
              <ElyPublicSelect
                disabled
                :options="options"
                label="Locked family"
                model-value="enterprise-calm"
              />
              <ElyPublicSelect
                :options="[]"
                label="Reserved family"
                description="Use the empty copy when the current surface has no valid choices."
                empty-message="No launch families are available for this audience yet."
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

export const ValidationScenarios: Story = {
  render: () => ({
    components: { ElyPublicSelect },
    setup() {
      const fallback = ref("")
      const locked = ref("enterprise-calm")

      return {
        fallback,
        locked,
        options,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Select validation scenarios</p>
            <h1 class="ely-public-section-title">Placeholder, invalid, and locked decisions</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSelect
                v-model="fallback"
                :options="options"
                label="Fallback family"
                placeholder="Choose a fallback family"
                description="Fallbacks keep dark mode and recovery paths predictable."
                invalid-message="Choose a fallback family before custom variants are approved."
              />
              <ElyPublicSelect
                v-model="locked"
                disabled
                :options="options"
                label="Enterprise bridge"
                description="Locked selects remain readable and announce the inherited decision."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const DecisionFlowScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicBadge, ElyPublicSelect },
    setup() {
      const family = ref("elysia-default")
      const density = ref("balanced")
      const stage = ref("design")
      const densityOptions: ElyPublicSelectOption[] = [
        { value: "compact", label: "Compact" },
        { value: "balanced", label: "Balanced" },
        { value: "ceremonial", label: "Ceremonial" },
      ]
      const stageOptions: ElyPublicSelectOption[] = [
        { value: "design", label: "Design review" },
        { value: "accessibility", label: "Accessibility pass" },
        { value: "release", label: "Release candidate" },
      ]

      return {
        density,
        densityOptions,
        family,
        options,
        stage,
        stageOptions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card" data-emphasis="feature">
              <p class="ely-public-eyebrow">Select decision flow</p>
              <h2 class="ely-public-section-title">Structured choices should not become navigation</h2>
              <p class="ely-public-muted-copy">
                Select is for one constrained decision inside the current
                surface. It can steer a preview, but it should not replace tabs,
                links, or route navigation.
              </p>
              <div class="ely-public-stack">
                <ElyPublicSelect
                  v-model="family"
                  :options="options"
                  label="Launch family"
                  description="Choose the complete theme family first."
                />
                <ElyPublicSelect
                  v-model="density"
                  :options="densityOptions"
                  label="Mobile density"
                  description="Density changes rhythm, not color roles."
                />
                <ElyPublicSelect
                  v-model="stage"
                  :options="stageOptions"
                  label="Review stage"
                  description="Use a stable option set for handoff state."
                />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Decision summary</p>
              <h2 class="ely-public-section-title">The selected value must be explainable</h2>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">{{ family }}</ElyPublicBadge>
                <ElyPublicBadge tone="accent">{{ density }}</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">{{ stage }}</ElyPublicBadge>
              </div>
              <ElyPublicAlert tone="info" title="Option meaning is visible">
                The summary repeats the selected values in plain text so the decision is not carried by select chrome alone.
              </ElyPublicAlert>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
