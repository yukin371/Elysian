import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const patternEntries = publicShowcaseEntries.filter(
  (entry) => entry.category === "pattern",
)

const patternReviewProfiles = [
  {
    key: "creator-center",
    primaryAction: "Edit member preference",
    proof:
      "Tabs, switch states, profile input, and reward preview stay operable.",
    risk: "Account page becomes a decorative settings form.",
  },
  {
    key: "member-rewards",
    primaryAction: "Claim one reward",
    proof:
      "Tier progress, scarcity signal, history, and support route remain visible.",
    risk: "Multiple promotional CTAs compete with the actual claim path.",
  },
  {
    key: "editorial-collection",
    primaryAction: "Read a curated collection",
    proof:
      "Lead artwork, reading order, archive recovery, and quiet links are preserved.",
    risk: "Mood imagery overrides scan order and recovery.",
  },
  {
    key: "event-landing",
    primaryAction: "Reserve a seat",
    proof:
      "Seat progress, agenda rhythm, policy link, and access recovery stay aligned.",
    risk: "Urgency treatment turns into a loud campaign page.",
  },
  {
    key: "forms-feedback",
    primaryAction: "Submit with confidence",
    proof:
      "Labels, helper copy, validation, consent, progress, and feedback work together.",
    risk: "Pretty fields hide repair instructions or agreement state.",
  },
  {
    key: "theme-atelier",
    primaryAction: "Choose a governed preference",
    proof:
      "Theme family, density, sync, and reduced glow remain explicit choices.",
    risk: "Theme customization becomes freeform token mixing.",
  },
] as const

const patternReviewQuestions = [
  "Can the primary action be named before reading every card?",
  "Does the pattern keep support or recovery visible without competing with the action?",
  "Are theme family, radius, status color, and density still governed by public-luxe?",
  "Does ornament clarify the scenario instead of becoming a second design language?",
] as const

const patternChoiceRows = [
  {
    decision: "Creator Center vs Theme Atelier",
    chooseA: "Creator Center",
    whenA:
      "Use when the user owns a member-facing account surface with moments, rewards, and preferences in one place.",
    chooseB: "Theme Atelier",
    whenB:
      "Use when the page is specifically about choosing governed theme, density, sync, or visual preference settings.",
    blocker:
      "Do not hide theme governance inside account content; do not turn the atelier into a general profile dashboard.",
  },
  {
    decision: "Member Rewards vs Event Landing",
    chooseA: "Member Rewards",
    whenA:
      "Use when the primary action is claiming or understanding one benefit with tier evidence and history recovery.",
    chooseB: "Event Landing",
    whenB:
      "Use when the primary action is reserving access to a scheduled moment with seat, agenda, and policy proof.",
    blocker:
      "Rewards should not become campaign urgency; events should not scatter multiple claim-like promotions.",
  },
  {
    decision: "Editorial Collection vs Forms & Feedback",
    chooseA: "Editorial Collection",
    whenA:
      "Use when the user needs a guided reading path, governed imagery, archive recovery, and quiet support links.",
    chooseB: "Forms & Feedback",
    whenB:
      "Use when the user must enter, repair, confirm, and submit information with validation evidence.",
    blocker:
      "Do not make forms look like editorials if repair copy becomes hidden; do not force reading content into form rhythm.",
  },
  {
    decision: "Pattern page vs Foundation rule",
    chooseA: "Pattern page",
    whenA:
      "Use when the story proves a real front-stage scenario with one primary action and recovery path.",
    chooseB: "Foundation rule",
    whenB:
      "Use when the story is explaining color, radius, action hierarchy, accessibility, or component grammar.",
    blocker:
      "A governance rule disguised as a page pattern makes review feel complete while no user flow has been proven.",
  },
] as const

const patternAssemblyGates = [
  "Hero or first surface names one user job before presenting ornament.",
  "Signal row proves state, progress, scarcity, or content order with text evidence.",
  "Primary action appears once per surface and keeps support links low pressure.",
  "Recovery is visible before failure: archive, support, history, repair, or access path.",
  "Mobile order preserves the same decision sequence instead of reshuffling meaning.",
] as const

const patternFailureEntry = publicShowcaseEntries.find(
  (entry) => entry.key === "pattern-failure-gallery",
)

const getPatternEntry = (key: string) =>
  patternEntries.find((entry) => entry.key === key)

const patternReviewRows = patternReviewProfiles
  .map((profile) => ({
    ...profile,
    entry: getPatternEntry(profile.key),
  }))
  .filter(
    (
      profile,
    ): profile is (typeof patternReviewProfiles)[number] & {
      entry: (typeof patternEntries)[number]
    } => Boolean(profile.entry),
  )

