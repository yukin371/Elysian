import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicFieldset,
  ElyPublicInput,
  ElyPublicNumberInput,
  ElyPublicRadioGroup,
  ElyPublicSlider,
  ElyPublicTextarea,
} from "@elysian/ui-public-vue"
import type { ElyPublicRadioGroupItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const meta = {
  title: "Public Luxe/Patterns/Responsive Form",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Responsive form patterns show how form primitives adapt to narrow and wide viewports. The primitives stay the same; the page layout changes density, direction, and action placement.",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const toneItems: ElyPublicRadioGroupItem[] = [
  {
    key: "luminous",
    label: "Luminous",
    description: "More ceremonial and brand-led",
    value: "luminous",
  },
  {
    key: "clear",
    label: "Clear",
    description: "Informational and restrained",
    value: "clear",
  },
  {
    key: "calm",
    label: "Calm",
    description: "Enterprise-adjacent clarity",
    value: "calm",
  },
]

export const MobileStackedLayout: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicFieldset,
      ElyPublicInput,
      ElyPublicNumberInput,
      ElyPublicRadioGroup,
      ElyPublicSlider,
      ElyPublicTextarea,
    },
    setup() {
      const name = ref("")
      const intensity = ref(50)
      const seats = ref(4)
      const tone = ref("luminous")

      return { intensity, name, seats, tone, toneItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Mobile stacked layout</p>
            <h1 class="ely-public-section-title">Single column, block actions, compact density</h1>
            <p class="ely-public-copy">
              On narrow viewports, form fields stack vertically. Actions use block width for easy touch targets.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="name"
                label="Collection name"
                description="Short text inputs adapt to full width on mobile."
                placeholder="Name your collection"
              />

              <ElyPublicFieldset
                legend="Theme personality"
                density="compact"
                description="Compact density reduces vertical space while keeping touch targets accessible."
              >
                <ElyPublicRadioGroup
                  aria-label="Theme personality"
                  v-model="tone"
                  :items="toneItems"
                />
              </ElyPublicFieldset>

              <ElyPublicSlider
                v-model="intensity"
                label="Ornament intensity"
                description="Sliders work well on touch. Full width gives precise control."
                unit="%"
              />

              <ElyPublicNumberInput
                v-model="seats"
                label="Guest seats"
                description="Stepper buttons provide tap-friendly adjustments."
                :min="0"
                :max="20"
                unit="seats"
              />

              <ElyPublicTextarea
                label="Launch note"
                description="Block resize keeps vertical expansion natural on mobile."
                placeholder="Write a short note"
                :max-length="180"
                resize="block"
                :rows="3"
                show-count
              />

              <ElyPublicAlert
                tone="info"
                title="Mobile form principles"
                description="Use block actions, compact density for grouped fields, and single-column stacking. Avoid multi-column layouts on narrow viewports."
              />

              <div class="ely-public-stack">
                <ElyPublicButton block>Save collection</ElyPublicButton>
                <ElyPublicButton block tone="ghost">Cancel</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const DesktopWideLayout: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicFieldset,
      ElyPublicInput,
      ElyPublicNumberInput,
      ElyPublicRadioGroup,
      ElyPublicSlider,
      ElyPublicTextarea,
    },
    setup() {
      const name = ref("")
      const intensity = ref(50)
      const seats = ref(4)
      const tone = ref("luminous")

      return { intensity, name, seats, tone, toneItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Desktop wide layout</p>
            <h1 class="ely-public-section-title">Same primitives, comfortable density, inline actions</h1>
            <p class="ely-public-copy">
              On wide viewports, comfortable density gives more breathing room. Actions stay inline instead of stacking as blocks.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="name"
                label="Collection name"
                description="Text inputs can be narrower on desktop when the container is constrained."
                placeholder="Name your collection"
              />

              <ElyPublicFieldset
                legend="Theme personality"
                description="Comfortable density provides more spacing between grouped controls."
              >
                <ElyPublicRadioGroup
                  aria-label="Theme personality"
                  v-model="tone"
                  :items="toneItems"
                />
              </ElyPublicFieldset>

              <ElyPublicSlider
                v-model="intensity"
                label="Ornament intensity"
                description="Constrained width keeps the slider proportional to its label."
                unit="%"
              />

              <ElyPublicNumberInput
                v-model="seats"
                label="Guest seats"
                description="Desktop layouts can place the number input beside related fields."
                :min="0"
                :max="40"
                unit="seats"
              />

              <ElyPublicTextarea
                label="Launch note"
                description="Desktop allows both-direction resize when the layout has room."
                placeholder="Write a short note"
                :max-length="240"
                resize="both"
                :rows="4"
                show-count
              />

              <ElyPublicAlert
                tone="info"
                title="Desktop form principles"
                description="Use comfortable density, inline actions, and constrained field widths. Multi-column field layouts should still read top-to-bottom within each column."
              />

              <div class="ely-public-actions">
                <ElyPublicButton>Save collection</ElyPublicButton>
                <ElyPublicButton tone="secondary">Preview</ElyPublicButton>
                <ElyPublicButton tone="ghost">Cancel</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const FormDensityComparison: Story = {
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicFieldset,
      ElyPublicInput,
      ElyPublicCheckbox,
    },
    setup() {
      const name = ref("")
      const agreed = ref(false)

      return { agreed, name }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Density comparison</p>
            <h1 class="ely-public-section-title">Same form at comfortable and compact density</h1>
            <p class="ely-public-copy">
              Density changes vertical rhythm without changing component behavior, touch targets, or accessibility. Choose compact for mobile or dense admin surfaces; comfortable for reading-first pages.
            </p>
            <div class="ely-public-card-grid ely-story-offset-md">
              <article class="ely-public-card">
                <h2 class="ely-public-section-title">Comfortable</h2>
                <ElyPublicFieldset
                  legend="Registration"
                  density="comfortable"
                >
                  <ElyPublicInput
                    v-model="name"
                    label="Display name"
                    placeholder="Your public name"
                  />
                  <ElyPublicCheckbox
                    v-model="agreed"
                    label="I accept the community guidelines"
                  />
                </ElyPublicFieldset>
                <div class="ely-public-actions ely-story-offset-md">
                  <ElyPublicButton size="md">Register</ElyPublicButton>
                </div>
              </article>

              <article class="ely-public-card">
                <h2 class="ely-public-section-title">Compact</h2>
                <ElyPublicFieldset
                  legend="Registration"
                  density="compact"
                >
                  <ElyPublicInput
                    v-model="name"
                    label="Display name"
                    placeholder="Your public name"
                  />
                  <ElyPublicCheckbox
                    v-model="agreed"
                    label="I accept the community guidelines"
                  />
                </ElyPublicFieldset>
                <div class="ely-public-actions ely-story-offset-md">
                  <ElyPublicButton size="sm">Register</ElyPublicButton>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
