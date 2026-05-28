import { ElyPublicBadge, ElyPublicButton } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { useResolvedPublicThemePacks } from "./publicThemeArtwork"

const pairingRules = [
  {
    title: "Choose a family before micro-tuning",
    description:
      "Mood, contrast rhythm, and accent behavior should be decided at the family level before any smaller component tweak begins.",
  },
  {
    title: "Light and dark move together",
    description:
      "Each launch family already carries a paired dark mode so the preview stack never falls back to an ungoverned inversion.",
  },
  {
    title: "Keep semantic slots stable",
    description:
      "Primary, secondary, accent, and danger stay recognizable across families even when the atmosphere changes sharply.",
  },
]

const meta = {
  title: "Public Luxe/Foundations/Theme Gallery",
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
    },
    setup() {
      const themePacks = useResolvedPublicThemePacks()

      return {
        pairingRules,
        themePacks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero">
            <div>
              <p class="ely-public-eyebrow">Theme gallery</p>
              <h1 class="ely-public-title">
                Compare launch families as a
                <span class="ely-public-title-accent">curated atmosphere roster</span>
              </h1>
              <p class="ely-public-copy">
                This view sits between raw token reference and full page
                patterns. It lets brand, product, and engineering compare theme
                personality, expression level, surface discipline, and accent
                behavior before they step into a component matrix or a
                front-stage scenario.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Review governed families</ElyPublicButton>
                <ElyPublicButton tone="secondary">Compare dark rhythm</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open pattern stories</ElyPublicButton>
              </div>
            </div>

            <div class="ely-public-preview-stat-row">
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">04</span>
                <span class="ely-public-preview-stat-label">Governed launch families</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">02</span>
                <span class="ely-public-preview-stat-label">Paired modes per family</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">01</span>
                <span class="ely-public-preview-stat-label">Preset truth owner</span>
              </div>
            </div>
          </section>

          <section class="ely-story-preview-grid">
            <article
              v-for="theme in themePacks"
              :key="theme.key"
              class="ely-story-preview-card"
              :data-theme-key="theme.key"
              :style="{
                '--ely-story-preview-accent': theme.preview.accent,
                '--ely-story-preview-from': theme.preview.heroFrom,
                '--ely-story-preview-surface': theme.preview.surface,
                '--ely-story-preview-to': theme.preview.heroTo,
              }"
            >
              <div class="ely-story-preview-hero">
                <div class="ely-story-preview-header">
                  <p class="ely-story-preview-eyebrow">{{ theme.key }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <div class="ely-story-preview-palette">
                  <span class="ely-story-preview-swatch"></span>
                  <span class="ely-story-preview-swatch"></span>
                  <span class="ely-story-preview-swatch"></span>
                </div>
              </div>

              <div class="ely-story-preview-body">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">{{ theme.expressionLevel }}</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">light + dark</ElyPublicBadge>
                </div>
                <p class="ely-story-preview-copy">{{ theme.description }}</p>
                <div class="ely-story-preview-persona">
                  <span>Theme persona</span>
                  <strong>{{ theme.personality }}</strong>
                  <p>{{ theme.designCue }}</p>
                </div>
                <div class="ely-story-preview-meta">
                  <div class="ely-public-chip">
                    <span class="ely-public-chip-label">Mood</span>
                    <span class="ely-public-chip-value">{{ theme.mood }}</span>
                  </div>
                  <div class="ely-public-chip">
                    <span class="ely-public-chip-label">Best fit</span>
                    <span class="ely-public-chip-value">{{ theme.bestFor }}</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-theme-gallery-rule-panel">
            <p class="ely-public-eyebrow">Pairing rules</p>
            <h2 class="ely-public-section-title">How to use the gallery well</h2>
            <div class="ely-story-theme-gallery-rule-grid ely-story-offset-md">
              <article
                v-for="rule in pairingRules"
                :key="rule.title"
                class="ely-story-theme-gallery-rule"
              >
                <h3>{{ rule.title }}</h3>
                <p>{{ rule.description }}</p>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
