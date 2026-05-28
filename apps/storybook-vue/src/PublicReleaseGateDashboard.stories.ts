import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { publicComponentScenarioCoverage } from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const releaseGateRows = [
  {
    decision: "Pass",
    evidenceKeys: [
      "token-pairing-ledger",
      "theme-role-matrix",
      "theme-family-dossier",
      "theme-selection-playbook",
      "theme-readiness",
      "mode-pairing-lab",
      "theme-application-recipes",
    ],
    label: "Theme family",
    proof:
      "Launch themes have family fit, paired mode proof, and page-level role recipes.",
    risk: "Approving a theme from a pretty single-mode screenshot.",
    badgeTone: "primary",
    tone: "success",
  },
  {
    decision: "Pass",
    evidenceKeys: [
      "radius-color-discipline",
      "theme-failure-gallery",
      "ornament-budget",
    ],
    label: "Visual discipline",
    proof:
      "Color jobs, radius scale, rejected examples, and ornament budgets are reviewable.",
    risk: "Letting local polish create a second palette or rounded-card language.",
    badgeTone: "primary",
    tone: "success",
  },
  {
    decision: "Watch",
    evidenceKeys: [
      "component-index",
      "component-acceptance-board",
      "component-handoff-dossier",
      "component-api-reference",
      "component-variant-matrix",
      "component-state-matrix",
      "component-scenario-atlas",
      "component-operability-board",
      "component-usage-matrix",
      "component-composition-matrix",
      "component-anatomy",
    ],
    label: "Component evidence",
    proof:
      "Every public primitive has owner docs, anatomy, detailed scenario entries, and risky-state proof.",
    risk: "Adding new components before existing primitives prove their user jobs.",
    badgeTone: "accent",
    tone: "warning",
  },
  {
    decision: "Watch",
    evidenceKeys: [
      "pattern-index",
      "pattern-evidence-atlas",
      "pattern-readiness-board",
      "pattern-composition",
      "surface-rhythm",
    ],
    label: "Pattern readiness",
    proof:
      "Current patterns show action path, proof, recovery, handoff blockers, and composition rhythm.",
    risk: "Treating page samples as production routing or business model truth.",
    badgeTone: "accent",
    tone: "warning",
  },
  {
    decision: "Block if missing",
    evidenceKeys: [
      "component-operability-board",
      "component-state-matrix",
      "accessibility-inclusion",
      "interaction-states",
      "action-hierarchy",
    ],
    label: "Operability",
    proof:
      "Keyboard, focus, state, and action hierarchy checks must be visible before release.",
    risk: "A luminous surface that cannot be operated, repaired, or explained.",
    badgeTone: "danger",
    tone: "danger",
  },
] as const

const releaseReviewSequence = [
  "Pick one theme family and prove both light and dark modes before touching page polish.",
  "Check color, radius, and ornament blockers before approving any custom surface.",
  "Open the component index and operability board instead of approving from a showcase tile.",
  "Open pattern readiness only after primitive behavior and action hierarchy are clear.",
  "Block release if focus, invalid, loading, disabled, or recovery states are absent.",
] as const

const evidenceChainKeys = [
  "theme-system-spec",
  "token-pairing-ledger",
  "theme-role-matrix",
  "theme-family-dossier",
  "theme-selection-playbook",
  "theme-readiness",
  "component-operability-board",
  "component-state-matrix",
  "pattern-evidence-atlas",
  "pattern-readiness-board",
  "theme-failure-gallery",
] as const

const evidenceByKey = new Map(
  publicShowcaseEntries.map((entry) => [entry.key, entry]),
)

const resolveEvidence = (keys: readonly string[]) =>
  keys
    .map((key) => evidenceByKey.get(key))
    .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
      Boolean(entry),
    )

const componentCount = Object.keys(publicComponentDocs).length
const scenarioCount = publicComponentScenarioCoverage.reduce(
  (total, coverage) => total + coverage.scenarios.length,
  0,
)
const patternCount = publicShowcaseEntries.filter(
  (entry) => entry.category === "pattern",
).length

