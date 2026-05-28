import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const responsivePrinciples = [
  {
    body: "Desktop can show comparison and supporting facts; mobile should preserve the same decision order, not simply shrink the grid.",
    label: "Decision order first",
  },
  {
    body: "A ceremonial block may become a compact stack on mobile, but primary action, current state, and recovery path stay visible.",
    label: "Priority survives width",
  },
  {
    body: "Density changes spacing and grouping, not color roles, radius scale, or component semantics.",
    label: "Density is rhythm",
  },
  {
    body: "When space collapses, remove decorative side content before hiding controls or state feedback.",
    label: "Trim ornament first",
  },
] as const

const layoutBands = [
  {
    copy: "Hero, membership, reward, and curated theme moments.",
    density: "Ceremonial",
    layout: "Wide editorial surface",
  },
  {
    copy: "Default account, preference, profile, gallery, and light creator flows.",
    density: "Comfortable",
    layout: "Two-column decision area",
  },
  {
    copy: "Dense creator tools, review lanes, settings, and high-frequency forms.",
    density: "Compact",
    layout: "Single decision lane",
  },
] as const

const mobileRules = [
  "Keep the primary action within the first meaningful viewport.",
  "Collapse supporting stats after the decision, not before it.",
  "Replace side rails with inline sections before creating drawers.",
  "Use dividers and headings to preserve scan rhythm after stacking.",
] as const

const reviewChecklist = [
  "Can the mobile view be read in the same decision order as desktop?",
  "Does compact density keep touch targets and focus states usable?",
  "Did we remove ornament before removing useful context?",
  "Do all layout variants still obey the same radius, color, and surface rules?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Layout & Density",
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
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        layoutBands,
        mobileRules,
        responsivePrinciples,
        reviewChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Layout & density</p>
            <h1 class="ely-public-section-title">Responsive elegance keeps the decision intact</h1>
            <p class="ely-public-copy">
              Public Luxe should remain graceful from ceremonial desktop layouts
              to compact mobile flows. Breakpoints may change rhythm, but they
              must not change theme roles, action priority, or component semantics.
            </p>

            <div class="ely-story-layout-principle-grid" aria-label="Responsive layout principles">
              <article
                v-for="principle in responsivePrinciples"
                :key="principle.label"
                class="ely-story-layout-principle"
              >
                <strong>{{ principle.label }}</strong>
                <p>{{ principle.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-layout-comparison">
            <article class="ely-story-layout-desktop">
              <p class="ely-public-eyebrow">Desktop rhythm</p>
              <h2>Theme review workspace</h2>
              <ElyPublicText tone="muted">
                Desktop can hold a primary decision surface with supporting
                facts beside it. The focal area still owns the next step.
              </ElyPublicText>
              <div class="ely-story-layout-stat-grid">
                <ElyPublicStat
                  value="04"
                  eyebrow="Families"
                  helper="All paired with dark mode."
                  tone="primary"
                >
                  launch themes
                </ElyPublicStat>
                <ElyPublicStat
                  value="03"
                  eyebrow="Density"
                  helper="Ceremonial, comfortable, compact."
                  tone="accent"
                >
                  rhythm bands
                </ElyPublicStat>
              </div>
              <ElyPublicDivider label="Decision" align="start" />
              <div class="ely-public-actions">
                <ElyPublicButton>Approve layout</ElyPublicButton>
                <ElyPublicButton tone="ghost">Review mobile stack</ElyPublicButton>
              </div>
            </article>

            <article class="ely-story-layout-phone" aria-label="Mobile layout specimen">
              <div class="ely-story-layout-phone-bar" aria-hidden="true"></div>
              <p class="ely-public-eyebrow">Mobile stack</p>
              <h3>Theme review</h3>
              <ElyPublicText size="sm" tone="muted">
                The same decision appears first; supporting facts follow.
              </ElyPublicText>
              <div class="ely-story-layout-phone-actions">
                <ElyPublicButton>Approve</ElyPublicButton>
                <ElyPublicBadge tone="primary">Ready</ElyPublicBadge>
              </div>
              <ElyPublicProgress
                label="Stack readiness"
                :value="88"
                tone="success"
              />
            </article>
          </section>

          <section class="ely-story-layout-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Density bands</p>
              <h2 class="ely-public-section-title">Choose density by task pressure</h2>
              <div class="ely-story-layout-band-list ely-story-offset-md">
                <div
                  v-for="band in layoutBands"
                  :key="band.density"
                  class="ely-story-layout-band"
                >
                  <span>{{ band.layout }}</span>
                  <strong>{{ band.density }}</strong>
                  <p>{{ band.copy }}</p>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Mobile rules</p>
              <h2 class="ely-public-section-title">Stack without losing intent</h2>
              <div class="ely-story-layout-rule-list ely-story-offset-md">
                <div
                  v-for="rule in mobileRules"
                  :key="rule"
                  class="ely-story-layout-rule"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Approve layout after resizing it</h2>
            <div class="ely-story-layout-checklist ely-story-offset-md">
              <div
                v-for="item in reviewChecklist"
                :key="item"
                class="ely-story-layout-check"
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
