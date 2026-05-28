import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const customizationLanes = [
  {
    label: "Safe to tune",
    scope:
      "Theme family, mode preference, density, accent intensity, surface majority.",
    review:
      "Treat these as curated choices. The page can feel more romantic, airy, calm, or ceremonial without changing token roles.",
  },
  {
    label: "Needs proof",
    scope:
      "New family palette, darker mode pair, richer artwork, stronger material sheen.",
    review:
      "Show light and dark previews, action contrast, status evidence, and recovery copy before approving the theme.",
  },
  {
    label: "Do not localize",
    scope:
      "Primary/secondary/accent semantics, status color meaning, component API, radius scale.",
    review:
      "If a page needs local color roles or new radius values to work, the theme is not ready to ship.",
  },
  {
    label: "Reject early",
    scope:
      "Multiple accent systems, page-only hex palettes, dark mode without paired surfaces, oversized corner drift.",
    review:
      "Reject the customization before it becomes a style exception that every later page has to explain.",
  },
] as const

const tokenRoleLocks = [
  {
    cssVar: "--color-primary",
    role: "One main action path, focus, selected state, and key progress.",
    guardrail: "Never use primary for decoration-only glow or secondary CTAs.",
  },
  {
    cssVar: "--color-secondary",
    role: "Ceremonial trim and supporting hierarchy.",
    guardrail: "Never let secondary compete with the primary path.",
  },
  {
    cssVar: "--color-accent",
    role: "Rare memory point, editorial glint, and special emphasis.",
    guardrail: "One accent memory per surface; do not build a second palette.",
  },
  {
    cssVar: "--color-surface",
    role: "Default component and content plane.",
    guardrail:
      "Most of the page should still be neutral surface, even in ornate themes.",
  },
  {
    cssVar: "--color-success / warning / danger / info",
    role: "State evidence with paired text and recovery meaning.",
    guardrail: "Status colors cannot be repurposed for brand decoration.",
  },
] as const

const radiusLocks = [
  {
    scale: "--ely-public-radius-sm",
    use: "Small controls, chips, dividers, compact internal rhythm.",
  },
  {
    scale: "--ely-public-radius-md",
    use: "Inputs, local cards, review rows, and ordinary grouped surfaces.",
  },
  {
    scale: "--ely-public-radius-lg",
    use: "Feature surfaces, hero cards, and governed showcase specimens.",
  },
  {
    scale: "999px",
    use: "Avatar, pill, focus dot, progress capsule; not ordinary panels.",
  },
] as const

