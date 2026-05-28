import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { PublicThemePack } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const roleRules = [
  {
    role: "Primary",
    usage: "Owns the next step, focus path, selected state, and key progress.",
  },
  {
    role: "Secondary",
    usage: "Adds ceremony, trim, and supporting hierarchy without competing.",
  },
  {
    role: "Accent",
    usage:
      "Creates memory through rare labels, glints, and editorial emphasis.",
  },
  {
    role: "Neutral",
    usage: "Carries reading, surface depth, borders, and dark-mode stability.",
  },
] as const

const familyUseCases: Record<PublicThemePack["key"], string[]> = {
  "azure-aria": [
    "Information-heavy front-stage tools",
    "Creator dashboards with airy rhythm",
    "Calm technical or analytics surfaces",
  ],
  "elysia-default": [
    "Default public experience",
    "Brand landing and creator entry",
    "Membership or profile overview",
  ],
  "enterprise-calm": [
    "Bridge pages near enterprise flows",
    "Lower-ornament account settings",
    "Public pages that need conservative tone",
  ],
  "rose-nocturne": [
    "Editorial campaigns",
    "Romantic event or seasonal pages",
    "High-touch content collections",
  ],
}

const familyRisks: Record<PublicThemePack["key"], string[]> = {
  "azure-aria": [
    "Do not let it collapse into generic enterprise blue.",
    "Keep mint accents rare and local.",
  ],
  "elysia-default": [
    "Do not make champagne trim the main action color.",
    "Keep rose accents as memory points only.",
  ],
  "enterprise-calm": [
    "Do not reintroduce TDesign-specific component assumptions.",
    "Keep it public-luxe, just quieter.",
  ],
  "rose-nocturne": [
    "Do not fill the page with saturated pink or purple.",
    "Let neutral mauve surfaces carry most of the view.",
  ],
}

const reviewSteps = [
  "Pick one family for the whole surface before tuning components.",
  "Verify light and dark previews both preserve the same atmosphere.",
  "Name the primary action and confirm no accent color is pretending to be it.",
  "Check that neutral surfaces carry most of the screen area.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Composition",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicText,
    },
    setup() {
      return {
        familyRisks,
        familyUseCases,
        reviewSteps,
        roleRules,
        themePacks: publicThemePacks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme composition</p>
            <h1 class="ely-public-section-title">Choose atmosphere as a system, not as a color pile</h1>
            <p class="ely-public-copy">
              Each launch family binds emphasis colors to a tinted neutral surface.
              That pairing is what keeps Public Luxe ornate but coherent across
              light and dark mode.
            </p>

            <div class="ely-story-composition-roles" aria-label="Theme role rules">
              <article
                v-for="item in roleRules"
                :key="item.role"
                class="ely-story-composition-role"
              >
                <strong>{{ item.role }}</strong>
                <span>{{ item.usage }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-composition-grid">
            <article
              v-for="theme in themePacks"
              :key="theme.key"
              class="ely-story-composition-card"
              :data-theme-key="theme.key"
            >
              <div class="ely-story-composition-head">
                <div>
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
              </div>

              <p class="ely-story-composition-copy">{{ theme.description }}</p>

              <div class="ely-story-composition-preview-pair">
                <div
                  class="ely-story-composition-preview"
                  :style="{
                    '--ely-story-preview-accent': theme.preview.accent,
                    '--ely-story-preview-from': theme.preview.heroFrom,
                    '--ely-story-preview-surface': theme.preview.surface,
                    '--ely-story-preview-to': theme.preview.heroTo,
                  }"
                >
                  <span>Light</span>
                  <div class="ely-story-composition-stage">
                    <i></i>
                    <b></b>
                    <em></em>
                  </div>
                </div>
                <div
                  class="ely-story-composition-preview"
                  :style="{
                    '--ely-story-preview-accent': theme.preview.dark.accent,
                    '--ely-story-preview-from': theme.preview.dark.heroFrom,
                    '--ely-story-preview-surface': theme.preview.dark.surface,
                    '--ely-story-preview-to': theme.preview.dark.heroTo,
                  }"
                >
                  <span>Dark</span>
                  <div class="ely-story-composition-stage">
                    <i></i>
                    <b></b>
                    <em></em>
                  </div>
                </div>
              </div>

              <ElyPublicDivider label="Best fit" align="start" />

              <div class="ely-story-composition-lists">
                <div>
                  <strong>Use for</strong>
                  <ul>
                    <li v-for="item in familyUseCases[theme.key]" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <strong>Watch out</strong>
                  <ul>
                    <li v-for="item in familyRisks[theme.key]" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review ritual</p>
            <h2 class="ely-public-section-title">Four checks before a theme lands on a page</h2>
            <div class="ely-story-composition-review ely-story-offset-md">
              <div
                v-for="(step, index) in reviewSteps"
                :key="step"
                class="ely-story-composition-step"
              >
                <span>{{ index + 1 }}</span>
                <strong>{{ step }}</strong>
              </div>
            </div>
            <div class="ely-public-actions">
              <ElyPublicButton>Approve theme family</ElyPublicButton>
              <ElyPublicButton tone="secondary">Send back to tokens</ElyPublicButton>
              <ElyPublicButton tone="ghost">Compare patterns</ElyPublicButton>
            </div>
            <ElyPublicText tone="muted">
              This story is intentionally about composition rules. Token values
              still live in ui-public-vue theme CSS and theme pack metadata.
            </ElyPublicText>
          </section>
        </div>
      </section>
    `,
  }),
}
