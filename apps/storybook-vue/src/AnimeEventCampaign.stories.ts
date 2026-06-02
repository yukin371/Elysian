import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

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
      ElyPublicStat,
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section class="ely-anime-campaign-hero ely-anime-glass" style="grid-template-columns: 1.1fr 0.9fr;">
            <div class="ely-anime-campaign-content">
              <div class="ely-anime-glow--inline">
                Limited Time Event
              </div>
              <h1>
                Dreamy Sakura
                Collection Drop
              </h1>
              <p>
                An exclusive seasonal collection featuring 12 limited-edition
                creator works. Each piece captures the fleeting beauty of
                cherry blossom season.
              </p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                <ElyPublicButton size="lg">Reserve your spot</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">Learn more</ElyPublicButton>
              </div>
            </div>
            <div style="position: relative; display: grid; gap: 16px; align-content: center;">
              <div class="ely-anime-hero-card ely-anime-glow" style="text-align: center;">
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                  Event starts in
                </p>
                <div class="ely-anime-countdown" style="justify-content: center; margin-top: 8px;">
                  <div class="ely-anime-countdown-block">
                    <strong>03</strong>
                    <span>Days</span>
                  </div>
                  <span class="ely-anime-countdown-sep">:</span>
                  <div class="ely-anime-countdown-block">
                    <strong>14</strong>
                    <span>Hours</span>
                  </div>
                  <span class="ely-anime-countdown-sep">:</span>
                  <div class="ely-anime-countdown-block">
                    <strong>28</strong>
                    <span>Mins</span>
                  </div>
                </div>
              </div>
              <div class="ely-anime-hero-card">
                <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-family: var(--ely-public-font-display); font-size: 1.6rem;">847</strong>
                    <span style="color: var(--color-text-muted); font-size: 0.78rem;"> / 1,000 spots</span>
                  </div>
                  <ElyPublicBadge tone="accent">85% claimed</ElyPublicBadge>
                </div>
                <ElyPublicProgress :value="85" tone="primary" label="Spot availability" />
              </div>
            </div>
          </section>

          <div class="ely-anime-shimmer-bar" />

          <section style="display: grid; gap: 18px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                Reward tiers
              </p>
              <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                Choose your collection tier
              </h2>
            </div>
            <div class="ely-anime-tier-grid">
              <div class="ely-anime-tier-card ely-anime-glass">
                <ElyPublicBadge tone="secondary">Starter</ElyPublicBadge>
                <div class="ely-anime-tier-price">Free</div>
                <div class="ely-anime-tier-list">
                  <div class="ely-anime-tier-item">Browse all 12 works</div>
                  <div class="ely-anime-tier-item">Community gallery access</div>
                  <div class="ely-anime-tier-item">Creator profiles</div>
                </div>
                <ElyPublicButton tone="ghost" block>Join free</ElyPublicButton>
              </div>

              <div class="ely-anime-tier-card ely-anime-glass ely-anime-glass--accent ely-anime-glow">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <ElyPublicBadge tone="primary">Collector</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Popular</ElyPublicBadge>
                </div>
                <div class="ely-anime-tier-price">
                  2,400 <small>stars</small>
                </div>
                <div class="ely-anime-tier-list">
                  <div class="ely-anime-tier-item">Collect up to 6 works</div>
                  <div class="ely-anime-tier-item">Exclusive creator commentary</div>
                  <div class="ely-anime-tier-item">Early access to future drops</div>
                  <div class="ely-anime-tier-item">Collector badge on profile</div>
                </div>
                <ElyPublicButton block>Reserve collector tier</ElyPublicButton>
              </div>

              <div class="ely-anime-tier-card ely-anime-glass">
                <ElyPublicBadge tone="secondary">Patron</ElyPublicBadge>
                <div class="ely-anime-tier-price">
                  6,000 <small>stars</small>
                </div>
                <div class="ely-anime-tier-list">
                  <div class="ely-anime-tier-item">Collect all 12 works</div>
                  <div class="ely-anime-tier-item">Signed digital prints</div>
                  <div class="ely-anime-tier-item">Private creator Q&A access</div>
                  <div class="ely-anime-tier-item">Patron-exclusive variant covers</div>
                  <div class="ely-anime-tier-item">Lifetime season access</div>
                </div>
                <ElyPublicButton tone="secondary" block>Reserve patron tier</ElyPublicButton>
              </div>
            </div>
          </section>

          <div class="ely-anime-divider" />

          <section style="display: grid; gap: 18px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                Featured works
              </p>
              <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                Preview the collection
              </h2>
            </div>
            <div class="ely-anime-grid">
              <div
                v-for="work in [
                  { title: 'First Light', tag: 'Illustration', desc: 'Dawn breaks over the petal bridge.' },
                  { title: 'Quiet Garden', tag: 'Watercolor', desc: 'A peaceful corner in the bamboo grove.' },
                  { title: 'Lantern Festival', tag: 'Digital Art', desc: 'Floating lights on the evening river.' },
                  { title: 'Winter Bloom', tag: 'Photography', desc: 'An unexpected flower in the snow.' },
                ]"
                :key="work.title"
                class="ely-anime-card ely-anime-glass"
              >
                <div class="ely-anime-card-image" style="aspect-ratio: 4/3;" />
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
              Questions about the event? Check the FAQ or contact support.
            </ElyPublicText>
            <div style="display: flex; gap: 12px;">
              <ElyPublicButton tone="ghost">View FAQ</ElyPublicButton>
              <ElyPublicLink>Contact support</ElyPublicLink>
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
    components: { ElyPublicBadge, ElyPublicButton, ElyPublicProgress },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section class="ely-anime-campaign-hero ely-anime-glass" style="min-height: 440px; place-items: center; text-align: center;">
            <div class="ely-anime-campaign-content" style="max-width: 640px; place-items: center;">
              <div class="ely-anime-glow--inline">
                Season Finale
              </div>
              <h1 style="font-size: clamp(2.2rem, 5vw, 3.4rem);">
                The Grand Archive Opens
              </h1>
              <p style="max-width: 480px; margin: 0 auto;">
                After two seasons of creator works, the grand archive
                unlocks every piece in one ceremonial collection. Only
                patrons who complete the season journey get permanent access.
              </p>
              <div class="ely-anime-countdown" style="justify-content: center; margin-top: 8px;">
                <div class="ely-anime-countdown-block">
                  <strong>01</strong>
                  <span>Day</span>
                </div>
                <span class="ely-anime-countdown-sep">:</span>
                <div class="ely-anime-countdown-block">
                  <strong>08</strong>
                  <span>Hours</span>
                </div>
                <span class="ely-anime-countdown-sep">:</span>
                <div class="ely-anime-countdown-block">
                  <strong>42</strong>
                  <span>Mins</span>
                </div>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <ElyPublicButton size="lg">Enter the archive</ElyPublicButton>
              </div>
            </div>
          </section>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div class="ely-anime-glass ely-anime-section ely-anime-glow" style="text-align: center;">
              <strong style="font-family: var(--ely-public-font-display); font-size: 2rem; display: block;">48</strong>
              <span style="color: var(--color-text-muted); font-size: 0.78rem;">Total works</span>
            </div>
            <div class="ely-anime-glass ely-anime-section ely-anime-glow--accent" style="text-align: center;">
              <strong style="font-family: var(--ely-public-font-display); font-size: 2rem; display: block;">12</strong>
              <span style="color: var(--color-text-muted); font-size: 0.78rem;">Featured creators</span>
            </div>
            <div class="ely-anime-glass ely-anime-section ely-anime-glow" style="text-align: center;">
              <strong style="font-family: var(--ely-public-font-display); font-size: 2rem; display: block;">3.2k</strong>
              <span style="color: var(--color-text-muted); font-size: 0.78rem;">Patrons waiting</span>
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
