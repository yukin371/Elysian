import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

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
      ElyPublicText,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section class="ely-anime-hero" style="grid-template-columns: 1.1fr 0.9fr;">
            <div class="ely-anime-hero-content">
              <div class="ely-anime-hero-badge">
                New Season — Limited Edition
              </div>
              <h1>
                Welcome to the
                <em>Elysian Collection</em>
              </h1>
              <p class="ely-anime-hero-desc">
                Discover curated creator collections with ceremonial elegance.
                Every piece tells a story worth preserving.
              </p>
              <div class="ely-anime-hero-actions">
                <ElyPublicButton size="lg">Explore collection</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">Watch trailer</ElyPublicButton>
              </div>
            </div>
            <div class="ely-anime-hero-aside">
              <div class="ely-anime-hero-card ely-anime-glow">
                <div class="ely-anime-hero-badge" style="background: color-mix(in oklab, var(--color-accent) 14%, transparent); color: var(--color-accent);">
                  Featured Creator
                </div>
                <h3>Spring Bloom Archive</h3>
                <p>
                  A hand-curated collection of 24 creator works celebrating
                  the season of renewal and cherry blossoms.
                </p>
                <div class="ely-anime-hero-stats">
                  <div class="ely-anime-hero-stat">
                    <strong>24</strong>
                    <span>Works</span>
                  </div>
                  <div class="ely-anime-hero-stat">
                    <strong>1.2k</strong>
                    <span>Collectors</span>
                  </div>
                  <div class="ely-anime-hero-stat">
                    <strong>98%</strong>
                    <span>Rating</span>
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
                  Trending Collections
                </p>
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1;">
                  Curated picks from the community
                </h2>
              </div>
              <ElyPublicLink>View all collections</ElyPublicLink>
            </div>
            <div class="ely-anime-grid--featured">
              <div class="ely-anime-card ely-anime-glass" v-for="card in [
                { title: 'Midnight Aurora', tag: 'Digital Art', desc: 'A visual journey through light and darkness by creator Aoi.', stat: '340 collectors' },
                { title: 'Sakura Dreams', tag: 'Illustration', desc: 'Delicate ink and watercolor pieces capturing spring.', stat: '580 collectors' },
                { title: 'Neon Chronicle', tag: 'Photography', desc: 'City nights captured in vivid color and texture.', stat: '210 collectors' },
              ]" :key="card.title">
                <div class="ely-anime-card-image" />
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
              Ready to create your own collection? Start building with the theme system.
            </ElyPublicText>
            <ElyPublicButton>Get started</ElyPublicButton>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MinimalHeroDark: Story = {
  name: "Minimal hero (dark mode)",
  render: () => ({
    components: { ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section class="ely-anime-hero" style="min-height: 500px; text-align: center; place-items: center;">
            <div class="ely-anime-hero-content" style="max-width: 680px; place-items: center;">
              <div class="ely-anime-glow--inline">
                Season 02 is here
              </div>
              <h1 style="font-size: clamp(2.4rem, 6vw, 4rem);">
                Create worlds that <em>feel alive</em>
              </h1>
              <p class="ely-anime-hero-desc" style="max-width: 520px; margin: 0 auto;">
                The Elysian platform gives creators the tools to build
                immersive, branded experiences with ceremonial polish and
                anime-inspired aesthetics.
              </p>
              <div class="ely-anime-hero-actions" style="justify-content: center;">
                <ElyPublicButton size="lg">Start creating</ElyPublicButton>
                <ElyPublicButton tone="ghost" size="lg">See examples</ElyPublicButton>
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
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
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