const meta = {
  title: "Public Luxe/Foundations/Release Gate Dashboard",
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
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const gateRows = releaseGateRows.map((gate) => ({
        ...gate,
        evidence: resolveEvidence(gate.evidenceKeys),
      }))
      const passCount = gateRows.filter(
        (gate) => gate.decision === "Pass",
      ).length
      const watchCount = gateRows.filter(
        (gate) => gate.decision === "Watch",
      ).length
      const blockCount = gateRows.filter((gate) =>
        gate.decision.startsWith("Block"),
      ).length
      const approvalScore = Math.round(
        ((passCount + watchCount * 0.5) / gateRows.length) * 100,
      )
      const evidenceChain = resolveEvidence(evidenceChainKeys)

      return {
        approvalScore,
        blockCount: String(blockCount),
        componentCount: String(componentCount),
        createStoryPath,
        evidenceChain,
        gateRows,
        patternCount: String(patternCount),
        releaseReviewSequence,
        scenarioCount: String(scenarioCount),
        themeCount: String(publicThemePacks.length),
        watchCount: String(watchCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-release-hero-panel">
            <p class="ely-public-eyebrow">Release gate dashboard</p>
            <h1 class="ely-public-section-title">Approve the system by evidence, not by mood</h1>
            <p class="ely-public-copy">
              This dashboard is the compact release review surface for Public
              Luxe. It does not own tokens, components, routes, or production
              business rules; it points reviewers to the evidence that must pass
              before a theme or pattern is treated as launch-ready.
            </p>

            <div class="ely-story-release-hero ely-story-offset-md">
              <div class="ely-story-release-score" aria-label="Release evidence score">
                <span>{{ approvalScore }}%</span>
                <ElyPublicProgress
                  :value="approvalScore"
                  label="Evidence readiness"
                  tone="success"
                />
                <ElyPublicText tone="muted">
                  Pass gates count fully; watch gates count as partial evidence.
                </ElyPublicText>
              </div>
              <div class="ely-story-release-stat-grid">
                <ElyPublicStat
                  :value="themeCount"
                  eyebrow="Theme families"
                  helper="Launch families reviewed as paired modes."
                  tone="primary"
                >
                  governed packs
                </ElyPublicStat>
                <ElyPublicStat
                  :value="componentCount"
                  eyebrow="Components"
                  helper="Owner-documented public primitives."
                  tone="accent"
                >
                  reviewed primitives
                </ElyPublicStat>
                <ElyPublicStat
                  :value="scenarioCount"
                  eyebrow="Detailed scenarios"
                  helper="Component-level evidence beyond showcase tiles."
                  tone="primary"
                >
                  story proofs
                </ElyPublicStat>
                <ElyPublicStat
                  :value="patternCount"
                  eyebrow="Patterns"
                  helper="Front-stage examples with recovery evidence."
                  tone="muted"
                >
                  composition proofs
                </ElyPublicStat>
              </div>
            </div>
          </section>

          <section class="ely-story-release-grid">
            <article
              v-for="gate in gateRows"
              :key="gate.label"
              class="ely-story-release-gate"
              :data-tone="gate.tone"
            >
              <div class="ely-story-release-gate-head">
                <div>
                  <span>{{ gate.label }}</span>
                  <h2>{{ gate.decision }}</h2>
                </div>
                <ElyPublicBadge :tone="gate.badgeTone">{{ gate.decision }}</ElyPublicBadge>
              </div>
              <ElyPublicText>{{ gate.proof }}</ElyPublicText>
              <ElyPublicText tone="muted">{{ gate.risk }}</ElyPublicText>
              <div class="ely-story-release-evidence">
                <ElyPublicLink
                  v-for="entry in gate.evidence"
                  :key="entry.key"
                  :href="createStoryPath(entry.storyId)"
                >
                  {{ entry.title }}
                </ElyPublicLink>
              </div>
            </article>
          </section>

          <section class="ely-story-release-chain-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Evidence chain</p>
                <h2 class="ely-public-section-title">Trace approval from contract to repair</h2>
              </div>
              <p>
                Release review should move through owner truth, launch proof,
                risky component behavior, pattern handoff, and rejected examples.
              </p>
            </div>
            <div class="ely-story-release-chain">
              <a
                v-for="(entry, index) in evidenceChain"
                :key="entry.key"
                class="ely-story-release-chain-item"
                :href="createStoryPath(entry.storyId)"
                target="_top"
                rel="noreferrer"
              >
                <span>0{{ index + 1 }}</span>
                <strong>{{ entry.title }}</strong>
                <p>{{ entry.description }}</p>
              </a>
            </div>
          </section>

          <section class="ely-story-release-layout">
            <article class="ely-story-release-sequence-panel">
              <p class="ely-public-eyebrow">Review sequence</p>
              <h2 class="ely-public-section-title">Do not skip straight to ornament</h2>
              <div class="ely-story-release-sequence ely-story-offset-md">
                <div
                  v-for="(step, index) in releaseReviewSequence"
                  :key="step"
                  class="ely-story-release-step"
                >
                  <span>0{{ index + 1 }}</span>
                  <ElyPublicText weight="semibold">{{ step }}</ElyPublicText>
                </div>
              </div>
            </article>

            <article class="ely-story-release-sentence-panel">
              <p class="ely-public-eyebrow">Release sentence</p>
              <h2 class="ely-public-section-title">The safest approval is boring to explain</h2>
              <ElyPublicText class="ely-story-offset-md">
                Public Luxe can be luminous when the reviewer can trace every
                visual decision back to a theme family, a component contract, a
                radius rule, an interaction state, and a recovery path.
              </ElyPublicText>
              <ElyPublicDivider label="Blocker" align="start" />
              <div class="ely-story-release-blocker">
                <ElyPublicBadge tone="danger">{{ blockCount }} release blocker</ElyPublicBadge>
                <ElyPublicText tone="muted">
                  Missing operability evidence blocks release even if the screen
                  looks visually complete.
                </ElyPublicText>
              </div>
              <div class="ely-story-release-blocker">
                <ElyPublicBadge tone="accent">{{ watchCount }} watch gates</ElyPublicBadge>
                <ElyPublicText tone="muted">
                  Watch gates are acceptable for phase-one review, but they must
                  link to concrete evidence before more variants are added.
                </ElyPublicText>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
