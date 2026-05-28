import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const budgetTiers = [
  {
    label: "Quiet",
    limit: "Default",
    use: "Forms, account settings, dense lists, recovery flows, and legal copy.",
    rule: "No glow, no animated ornament, no accent unless it marks one support fact.",
  },
  {
    label: "Luminous",
    limit: "Allowed locally",
    use: "Theme cards, selected panels, member summaries, and product proof areas.",
    rule: "One sheen layer and one restrained accent detail may appear inside the surface.",
  },
  {
    label: "Ceremonial",
    limit: "One per view",
    use: "Hero, launch, tier celebration, creator milestone, or invitation moment.",
    rule: "One focal glow is allowed only if the primary action remains visually dominant.",
  },
  {
    label: "Blocked",
    limit: "Reject",
    use: "Any page where ornament hides reading order, state, focus, or action hierarchy.",
    rule: "Remove competing highlights before discussing color, motion, or imagery polish.",
  },
] as const

const surfaceBudgets = [
  {
    surface: "Hero",
    budget: "Ceremonial",
    allowance: "One focal plane, one primary action, one accent memory.",
  },
  {
    surface: "Form",
    budget: "Quiet",
    allowance:
      "Clear labels, visible boundaries, status copy, and no decorative distraction.",
  },
  {
    surface: "Data",
    budget: "Luminous",
    allowance:
      "Token sheen only when it helps compare progress or achievement.",
  },
  {
    surface: "Recovery",
    budget: "Quiet",
    allowance: "Status evidence and support action outrank all ceremony.",
  },
  {
    surface: "Editorial",
    budget: "Luminous",
    allowance:
      "One glint for memory; content rhythm remains the visual structure.",
  },
] as const

const blockers = [
  "More than one ceremonial focal point appears in the same viewport.",
  "Accent color is used for the primary action or for multiple unrelated highlights.",
  "Glow appears on passive cards, static copy, or decorative background fragments.",
  "The page becomes less readable when motion or material layers are removed.",
] as const

const reviewQuestions = [
  "Which single surface is allowed to be ceremonial?",
  "Can all other surfaces name a quieter budget tier?",
  "Does the primary action stay stronger than accent ornament?",
  "Do status messages remain understandable without color alone?",
  "Would a reduced-motion screenshot preserve the same hierarchy?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Ornament Budget",
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
      ElyPublicText,
    },
    setup() {
      return {
        blockers,
        budgetTiers,
        reviewQuestions,
        surfaceBudgets,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Ornament budget</p>
            <h1 class="ely-public-section-title">Luxury becomes elegant when ornament has a limit</h1>
            <p class="ely-public-copy">
              Elysian can be luminous and ornate, but every glow, sheen, and
              accent must spend from a budget. This page defines how much
              ornament a surface may carry before it starts fighting the user's
              next step.
            </p>

            <div class="ely-story-ornament-tier-grid" aria-label="Ornament budget tiers">
              <article
                v-for="tier in budgetTiers"
                :key="tier.label"
                class="ely-story-ornament-tier"
              >
                <span>{{ tier.limit }}</span>
                <strong>{{ tier.label }}</strong>
                <p>{{ tier.use }}</p>
                <em>{{ tier.rule }}</em>
              </article>
            </div>
          </section>

          <section class="ely-story-ornament-layout">
            <article class="ely-story-ornament-specimen">
              <div class="ely-story-ornament-specimen-mark" aria-hidden="true">
                <span></span>
                <span></span>
              </div>
              <p class="ely-public-eyebrow">Approved specimen</p>
              <h2>One ceremonial surface, then restraint everywhere else</h2>
              <ElyPublicText tone="muted">
                The hero spends the ceremony budget. Progress, support, and
                recovery areas stay quieter so the primary action remains clear.
              </ElyPublicText>
              <div class="ely-public-actions">
                <ElyPublicButton>Start the journey</ElyPublicButton>
                <ElyPublicButton tone="secondary">Review theme</ElyPublicButton>
                <ElyPublicButton tone="ghost">Restore draft</ElyPublicButton>
              </div>
              <ElyPublicDivider label="Quiet evidence" align="start" />
              <div class="ely-story-ornament-specimen-evidence">
                <ElyPublicProgress label="Review clarity" :value="76" tone="success" />
                <ElyPublicAlert tone="info" title="Budget note">
                  Accent stays on the small memory cue; status and recovery remain readable.
                </ElyPublicAlert>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Surface budget map</p>
              <h2 class="ely-public-section-title">Assign intensity before polishing pixels</h2>
              <div class="ely-story-ornament-surface-list ely-story-offset-md">
                <div
                  v-for="item in surfaceBudgets"
                  :key="item.surface"
                  class="ely-story-ornament-surface"
                >
                  <ElyPublicBadge tone="primary">{{ item.budget }}</ElyPublicBadge>
                  <div>
                    <strong>{{ item.surface }}</strong>
                    <p>{{ item.allowance }}</p>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-ornament-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Blockers</p>
              <h2 class="ely-public-section-title">Reject polish that spends beyond its budget</h2>
              <div class="ely-story-ornament-blockers ely-story-offset-md">
                <div
                  v-for="item in blockers"
                  :key="item"
                  class="ely-story-ornament-blocker"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ item }}</strong>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review questions</p>
              <h2 class="ely-public-section-title">Elegance is approved as restraint</h2>
              <div class="ely-story-ornament-questions ely-story-offset-md">
                <div
                  v-for="question in reviewQuestions"
                  :key="question"
                  class="ely-story-ornament-question"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ question }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
