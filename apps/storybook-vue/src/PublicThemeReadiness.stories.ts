import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { PublicThemePack } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const readinessChecks = [
  {
    label: "Family fit",
    proof: "The theme family matches the whole product surface, not one hero.",
    risk: "A page borrows a dramatic palette for a single block and drifts later.",
  },
  {
    label: "Mode pair",
    proof:
      "Light and dark previews keep the same emotional role and hierarchy.",
    risk: "Dark mode becomes a late inversion with different accent behavior.",
  },
  {
    label: "Role discipline",
    proof: "Primary owns the next step; secondary and accent stay supporting.",
    risk: "Accent starts competing with primary or status colors.",
  },
  {
    label: "Surface majority",
    proof:
      "Neutral surfaces carry most of the view so ornament has room to breathe.",
    risk: "Every card becomes saturated, glowing, or visually loud.",
  },
] as const

const familyGuidance: Record<
  PublicThemePack["key"],
  {
    bestFor: string
    approvalQuestion: string
    avoid: string
    lane: string
  }
> = {
  "azure-aria": {
    approvalQuestion:
      "Does the airy blue rhythm clarify information, or has it become generic admin blue?",
    avoid: "Overusing mint accents as CTA color.",
    bestFor:
      "Information-rich public tools, creator analytics, clear comparison views.",
    lane: "Clarity lane",
  },
  "elysia-default": {
    approvalQuestion:
      "Does the page feel ceremonial while still leaving one obvious primary path?",
    avoid:
      "Turning champagne trim or rose memory points into the main action color.",
    bestFor:
      "Default public entry, membership overview, creator center, brand landing.",
    lane: "Default lane",
  },
  "enterprise-calm": {
    approvalQuestion:
      "Is this intentionally quieter public-luxe, not an accidental enterprise clone?",
    avoid:
      "Importing TDesign assumptions, dense admin layout, or blue-gray sameness.",
    bestFor:
      "Bridge surfaces near account, settings, billing, or enterprise-adjacent flows.",
    lane: "Bridge lane",
  },
  "rose-nocturne": {
    approvalQuestion:
      "Is the romantic tone carried by surfaces and copy rather than saturation?",
    avoid: "Flooding the page with pink, purple, or promotional urgency.",
    bestFor:
      "Editorial campaigns, seasonal moments, high-touch content collections.",
    lane: "Editorial lane",
  },
  "dreamy-sakura": {
    approvalQuestion:
      "Does the pastel whimsy still guide the user to one clear next step?",
    avoid:
      "Letting sakura pink flood every surface until interactive elements disappear.",
    bestFor:
      "Anime-inspired showcases, playful onboarding, soft celebration surfaces.",
    lane: "Whimsy lane",
  },
}

const approvalOutcomes = [
  "Approve theme family",
  "Request darker-mode proof",
  "Send back for accent discipline",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Readiness",
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
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const familyRows = publicThemePacks.map((theme) => ({
        ...theme,
        guidance: familyGuidance[theme.key],
      }))

      return {
        approvalOutcomes,
        familyRows,
        readinessChecks,
        themeCount: String(publicThemePacks.length),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme readiness</p>
            <h1 class="ely-public-section-title">Approve the family before polishing the page</h1>
            <p class="ely-public-copy">
              This matrix turns launch themes into reviewable decisions. It
              consumes ui-public-vue theme pack metadata and adds only
              Storybook-level approval questions, so token truth still stays
              in the public preset owner.
            </p>

            <div class="ely-story-theme-readiness-hero-grid">
              <ElyPublicStat
                :value="themeCount"
                eyebrow="Launch families"
                helper="Each family ships with paired light and dark preview metadata."
                tone="primary"
              >
                governed choices
              </ElyPublicStat>
              <article
                v-for="check in readinessChecks"
                :key="check.label"
                class="ely-story-theme-readiness-check"
              >
                <strong>{{ check.label }}</strong>
                <span>{{ check.proof }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-readiness-grid">
            <article
              v-for="theme in familyRows"
              :key="theme.key"
              class="ely-story-theme-readiness-card"
            >
              <div class="ely-story-theme-readiness-head">
                <div>
                  <p class="ely-public-eyebrow">{{ theme.guidance.lane }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
              </div>

              <p class="ely-story-theme-readiness-copy">{{ theme.description }}</p>

              <div class="ely-story-theme-readiness-preview-pair">
                <div
                  class="ely-story-theme-readiness-preview"
                  :style="{
                    '--ely-story-theme-preview-accent': theme.preview.accent,
                    '--ely-story-theme-preview-from': theme.preview.heroFrom,
                    '--ely-story-theme-preview-surface': theme.preview.surface,
                    '--ely-story-theme-preview-to': theme.preview.heroTo,
                  }"
                >
                  <span>Light proof</span>
                </div>
                <div
                  class="ely-story-theme-readiness-preview"
                  :style="{
                    '--ely-story-theme-preview-accent': theme.preview.dark.accent,
                    '--ely-story-theme-preview-from': theme.preview.dark.heroFrom,
                    '--ely-story-theme-preview-surface': theme.preview.dark.surface,
                    '--ely-story-theme-preview-to': theme.preview.dark.heroTo,
                  }"
                >
                  <span>Dark proof</span>
                </div>
              </div>

              <ElyPublicDivider label="Approval fit" align="start" />

              <dl class="ely-story-theme-readiness-list">
                <div>
                  <dt>Best for</dt>
                  <dd>{{ theme.guidance.bestFor }}</dd>
                </div>
                <div>
                  <dt>Approval question</dt>
                  <dd>{{ theme.guidance.approvalQuestion }}</dd>
                </div>
                <div>
                  <dt>Block if</dt>
                  <dd>{{ theme.guidance.avoid }}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section class="ely-public-card">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Readiness gates</p>
                <h2 class="ely-public-section-title">A theme is ready only when the boring checks pass</h2>
              </div>
              <p>
                The elegant feeling comes after the contract is boringly clear:
                family, mode pair, role hierarchy, and surface majority.
              </p>
            </div>

            <div class="ely-story-theme-readiness-gates">
              <article
                v-for="check in readinessChecks"
                :key="check.risk"
                class="ely-story-theme-readiness-gate"
              >
                <span>{{ check.label }}</span>
                <strong>{{ check.proof }}</strong>
                <ElyPublicText tone="muted">{{ check.risk }}</ElyPublicText>
              </article>
            </div>

            <div class="ely-public-actions">
              <ElyPublicButton
                v-for="action in approvalOutcomes"
                :key="action"
                :tone="action === 'Approve theme family' ? 'primary' : 'secondary'"
              >
                {{ action }}
              </ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
