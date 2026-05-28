import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

type PatternEvidenceFocus =
  | "access"
  | "action"
  | "content"
  | "feedback"
  | "form"
  | "governance"
  | "interaction"
  | "media"
  | "mobile"
  | "progress"
  | "recovery"
  | "state"
  | "theme"

interface PatternEvidenceRow {
  action: string
  blocker: string
  family: string
  focus: readonly PatternEvidenceFocus[]
  key: string
  mobileProof: string
  proof: string
  recovery: string
  themeProof: string
  userJob: string
}

const patternEntries = publicShowcaseEntries.filter(
  (entry) => entry.category === "pattern",
)

const patternEvidenceRows: readonly PatternEvidenceRow[] = [
  {
    key: "creator-center",
    family: "Account surface",
    userJob: "Adjust a member preference without losing reward context.",
    action: "Edit member preference",
    proof:
      "Tabs, switches, identity input, reward preview, and support exit stay visible together.",
    recovery: "Preference reversal and support route appear before failure.",
    themeProof: "elysia-default in light mode, dark mode watch",
    mobileProof: "Decision order remains profile -> rewards -> preferences.",
    blocker:
      "Block if profile, rewards, and theme controls compete for primary action.",
    focus: ["interaction", "state", "recovery"],
  },
  {
    key: "member-rewards",
    family: "Benefit claim",
    userJob: "Claim one benefit with confidence and history fallback.",
    action: "Claim one reward",
    proof:
      "Tier progress, scarcity signal, history, and support route prove a governed claim path.",
    recovery: "History and support link remain quiet but reachable.",
    themeProof: "rose-nocturne in dark mode, light mode pass",
    mobileProof: "Reward summary stays above claim, history stays below.",
    blocker: "Block if scarcity treatment creates multiple promotional CTAs.",
    focus: ["action", "progress", "recovery"],
  },
  {
    key: "editorial-collection",
    family: "Content feature",
    userJob: "Read a curated story while preserving archive recovery.",
    action: "Read collection",
    proof:
      "Lead artwork, reading order, sections, quiet links, and archive path stay scannable.",
    recovery:
      "Archive route is visible without becoming a second navigation lane.",
    themeProof: "azure-aria in light mode, dark mode watch",
    mobileProof: "Artwork collapses after title and before section evidence.",
    blocker: "Block if mood imagery overrides reading order or alt meaning.",
    focus: ["content", "media", "recovery"],
  },
  {
    key: "event-landing",
    family: "Live moment",
    userJob: "Reserve access to a scheduled release without urgency noise.",
    action: "Reserve a seat",
    proof:
      "Seat progress, agenda rhythm, registration action, policy link, and access recovery align.",
    recovery:
      "Access recovery and policy links sit after the registration path.",
    themeProof: "rose-nocturne in ceremonial mode, both modes watch",
    mobileProof: "Seat proof stays next to registration before agenda details.",
    blocker:
      "Block if countdown or campaign treatment overwhelms calm decision.",
    focus: ["action", "progress", "access"],
  },
  {
    key: "forms-feedback",
    family: "Form repair",
    userJob: "Submit information and repair mistakes without guessing.",
    action: "Submit with confidence",
    proof:
      "Labels, helper copy, validation, consent, progress, feedback, and retry path work together.",
    recovery: "Invalid message and retry copy name the next repair action.",
    themeProof: "enterprise-calm as restrained public form proof",
    mobileProof: "Label, field, helper, invalid copy, consent, then submit.",
    blocker:
      "Block if field polish hides label, consent, invalid copy, or submit state.",
    focus: ["form", "feedback", "recovery"],
  },
  {
    key: "theme-atelier",
    family: "Preference studio",
    userJob: "Choose governed theme settings without freeform token mixing.",
    action: "Choose governed preference",
    proof:
      "Theme family, density, sync, and reduced glow stay explicit, reversible choices.",
    recovery: "Preference changes are described as governed and reversible.",
    themeProof: "elysia-default as baseline, all families remain selectable",
    mobileProof: "Family selection precedes density, sync, and glow choices.",
    blocker: "Block if customization bypasses family, mode, or radius locks.",
    focus: ["theme", "state", "governance"],
  },
] as const

