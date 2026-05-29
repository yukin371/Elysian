import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicSlider,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Slider

const meta = {
  title: "Public Luxe/Components/Slider",
  component: ElyPublicSlider,
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
    description: {
      control: "text",
      description: "Helper copy linked to the range input.",
    },
    disabled: { control: "boolean", description: "Disables range changes." },
    invalidMessage: {
      control: "text",
      description: "Actionable repair copy linked through aria-describedby.",
    },
    id: {
      control: "text",
      description: "Optional id for the range input.",
    },
    label: { control: "text", description: "Visible range label." },
    max: { control: "number", description: "Upper range bound." },
    min: { control: "number", description: "Lower range bound." },
    modelValue: {
      control: "number",
      description: "Controlled numeric value.",
    },
    showValue: {
      control: "boolean",
      description: "Shows the current value beside the label.",
    },
    step: { control: "number", description: "Native range increment." },
    unit: { control: "text", description: "Optional value suffix." },
  },
  args: {
    description: "Adjust the theme expression without changing component API.",
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: "Ornament intensity",
    max: 100,
    min: 0,
    modelValue: 62,
    showValue: true,
    step: 1,
    unit: "%",
  },
} satisfies Meta<typeof ElyPublicSlider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSlider },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Slider playground</p>
            <h1 class="ely-public-section-title">Tune a bounded public preference</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSlider v-bind="args" />
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
    components: { ElyPublicSlider },
    setup() {
      const ornament = ref(58)
      const density = ref(2)
      const motion = ref(35)

      return {
        density,
        doc,
        motion,
        ornament,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Slider states</p>
            <h1 class="ely-public-section-title">Value, step, unit, and disabled states</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSlider
                v-model="ornament"
                label="Ornament intensity"
                description="A continuous setting for theme expression."
                unit="%"
              />
              <ElyPublicSlider
                v-model="density"
                label="Density step"
                description="A stepped range for compact, balanced, or ceremonial rhythm."
                :min="1"
                :max="3"
                :step="1"
              />
              <ElyPublicSlider
                v-model="motion"
                label="Motion strength"
                description="Value is available to assistive users even when hidden visually."
                :show-value="false"
              />
              <ElyPublicSlider
                :model-value="80"
                disabled
                label="Locked campaign glow"
                description="Disabled range keeps the current setting visible."
                unit="%"
              />
              <ElyPublicSlider
                :model-value="92"
                label="Motion intensity"
                description="Higher values require reduced-motion evidence before approval."
                invalid-message="Lower motion intensity or attach reduced-motion proof."
                unit="%"
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

export const IntensityScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicSlider,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const intensity = ref(68)
      const label = computed(() =>
        intensity.value >= 76
          ? "Ceremonial"
          : intensity.value >= 46
            ? "Luminous"
            : "Quiet",
      )

      return {
        intensity,
        label,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Intensity scenarios</p>
                <h1 class="ely-public-section-title">Let users tune expression without changing theme family</h1>
              </div>
              <ElyPublicBadge tone="primary">{{ label }}</ElyPublicBadge>
            </div>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSlider
                v-model="intensity"
                label="Elysia expression"
                description="Higher values add more petal light and crystalline emphasis; the component grammar stays the same."
                unit="%"
              />
              <ElyPublicStat
                label="Current expression"
                :value="String(intensity)"
                suffix="%"
                tone="primary"
              />
              <ElyPublicText>
                Use this pattern for safe personalisation where the range changes atmosphere, not business rules.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BudgetScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicSlider, ElyPublicText },
    setup() {
      const shimmer = ref(40)
      const motion = ref(24)
      const density = ref(2)

      return {
        density,
        motion,
        shimmer,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Budget scenarios</p>
            <h1 class="ely-public-section-title">Several ranges can share one preference lane</h1>
            <ElyPublicText class="ely-story-offset-sm">
              Keep ranges together when they tune one surface. Use separators and labels before adding another panel.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSlider
                v-model="shimmer"
                label="Material shimmer"
                description="Controls local sheen strength for ceremonial surfaces."
                unit="%"
              />
              <ElyPublicSlider
                v-model="motion"
                label="Reveal motion"
                description="Keeps motion restrained before it competes with reading."
                unit="%"
              />
              <ElyPublicSlider
                v-model="density"
                label="Reading density"
                description="Steps between airy, balanced, and compact rhythm."
                :min="1"
                :max="3"
                :step="1"
              />
              <ElyPublicAlert
                tone="info"
                title="Approval rule"
                description="Slider values may tune expression, but they must not create a second color system or hidden business state."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicSlider },
    setup() {
      const exact = ref(15)

      return { exact }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject ranges when exact commitment matters</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSlider
                v-model="exact"
                label="Preview-only threshold"
                description="Safe because this controls a local preview, not price, consent, or destructive limits."
                :min="0"
                :max="30"
                :step="5"
                unit=" min"
              />
              <ElyPublicSlider
                :model-value="100"
                disabled
                label="Locked accessibility minimum"
                description="Do not let ornamental tuning reduce required contrast, focus visibility, or readable motion settings."
                unit="%"
              />
              <ElyPublicAlert
                tone="warning"
                title="Use another component when precision is the job"
                description="If users must type an exact value, confirm a legal choice, or compare named plans, use Input, Checkbox, Select, Radio Group, or Table instead."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
