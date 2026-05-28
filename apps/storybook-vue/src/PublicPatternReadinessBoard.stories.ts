import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const patternEntries = publicShowcaseEntries.filter(
  (entry) => entry.category === "pattern",
)

const patternReadinessRows = [
  {
    key: "creator-center",
    mobile: "Pass",
    mode: "Watch",
    theme: "elysia-default",
    proof:
      "Tabs, switch preferences, editable identity, reward preview, and support exit remain visible in one account surface.",
    recovery:
      "Support route and preference reversal are visible before failure.",
    blocker:
      "Block if profile, rewards, and theme preference compete for primary action.",
    score: 82,
    tone: "primary",
  },
  {
    key: "member-rewards",
    mobile: "Watch",
    mode: "Pass",
    theme: "rose-nocturne",
    proof:
      "One reward claim, tier progress, scarcity cue, history, and support route prove a benefit flow.",
    recovery: "History and support path remain quiet but reachable.",
    blocker: "Block if urgency creates multiple promotional claim buttons.",
    score: 78,
    tone: "accent",
  },
  {
    key: "editorial-collection",
    mobile: "Pass",
    mode: "Watch",
    theme: "azure-aria",
    proof:
      "Lead artwork, reading order, collection sections, archive recovery, and quiet links keep content scannable.",
    recovery:
      "Archive path is present without becoming a second navigation lane.",
    blocker: "Block if imagery overrides reading order or removes alt meaning.",
    score: 80,
    tone: "primary",
  },
  {
    key: "event-landing",
    mobile: "Watch",
    mode: "Watch",
    theme: "rose-nocturne",
    proof:
      "Seat progress, agenda rhythm, registration action, policy link, and access recovery prove a live moment.",
    recovery:
      "Access recovery and policy links sit below the registration path.",
    blocker:
      "Block if countdown or campaign treatment overwhelms calm decision.",
    score: 74,
    tone: "warning",
  },
  {
    key: "forms-feedback",
    mobile: "Pass",
    mode: "Pass",
    theme: "enterprise-calm",
    proof:
      "Labels, helper copy, validation, consent, progress, feedback, and repair path prove operability.",
    recovery: "Invalid message and retry path explain the next repair action.",
    blocker:
      "Block if field polish hides label, consent, invalid copy, or submit state.",
    score: 88,
    tone: "success",
  },
  {
    key: "theme-atelier",
    mobile: "Watch",
    mode: "Pass",
    theme: "elysia-default",
    proof:
      "Theme family, density, sync, and reduced glow choices stay governed instead of becoming token mixing.",
    recovery:
      "Preference changes remain reversible and described as governed choices.",
    blocker: "Block if customization bypasses family, mode, or radius locks.",
    score: 84,
    tone: "primary",
  },
] as const

const readinessGates = [
  {
    label: "Theme proof",
    target:
      "One named theme family, both modes reviewed, no page-local palette.",
    evidence: "Theme Readiness + Mode Pairing Lab",
  },
  {
    label: "Component proof",
    target:
      "Every visible primitive links back to a component story or owner doc.",
    evidence: "Component Index + Component Usage Matrix",
  },
  {
    label: "Mobile order",
    target:
      "Mobile keeps status, primary action, recovery, and support in the same order.",
    evidence: "Layout & Density + Pattern Index",
  },
  {
    label: "Recovery path",
    target:
      "Archive, support, history, repair, or access recovery is visible before failure.",
    evidence: "Pattern Composition + Accessibility & Inclusion",
  },
] as const

const handoffChecks = [
  "Name the user job in the first surface before judging ornament.",
  "Capture a light and dark screenshot for the same primary action.",
  "Point every high-risk primitive to detailed component evidence.",
  "Verify keyboard, invalid, loading, disabled, and recovery states where the pattern uses them.",
  "Reject the pattern if it needs local color, local radius, or a second action language to feel complete.",
] as const

const entryByKey = new Map(patternEntries.map((entry) => [entry.key, entry]))

const readinessRows = patternReadinessRows
  .map((row) => ({
    ...row,
    entry: entryByKey.get(row.key),
  }))
  .filter(
    (
      row,
    ): row is (typeof patternReadinessRows)[number] & {
      entry: (typeof patternEntries)[number]
    } => Boolean(row.entry),
  )