const evidenceFocusLanes = [
  {
    focus: "action" satisfies PatternEvidenceFocus,
    label: "Primary action",
    intent:
      "Every pattern must name one next step before ornament, state, or supporting links.",
  },
  {
    focus: "recovery" satisfies PatternEvidenceFocus,
    label: "Recovery",
    intent:
      "Archive, support, history, repair, or access recovery must be visible before failure.",
  },
  {
    focus: "theme" satisfies PatternEvidenceFocus,
    label: "Theme proof",
    intent:
      "A pattern should prove one named family and mode behavior, not local palette drift.",
  },
  {
    focus: "mobile" satisfies PatternEvidenceFocus,
    label: "Mobile order",
    intent:
      "Responsive changes may compress rhythm, but must not reshuffle the decision sequence.",
  },
] as const

const evidenceRoute = [
  {
    copy: "Start with the approval map to choose the correct pattern grammar.",
    entryKey: "pattern-index",
    label: "Index",
  },
  {
    copy: "Use this atlas when reviewers ask which scenario proves which risk.",
    entryKey: "pattern-evidence-atlas",
    label: "Evidence atlas",
  },
  {
    copy: "Check readiness only after action, theme, recovery, and mobile proof are visible.",
    entryKey: "pattern-readiness-board",
    label: "Readiness",
  },
  {
    copy: "Reject composition drift before adding more surface polish.",
    entryKey: "pattern-failure-gallery",
    label: "Failure gallery",
  },
] as const

const familyReviewOrder = [
  "Account surface",
  "Benefit claim",
  "Content feature",
  "Live moment",
  "Form repair",
  "Preference studio",
] as const

const entryByKey = new Map(patternEntries.map((entry) => [entry.key, entry]))
const allEntryByKey = new Map(
  publicShowcaseEntries.map((entry) => [entry.key, entry]),
)

const evidenceRows = patternEvidenceRows
  .map((row) => ({
    ...row,
    entry: entryByKey.get(row.key),
  }))
  .filter(
    (
      row,
    ): row is (typeof patternEvidenceRows)[number] & {
      entry: (typeof patternEntries)[number]
    } => Boolean(row.entry),
  )

const familyLanes = familyReviewOrder.map((family) => ({
  family,
  rows: evidenceRows.filter((row) => row.family === family),
}))

const focusLanes = evidenceFocusLanes.map((lane) => ({
  ...lane,
  rows: evidenceRows.filter((row) => {
    if (lane.focus === "action") {
      return row.action.length > 0
    }

    if (lane.focus === "recovery") {
      return row.recovery.length > 0
    }

    if (lane.focus === "theme") {
      return row.themeProof.length > 0
    }

    if (lane.focus === "mobile") {
      return row.mobileProof.length > 0
    }

    return false
  }),
}))