const approvalFlow = [
  "Pick one complete family before touching page composition.",
  "Prove light and dark mode with the same action, status, surface, and recovery roles.",
  "Check ordinary radius against sm / md / lg only; reserve 999px for pills and avatars.",
  "Scan component usage: primitive semantics must survive without ornament.",
  "Approve the page only when neutral surfaces still carry the majority of the layout.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Customization Guardrails",
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
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const familyCards = publicThemePacks.map((theme) => ({
        ...theme,
        previewStyle: {
          "--ely-story-theme-preview-accent": theme.preview.accent,
          "--ely-story-theme-preview-dark-accent": theme.preview.dark.accent,
          "--ely-story-theme-preview-dark-from": theme.preview.dark.heroFrom,
          "--ely-story-theme-preview-dark-surface": theme.preview.dark.surface,
          "--ely-story-theme-preview-dark-to": theme.preview.dark.heroTo,
          "--ely-story-theme-preview-from": theme.preview.heroFrom,
          "--ely-story-theme-preview-surface": theme.preview.surface,
          "--ely-story-theme-preview-to": theme.preview.heroTo,
        },
      }))

      return {
        approvalFlow,
        customizationLanes,
        familyCards,
        radiusLocks,
        tokenRoleLocks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-theme-custom-hero-panel">
            <p class="ely-public-eyebrow">Theme customization guardrails</p>
            <h1 class="ely-public-section-title">Personalization stays elegant when roles stay fixed</h1>
            <p class="ely-public-copy">
              Users can choose a more romantic, crystalline, ceremonial, or
              calm public theme. What they cannot do is turn every page into a
              separate color system. This review surface explains what can be
              customized safely and what must remain governed by public-luxe.
            </p>

            <div class="ely-story-theme-custom-stats" aria-label="Customization guardrail summary">
              <ElyPublicStat
                :value="String(familyCards.length)"
                eyebrow="Curated families"
                helper="Choose a complete family, not loose page colors."
                tone="primary"
              >
                launch themes
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(tokenRoleLocks.length)"
                eyebrow="Locked roles"
                helper="Primary, secondary, accent, surface, and status stay semantic."
                tone="accent"
              >
                role locks
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(radiusLocks.length)"
                eyebrow="Radius scale"
                helper="Ordinary radius stays within sm / md / lg."
                tone="muted"
              >
                allowed stops
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-theme-custom-grid">
            <article
              v-for="lane in customizationLanes"
              :key="lane.label"
              class="ely-story-theme-custom-lane"
            >
              <ElyPublicBadge tone="primary">{{ lane.label }}</ElyPublicBadge>
              <strong>{{ lane.scope }}</strong>
              <p>{{ lane.review }}</p>
            </article>
          </section>

          <section class="ely-story-theme-custom-layout">
            <article class="ely-story-theme-custom-family-panel">
              <p class="ely-public-eyebrow">Family proof</p>
              <h2 class="ely-public-section-title">Every customized family needs paired mode evidence</h2>
              <div class="ely-story-theme-custom-family-grid ely-story-offset-md">
                <article
                  v-for="family in familyCards"
                  :key="family.key"
                  class="ely-story-theme-custom-family"
                  :style="family.previewStyle"
                >
                  <div class="ely-story-theme-custom-preview-pair">
                    <span data-mode="light">Light</span>
                    <span data-mode="dark">Dark</span>
                  </div>
                  <div class="ely-story-theme-custom-family-copy">
                    <h3>{{ family.displayName }}</h3>
                    <p>{{ family.mood }}</p>
                    <ElyPublicBadge tone="accent">{{ family.accentLabel }}</ElyPublicBadge>
                  </div>
                </article>
              </div>
            </article>

            <article class="ely-story-theme-custom-flow-panel">
              <p class="ely-public-eyebrow">Approval flow</p>
              <h2 class="ely-public-section-title">Do not approve a color until it survives the page</h2>
              <div class="ely-story-theme-custom-flow ely-story-offset-md">
                <div
                  v-for="(step, index) in approvalFlow"
                  :key="step"
                  class="ely-story-theme-custom-step"
                >
                  <span>0{{ index + 1 }}</span>
                  <ElyPublicText weight="semibold">{{ step }}</ElyPublicText>
                </div>
              </div>
              <ElyPublicAlert
                tone="warning"
                title="Reject page-only palette drift"
                eyebrow="Before polish"
              >
                If a customization only works because one page hand-picks new
                colors, larger radius, or stronger glow, move it back to theme
                design before shipping the page.
              </ElyPublicAlert>
            </article>
          </section>

          <section class="ely-story-theme-custom-role-panel">
            <p class="ely-public-eyebrow">Role locks</p>
            <h2 class="ely-public-section-title">Customization changes values, not responsibilities</h2>
            <div class="ely-story-theme-custom-role-grid ely-story-offset-md">
              <article
                v-for="role in tokenRoleLocks"
                :key="role.cssVar"
                class="ely-story-theme-custom-role"
              >
                <code>{{ role.cssVar }}</code>
                <strong>{{ role.role }}</strong>
                <p>{{ role.guardrail }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-custom-layout">
            <article class="ely-story-theme-custom-radius-panel">
              <p class="ely-public-eyebrow">Radius lock</p>
              <h2 class="ely-public-section-title">Elegance comes from a narrow corner vocabulary</h2>
              <div class="ely-story-theme-custom-radius-list ely-story-offset-md">
                <div
                  v-for="radius in radiusLocks"
                  :key="radius.scale"
                  class="ely-story-theme-custom-radius"
                >
                  <code>{{ radius.scale }}</code>
                  <p>{{ radius.use }}</p>
                </div>
              </div>
            </article>

            <article class="ely-story-theme-custom-live-panel">
              <p class="ely-public-eyebrow">Live proof</p>
              <h2 class="ely-public-section-title">A customized theme still needs one obvious next step</h2>
              <div class="ely-story-theme-custom-specimen ely-story-offset-md">
                <ElyPublicBadge tone="accent">Curated public theme</ElyPublicBadge>
                <ElyPublicText size="lg" weight="semibold">
                  Keep the surface luminous, but let neutral planes carry the
                  reading path and let primary carry the only main action.
                </ElyPublicText>
                <ElyPublicProgress label="Mode-pair proof" :value="84" tone="success" />
                <div class="ely-story-theme-custom-actions">
                  <ElyPublicButton>Approve theme family</ElyPublicButton>
                  <ElyPublicLink href="/?path=/story/public-luxe-foundations-theme-readiness--overview">
                    Review readiness matrix
                  </ElyPublicLink>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
