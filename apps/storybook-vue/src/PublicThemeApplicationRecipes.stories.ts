import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const recipeLanes = [
  {
    label: "Hero ceremony",
    surface:
      "Use primary for the only forward action; let secondary create trim.",
    proof: "The hero still reads if the accent glint is removed.",
    risk: "Accent becomes a second primary path.",
  },
  {
    label: "Data summary",
    surface:
      "Let neutral surfaces carry metrics; use progress to explain change.",
    proof: "Every number has a label, helper, and status reason.",
    risk: "Stats turn into decorative posters.",
  },
  {
    label: "Form recovery",
    surface: "Use status containers for validation, not louder brand color.",
    proof:
      "Invalid, warning, and recovery states remain distinguishable without hue.",
    risk: "Errors compete with the submit action.",
  },
  {
    label: "Editorial glint",
    surface:
      "Reserve accent for one remembered detail: badge, divider, or caption.",
    proof: "The page has one memorable highlight, not a field of sparkles.",
    risk: "Ornament becomes the information hierarchy.",
  },
] as const

const familyRecipeGuidance = {
  "azure-aria": {
    emphasis: "Airy tools and clear creator workspaces",
    primaryUse: "Use primary on task progress and calm submit paths.",
    accentUse: "Keep mint accents on proof badges or one small editorial cue.",
  },
  "elysia-default": {
    emphasis: "Default public brand pages and member entry",
    primaryUse: "Use primary on the route that moves the member forward.",
    accentUse:
      "Use champagne as trim, achievement, or one ceremonial memory point.",
  },
  "enterprise-calm": {
    emphasis: "Bridge surfaces near enterprise or account flows",
    primaryUse: "Use primary sparingly and let structure do more work.",
    accentUse:
      "Use accent only to soften the public-luxe tone, not to decorate.",
  },
  "rose-nocturne": {
    emphasis: "Romantic editorial and seasonal campaigns",
    primaryUse: "Use primary for the story path or reservation action.",
    accentUse:
      "Use candle-like accent on captions, tier hints, or quiet proof.",
  },
} as const

const approvalChecks = [
  "One page surface chooses one theme family and one mode pair.",
  "Primary owns the next step; accent never owns the next step.",
  "Neutral surfaces occupy most of the viewport in both light and dark mode.",
  "Status color appears only when the user needs state evidence.",
  "Ornament can be removed without breaking task comprehension.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Application Recipes",
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
      ElyPublicDivider,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        approvalChecks,
        familyRecipeGuidance,
        recipeLanes,
        themePacks: publicThemePacks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme application recipes</p>
            <h1 class="ely-public-section-title">A theme is approved by how it behaves on real surfaces</h1>
            <p class="ely-public-copy">
              This page turns the launch families into page recipes. It does
              not define new tokens or component APIs; it shows how primary,
              secondary, accent, neutral, and status roles should be assigned
              before a pattern becomes ornate.
            </p>

            <div class="ely-story-theme-recipes-lanes" aria-label="Theme recipe lanes">
              <article
                v-for="lane in recipeLanes"
                :key="lane.label"
                class="ely-story-theme-recipes-lane"
              >
                <strong>{{ lane.label }}</strong>
                <span>{{ lane.surface }}</span>
                <em>{{ lane.proof }}</em>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-recipes-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Applied specimen</p>
              <h2 class="ely-public-section-title">One primary path, one accent memory</h2>
              <div class="ely-story-theme-recipes-specimen ely-story-offset-md">
                <div class="ely-story-theme-recipes-specimen-hero">
                  <ElyPublicBadge tone="accent">Moonlit member preview</ElyPublicBadge>
                  <h3>Invite the user forward without turning every detail into a CTA</h3>
                  <ElyPublicText tone="muted">
                    Primary carries the next step. Secondary and accent only
                    create atmosphere, proof, and memory.
                  </ElyPublicText>
                  <div class="ely-public-actions">
                    <ElyPublicButton>Continue journey</ElyPublicButton>
                    <ElyPublicButton tone="secondary">Compare family</ElyPublicButton>
                    <ElyPublicButton tone="ghost">Recover draft</ElyPublicButton>
                  </div>
                </div>

                <div class="ely-story-theme-recipes-specimen-grid">
                  <ElyPublicStat
                    value="82%"
                    eyebrow="Profile clarity"
                    helper="Progress is evidence, not decoration."
                    tone="primary"
                  >
                    ready for review
                  </ElyPublicStat>
                  <ElyPublicProgress :value="68" label="Theme proof" tone="accent" />
                  <ElyPublicAlert tone="warning" title="Needs dark-mode proof">
                    The accent badge is acceptable only if the dark pair stays quiet.
                  </ElyPublicAlert>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval checks</p>
              <h2 class="ely-public-section-title">Reject the page before the colors drift</h2>
              <div class="ely-story-theme-recipes-checks ely-story-offset-md">
                <div
                  v-for="check in approvalChecks"
                  :key="check"
                  class="ely-story-theme-recipes-check"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ check }}</strong>
                </div>
              </div>
              <ElyPublicDivider label="Blockers" align="start" />
              <div class="ely-story-theme-recipes-risks">
                <ElyPublicBadge
                  v-for="lane in recipeLanes"
                  :key="lane.risk"
                  tone="warning"
                >
                  {{ lane.risk }}
                </ElyPublicBadge>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Family recipes</p>
                <h2 class="ely-public-section-title">Each family keeps a different temperament, not a different rulebook</h2>
              </div>
              <p>
                The assignments stay the same across families: primary moves,
                accent remembers, neutral carries, status explains.
              </p>
            </div>

            <div class="ely-story-theme-recipes-family-grid">
              <article
                v-for="theme in themePacks"
                :key="theme.key"
                class="ely-story-theme-recipes-family"
              >
                <div class="ely-story-theme-recipes-family-preview">
                  <div
                    class="ely-story-theme-recipes-family-swatch"
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.accent,
                      '--ely-story-theme-preview-from': theme.preview.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.surface,
                      '--ely-story-theme-preview-to': theme.preview.heroTo,
                    }"
                  >
                    <span>Light</span>
                  </div>
                  <div
                    class="ely-story-theme-recipes-family-swatch"
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.dark.accent,
                      '--ely-story-theme-preview-from': theme.preview.dark.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.dark.surface,
                      '--ely-story-theme-preview-to': theme.preview.dark.heroTo,
                    }"
                  >
                    <span>Dark</span>
                  </div>
                </div>
                <div class="ely-story-theme-recipes-family-copy">
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h3>{{ theme.displayName }}</h3>
                  <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
                  <dl>
                    <div>
                      <dt>Best surface</dt>
                      <dd>{{ familyRecipeGuidance[theme.key].emphasis }}</dd>
                    </div>
                    <div>
                      <dt>Primary job</dt>
                      <dd>{{ familyRecipeGuidance[theme.key].primaryUse }}</dd>
                    </div>
                    <div>
                      <dt>Accent job</dt>
                      <dd>{{ familyRecipeGuidance[theme.key].accentUse }}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