const meta = {
  title: "Public Luxe/Patterns/Evidence Atlas",
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
      const routeEntries = evidenceRoute.map((step) => ({
        ...step,
        entry: allEntryByKey.get(step.entryKey),
      }))
      const recoveryRows = evidenceRows.filter((row) => row.recovery.length > 0)
      const themeRows = evidenceRows.filter((row) => row.themeProof.length > 0)

      return {
        createStoryPath,
        evidenceRows,
        familyLanes,
        focusLanes,
        patternCount: String(evidenceRows.length),
        recoveryCount: String(recoveryRows.length),
        routeEntries,
        themeProofCount: String(themeRows.length),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-pattern-atlas-hero">
            <p class="ely-public-eyebrow">Pattern evidence atlas</p>
            <h1 class="ely-public-section-title">Page patterns should prove one user job, one route to recovery</h1>
            <p class="ely-public-copy">
              This atlas connects every current public-luxe page pattern to a
              user job, action proof, theme proof, mobile order, and blocker.
              It is a Storybook review map only: business routes, page models,
              tokens, and component APIs still live with their canonical owners.
            </p>

            <div class="ely-story-pattern-atlas-stats" aria-label="Pattern evidence atlas summary">
              <ElyPublicStat
                :value="patternCount"
                eyebrow="Pattern rows"
                helper="Every public pattern has a user job and blocker."
                tone="primary"
              >
                evidence rows
              </ElyPublicStat>
              <ElyPublicStat
                :value="themeProofCount"
                eyebrow="Theme proofs"
                helper="Rows that name family or mode behavior."
                tone="accent"
              >
                governed modes
              </ElyPublicStat>
              <ElyPublicStat
                :value="recoveryCount"
                eyebrow="Recovery routes"
                helper="Rows with archive, support, repair, history, or access fallback."
                tone="success"
              >
                recoverable jobs
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-pattern-atlas-layout">
            <article class="ely-story-pattern-atlas-route-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from page grammar to readiness without skipping proof</h2>
              <div class="ely-story-pattern-atlas-route ely-story-offset-md">
                <a
                  v-for="(step, index) in routeEntries"
                  :key="step.label"
                  class="ely-story-pattern-atlas-route-step"
                  :href="step.entry ? createStoryPath(step.entry.storyId) : '#'"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ step.entry?.title ?? step.label }}</strong>
                  <p>{{ step.copy }}</p>
                </a>
              </div>
            </article>

            <article class="ely-story-pattern-atlas-approval-panel">
              <p class="ely-public-eyebrow">Approval sentence</p>
              <h2 class="ely-public-section-title">If the risk is invisible, the pattern is not ready</h2>
              <ElyPublicText class="ely-story-offset-md">
                Use this page when a pattern looks polished but the reviewer
                cannot trace which story proves action hierarchy, mode behavior,
                mobile order, recovery, or handoff blockers.
              </ElyPublicText>
              <ElyPublicDivider label="Boundary" align="start" />
              <ElyPublicText tone="muted">
                This atlas may link to stories and review facts. It must not
                define a second production page model or a local visual system.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-story-pattern-atlas-focus-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Risk lenses</p>
                <h2 class="ely-public-section-title">Review patterns by the thing most likely to break</h2>
              </div>
              <p>
                These lanes keep public-luxe elegant: first name the risk, then
                open the pattern that proves it.
              </p>
            </div>

            <div class="ely-story-pattern-atlas-focus-grid">
              <article
                v-for="lane in focusLanes"
                :key="lane.focus"
                class="ely-story-pattern-atlas-focus-card"
              >
                <div class="ely-story-pattern-atlas-focus-head">
                  <ElyPublicBadge tone="primary">{{ lane.rows.length }} rows</ElyPublicBadge>
                  <strong>{{ lane.label }}</strong>
                </div>
                <p>{{ lane.intent }}</p>
                <div class="ely-story-pattern-atlas-mini-list">
                  <ElyPublicLink
                    v-for="row in lane.rows"
                    :key="lane.focus + row.key"
                    :href="createStoryPath(row.entry.storyId)"
                  >
                    {{ row.entry.title }} · {{ row.action }}
                  </ElyPublicLink>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-pattern-atlas-evidence-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Evidence rows</p>
                <h2 class="ely-public-section-title">Each pattern needs action, proof, recovery, and a blocker</h2>
              </div>
              <p>
                The table is intentionally concrete so review can move faster
                than subjective mood debates.
              </p>
            </div>

            <div class="ely-story-pattern-atlas-family-list">
              <article
                v-for="lane in familyLanes"
                :key="lane.family"
                class="ely-story-pattern-atlas-family"
              >
                <div class="ely-story-pattern-atlas-family-head">
                  <h3>{{ lane.family }}</h3>
                  <ElyPublicBadge tone="accent">{{ lane.rows.length }} pattern</ElyPublicBadge>
                </div>

                <a
                  v-for="row in lane.rows"
                  :key="row.key"
                  class="ely-story-pattern-atlas-row"
                  :href="createStoryPath(row.entry.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <div class="ely-story-pattern-atlas-row-title">
                    <span>{{ row.entry.eyebrow }}</span>
                    <strong>{{ row.entry.title }}</strong>
                    <em>{{ row.entry.stat }}</em>
                  </div>
                  <dl>
                    <div>
                      <dt>User job</dt>
                      <dd>{{ row.userJob }}</dd>
                    </div>
                    <div>
                      <dt>Proof</dt>
                      <dd>{{ row.proof }}</dd>
                    </div>
                    <div>
                      <dt>Theme + mobile</dt>
                      <dd>{{ row.themeProof }} · {{ row.mobileProof }}</dd>
                    </div>
                    <div>
                      <dt>Recovery + blocker</dt>
                      <dd>{{ row.recovery }} {{ row.blocker }}</dd>
                    </div>
                  </dl>
                </a>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
