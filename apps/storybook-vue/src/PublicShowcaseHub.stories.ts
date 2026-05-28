import {
  ElyPublicBadge,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"
import { useResolvedPublicThemePacks } from "./publicThemeArtwork"

const showcaseCategoryLabels = {
  entry: "Entry",
  pattern: "Pattern",
  system: "System",
} as const

const getEntryByKey = (key: string) =>
  publicShowcaseEntries.find((entry) => entry.key === key)

const buildCategoryCoverage = () =>
  (
    Object.keys(showcaseCategoryLabels) as Array<
      keyof typeof showcaseCategoryLabels
    >
  ).map((category) => {
    const entries = publicShowcaseEntries.filter(
      (entry) => entry.category === category,
    )

    return {
      category,
      count: entries.length,
      detail:
        category === "system"
          ? "Foundations, token rules, component governance, and review gates."
          : category === "pattern"
            ? "Front-stage flows that prove atmosphere, recovery, and action order."
            : "Brand, theme gallery, and curated navigation entry points.",
      label: showcaseCategoryLabels[category],
    }
  })

const reviewGatewayKeys = [
  "foundations-index",
  "component-index",
  "component-api-reference",
  "component-variant-matrix",
  "component-state-matrix",
  "component-scenario-atlas",
  "pattern-evidence-atlas",
  "design-review-checklist",
  "theme-atelier",
] as const

const reviewRiskLanes = [
  {
    detail:
      "No page should invent a local palette, radius scale, or mode behavior.",
    label: "Theme drift",
  },
  {
    detail:
      "Every public primitive should expose usage guidance, states, and scenarios.",
    label: "Shallow component docs",
  },
  {
    detail:
      "Patterns must keep one primary decision path and visible recovery routes.",
    label: "Noisy page composition",
  },
  {
    detail:
      "Ornament is approved only after focus, contrast, state, and copy are usable.",
    label: "Pretty but inaccessible",
  },
] as const

const meta = {
  title: "Public Luxe/Showcase/Showcase Hub",
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
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const themePacks = useResolvedPublicThemePacks()
      const categoryCoverage = buildCategoryCoverage()
      const reviewGateways = reviewGatewayKeys
        .map((key) => getEntryByKey(key))
        .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
          Boolean(entry),
        )

      return {
        categoryCoverage,
        createStoryPath,
        entries: publicShowcaseEntries,
        reviewSteps: [
          {
            copy: "Confirm family, mode, semantic slots, and dark-mode rhythm.",
            label: "Foundations",
          },
          {
            copy: "Scan primitive states before judging a full page composition.",
            label: "Components",
          },
          {
            copy: "Validate product atmosphere in realistic front-stage flows.",
            label: "Patterns",
          },
          {
            copy: "Use the hub as a polished map, not a second source of truth.",
            label: "Showcase",
          },
        ],
        patterns: publicShowcaseEntries.filter(
          (entry) => entry.category === "pattern",
        ),
        reviewGateways,
        reviewRiskLanes,
        systems: publicShowcaseEntries.filter(
          (entry) => entry.category !== "pattern",
        ),
        themePacks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero">
            <div>
              <p class="ely-public-eyebrow">Showcase hub</p>
              <h1 class="ely-public-title">
                Browse the preset as a
                <span class="ely-public-title-accent">theme system, not a pile of stories</span>
              </h1>
              <p class="ely-public-copy">
                This hub takes the role your earlier DemoHub played in the
                reference project: one polished entry surface for brand thesis,
                token review, component baselines, and front-stage patterns.
              </p>
              <div class="ely-story-review-rail" aria-label="Recommended review order">
                <div
                  v-for="(step, index) in reviewSteps"
                  :key="step.label"
                  class="ely-story-review-step"
                >
                  <span class="ely-story-review-index">0{{ index + 1 }}</span>
                  <span class="ely-story-review-label">{{ step.label }}</span>
                  <span class="ely-story-review-copy">{{ step.copy }}</span>
                </div>
              </div>
              <div class="ely-public-actions">
                <a class="ely-public-button" :href="createStoryPath('public-luxe-showcase-brand-showcase--landing')" target="_top" rel="noreferrer">
                  Open landing story
                </a>
                <a class="ely-public-button ely-public-button--ghost" :href="createStoryPath('public-luxe-foundations-theme-gallery--overview')" target="_top" rel="noreferrer">
                  Open theme gallery
                </a>
              </div>
            </div>

            <div class="ely-public-preview-stat-row">
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">{{ entries.length }}</span>
                <span class="ely-public-preview-stat-label">Curated showcase stops</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">{{ themePacks.length }}</span>
                <span class="ely-public-preview-stat-label">Theme families</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">{{ patterns.length }}</span>
                <span class="ely-public-preview-stat-label">Front-stage patterns</span>
              </div>
            </div>
          </section>

          <section class="ely-story-hub-review">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Review cockpit</p>
                <h2 class="ely-public-section-title">Make the approval path visible before entering the gallery</h2>
              </div>
              <p>
                The hub should answer what is covered, what can block approval,
                and which story a reviewer opens next. It summarizes Storybook
                evidence without becoming the source of component or theme truth.
              </p>
            </div>

            <div class="ely-story-hub-cockpit">
              <div class="ely-story-hub-coverage" aria-label="Showcase coverage by lane">
                <ElyPublicStat
                  v-for="coverage in categoryCoverage"
                  :key="coverage.category"
                  :value="String(coverage.count)"
                  :eyebrow="coverage.label"
                  :helper="coverage.detail"
                  :tone="coverage.category === 'pattern' ? 'accent' : coverage.category === 'system' ? 'primary' : 'success'"
                >
                  story stops
                </ElyPublicStat>
              </div>

              <div class="ely-story-hub-gateways">
                <article class="ely-story-hub-panel">
                  <p class="ely-public-eyebrow">Approval gateways</p>
                  <div class="ely-story-hub-route-list">
                    <a
                      v-for="entry in reviewGateways"
                      :key="entry.key"
                      class="ely-story-hub-route"
                      :href="createStoryPath(entry.storyId)"
                      target="_top"
                      rel="noreferrer"
                    >
                      <span>{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <em>{{ entry.stat }}</em>
                    </a>
                  </div>
                </article>

                <article class="ely-story-hub-panel" data-tone="risk">
                  <p class="ely-public-eyebrow">Blocking risks</p>
                  <div class="ely-story-hub-risk-list">
                    <div
                      v-for="risk in reviewRiskLanes"
                      :key="risk.label"
                      class="ely-story-hub-risk"
                    >
                      <ElyPublicBadge tone="warning">{{ risk.label }}</ElyPublicBadge>
                      <ElyPublicText tone="muted">{{ risk.detail }}</ElyPublicText>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="ely-story-hub-lane">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">System lanes</p>
                <h2 class="ely-public-section-title">Start with the preset and review surfaces in order</h2>
              </div>
              <p>
                These stops keep the system grounded: first read the contract,
                then inspect tokens and primitives before judging page emotion.
              </p>
            </div>
            <div class="ely-story-link-grid">
              <a
                v-for="entry in systems"
                :key="entry.key"
                class="ely-story-link-card"
                :data-category="entry.category"
                :href="createStoryPath(entry.storyId)"
                target="_top"
                rel="noreferrer"
              >
                <div class="ely-story-link-top">
                  <span class="ely-story-link-eyebrow">{{ entry.eyebrow }}</span>
                  <span class="ely-story-link-badge">{{ entry.badge }}</span>
                </div>
                <h3>{{ entry.title }}</h3>
                <p>{{ entry.description }}</p>
                <div class="ely-story-link-meta">
                  <span class="ely-story-link-stat">{{ entry.stat }}</span>
                  <span class="ely-story-link-route">{{ entry.storyId }}</span>
                </div>
              </a>
            </div>
          </section>

          <section class="ely-story-hub-lane">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Pattern lanes</p>
                <h2 class="ely-public-section-title">Then validate atmosphere in real page structures</h2>
              </div>
              <p>
                Patterns are deliberately downstream. They prove the theme can
                carry real front-stage intent without becoming the canonical owner.
              </p>
            </div>
            <div class="ely-story-link-grid">
              <a
                v-for="entry in patterns"
                :key="entry.key"
                class="ely-story-link-card"
                :data-category="entry.category"
                :href="createStoryPath(entry.storyId)"
                target="_top"
                rel="noreferrer"
              >
                <div class="ely-story-link-top">
                  <span class="ely-story-link-eyebrow">{{ entry.eyebrow }}</span>
                  <span class="ely-story-link-badge">{{ entry.badge }}</span>
                </div>
                <h3>{{ entry.title }}</h3>
                <p>{{ entry.description }}</p>
                <div class="ely-story-link-meta">
                  <span class="ely-story-link-stat">{{ entry.stat }}</span>
                  <span class="ely-story-link-route">{{ entry.storyId }}</span>
                </div>
              </a>
            </div>
          </section>

          <section class="ely-story-theme-strip">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Theme roster</p>
                <h2 class="ely-public-section-title">Four governed families, one preset contract</h2>
              </div>
              <p>
                Theme cards are a mood index only. Tokens and runtime behavior
                still live in <code>ui-public-vue</code>.
              </p>
            </div>
            <div class="ely-story-preview-grid ely-story-preview-grid--compact">
              <article
                v-for="theme in themePacks"
                :key="theme.key"
                class="ely-story-preview-card"
                :data-theme-key="theme.key"
                :style="{
                  '--ely-story-preview-accent': theme.preview.accent,
                  '--ely-story-preview-from': theme.preview.heroFrom,
                  '--ely-story-preview-surface': theme.preview.surface,
                  '--ely-story-preview-to': theme.preview.heroTo,
                }"
              >
                <div class="ely-story-preview-hero">
                  <div class="ely-story-preview-header">
                    <p class="ely-story-preview-eyebrow">family</p>
                    <h2>{{ theme.displayName }}</h2>
                  </div>
                </div>
                <div class="ely-story-preview-body">
                  <div class="ely-public-inline">
                    <ElyPublicBadge tone="accent">{{ theme.accentLabel }}</ElyPublicBadge>
                  </div>
                  <p class="ely-story-preview-copy">{{ theme.mood }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
