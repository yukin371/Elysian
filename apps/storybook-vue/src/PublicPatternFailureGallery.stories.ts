import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicLink,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath } from "./public-luxe-showcase"

const patternFailureCases = [
  {
    title: "Competing primary actions",
    surface: "Member rewards",
    symptom:
      "Claim, upgrade, invite, and shop all look like the next required step.",
    repair:
      "Pick one primary action; demote the rest to secondary, ghost, or link roles.",
    evidence: "Action Hierarchy",
    evidenceStoryId: "public-luxe-foundations-action-hierarchy--overview",
  },
  {
    title: "Recovery path removed",
    surface: "Event landing",
    symptom:
      "The hero is polished, but sold-out, access, and policy recovery are hidden.",
    repair: "Keep one quiet recovery route visible near the decision surface.",
    evidence: "Pattern Index",
    evidenceStoryId: "public-luxe-patterns-index--coverage",
  },
  {
    title: "Form repair copy missing",
    surface: "Forms & feedback",
    symptom:
      "Invalid fields show mood color but do not explain what to repair.",
    repair:
      "Pair every invalid state with a plain next step and non-color cue.",
    evidence: "Accessibility & Inclusion",
    evidenceStoryId:
      "public-luxe-foundations-accessibility-inclusion--overview",
  },
  {
    title: "Ornament becomes layout",
    surface: "Editorial collection",
    symptom:
      "Glow, borders, and media frames create more hierarchy than the content order.",
    repair:
      "Reduce the surface to one ceremonial moment and restore reading rhythm.",
    evidence: "Ornament Budget",
    evidenceStoryId: "public-luxe-foundations-ornament-budget--overview",
  },
  {
    title: "Theme roles drift per section",
    surface: "Theme atelier",
    symptom:
      "Each section invents its own accent, status, and neutral treatment.",
    repair:
      "Return to one theme family and prove primary, secondary, accent, and status roles.",
    evidence: "Theme Application Recipes",
    evidenceStoryId:
      "public-luxe-foundations-theme-application-recipes--overview",
  },
] as const

const patternFailureReviewOrder = [
  "Name the user job before judging the visual mood.",
  "Find the primary action and demote every competing action.",
  "Check recovery, support, invalid, loading, and disabled paths.",
  "Inspect radius, theme role, and ornament budget after the flow is legible.",
  "Only approve the pattern when the repair sentence is shorter than the decoration brief.",
] as const

const repairChecklist = [
  "One primary action per decision surface.",
  "Recovery remains visible without becoming the hero.",
  "Status and invalid states include text, not only color.",
  "Ornament has a named budget and a clear owner.",
] as const

const meta = {
  title: "Public Luxe/Patterns/Pattern Failure Gallery",
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
      ElyPublicEmptyState,
      ElyPublicLink,
      ElyPublicText,
    },
    setup() {
      return {
        createStoryPath,
        patternFailureCases,
        patternFailureReviewOrder,
        repairChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Pattern failure gallery</p>
            <h1 class="ely-public-section-title">Rejected patterns should make the next good pattern easier</h1>
            <p class="ely-public-copy">
              These are composition-level failures, not production defect
              records. Use them to reject public-luxe pages that look ornate
              but lose action clarity, recovery, accessibility, or theme
              discipline.
            </p>

            <div class="ely-story-pattern-failure-review ely-story-offset-md">
              <article
                v-for="(step, index) in patternFailureReviewOrder"
                :key="step"
                class="ely-story-pattern-failure-step"
              >
                <span>0{{ index + 1 }}</span>
                <ElyPublicText weight="semibold">{{ step }}</ElyPublicText>
              </article>
            </div>
          </section>

          <section class="ely-story-pattern-failure-grid">
            <article
              v-for="failure in patternFailureCases"
              :key="failure.title"
              class="ely-story-pattern-failure-card"
            >
              <div class="ely-story-pattern-failure-head">
                <div>
                  <span>{{ failure.surface }}</span>
                  <h2>{{ failure.title }}</h2>
                </div>
                <ElyPublicBadge tone="danger">Reject</ElyPublicBadge>
              </div>

              <div class="ely-story-pattern-failure-specimen" aria-label="Rejected pattern specimen">
                <div class="ely-story-pattern-failure-specimen-actions">
                  <ElyPublicButton size="sm">Primary-looking action</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="secondary">Another strong action</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">Recovery</ElyPublicButton>
                </div>
                <ElyPublicAlert
                  eyebrow="Failure signal"
                  :title="failure.title"
                  tone="warning"
                >
                  {{ failure.symptom }}
                </ElyPublicAlert>
              </div>

              <div class="ely-story-pattern-failure-copy">
                <ElyPublicText tone="muted">{{ failure.symptom }}</ElyPublicText>
                <ElyPublicText weight="semibold">{{ failure.repair }}</ElyPublicText>
                <ElyPublicLink :href="createStoryPath(failure.evidenceStoryId)">
                  Review {{ failure.evidence }}
                </ElyPublicLink>
              </div>
            </article>
          </section>

          <section class="ely-story-pattern-failure-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Repair checklist</p>
              <h2 class="ely-public-section-title">Do not fix pattern drift with more decoration</h2>
              <div class="ely-story-pattern-failure-checks ely-story-offset-md">
                <div
                  v-for="check in repairChecklist"
                  :key="check"
                  class="ely-story-pattern-failure-check"
                >
                  <ElyPublicBadge tone="accent">Repair</ElyPublicBadge>
                  <ElyPublicText weight="semibold">{{ check }}</ElyPublicText>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Blocked pattern</p>
              <h2 class="ely-public-section-title">A beautiful page still fails if users cannot recover</h2>
              <ElyPublicEmptyState
                class="ely-story-offset-md"
                eyebrow="Recovery missing"
                title="No support path is visible"
                tone="accent"
              >
                Reject this pattern until the next action, repair path, and
                owner evidence are all visible without guessing.
                <template #actions>
                  <ElyPublicLink :href="createStoryPath('public-luxe-patterns-index--coverage')">
                    Return to pattern evidence
                  </ElyPublicLink>
                </template>
              </ElyPublicEmptyState>
              <ElyPublicDivider label="Approval rule" align="start" />
              <ElyPublicText tone="muted">
                Public Luxe can be lavish, but the flow must remain easier to
                use than to admire.
              </ElyPublicText>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
