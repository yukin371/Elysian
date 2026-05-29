import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicNumberInput,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.NumberInput

const meta = {
  title: "Public Luxe/Components/Number Input",
  component: ElyPublicNumberInput,
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
      description: "Helper copy linked to the number input.",
    },
    disabled: { control: "boolean", description: "Disables editing." },
    invalidMessage: {
      control: "text",
      description: "Visible invalid recovery copy.",
    },
    label: { control: "text", description: "Visible field label." },
    max: { control: "number", description: "Optional maximum value." },
    min: { control: "number", description: "Optional minimum value." },
    modelValue: {
      control: "number",
      description: "Controlled exact numeric value.",
    },
    placeholder: { control: "text", description: "Placeholder hint." },
    rangeText: {
      control: "text",
      description: "Visible range hint linked through aria-describedby.",
    },
    readOnly: { control: "boolean", description: "Prevents editing." },
    step: { control: "number", description: "Native and stepper increment." },
    unit: { control: "text", description: "Visible unit suffix." },
  },
  args: {
    description: "Type an exact amount; use the steppers for small changes.",
    disabled: false,
    invalidMessage: undefined,
    label: "Reward credits",
    max: 120,
    min: 0,
    modelValue: 36,
    placeholder: "0",
    rangeText: "Allowed range: 0 to 120 credits.",
    readOnly: false,
    step: 1,
    unit: "credits",
  },
} satisfies Meta<typeof ElyPublicNumberInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicNumberInput },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Number input playground</p>
            <h1 class="ely-public-section-title">Enter exact public settings without losing the luxe field rhythm</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicNumberInput v-bind="args" />
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
    components: { ElyPublicNumberInput },
    setup() {
      const emptyValue = ref<number | null>(null)
      const typedValue = ref(24)
      const steppedValue = ref(6)

      return {
        doc,
        emptyValue,
        steppedValue,
        typedValue,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Number input states</p>
            <h1 class="ely-public-section-title">Empty, precise, invalid, read-only, and disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicNumberInput
                v-model="emptyValue"
                label="Optional guest seats"
                description="Empty stays distinct from zero while the form is incomplete."
                :min="0"
                :max="8"
                unit="seats"
              />
              <ElyPublicNumberInput
                v-model="typedValue"
                label="Preview duration"
                description="Exact values belong here; approximate mood tuning belongs to Slider."
                :min="5"
                :max="90"
                :step="5"
                unit="min"
              />
              <ElyPublicNumberInput
                v-model="steppedValue"
                label="Reward batch"
                description="Steppers support small local changes without becoming a calculator."
                :min="1"
                :max="12"
                unit="drops"
              />
              <ElyPublicNumberInput
                :model-value="140"
                label="Petal reserve"
                description="Visible correction explains the boundary instead of silently rewriting the field."
                invalid-message="Keep the reserve at 120 credits or below."
                :max="120"
                unit="credits"
              />
              <ElyPublicNumberInput
                :model-value="30"
                read-only
                label="Submitted window"
                description="Read-only values can be reviewed before final confirmation."
                unit="days"
              />
              <ElyPublicNumberInput
                :model-value="2"
                disabled
                label="Locked creator tier"
                description="Disabled fields explain unavailable changes."
                unit="tiers"
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

export const QuantityScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicNumberInput,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const seats = ref(18)
      const capacity = computed(() =>
        Math.min(100, Math.round((seats.value / 40) * 100)),
      )
      const capacityLabel = computed(() =>
        capacity.value >= 80 ? "Nearly full" : "Open",
      )

      return {
        capacity,
        capacityLabel,
        seats,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Quantity scenarios</p>
                <h1 class="ely-public-section-title">Use exact quantities when capacity changes the next action</h1>
              </div>
              <ElyPublicBadge tone="primary">{{ capacityLabel }}</ElyPublicBadge>
            </div>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicNumberInput
                v-model="seats"
                label="Reserved guest seats"
                description="The surrounding copy names the unit and consequence before the user submits."
                :min="0"
                :max="40"
                unit="seats"
              />
              <ElyPublicProgress
                label="Capacity used"
                :value="capacity"
                tone="accent"
              />
              <ElyPublicStat
                label="Seats reserved"
                :value="String(seats)"
                suffix="/40"
                tone="primary"
              />
              <ElyPublicText>
                A flat lane keeps quantity, evidence, and explanation together without turning every metric into a card.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const PrecisionScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicNumberInput, ElyPublicText },
    setup() {
      const threshold = ref(12.5)
      const cadence = ref(7)

      return {
        cadence,
        threshold,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Precision scenarios</p>
            <h1 class="ely-public-section-title">Let exact values stay calm, typed, and reviewable</h1>
            <ElyPublicText class="ely-story-offset-sm">
              Decimal and stepped values should still read as one governed form lane. The unit belongs beside the value, not hidden in placeholder text.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicNumberInput
                v-model="threshold"
                label="Bonus threshold"
                description="Decimals are acceptable when the business meaning is visible."
                :min="0"
                :max="25"
                :step="0.5"
                unit="%"
              />
              <ElyPublicNumberInput
                v-model="cadence"
                label="Review cadence"
                description="Step by week to keep the choice exact but not fiddly."
                :min="1"
                :max="12"
                unit="days"
              />
              <ElyPublicAlert
                tone="info"
                title="Precision rule"
                description="NumberInput owns exact entry. Formatting, exchange rates, tax rules, and final pricing belong to a page-owned domain flow."
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
    components: { ElyPublicAlert, ElyPublicNumberInput },
    setup() {
      const exact = ref(130)

      return { exact }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject numeric fields that are secretly business engines</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicNumberInput
                v-model="exact"
                label="Credit cap"
                description="The field can expose the number, but the surrounding flow must own policy and confirmation."
                invalid-message="Review the policy cap before accepting values above 120 credits."
                :min="0"
                :max="120"
                unit="credits"
              />
              <ElyPublicAlert
                tone="warning"
                title="Do not hide high-risk rules inside the primitive"
                description="Use a dedicated domain flow for currency formatting, inventory locks, legal thresholds, destructive limits, or multi-field calculations."
              />
              <ElyPublicAlert
                tone="info"
                title="Choose the simpler primitive first"
                description="Use Slider for approximate tuning, Select for named choices, Progress for read-only completion, and Text or Table for explanations."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
