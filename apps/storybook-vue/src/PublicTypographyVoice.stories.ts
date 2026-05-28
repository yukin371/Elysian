import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const typeRoles = [
  {
    body: "Brand headings, chapter titles, and key numbers. Use it to create ceremony, not to carry dense instructions.",
    label: "Display",
    sample: "Moonlit atelier",
  },
  {
    body: "Body copy, controls, helper text, and settings. Use it whenever clarity and scan speed matter.",
    label: "Sans",
    sample: "Readable product copy",
  },
  {
    body: "Short uppercase cues for navigation and grouping. It should frame meaning, not replace the real title.",
    label: "Eyebrow",
    sample: "FOUNDATION",
  },
] as const

const hierarchyRules = [
  "One display title per local surface.",
  "Body copy should stay calm and readable before it becomes poetic.",
  "Helper text explains consequence, not implementation details.",
  "Links should name the destination or action, never say only learn more.",
] as const

const voiceRules = [
  {
    bad: "POC preview skeleton has generated runtime state.",
    good: "Preview the generated draft before applying it to staging.",
    label: "Remove engineering residue",
  },
  {
    bad: "Activate celestial resonance to unlock the destiny panel.",
    good: "Open member rewards and review the available benefits.",
    label: "Keep poetry accountable",
  },
  {
    bad: "Click here.",
    good: "Review theme contrast",
    label: "Name the next step",
  },
] as const

const contentChecklist = [
  "Can the headline be understood without reading the helper paragraph?",
  "Does every decorative phrase still tell the user what changed or what to do?",
  "Are muted texts readable in both light and dark mode?",
  "Are internal terms removed from visible user-facing copy?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Typography & Voice",
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
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        contentChecklist,
        hierarchyRules,
        typeRoles,
        voiceRules,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Typography & voice</p>
            <h1 class="ely-public-section-title">A luminous theme still speaks plainly</h1>
            <p class="ely-public-copy">
              Public Luxe can feel ornate, but typography and copy must keep the
              product usable. Display type creates ceremony; body text carries
              decisions; helper copy removes doubt.
            </p>

            <div class="ely-story-type-role-grid" aria-label="Typography role model">
              <article
                v-for="role in typeRoles"
                :key="role.label"
                class="ely-story-type-role"
              >
                <span>{{ role.label }}</span>
                <strong>{{ role.sample }}</strong>
                <p>{{ role.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-type-layout">
            <article class="ely-story-type-specimen">
              <p class="ely-public-eyebrow">Specimen</p>
              <h2>Crystal notes for a creator profile</h2>
              <ElyPublicText size="lg" tone="muted">
                Use the display voice for a precise moment of delight, then
                return to measured body copy so the next action remains clear.
              </ElyPublicText>
              <div class="ely-story-type-stat-row">
                <ElyPublicStat
                  value="1"
                  eyebrow="Focus"
                  helper="One lead phrase per surface."
                  tone="primary"
                >
                  display title
                </ElyPublicStat>
                <ElyPublicStat
                  value="1.65"
                  eyebrow="Line height"
                  helper="Readable before atmospheric."
                  tone="accent"
                >
                  body rhythm
                </ElyPublicStat>
              </div>
              <ElyPublicDivider label="Text roles" align="start" />
              <div class="ely-story-type-copy-stack">
                <ElyPublicText weight="semibold">Primary text names the decision.</ElyPublicText>
                <ElyPublicText tone="muted">
                  Muted text can explain consequences, limits, or next steps,
                  but it should not hide the main action.
                </ElyPublicText>
                <ElyPublicText size="sm" tone="subtle">
                  Subtle text is reserved for metadata and quiet context.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Hierarchy rules</p>
              <h2 class="ely-public-section-title">Make the reading path visible</h2>
              <div class="ely-story-type-rule-list ely-story-offset-md">
                <div
                  v-for="rule in hierarchyRules"
                  :key="rule"
                  class="ely-story-type-rule"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-type-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Voice transformations</p>
              <h2 class="ely-public-section-title">Elegant does not mean obscure</h2>
              <div class="ely-story-type-voice-list ely-story-offset-md">
                <div
                  v-for="item in voiceRules"
                  :key="item.label"
                  class="ely-story-type-voice"
                >
                  <ElyPublicBadge tone="neutral">{{ item.label }}</ElyPublicBadge>
                  <div class="ely-story-type-voice-pair">
                    <p data-kind="avoid">{{ item.bad }}</p>
                    <p data-kind="prefer">{{ item.good }}</p>
                  </div>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Link and microcopy</p>
              <h2 class="ely-public-section-title">Small words carry the route</h2>
              <div class="ely-story-type-link-panel ely-story-offset-md">
                <ElyPublicText tone="muted">
                  Links and badges are quiet choreography. They point users to
                  the next stable place instead of competing with primary actions.
                </ElyPublicText>
                <div class="ely-public-inline">
                  <ElyPublicLink href="#contrast">Review contrast</ElyPublicLink>
                  <ElyPublicLink href="#release-notes" tone="muted">Read release notes</ElyPublicLink>
                  <ElyPublicLink href="https://example.com" external tone="accent">
                    Open inspiration board
                  </ElyPublicLink>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Approve language with the same care as color</h2>
            <div class="ely-story-type-checklist ely-story-offset-md">
              <div
                v-for="item in contentChecklist"
                :key="item"
                class="ely-story-type-check"
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
