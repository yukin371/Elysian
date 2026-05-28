import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicImage,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { usePublicThemeArtwork } from "./publicThemeArtwork"

const compositionSlots = [
  {
    body: "Names the promise, current state, and one next step. It may be luminous, but it cannot hide the decision.",
    label: "Hero",
    title: "One scene-setting surface",
  },
  {
    body: "Uses Image, Avatar, or abstract artwork with controlled aspect ratio, alt text, and a clear visual role.",
    label: "Media",
    title: "Atmosphere with a job",
  },
  {
    body: "Uses Stat, Progress, Badge, and Text to explain urgency, readiness, or value without decorative numbers.",
    label: "Signal",
    title: "Readable evidence",
  },
  {
    body: "Keeps one primary action per local surface; secondary, ghost, link, and support routes stay lower.",
    label: "Action",
    title: "Decision hierarchy",
  },
  {
    body: "Uses Alert, Empty State, Divider, and support links to recover gracefully before the user is blocked.",
    label: "Recovery",
    title: "Quiet fallback path",
  },
] as const

const assemblyRules = [
  "Pick the theme family first; do not borrow accent colors from another family.",
  "Choose the single primary decision before arranging decorative media.",
  "Pair every stat or progress value with a label and helper copy.",
  "Use links for policy, archive, creator profile, billing, or support exits.",
  "If a pattern needs a new token to look coherent, stop and review the owner before styling locally.",
] as const

const patternMatrix = [
  {
    action: "Claim reward",
    media: "Identity mark",
    recovery: "History and support",
    signal: "Tier progress",
    title: "Member Rewards",
  },
  {
    action: "Read collection",
    media: "Lead artwork",
    recovery: "Archive route",
    signal: "Collection readiness",
    title: "Editorial Collection",
  },
  {
    action: "Reserve seat",
    media: "Event artwork",
    recovery: "Ticket help",
    signal: "Seat progress",
    title: "Event Landing",
  },
  {
    action: "Submit form",
    media: "Minimal or none",
    recovery: "Validation and retry",
    signal: "Completion progress",
    title: "Forms & Feedback",
  },
] as const

const meta = {
  title: "Public Luxe/Foundations/Pattern Composition",
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
      ElyPublicImage,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const artwork = usePublicThemeArtwork("landscape")

      return {
        artwork,
        assemblyRules,
        compositionSlots,
        patternMatrix,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-pattern-principle">
            <p class="ely-public-eyebrow">Pattern composition</p>
            <h1 class="ely-public-section-title">Pages are approved by composition, not decoration count</h1>
            <p class="ely-public-copy">
              Public-luxe patterns should share one grammar: hero, governed
              media, readable signal, clear action hierarchy, and quiet
              recovery. This keeps C-end pages expressive without drifting into
              unrelated one-off page skins.
            </p>

            <div class="ely-story-pattern-slot-grid" aria-label="Pattern composition slots">
              <article
                v-for="slot in compositionSlots"
                :key="slot.label"
                class="ely-story-pattern-slot"
              >
                <span>{{ slot.label }}</span>
                <strong>{{ slot.title }}</strong>
                <p>{{ slot.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-pattern-layout">
            <article class="ely-story-pattern-specimen">
              <div class="ely-story-pattern-specimen-copy">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">Primary decision</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">Support routes visible</ElyPublicBadge>
                </div>
                <p class="ely-public-eyebrow">Composed pattern specimen</p>
                <h2>One luminous surface, one next step</h2>
                <ElyPublicText tone="muted">
                  The media sets atmosphere, stats explain the state, and the
                  action row makes the next step unmistakable.
                </ElyPublicText>
                <div class="ely-public-actions">
                  <ElyPublicButton>Continue primary path</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Preview context</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Open support</ElyPublicButton>
                </div>
              </div>

              <div class="ely-story-pattern-specimen-media">
                <ElyPublicImage
                  :src="artwork"
                  alt="Abstract landscape artwork showing public-luxe pattern atmosphere"
                  aspect="wide"
                />
              </div>

              <div class="ely-story-pattern-signal-row">
                <ElyPublicStat
                  eyebrow="Readiness"
                  helper="Signal supports the decision."
                  tone="primary"
                  value="86%"
                />
                <ElyPublicStat
                  eyebrow="Recovery"
                  helper="Fallback path remains visible."
                  tone="neutral"
                  value="2 routes"
                />
              </div>

              <ElyPublicDivider label="State and recovery" align="start" />

              <ElyPublicAlert
                eyebrow="Composition note"
                title="The fallback is quiet, but not hidden"
                tone="info"
              >
                Recovery belongs near the decision surface. It should not wait
                until a user hits a dead end.
              </ElyPublicAlert>
            </article>

            <article class="ely-story-pattern-rule-panel">
              <p class="ely-public-eyebrow">Assembly rules</p>
              <h2>A repeatable order for C-end pages</h2>
              <div class="ely-story-pattern-rule-list ely-story-offset-md">
                <div
                  v-for="rule in assemblyRules"
                  :key="rule"
                  class="ely-story-pattern-rule"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ rule }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-pattern-matrix-panel">
            <div class="ely-story-pattern-section-head">
              <div>
                <p class="ely-public-eyebrow">Pattern matrix</p>
                <h2>Different scenarios, same grammar</h2>
              </div>
              <p>
                Patterns can feel distinct while preserving the same theme roles,
                radius scale, signal grammar, and action order.
              </p>
            </div>

            <div class="ely-story-pattern-matrix ely-story-offset-md">
              <article
                v-for="pattern in patternMatrix"
                :key="pattern.title"
                class="ely-story-pattern-matrix-card"
              >
                <h3>{{ pattern.title }}</h3>
                <dl>
                  <div>
                    <dt>Action</dt>
                    <dd>{{ pattern.action }}</dd>
                  </div>
                  <div>
                    <dt>Media</dt>
                    <dd>{{ pattern.media }}</dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{{ pattern.signal }}</dd>
                  </div>
                  <div>
                    <dt>Recovery</dt>
                    <dd>{{ pattern.recovery }}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>

          <section class="ely-story-pattern-layout">
            <article class="ely-story-pattern-recovery-panel">
              <p class="ely-public-eyebrow">Approved empty path</p>
              <h2>Recovery is part of the composition</h2>
              <ElyPublicText tone="muted">
                Empty and blocked states should share the same action hierarchy as successful states.
              </ElyPublicText>
              <ElyPublicEmptyState
                eyebrow="No blocked route"
                title="Nothing needs manual recovery"
              >
                When a pattern has no content, it still needs a primary
                recovery action, a support route, and readable cause copy.

                <template v-slot:actions>
                  <ElyPublicButton>Start recovery</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Read support note</ElyPublicButton>
                </template>
              </ElyPublicEmptyState>
            </article>

            <article class="ely-story-pattern-support-panel">
              <p class="ely-public-eyebrow">Support links</p>
              <h2>Links leave the pattern honestly</h2>
              <ElyPublicText tone="muted">
                Use links for cross-route exits. Do not hide unrelated owner,
                policy, billing, or archive routes inside tabs just to keep the
                page visually symmetrical.
              </ElyPublicText>
              <div class="ely-story-pattern-link-list">
                <ElyPublicLink href="/?path=/story/public-luxe-foundations-action-hierarchy--overview">
                  Review action hierarchy
                </ElyPublicLink>
                <ElyPublicLink href="/?path=/story/public-luxe-foundations-navigation-wayfinding--overview" tone="muted">
                  Review navigation rules
                </ElyPublicLink>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