const meta = {
  title: "Public Luxe/Patterns/Index",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Coverage: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const recoveryCount = patternReviewRows.filter((row) =>
        row.proof.toLowerCase().includes("recovery"),
      ).length

      return {
        createStoryPath,
        patternEntries,
        patternAssemblyGates,
        patternChoiceRows,
        patternFailureEntry,
        patternReviewQuestions,
        patternReviewRows,
        recoveryCount: String(recoveryCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-pattern-index-hero">
            <p class="ely-public-eyebrow">Patterns index</p>
            <h1 class="ely-public-section-title">Pattern stories need approval evidence, not only atmosphere</h1>
            <p class="ely-public-copy">
              This index groups public-luxe page patterns by primary action,
              proof, recovery, and blocking risk. It helps reviewers decide
              whether a pattern is usable before judging whether it is ornate enough.
            </p>

            <div class="ely-story-pattern-index-stats" aria-label="Pattern review coverage">
              <ElyPublicStat
                :value="String(patternEntries.length)"
                eyebrow="Pattern stories"
                helper="Front-stage scenarios visible from one review map."
                tone="primary"
              >
                governed patterns
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(patternReviewRows.length)"
                eyebrow="Review profiles"
                helper="Each pattern names action, proof, and blocking risk."
                tone="accent"
              >
                approval rows
              </ElyPublicStat>
              <ElyPublicStat
                :value="recoveryCount"
                eyebrow="Recovery evidence"
                helper="Recovery paths remain part of the pattern grammar."
                tone="success"
              >
                recovery rows
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-pattern-index-choice-panel">
            <p class="ely-public-eyebrow">Pattern choice matrix</p>
            <h2 class="ely-public-section-title">Choose the page grammar before composing the page</h2>
            <div class="ely-story-pattern-index-choice-grid ely-story-offset-md">
              <article
                v-for="row in patternChoiceRows"
                :key="row.decision"
                class="ely-story-pattern-index-choice"
              >
                <div class="ely-story-pattern-index-choice-head">
                  <ElyPublicBadge tone="primary">{{ row.decision }}</ElyPublicBadge>
                  <strong>{{ row.blocker }}</strong>
                </div>
                <div class="ely-story-pattern-index-choice-columns">
                  <div>
                    <span>{{ row.chooseA }}</span>
                    <p>{{ row.whenA }}</p>
                  </div>
                  <div>
                    <span>{{ row.chooseB }}</span>
                    <p>{{ row.whenB }}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-pattern-index-layout">
            <article class="ely-story-pattern-index-review-panel">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Review map</p>
                  <h2 class="ely-public-section-title">Approve each scenario by action and proof</h2>
                </div>
                <p>
                  Every row links to a concrete pattern story. The index only
                  describes review evidence and does not own page business truth.
                </p>
              </div>

              <div class="ely-story-pattern-index-row-list ely-story-offset-md">
                <a
                  v-for="row in patternReviewRows"
                  :key="row.key"
                  class="ely-story-pattern-index-row"
                  :href="createStoryPath(row.entry.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <div>
                    <span>{{ row.entry.eyebrow }}</span>
                    <strong>{{ row.entry.title }}</strong>
                    <em>{{ row.entry.stat }}</em>
                  </div>
                  <dl>
                    <div>
                      <dt>Primary action</dt>
                      <dd>{{ row.primaryAction }}</dd>
                    </div>
                    <div>
                      <dt>Proof</dt>
                      <dd>{{ row.proof }}</dd>
                    </div>
                    <div>
                      <dt>Blocking risk</dt>
                      <dd>{{ row.risk }}</dd>
                    </div>
                  </dl>
                </a>
              </div>
            </article>

            <article class="ely-story-pattern-index-question-panel">
              <p class="ely-public-eyebrow">Approval questions</p>
              <h2 class="ely-public-section-title">A pattern is not approved by decoration alone</h2>
              <div class="ely-story-pattern-index-question-list ely-story-offset-md">
                <div
                  v-for="question in patternReviewQuestions"
                  :key="question"
                  class="ely-story-pattern-index-question"
                >
                  <ElyPublicBadge tone="neutral">Check</ElyPublicBadge>
                  <ElyPublicText weight="semibold">{{ question }}</ElyPublicText>
                </div>
              </div>
              <ElyPublicDivider label="Downstream rule" align="start" />
              <ElyPublicText tone="muted">
                If a page pattern fails these questions, return to Foundations
                or Components before adding more visual polish.
              </ElyPublicText>
              <div class="ely-story-pattern-index-links">
                <ElyPublicLink
                  v-if="patternFailureEntry"
                  :href="createStoryPath(patternFailureEntry.storyId)"
                >
                  Review pattern failure gallery
                </ElyPublicLink>
                <ElyPublicLink :href="createStoryPath('public-luxe-foundations-pattern-composition--overview')">
                  Review pattern composition
                </ElyPublicLink>
                <ElyPublicLink
                  :href="createStoryPath('public-luxe-components-index--coverage')"
                  tone="muted"
                >
                  Review component evidence
                </ElyPublicLink>
              </div>
            </article>
          </section>

          <section class="ely-story-pattern-index-gate-panel">
            <p class="ely-public-eyebrow">Assembly gates</p>
            <h2 class="ely-public-section-title">A pattern is approved by the order of decisions</h2>
            <div class="ely-story-pattern-index-gate-list ely-story-offset-md">
              <div
                v-for="(gate, index) in patternAssemblyGates"
                :key="gate"
                class="ely-story-pattern-index-gate"
              >
                <span>0{{ index + 1 }}</span>
                <ElyPublicText weight="semibold">{{ gate }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
