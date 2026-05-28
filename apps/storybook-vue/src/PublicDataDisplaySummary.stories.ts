import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const summaryRules = [
  {
    body: "Stats should read as a decision aid, not a poster. Keep the value concise and the label explicit.",
    label: "Stat is for judgment",
  },
  {
    body: "Progress should pair the bar with a task label and supporting context so color is never the only signal.",
    label: "Progress tells a story",
  },
  {
    body: "Badges summarize status or category. They can frame the summary, but they should not replace the summary.",
    label: "Badge is supporting evidence",
  },
  {
    body: "Divider labels should mark rhythm changes in a calm way, not compete with headings or actions.",
    label: "Divider keeps cadence",
  },
] as const

const metricClusters = [
  {
    helper:
      "Theme family, pattern coverage, and governance entries stay visible together.",
    label: "Theme coverage",
    value: "04 families",
  },
  {
    helper: "Current review state across stories, components, and patterns.",
    label: "Review health",
    value: "92%",
  },
  {
    helper:
      "Only one active release lane is expected at a time in a calm surface.",
    label: "Active focus",
    value: "01 lane",
  },
] as const

const signalRows = [
  {
    badge: "Stable",
    description:
      "Theme tokens and launch families keep their light/dark pairings in sync.",
    title: "Theme pairings",
  },
  {
    badge: "Review",
    description:
      "Component docs are complete, but a few pattern states still need broader usage coverage.",
    title: "Component coverage",
  },
  {
    badge: "Watch",
    description:
      "Action hierarchy is governed, but future patterns should still preserve the same button order.",
    title: "Action order",
  },
] as const

const checklist = [
  "Can the user read the summary without opening a chart?",
  "Does every metric explain what the number means?",
  "Are progress values and labels paired so the state survives color loss?",
  "Do badges clarify context instead of inventing a second call to action?",
  "Does the layout keep one dominant signal and quieter support blocks?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Data Display & Summary",
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
      ElyPublicDivider,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        checklist,
        metricClusters,
        signalRows,
        summaryRules,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Data display & summary</p>
            <h1 class="ely-public-section-title">Summary surfaces should feel like good judgment, not noise</h1>
            <p class="ely-public-copy">
              Public-luxe data display works best when the user can read the
              state at a glance: metrics, progress, badges, and terse
              supporting text should all describe the same condition from
              different angles.
            </p>

            <div class="ely-story-data-rule-grid" aria-label="Data display rules">
              <article
                v-for="rule in summaryRules"
                :key="rule.label"
                class="ely-story-data-rule-card"
              >
                <strong>{{ rule.label }}</strong>
                <p>{{ rule.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-data-layout">
            <article class="ely-story-data-hero">
              <p class="ely-public-eyebrow">Overview lane</p>
              <h2>Read the state before the details</h2>
              <div class="ely-story-data-stat-grid">
                <ElyPublicStat
                  v-for="metric in metricClusters"
                  :key="metric.label"
                  :eyebrow="metric.label"
                  :helper="metric.helper"
                  tone="primary"
                  :value="metric.value"
                />
              </div>
              <div class="ely-story-data-progress-grid">
                <ElyPublicProgress
                  label="Theme review"
                  tone="primary"
                  :value="92"
                />
                <ElyPublicProgress
                  label="Component docs"
                  tone="success"
                  :value="88"
                />
                <ElyPublicProgress
                  label="Pattern coverage"
                  tone="warning"
                  :value="64"
                />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Signal stack</p>
              <h2 class="ely-public-section-title">Use badges as evidence, not decoration</h2>
              <div class="ely-story-data-signal-list ely-story-offset-md">
                <div
                  v-for="signal in signalRows"
                  :key="signal.title"
                  class="ely-story-data-signal"
                >
                  <div class="ely-story-data-signal-head">
                    <strong>{{ signal.title }}</strong>
                    <ElyPublicBadge tone="primary">{{ signal.badge }}</ElyPublicBadge>
                  </div>
                  <ElyPublicText tone="muted">
                    {{ signal.description }}
                  </ElyPublicText>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-data-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rhythm control</p>
              <h2 class="ely-public-section-title">Divider labels can pace the summary</h2>
              <ElyPublicDivider label="Active release lane" align="start" />
              <div class="ely-story-data-inline">
                <ElyPublicBadge tone="accent">Release ready</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">1 lane active</ElyPublicBadge>
                <ElyPublicBadge tone="primary">92% review health</ElyPublicBadge>
              </div>
              <ElyPublicDivider label="Exception lane" align="start" tone="accent" />
              <ElyPublicAlert
                eyebrow="Watch point"
                title="Pattern coverage still needs more usage depth"
                tone="warning"
              >
                The theme system is consistent, but a few patterns should
                collect more real usage before they become the default
                presentation path.
              </ElyPublicAlert>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review checklist</p>
              <h2 class="ely-public-section-title">Summary quality is judged by clarity, not ornament</h2>
              <div class="ely-story-data-checklist ely-story-offset-md">
                <div
                  v-for="item in checklist"
                  :key="item"
                  class="ely-story-data-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
