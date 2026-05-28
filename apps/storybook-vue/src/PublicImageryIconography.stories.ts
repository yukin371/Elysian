import {
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicImage,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { usePublicThemeArtwork } from "./publicThemeArtwork"

const imageryRules = [
  {
    body: "Use abstract moonlight, crystal, silk, music, and atelier cues. Do not copy game assets, character likeness, UI frames, or copyrighted motifs.",
    label: "Abstract the inspiration",
  },
  {
    body: "Every meaningful image needs alt text. Decorative texture should stay CSS-driven or be hidden from assistive technology.",
    label: "Accessibility owns meaning",
  },
  {
    body: "Use governed aspect presets for cards, portraits, and hero moments so image rhythm does not break layout.",
    label: "Aspect before artwork",
  },
  {
    body: "Icons are supporting signs, not a second illustration language. Pair them with text when the action or status is important.",
    label: "Icon follows label",
  },
] as const

const imageRoles = [
  {
    copy: "Theme gallery covers, editorial cards, and visual previews.",
    label: "Atmosphere image",
    value: "Wide or landscape",
  },
  {
    copy: "Creator profile, member identity, and account recognition.",
    label: "Identity image",
    value: "Avatar or portrait",
  },
  {
    copy: "Empty states, feature callouts, and guided setup moments.",
    label: "Instructional image",
    value: "Simple symbolic scene",
  },
] as const

const iconRules = [
  "Use icons to reinforce state, category, or direction; avoid decorative icon confetti.",
  "Do not mix filled, outline, emoji, and illustration glyphs in the same local surface.",
  "Status icon color follows status token meaning, never theme accent improvisation.",
  "If an icon is necessary for comprehension, the nearby text must name the same meaning.",
] as const

const reviewChecklist = [
  "Does every image role explain why the image exists?",
  "Are ratios and fallbacks governed by Image / Avatar components?",
  "Can the page work without any copyrighted or character-specific asset?",
  "Are icons consistent in weight, role, and accessible labeling?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Imagery & Iconography",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicImage,
      ElyPublicText,
    },
    setup() {
      const landscapeArtwork = usePublicThemeArtwork("landscape")
      const portraitArtwork = usePublicThemeArtwork("portrait")

      return {
        iconRules,
        imageRoles,
        imageryRules,
        landscapeArtwork,
        portraitArtwork,
        reviewChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Imagery & iconography</p>
            <h1 class="ely-public-section-title">Visual assets should suggest the myth, not copy it</h1>
            <p class="ely-public-copy">
              Elysian can feel moonlit and crystalline without borrowing game
              assets or character likeness. Images, avatars, and icons must
              support identity, atmosphere, state, or instruction.
            </p>

            <div class="ely-story-image-rule-grid" aria-label="Imagery governance rules">
              <article
                v-for="rule in imageryRules"
                :key="rule.label"
                class="ely-story-image-rule-card"
              >
                <strong>{{ rule.label }}</strong>
                <p>{{ rule.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-image-layout">
            <article class="ely-story-image-gallery">
              <p class="ely-public-eyebrow">Asset roles</p>
              <h2>Govern the frame before choosing the artwork</h2>
              <ElyPublicText tone="muted">
                Stable aspect ratios keep the theme refined even when content
                changes. The artwork should live inside the system, not redraw it.
              </ElyPublicText>
              <div class="ely-story-image-media-grid">
                <ElyPublicImage
                  :src="landscapeArtwork"
                  alt="Abstract moonlit landscape for theme preview"
                  aspect="landscape"
                />
                <ElyPublicImage
                  :src="portraitArtwork"
                  alt="Abstract portrait-like crystal composition"
                  aspect="portrait"
                  fit="contain"
                />
              </div>
              <ElyPublicDivider label="Fallback identity" align="start" />
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Elysian Atelier" status="online" />
                <ElyPublicAvatar name="Rose Nocturne" shape="circle" status="away" />
                <ElyPublicAvatar name="Azure Aria" shape="square" status="busy" />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Image roles</p>
              <h2 class="ely-public-section-title">Choose by job, not decoration</h2>
              <div class="ely-story-image-role-list ely-story-offset-md">
                <div
                  v-for="role in imageRoles"
                  :key="role.label"
                  class="ely-story-image-role"
                >
                  <span>{{ role.value }}</span>
                  <strong>{{ role.label }}</strong>
                  <p>{{ role.copy }}</p>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-image-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Icon grammar</p>
              <h2 class="ely-public-section-title">Small signs still need hierarchy</h2>
              <div class="ely-story-image-icon-grid ely-story-offset-md">
                <div class="ely-story-image-icon-card">
                  <span aria-hidden="true">✦</span>
                  <strong>Atmosphere</strong>
                  <p>Rare decorative mark, paired with brand context.</p>
                </div>
                <div class="ely-story-image-icon-card">
                  <span aria-hidden="true">✓</span>
                  <strong>Status</strong>
                  <p>Semantic sign, paired with clear state copy.</p>
                </div>
                <div class="ely-story-image-icon-card">
                  <span aria-hidden="true">→</span>
                  <strong>Direction</strong>
                  <p>Navigation cue, never the only action label.</p>
                </div>
              </div>
              <div class="ely-story-image-rule-list ely-story-offset-md">
                <div
                  v-for="rule in iconRules"
                  :key="rule"
                  class="ely-story-image-rule"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Asset boundary</p>
              <h2 class="ely-public-section-title">No copied character system</h2>
              <div class="ely-story-image-boundary ely-story-offset-md">
                <ElyPublicBadge tone="primary">Allowed: abstract cues</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">Allowed: governed ratios</ElyPublicBadge>
                <ElyPublicBadge tone="accent">Rare: ceremonial symbol</ElyPublicBadge>
              </div>
              <ElyPublicText tone="muted">
                The theme may reference moonlight, crystal, silk, aria, and a
                gentle divine mood. It must not reproduce character silhouettes,
                signature outfits, interface frames, or proprietary visual marks.
              </ElyPublicText>
              <div class="ely-public-actions">
                <ElyPublicButton>Review asset role</ElyPublicButton>
                <ElyPublicButton tone="ghost">Check alt text</ElyPublicButton>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Approve visuals after naming their job</h2>
            <div class="ely-story-image-checklist ely-story-offset-md">
              <div
                v-for="item in reviewChecklist"
                :key="item"
                class="ely-story-image-check"
              >
                <span aria-hidden="true"></span>
                <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
