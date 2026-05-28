import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicInput,
  ElyPublicSelect,
  ElyPublicSwitch,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const accessibilityRules = [
  {
    body: "Focus must be visible on every keyboard path. Decorative sheen can support focus, but the ring cannot be hidden behind glow.",
    label: "Keyboard first",
  },
  {
    body: "Error, warning, selected, and disabled states must pair color with copy, border, icon, or structure so meaning survives low vision and dark mode.",
    label: "Never color-only",
  },
  {
    body: "Luxury copy should reduce uncertainty. Every alert, empty state, or validation message needs a clear next step.",
    label: "Actionable language",
  },
  {
    body: "Motion and imagery must remain optional. Reduced motion, alt text, and stable layout are part of the theme contract.",
    label: "Atmosphere is optional",
  },
] as const

const contrastChecks = [
  "Body text keeps neutral contrast before brand tint.",
  "Primary actions use paired on-primary tokens.",
  "Muted copy remains readable in dark mode.",
  "Status surfaces include text labels, not just hue.",
] as const

const inclusionChecklist = [
  "Can the flow be completed with keyboard only?",
  "Does focus order match the visible reading order?",
  "Does every invalid field expose a message and aria-invalid?",
  "Can reduced-motion users still understand loading, reveal, and progress?",
  "Do meaningful images have alt text and decorative marks stay hidden?",
] as const

const selectOptions = [
  { label: "Comfortable density", value: "comfortable" },
  { label: "Compact review", value: "compact" },
  { label: "Ceremonial feature", value: "ceremonial" },
] as const

const meta = {
  title: "Public Luxe/Foundations/Accessibility & Inclusion",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicInput,
      ElyPublicSelect,
      ElyPublicSwitch,
      ElyPublicText,
    },
    setup() {
      const email = ref("atelier@example.com")
      const density = ref("comfortable")
      const reduceMotion = ref(true)

      return {
        accessibilityRules,
        contrastChecks,
        density,
        email,
        inclusionChecklist,
        reduceMotion,
        selectOptions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Accessibility & inclusion</p>
            <h1 class="ely-public-section-title">Elegance should make the path calmer, not harder to use</h1>
            <p class="ely-public-copy">
              Public-luxe can be luminous and ornate while still protecting
              keyboard flow, text contrast, reduced motion, validation clarity,
              and non-color state cues. Accessibility is a design material, not
              a compliance layer added after polish.
            </p>

            <div class="ely-story-a11y-rule-grid" aria-label="Accessibility governance rules">
              <article
                v-for="rule in accessibilityRules"
                :key="rule.label"
                class="ely-story-a11y-rule-card"
              >
                <strong>{{ rule.label }}</strong>
                <p>{{ rule.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-a11y-layout">
            <article class="ely-story-a11y-flow">
              <p class="ely-public-eyebrow">Keyboard path</p>
              <h2>Focus follows the decision, not the decoration</h2>
              <ElyPublicText tone="muted">
                Review focus order on the real controls. The first useful
                action should be reachable before ornamental or secondary
                content.
              </ElyPublicText>

              <div class="ely-story-a11y-control-stack">
                <ElyPublicInput
                  v-model="email"
                  description="Validation text stays connected to the field."
                  label="Notification email"
                  type="email"
                />
                <ElyPublicSelect
                  v-model="density"
                  description="Density changes rhythm, never semantic roles."
                  label="Review density"
                  :options="selectOptions"
                />
                <ElyPublicSwitch
                  v-model="reduceMotion"
                  description="Motion can enhance hierarchy, but cannot carry the only meaning."
                  label="Prefer reduced motion"
                />
              </div>

              <div class="ely-public-actions">
                <ElyPublicButton>Save accessible defaults</ElyPublicButton>
                <ElyPublicButton tone="ghost">Review tab order</ElyPublicButton>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Contrast discipline</p>
              <h2 class="ely-public-section-title">Brand color is not a reading strategy</h2>
              <div class="ely-story-a11y-contrast-list ely-story-offset-md">
                <div
                  v-for="item in contrastChecks"
                  :key="item"
                  class="ely-story-a11y-contrast"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
                </div>
              </div>
              <ElyPublicDivider label="State pairing" align="start" />
              <div class="ely-story-a11y-state-row">
                <ElyPublicBadge tone="success">Success: synced</ElyPublicBadge>
                <ElyPublicBadge tone="warning">Warning: review</ElyPublicBadge>
                <ElyPublicBadge tone="danger">Error: blocked</ElyPublicBadge>
              </div>
            </article>
          </section>

          <section class="ely-story-a11y-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Validation copy</p>
              <h2 class="ely-public-section-title">Errors name the fix</h2>
              <div class="ely-story-a11y-control-stack ely-story-offset-md">
                <ElyPublicInput
                  description="Use a real address so members can recover access."
                  invalid-message="Enter a reachable email address before continuing."
                  label="Recovery email"
                  model-value="not-an-email"
                  type="email"
                />
                <ElyPublicAlert
                  eyebrow="Form feedback"
                  title="Two fields need attention"
                  tone="warning"
                >
                  Review the recovery email and motion preference before saving.
                  The warning is announced and visible without relying on color.
                </ElyPublicAlert>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Inclusive review</p>
              <h2 class="ely-public-section-title">Approve the theme after the assistive path works</h2>
              <div class="ely-story-a11y-checklist ely-story-offset-md">
                <div
                  v-for="item in inclusionChecklist"
                  :key="item"
                  class="ely-story-a11y-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