const meta = {
  title: "Public Luxe/Patterns/Readiness Board",
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
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const passMobileCount = readinessRows.filter(
        (row) => row.mobile === "Pass",
      ).length
      const passModeCount = readinessRows.filter(
        (row) => row.mode === "Pass",
      ).length
      const averageScore = Math.round(
        readinessRows.reduce((total, row) => total + row.score, 0) /
          readinessRows.length,
      )
      const watchCount = readinessRows.filter(
        (row) => row.mobile === "Watch" || row.mode === "Watch",
      ).length

      return {
        averageScore,
        createStoryPath,
        handoffChecks,
        passMobileCount: String(passMobileCount),
        passModeCount: String(passModeCount),
        readinessGates,
        readinessRows,
        watchCount: String(watchCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Pattern readiness board</p>
            <h1 class="ely-public-section-title">Page samples become useful when their risks are visible</h1>
            <p class="ely-public-copy">
              This board turns the public-luxe pattern gallery into a handoff
              surface: each scenario must show theme proof, component evidence,
              mobile order, and recovery before it can be treated as design-system ready.
            </p>

            <div class="ely-story-pattern-readiness-stats" aria-label="Pattern readiness summary">
              <ElyPublicStat
                :value="String(averageScore)"
                eyebrow="Average readiness"
                helper="Weighted by visible evidence, not visual mood."
                tone="primary"
              >
                review score
              </ElyPublicStat>
              <ElyPublicStat
                :value="passMobileCount"
                eyebrow="Mobile pass"
                helper="Patterns that preserve decision order on small screens."
                tone="success"
              >
                responsive proofs
              </ElyPublicStat>
              <ElyPublicStat
                :value="passModeCount"
                eyebrow="Mode pass"
                helper="Patterns with stronger light and dark confidence."
                tone="accent"
              >
                mode proofs
              </ElyPublicStat>
              <ElyPublicStat
                :value="watchCount"
                eyebrow="Watch items"
                helper="Review risks that must not become release assumptions."
                tone="warning"
              >
                guarded rows
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-pattern-readiness-layout">
            <article class="ely-public-card">
              <div class="ely-story-section-head">
                <div>
                  <p class="ely-public-eyebrow">Scenario board</p>
                  <h2 class="ely-public-section-title">Approve patterns by evidence density</h2>
                </div>
                <p>
                  Scores are review signals only. They do not replace component
                  docs, token truth, production routes, or business acceptance.
                </p>
              </div>

              <div class="ely-story-pattern-readiness-table ely-story-offset-md">
                <a
                  v-for="row in readinessRows"
                  :key="row.key"
                  class="ely-story-pattern-readiness-row"
                  :href="createStoryPath(row.entry.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <div class="ely-story-pattern-readiness-name">
                    <span>{{ row.entry.eyebrow }}</span>
                    <strong>{{ row.entry.title }}</strong>
                    <em>{{ row.theme }}</em>
                  </div>
                  <div class="ely-story-pattern-readiness-score">
                    <ElyPublicProgress
                      :value="row.score"
                      :label="row.entry.title + ' readiness'"
                      :tone="row.tone"
                    />
                    <span>{{ row.score }}%</span>
                  </div>
                  <div class="ely-story-pattern-readiness-badges">
                    <ElyPublicBadge :tone="row.mobile === 'Pass' ? 'success' : 'warning'">
                      Mobile {{ row.mobile }}
                    </ElyPublicBadge>
                    <ElyPublicBadge :tone="row.mode === 'Pass' ? 'success' : 'warning'">
                      Mode {{ row.mode }}
                    </ElyPublicBadge>
                  </div>
                  <dl>
                    <div>
                      <dt>Proof</dt>
                      <dd>{{ row.proof }}</dd>
                    </div>
                    <div>
                      <dt>Recovery</dt>
                      <dd>{{ row.recovery }}</dd>
                    </div>
                    <div>
                      <dt>Blocker</dt>
                      <dd>{{ row.blocker }}</dd>
                    </div>
                  </dl>
                </a>
              </div>
            </article>

            <aside class="ely-public-card">
              <p class="ely-public-eyebrow">Readiness gates</p>
              <h2 class="ely-public-section-title">A pattern is not ready because it looks finished</h2>
              <div class="ely-story-pattern-readiness-gates ely-story-offset-md">
                <article
                  v-for="gate in readinessGates"
                  :key="gate.label"
                  class="ely-story-pattern-readiness-gate"
                >
                  <ElyPublicBadge tone="primary">{{ gate.label }}</ElyPublicBadge>
                  <ElyPublicText weight="semibold">{{ gate.target }}</ElyPublicText>
                  <ElyPublicText tone="muted">{{ gate.evidence }}</ElyPublicText>
                </article>
              </div>
            </aside>
          </section>

          <section class="ely-public-card">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Handoff checklist</p>
                <h2 class="ely-public-section-title">Before a pattern graduates from gallery to system</h2>
              </div>
              <p>
                These checks keep the ornate public style elegant: the evidence
                must be traceable, compact, and governed before more variants are added.
              </p>
            </div>
            <div class="ely-story-pattern-readiness-checks ely-story-offset-md">
              <div
                v-for="(check, index) in handoffChecks"
                :key="check"
                class="ely-story-pattern-readiness-check"
              >
                <span>0{{ index + 1 }}</span>
                <ElyPublicText weight="semibold">{{ check }}</ElyPublicText>
              </div>
            </div>
            <ElyPublicDivider label="Review routes" align="start" />
            <div class="ely-story-pattern-readiness-links">
              <ElyPublicLink :href="createStoryPath('public-luxe-patterns-index--coverage')">
                Return to pattern index
              </ElyPublicLink>
              <ElyPublicLink :href="createStoryPath('public-luxe-foundations-release-gate-dashboard--overview')">
                Review release gates
              </ElyPublicLink>
              <ElyPublicLink
                :href="createStoryPath('public-luxe-components-index--coverage')"
                tone="muted"
              >
                Review component evidence
              </ElyPublicLink>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
