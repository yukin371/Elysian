import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicSegmentedControl,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, animeHeroI18n, localeItems } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Anime Hero Landing",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A full-bleed hero landing page template inspired by anime and gaming brand aesthetics. Uses gradient overlays, glassmorphism cards, and glow accents to create dramatic visual impact while staying within the theme token system. Switch between themes and dark mode to see how the template adapts.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const HeroWithFeaturedContent: Story = {
  name: "Hero with featured content",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicSegmentedControl,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeHeroI18n[locale.value])
      return { locale, t, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <section class="ely-anime-hero" style="grid-template-columns: 1.1fr 0.9fr;">
            <div class="ely-anime-hero-content">
              <div class="ely-anime-hero-badge">
                {{ t.badge }}
              </div>
              <h1 v-html="t.heading"></h1>
              <p class="ely-anime-hero-desc">
                {{ t.description }}
              </p>
              <div class="ely-anime-hero-actions">
                <ElyPublicButton size="lg">{{ t.exploreBtn }}</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">{{ t.watchBtn }}</ElyPublicButton>
              </div>
            </div>
            <div class="ely-anime-hero-aside">
              <div class="ely-anime-hero-card ely-anime-glow">
                <div class="ely-anime-hero-badge" style="background: color-mix(in oklab, var(--color-accent) 14%, transparent); color: var(--color-accent);">
                  {{ t.featuredBadge }}
                </div>
                <h3>{{ t.featuredTitle }}</h3>
                <p>
                  {{ t.featuredDesc }}
                </p>
                <div class="ely-anime-hero-stats">
                  <div class="ely-anime-hero-stat">
                    <strong>24</strong>
                    <span>{{ t.statWorks }}</span>
                  </div>
                  <div class="ely-anime-hero-stat">
                    <strong>1.2k</strong>
                    <span>{{ t.statCollectors }}</span>
                  </div>
                  <div class="ely-anime-hero-stat">
                    <strong>98%</strong>
                    <span>{{ t.statRating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="ely-anime-shimmer-bar" />

          <section style="display: grid; gap: 18px;">
            <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
              <div>
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                  {{ t.trendingLabel }}
                </p>
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                  {{ t.trendingTitle }}
                </h2>
              </div>
              <ElyPublicLink>{{ t.viewAll }}</ElyPublicLink>
            </div>
            <div class="ely-anime-grid--featured">
              <div class="ely-anime-card ely-anime-glass" v-for="card in t.cards" :key="card.title">
                <div class="ely-anime-card-image"><svg viewBox="0 0 160 100" fill="none" style="width:80px;opacity:.55"><circle cx="55" cy="38" r="22" stroke="white" stroke-width="2" opacity=".5"/><circle cx="105" cy="30" r="12" stroke="white" stroke-width="1.5" opacity=".4"/><path d="M20 72L55 45L85 62L120 42L145 55" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/><circle cx="130" cy="70" r="5" fill="white" opacity=".25"/><circle cx="35" cy="55" r="3" fill="white" opacity=".3"/></svg></div>
                <div class="ely-anime-card-body">
                  <span class="ely-anime-card-tag">{{ card.tag }}</span>
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.desc }}</p>
                </div>
                <div class="ely-anime-card-footer">
                  <span>{{ card.stat }}</span>
                </div>
              </div>
            </div>
          </section>

          <div class="ely-anime-divider" />

          <section style="display: grid; gap: 14px; text-align: center; place-items: center; padding: 24px 0;">
            <ElyPublicText>
              {{ t.ctaText }}
            </ElyPublicText>
            <ElyPublicButton>{{ t.ctaBtn }}</ElyPublicButton>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MinimalHeroDark: Story = {
  name: "Minimal hero (dark mode)",
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicSegmentedControl,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeHeroI18n[locale.value])
      return { locale, t, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <section class="ely-anime-hero" style="min-height: 500px; text-align: center; place-items: center;">
            <div class="ely-anime-hero-content" style="max-width: 680px; place-items: center;">
              <div class="ely-anime-glow--inline">
                {{ t.darkBadge }}
              </div>
              <h1 style="font-size: clamp(2.4rem, 6vw, 4rem);" v-html="t.darkHeading"></h1>
              <p class="ely-anime-hero-desc" style="max-width: 520px; margin: 0 auto;">
                {{ t.darkDesc }}
              </p>
              <div class="ely-anime-hero-actions" style="justify-content: center;">
                <ElyPublicButton size="lg">{{ t.darkStartBtn }}</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">{{ t.darkExamplesBtn }}</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
  parameters: {
    globals: { mode: "dark" },
  },
}

export const DesignTokens: Story = {
  name: "Design tokens and techniques",
  render: () => ({
    components: {
      ElyPublicSegmentedControl,
    },
    setup() {
      const locale = ref<Locale>("en")
      return { locale, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
            Template reference
          </p>
          <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem);">
            Design tokens and techniques used in anime templates
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;">
            <div class="ely-anime-glass ely-anime-section">
              <h3>Glassmorphism panel</h3>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem; line-height: 1.55;">
                <code>.ely-anime-glass</code> applies backdrop-filter blur
                with semi-transparent surface and subtle border.
              </p>
            </div>

            <div class="ely-anime-glass ely-anime-glass--accent ely-anime-section">
              <h3>Accent glass panel</h3>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem; line-height: 1.55;">
                <code>.ely-anime-glass--accent</code> adds a primary color
                gradient wash for emphasis.
              </p>
            </div>

            <div class="ely-anime-glass ely-anime-glow ely-anime-section">
              <h3>Glow effect</h3>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem; line-height: 1.55;">
                <code>.ely-anime-glow</code> adds a soft primary-color
                box-shadow for neon accent lighting.
              </p>
            </div>

            <div class="ely-anime-glass ely-anime-glow--accent ely-anime-section">
              <h3>Accent glow</h3>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem; line-height: 1.55;">
                <code>.ely-anime-glow--accent</code> uses the accent token
                for secondary glow emphasis.
              </p>
            </div>
          </div>

          <div class="ely-anime-divider" />

          <div style="display: grid; gap: 14px;">
            <h3 style="margin: 0; font-family: var(--ely-public-font-display);">Gradient divider</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem;">
              <code>.ely-anime-divider</code> — horizontal rule fading through primary and accent colors.
            </p>
          </div>

          <div style="display: grid; gap: 14px;">
            <h3 style="margin: 0; font-family: var(--ely-public-font-display);">Shimmer bar</h3>
            <div class="ely-anime-shimmer-bar" />
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem;">
              <code>.ely-anime-shimmer-bar</code> — a thin gradient bar for section separation with color shimmer.
            </p>
          </div>

          <div style="display: grid; gap: 14px;">
            <h3 style="margin: 0; font-family: var(--ely-public-font-display);">Inline glow badge</h3>
            <div class="ely-anime-glow--inline">Active now</div>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.88rem;">
              <code>.ely-anime-glow--inline</code> — a badge with glow background for status indicators.
            </p>
          </div>
        </div>
      </section>
    `,
  }),
}
