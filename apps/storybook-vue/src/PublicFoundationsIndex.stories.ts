import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const foundationEntries = publicShowcaseEntries.filter(
  (entry) => entry.category === "system",
)

const approvalLanes = [
  {
    intent:
      "Confirm the preset thesis, theme ownership, and semantic token contract before judging visual polish.",
    keys: [
      "design-principles",
      "design-review-checklist",
      "release-gate-dashboard",
      "radius-color-discipline",
      "theme-failure-gallery",
      "theme-tokens",
      "theme-system-spec",
      "token-pairing-ledger",
      "theme-role-matrix",
      "theme-family-dossier",
      "theme-selection-playbook",
      "theme-composition",
      "theme-readiness",
      "theme-customization-guardrails",
      "mode-pairing-lab",
      "theme-application-recipes",
    ],
    label: "Contract and theme",
    risk: "Color drift / duplicated token truth",
  },
  {
    intent:
      "Review primitive anatomy, usage choice, component coverage, and interaction states before approving page patterns.",
    keys: [
      "component-anatomy",
      "component-usage-matrix",
      "component-composition-matrix",
      "component-index",
      "component-acceptance-board",
      "component-handoff-dossier",
      "component-api-reference",
      "component-variant-matrix",
      "component-state-matrix",
      "component-scenario-atlas",
      "component-operability-board",
      "component-failure-gallery",
      "interaction-states",
      "action-hierarchy",
    ],
    label: "Component review",
    risk: "Shallow stories / unclear component ownership",
  },
  {
    intent:
      "Inspect pattern grammar, surface rhythm, navigation, and data summary before composing full front-stage pages.",
    keys: [
      "pattern-composition",
      "pattern-index",
      "pattern-evidence-atlas",
      "pattern-readiness-board",
      "pattern-failure-gallery",
      "surface-rhythm",
      "navigation-wayfinding",
      "data-display-summary",
      "layout-density",
    ],
    label: "Composition rhythm",
    risk: "Card nesting / competing actions / broken responsive order",
  },
  {
    intent:
      "Approve typography, material restraint, imagery boundaries, and accessibility before adding more ornament.",
    keys: [
      "typography-voice",
      "material-motion",
      "ornament-budget",
      "imagery-iconography",
      "accessibility-inclusion",
    ],
    label: "Expression and access",
    risk: "Pretty but unclear / inaccessible ceremony",
  },
] as const

const requiredReviewQuestions = [
  "Is this page consuming owner truth from ui-public-vue or Storybook-local metadata only?",
  "Can a reviewer reach the next detailed story without guessing the sidebar route?",
  "Does the page name a risk that would block approval if it regressed?",
  "Does the page keep ordinary radius within the public-luxe scale?",
] as const

const getEntriesByKeys = (keys: readonly string[]) =>
  keys
    .map((key) => foundationEntries.find((entry) => entry.key === key))
    .filter((entry): entry is (typeof foundationEntries)[number] =>
      Boolean(entry),
    )

const meta = {
  title: "Public Luxe/Foundations/Index",
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
      const lanes = approvalLanes.map((lane) => ({
        ...lane,
        entries: getEntriesByKeys(lane.keys),
      }))
      const linkedEntryCount = lanes.reduce(
        (total, lane) => total + lane.entries.length,
        0,
      )

      return {
        createStoryPath,
        foundationEntries,
        foundationEntryCount: String(foundationEntries.length),
        laneCount: String(lanes.length),
        lanes,
        linkedEntryCount: String(linkedEntryCount),
        requiredReviewQuestions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-foundation-index-hero">
            <p class="ely-public-eyebrow">Foundations index</p>
            <h1 class="ely-public-section-title">Governance should be reviewable before it becomes beautiful</h1>
            <p class="ely-public-copy">
              This index turns the Foundations layer into an approval map. It
              does not own tokens, APIs, routes, or production copy; it shows
              reviewers which rule page, component board, or pattern evidence
              board to open, what risk it blocks, and where the next evidence lives.
            </p>

            <div class="ely-story-foundation-index-stats" aria-label="Foundations governance coverage">
              <ElyPublicStat
                :value="foundationEntryCount"
                eyebrow="Governance entries"
                helper="Rules and review surfaces visible from one index."
                tone="primary"
              >
                foundation stops
              </ElyPublicStat>
              <ElyPublicStat
                :value="laneCount"
                eyebrow="Approval lanes"
                helper="Review order before page-level polish."
                tone="accent"
              >
                risk lanes
              </ElyPublicStat>
              <ElyPublicStat
                :value="linkedEntryCount"
                eyebrow="Linked evidence"
                helper="Every lane points to concrete Storybook entries."
                tone="success"
              >
                story links
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-foundation-index-layout">
            <article class="ely-story-foundation-index-lane-panel">
              <p class="ely-public-eyebrow">Approval order</p>
              <h2 class="ely-public-section-title">Review by risk, not by sidebar habit</h2>
              <div class="ely-story-foundation-index-lanes ely-story-offset-md">
                <article
                  v-for="(lane, index) in lanes"
                  :key="lane.label"
                  class="ely-story-foundation-index-lane"
                >
                  <div class="ely-story-foundation-index-lane-head">
                    <span>0{{ index + 1 }}</span>
                    <div>
                      <h3>{{ lane.label }}</h3>
                      <p>{{ lane.intent }}</p>
                    </div>
                  </div>
                  <ElyPublicBadge tone="warning">{{ lane.risk }}</ElyPublicBadge>
                  <div class="ely-story-foundation-index-link-list">
                    <ElyPublicLink
                      v-for="entry in lane.entries"
                      :key="entry.key"
                      :href="createStoryPath(entry.storyId)"
                    >
                      {{ entry.title }}
                    </ElyPublicLink>
                  </div>
                </article>
              </div>
            </article>

            <article class="ely-story-foundation-index-question-panel">
              <p class="ely-public-eyebrow">Approval questions</p>
              <h2 class="ely-public-section-title">A rule page must answer why it exists</h2>
              <div class="ely-story-foundation-index-questions ely-story-offset-md">
                <div
                  v-for="question in requiredReviewQuestions"
                  :key="question"
                  class="ely-story-foundation-index-question"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ question }}</ElyPublicText>
                </div>
              </div>
              <ElyPublicDivider label="Next review" align="start" />
              <ElyPublicText tone="muted">
                If a rule page cannot answer these questions, it should be
                tightened before adding more page patterns or decorative states.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-story-foundation-index-map-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Foundation story map</p>
                <h2 class="ely-public-section-title">Every governance stop has an owner-aware route</h2>
              </div>
              <p>
                The route list is intentionally mechanical: it gives reviewers
                fast access across foundations, component evidence, and pattern
                readiness without turning Storybook into a second token or API registry.
              </p>
            </div>
            <div class="ely-story-foundation-index-entry-grid">
              <a
                v-for="entry in foundationEntries"
                :key="entry.key"
                class="ely-story-foundation-index-entry"
                :href="createStoryPath(entry.storyId)"
                target="_top"
                rel="noreferrer"
              >
                <span>{{ entry.eyebrow }}</span>
                <strong>{{ entry.title }}</strong>
                <p>{{ entry.description }}</p>
                <em>{{ entry.stat }}</em>
              </a>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
