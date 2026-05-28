import {
  publicThemePacks,
  publicThemeSemanticSlots,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const semanticSwatches = [
  { label: "Background", cssVar: "--color-bg" },
  { label: "Surface", cssVar: "--color-surface" },
  { label: "Elevated Surface", cssVar: "--color-surface-elevated" },
  { label: "Text", cssVar: "--color-text" },
  { label: "Muted Text", cssVar: "--color-text-muted" },
  { label: "Line", cssVar: "--color-line" },
  { label: "Primary", cssVar: "--color-primary" },
  { label: "Secondary", cssVar: "--color-secondary" },
  { label: "Accent", cssVar: "--color-accent" },
  { label: "Danger", cssVar: "--color-danger" },
]

const governanceRules = [
  {
    description:
      "Choose from governed families first. Page-level free colors should not bypass semantic tokens.",
    title: "Family before freestyle",
  },
  {
    description:
      "Each family owns paired light and dark values; dark mode is not a brightness inversion.",
    title: "Paired modes only",
  },
  {
    description:
      "Components consume semantic slots, not raw palette values, so theme changes remain predictable.",
    title: "Semantic slots stay stable",
  },
]

const tokenGroups = [
  {
    description: "--color-bg, --color-surface, --color-surface-elevated",
    title: "Surface",
  },
  {
    description: "--color-text, --color-text-muted, --color-line",
    title: "Reading",
  },
  {
    description: "--color-primary, --color-secondary, --color-accent",
    title: "Emphasis",
  },
  {
    description: "--color-danger plus fixed status semantics in component CSS",
    title: "State",
  },
]

const meta = {
  title: "Public Luxe/Foundations/Theme Tokens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    setup() {
      return {
        governanceRules,
        themePacks: publicThemePacks,
        semanticSwatches,
        semanticSlots: publicThemeSemanticSlots,
        tokenGroups,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Theme packs</p>
            <h1 class="ely-public-section-title">Public Luxe token families</h1>
            <p class="ely-public-copy">
              Each family keeps the same semantic slots but changes atmosphere,
              contrast rhythm, and highlight behavior. Dark mode is paired from
              the start instead of being bolted on later.
            </p>
            <div class="ely-story-token-rule-grid" aria-label="Theme governance rules">
              <div
                v-for="rule in governanceRules"
                :key="rule.title"
                class="ely-story-token-rule"
              >
                <strong>{{ rule.title }}</strong>
                <span>{{ rule.description }}</span>
              </div>
            </div>
            <div class="ely-public-card-grid ely-story-offset-md">
              <article v-for="theme in themePacks" :key="theme.key" class="ely-public-card">
                <h3>{{ theme.displayName }}</h3>
                <p>{{ theme.description }}</p>
                <div class="ely-public-chip-row ely-story-offset-sm">
                  <div class="ely-public-chip">
                    <span class="ely-public-chip-label">Mood</span>
                    <span class="ely-public-chip-value">{{ theme.mood }}</span>
                  </div>
                  <div class="ely-public-chip">
                    <span class="ely-public-chip-label">Accent</span>
                    <span class="ely-public-chip-value">{{ theme.accentLabel }}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Semantic slots</p>
            <h2 class="ely-public-section-title">Mode-safe token surface</h2>
            <p class="ely-public-copy">
              Components should consume semantic tokens only. Storybook reads the
              current toolbar state, applies attributes to the root, and the
              swatches below render the active theme family in real time.
            </p>
            <div class="ely-story-token-group-grid" aria-label="Semantic token groups">
              <div
                v-for="group in tokenGroups"
                :key="group.title"
                class="ely-story-token-group"
              >
                <strong>{{ group.title }}</strong>
                <span>{{ group.description }}</span>
              </div>
            </div>
            <div class="ely-public-token-grid ely-story-offset-md">
              <article
                v-for="swatch in semanticSwatches"
                :key="swatch.cssVar"
                class="ely-public-swatch"
                :style="{ '--swatch-color': 'var(' + swatch.cssVar + ')' }"
              >
                <div class="ely-public-swatch-color"></div>
                <div>
                  <div class="ely-public-swatch-name">{{ swatch.label }}</div>
                  <div class="ely-public-swatch-token">{{ swatch.cssVar }}</div>
                </div>
              </article>
            </div>
            <div class="ely-public-chip-row ely-story-offset-md">
              <div
                v-for="slot in semanticSlots"
                :key="slot"
                class="ely-public-chip"
              >
                <span class="ely-public-chip-label">Semantic token</span>
                <span class="ely-public-chip-value">{{ slot }}</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
