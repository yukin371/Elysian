import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicSegmentedControl,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, animeEventI18n, localeItems } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Anime Event Campaign",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "An event/campaign landing page template with countdown display, tiered reward cards, and featured content. Uses glassmorphism, glow effects, and gradient overlays for anime-brand visual impact. Works with all themes and modes.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CampaignWithCountdown: Story = {
  name: "Campaign with countdown",
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicSegmentedControl,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeEventI18n[locale.value])

      return { locale, t, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <section class="ely-anime-campaign-hero ely-anime-glass" style="grid-template-columns: 1.1fr 0.9fr;">
            <div class="ely-anime-campaign-content">
              <div class="ely-anime-glow--inline">
                {{ t.badge }}
              </div>
              <h1 v-html="t.heading"></h1>
              <p>
                {{ t.description }}
              </p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                <ElyPublicButton size="lg">{{ t.reserveBtn }}</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">{{ t.learnBtn }}</ElyPublicButton>
              </div>
            </div>
            <div style="position: relative; display: grid; gap: 16px; align-content: center;">
              <div class="ely-anime-hero-card ely-anime-glow" style="text-align: center;">
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                  {{ t.startsIn }}
                </p>
                <div class="ely-anime-countdown" style="justify-content: center; margin-top: 8px;">
                  <div class="ely-anime-countdown-block">
                    <strong>03</strong>
                    <span>{{ t.days }}</span>
                  </div>
                  <span class="ely-anime-countdown-sep">:</span>
                  <div class="ely-anime-countdown-block">
                    <strong>14</strong>
                    <span>{{ t.hours }}</span>
                  </div>
                  <span class="ely-anime-countdown-sep">:</span>
                  <div class="ely-anime-countdown-block">
                    <strong>28</strong>
                    <span>{{ t.mins }}</span>
                  </div>
                </div>
              </div>
              <div class="ely-anime-hero-card">
                <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-family: var(--ely-public-font-display); font-size: 1.6rem;">847</strong>
                    <span style="color: var(--color-text-muted); font-size: 0.78rem;">{{ t.spotsLabel }}</span>
                  </div>
                  <ElyPublicBadge tone="accent">{{ t.claimed }}</ElyPublicBadge>
                </div>
                <ElyPublicProgress :value="85" tone="primary" label="Spot availability" />
              </div>
            </div>
          </section>

          <div class="ely-anime-shimmer-bar" />

          <section style="display: grid; gap: 18px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                {{ t.tierLabel }}
              </p>
              <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                {{ t.tierTitle }}
              </h2>
            </div>
            <div class="ely-anime-tier-grid">
              <div v-for="(tier, idx) in t.tiers" :key="idx" class="ely-anime-tier-card ely-anime-glass" :class="{ 'ely-anime-glass--accent ely-anime-glow': idx === 1 }">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <ElyPublicBadge :tone="idx === 1 ? 'primary' : 'secondary'">{{ tier.badge }}</ElyPublicBadge>
                  <ElyPublicBadge v-if="tier.badgeAlt" tone="accent">{{ tier.badgeAlt }}</ElyPublicBadge>
                </div>
                <div class="ely-anime-tier-price">
                  {{ tier.price }}<small v-if="tier.priceUnit"> {{ tier.priceUnit }}</small>
                </div>
                <div class="ely-anime-tier-list">
                  <div v-for="(feat, fi) in tier.features" :key="fi" class="ely-anime-tier-item">{{ feat }}</div>
                </div>
                <ElyPublicButton :tone="idx === 0 ? 'ghost' : idx === 2 ? 'secondary' : undefined" block>{{ tier.cta }}</ElyPublicButton>
              </div>
            </div>
          </section>

          <div class="ely-anime-divider" />

          <section style="display: grid; gap: 18px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                {{ t.featuredLabel }}
              </p>
              <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                {{ t.featuredTitle }}
              </h2>
            </div>
            <div class="ely-anime-grid">
              <div
                v-for="work in t.works"
                :key="work.title"
                class="ely-anime-card ely-anime-glass"
              >
                <div class="ely-anime-card-image" style="aspect-ratio: 4/3;"><svg viewBox="0 0 160 100" fill="none" style="width:72px;opacity:.5"><circle cx="55" cy="38" r="20" stroke="white" stroke-width="2" opacity=".5"/><circle cx="100" cy="28" r="10" stroke="white" stroke-width="1.5" opacity=".35"/><path d="M20 72L50 48L80 60L110 40L145 52" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/><circle cx="125" cy="65" r="5" fill="white" opacity=".2"/></svg></div>
                <div class="ely-anime-card-body">
                  <span class="ely-anime-card-tag">{{ work.tag }}</span>
                  <h3 style="font-size: 0.95rem;">{{ work.title }}</h3>
                  <p>{{ work.desc }}</p>
                </div>
              </div>
            </div>
          </section>

          <div class="ely-anime-divider" />

          <div style="display: grid; gap: 14px; text-align: center; place-items: center; padding: 16px 0;">
            <ElyPublicText>
              {{ t.footerText }}
            </ElyPublicText>
            <div style="display: flex; gap: 12px;">
              <ElyPublicButton tone="ghost">{{ t.faqBtn }}</ElyPublicButton>
              <ElyPublicLink>{{ t.contactLink }}</ElyPublicLink>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
}

export const EventDarkMode: Story = {
  name: "Event page (dark mode emphasis)",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicProgress,
      ElyPublicSegmentedControl,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeEventI18n[locale.value])

      return { locale, t, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <section class="ely-anime-campaign-hero ely-anime-glass" style="min-height: 440px; place-items: center; text-align: center;">
            <div class="ely-anime-campaign-content" style="max-width: 640px; place-items: center;">
              <div class="ely-anime-glow--inline">
                {{ t.darkBadge }}
              </div>
              <h1 style="font-size: clamp(2.2rem, 5vw, 3.4rem);">
                {{ t.darkHeading }}
              </h1>
              <p style="max-width: 480px; margin: 0 auto;">
                {{ t.darkDesc }}
              </p>
              <div class="ely-anime-countdown" style="justify-content: center; margin-top: 8px;">
                <div class="ely-anime-countdown-block">
                  <strong>01</strong>
                  <span>{{ t.darkDay }}</span>
                </div>
                <span class="ely-anime-countdown-sep">:</span>
                <div class="ely-anime-countdown-block">
                  <strong>08</strong>
                  <span>{{ t.hours }}</span>
                </div>
                <span class="ely-anime-countdown-sep">:</span>
                <div class="ely-anime-countdown-block">
                  <strong>42</strong>
                  <span>{{ t.mins }}</span>
                </div>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <ElyPublicButton size="lg">{{ t.darkBtn }}</ElyPublicButton>
              </div>
            </div>
          </section>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div v-for="stat in t.darkStats" :key="stat.label" class="ely-anime-glass ely-anime-section ely-anime-glow" style="text-align: center;">
              <strong style="font-family: var(--ely-public-font-display); font-size: 2rem; display: block;">{{ stat.value }}</strong>
              <span style="color: var(--color-text-muted); font-size: 0.78rem;">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
  parameters: {
    globals: { mode: "dark" },
  },
}
