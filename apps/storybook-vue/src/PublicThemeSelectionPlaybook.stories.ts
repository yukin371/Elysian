import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { PublicThemePack } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath } from "./public-luxe-showcase"

const selectionLanes: Array<{
  alternate: PublicThemePack["key"]
  blocked: string
  decisionQuestion: string
  label: string
  proof: string
  recommended: PublicThemePack["key"]
}> = [
  {
    alternate: "azure-aria",
    blocked:
      "Reject rose-nocturne if the main task is dense setup or comparison.",
    decisionQuestion:
      "Is this the default public journey where brand ceremony should be strongest?",
    label: "Public launch",
    proof:
      "Use the default family when the page introduces Elysian, creators, or membership.",
    recommended: "elysia-default",
  },
  {
    alternate: "elysia-default",
    blocked: "Reject enterprise-calm if the campaign needs emotional memory.",
    decisionQuestion:
      "Is the page editorial, seasonal, reward-led, or intentionally intimate?",
    label: "Editorial campaign",
    proof:
      "Use the nocturne family only when copy, imagery, and recovery paths remain readable.",
    recommended: "rose-nocturne",
  },
  {
    alternate: "enterprise-calm",
    blocked:
      "Reject elysia-default if ceremony obscures comparison or data scanning.",
    decisionQuestion:
      "Does the user need clarity, comparison, or calm creation more than ceremony?",
    label: "Clarity workspace",
    proof:
      "Use the aria family when the surface is public but information-heavy.",
    recommended: "azure-aria",
  },
  {
    alternate: "elysia-default",
    blocked:
      "Reject azure-aria if the page starts feeling like generic admin blue.",
    decisionQuestion:
      "Is this public-facing but adjacent to account, billing, or enterprise setup?",
    label: "Bridge surface",
    proof:
      "Use the calm family to reduce ornament without inheriting enterprise component assumptions.",
    recommended: "enterprise-calm",
  },
]

const familySelectionGuidance: Record<
  PublicThemePack["key"],
  {
    chooseWhen: string
    doNotChooseWhen: string
    memoryPoint: string
    reviewerCue: string
  }
> = {
  "azure-aria": {
    chooseWhen:
      "The user compares information, edits settings, or scans structured proof.",
    doNotChooseWhen:
      "The page needs warm editorial drama or a celebratory member moment.",
    memoryPoint: "A cool glass accent that marks proof without becoming a CTA.",
    reviewerCue:
      "If the page becomes generic SaaS blue, pull it back to theme roles.",
  },
  "elysia-default": {
    chooseWhen:
      "The surface should introduce the lively Elysian public identity.",
    doNotChooseWhen:
      "The job is dense account maintenance or low-ceremony recovery.",
    memoryPoint:
      "Petal rose action, iris-blue clarity, and a small champagne sparkle.",
    reviewerCue:
      "If the bloom becomes noisy, reduce ornament before changing tokens.",
  },
  "enterprise-calm": {
    chooseWhen:
      "The page sits close to enterprise flows but still belongs to C-side.",
    doNotChooseWhen:
      "The surface needs a distinct campaign or brand-first emotional tone.",
    memoryPoint: "Quiet slate structure with just enough public warmth.",
    reviewerCue: "If it looks like TDesign with softer corners, reject it.",
  },
  "rose-nocturne": {
    chooseWhen:
      "The surface is editorial, seasonal, reward-led, or intentionally intimate.",
    doNotChooseWhen:
      "The job is high-density comparison, admin-adjacent setup, or urgent repair.",
    memoryPoint: "Rose lacquer and candle gold used as selective ceremony.",
    reviewerCue:
      "If romance reduces readability, switch family or reduce saturation.",
  },
  "dreamy-sakura": {
    chooseWhen:
      "The surface should feel whimsical, anime-inspired, or playfully inviting.",
    doNotChooseWhen:
      "The job is data-heavy comparison, serious transaction, or urgent error handling.",
    memoryPoint:
      "Sakura blossom pink as a gentle accent over soft cream surfaces.",
    reviewerCue:
      "If pastel tones wash out the primary action or hide status meaning, pull back.",
  },
}

const selectionChecks = [
  "Choose one family for the whole surface before tuning components.",
  "Name the user job and prove the chosen family supports that job.",
  "Record the alternate family so the decision is reviewable.",
  "Write the reject line before approving decorative polish.",
  "Open mode proof and token pairing before shipping the theme choice.",
] as const

const reviewRoutes = [
  {
    key: "theme-family-dossier",
    label: "Theme Family Dossier",
    storyId: "public-luxe-foundations-theme-family-dossier--overview",
  },
  {
    key: "mode-pairing-lab",
    label: "Mode Pairing Lab",
    storyId: "public-luxe-foundations-mode-pairing-lab--overview",
  },
  {
    key: "token-pairing-ledger",
    label: "Token Pairing Ledger",
    storyId: "public-luxe-foundations-token-pairing-ledger--overview",
  },
  {
    key: "theme-readiness",
    label: "Theme Readiness",
    storyId: "public-luxe-foundations-theme-readiness--overview",
  },
  {
    key: "theme-failure-gallery",
    label: "Theme Failure Gallery",
    storyId: "public-luxe-foundations-theme-failure-gallery--overview",
  },
] as const

const getTheme = (key: PublicThemePack["key"]) => {
  const theme = publicThemePacks.find((item) => item.key === key)

  if (!theme) {
    throw new Error(`Missing public theme pack: ${key}`)
  }

  return theme
}

const meta = {
  title: "Public Luxe/Foundations/Theme Selection Playbook",
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
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const lanes = selectionLanes.map((lane) => ({
        ...lane,
        alternateTheme: getTheme(lane.alternate),
        recommendedTheme: getTheme(lane.recommended),
      }))
      const familyRows = publicThemePacks.map((theme) => ({
        ...theme,
        guidance: familySelectionGuidance[theme.key],
      }))

      return {
        createStoryPath,
        familyRows,
        lanes,
        reviewRoutes,
        routeCount: String(reviewRoutes.length),
        selectionChecks,
        themeCount: String(publicThemePacks.length),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-theme-selection-hero-panel">
            <p class="ely-public-eyebrow">Theme selection playbook</p>
            <h1 class="ely-public-section-title">Choose the theme by user job before choosing the shine</h1>
            <p class="ely-public-copy">
              This playbook turns the launch families into a decision path:
              recommended family, alternate family, blocked misuse, family
              fit, and review route. It consumes ui-public-vue theme pack
              metadata and existing evidence pages; it does not create a second
              palette, routing model, or production personalization engine.
            </p>

            <div class="ely-story-theme-selection-hero-grid ely-story-offset-md">
              <ElyPublicStat
                :value="themeCount"
                eyebrow="Theme families"
                helper="Each launch family remains owner-defined."
                tone="primary"
              >
                choices
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(lanes.length)"
                eyebrow="Decision lanes"
                helper="Selection starts from user job and surface intent."
                tone="accent"
              >
                use cases
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(selectionChecks.length)"
                eyebrow="Selection checks"
                helper="Review the decision before approving polish."
                tone="success"
              >
                gates
              </ElyPublicStat>
              <ElyPublicStat
                :value="routeCount"
                eyebrow="Evidence routes"
                helper="Move from choice to proof without guessing."
                tone="primary"
              >
                proof stops
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-theme-selection-layout">
            <article
              v-for="lane in lanes"
              :key="lane.label"
              class="ely-story-theme-selection-lane"
            >
              <div class="ely-story-theme-selection-lane-head">
                <div>
                  <p class="ely-public-eyebrow">{{ lane.label }}</p>
                  <h2>{{ lane.recommendedTheme.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">Recommended</ElyPublicBadge>
              </div>

              <p>{{ lane.decisionQuestion }}</p>

              <div class="ely-story-theme-selection-choice-grid">
                <div
                  class="ely-story-theme-selection-choice"
                  :style="{
                    '--ely-story-selection-accent': lane.recommendedTheme.preview.accent,
                    '--ely-story-selection-from': lane.recommendedTheme.preview.heroFrom,
                    '--ely-story-selection-surface': lane.recommendedTheme.preview.surface,
                    '--ely-story-selection-to': lane.recommendedTheme.preview.heroTo,
                  }"
                >
                  <span>Choose</span>
                  <strong>{{ lane.recommendedTheme.accentLabel }}</strong>
                </div>
                <div
                  class="ely-story-theme-selection-choice"
                  :style="{
                    '--ely-story-selection-accent': lane.alternateTheme.preview.accent,
                    '--ely-story-selection-from': lane.alternateTheme.preview.heroFrom,
                    '--ely-story-selection-surface': lane.alternateTheme.preview.surface,
                    '--ely-story-selection-to': lane.alternateTheme.preview.heroTo,
                  }"
                >
                  <span>Alternate</span>
                  <strong>{{ lane.alternateTheme.displayName }}</strong>
                </div>
              </div>

              <ElyPublicDivider label="Selection proof" align="start" />

              <div class="ely-story-theme-selection-proof">
                <strong>Why this family</strong>
                <p>{{ lane.proof }}</p>
              </div>
              <div class="ely-story-theme-selection-blocker">
                <strong>Reject line</strong>
                <p>{{ lane.blocked }}</p>
              </div>
            </article>
          </section>

          <section class="ely-story-theme-selection-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Family fit table</p>
                <h2 class="ely-public-section-title">The four families are choices, not decoration presets</h2>
              </div>
              <p>
                Reviewers should be able to explain why a family was chosen,
                when it should be rejected, and what visual memory it owns.
              </p>
            </div>

            <div class="ely-story-theme-selection-family-grid">
              <article
                v-for="theme in familyRows"
                :key="theme.key"
                class="ely-story-theme-selection-family"
              >
                <div class="ely-story-theme-selection-family-head">
                <div>
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h3>{{ theme.displayName }}</h3>
                </div>
                  <div class="ely-story-theme-selection-family-badges">
                    <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
                    <ElyPublicBadge tone="accent">{{ theme.expressionLevel }}</ElyPublicBadge>
                  </div>
                </div>
                <div class="ely-story-theme-selection-persona">
                  <span>{{ theme.personality }}</span>
                  <p>{{ theme.bestFor }}</p>
                  <strong>{{ theme.designCue }}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Choose when</dt>
                    <dd>{{ theme.guidance.chooseWhen }}</dd>
                  </div>
                  <div>
                    <dt>Do not choose when</dt>
                    <dd>{{ theme.guidance.doNotChooseWhen }}</dd>
                  </div>
                  <div>
                    <dt>Memory point</dt>
                    <dd>{{ theme.guidance.memoryPoint }}</dd>
                  </div>
                  <div>
                    <dt>Reviewer cue</dt>
                    <dd>{{ theme.guidance.reviewerCue }}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-selection-bottom">
            <article class="ely-story-theme-selection-panel">
              <p class="ely-public-eyebrow">Selection checks</p>
              <h2 class="ely-public-section-title">A beautiful theme choice still needs a written reason</h2>
              <div class="ely-story-theme-selection-check-list ely-story-offset-md">
                <div
                  v-for="check in selectionChecks"
                  :key="check"
                  class="ely-story-theme-selection-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ check }}</ElyPublicText>
                </div>
              </div>
            </article>

            <article class="ely-story-theme-selection-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Selection only counts when proof is reachable</h2>
              <div class="ely-story-theme-selection-route-list ely-story-offset-md">
                <a
                  v-for="(route, index) in reviewRoutes"
                  :key="route.key"
                  class="ely-story-theme-selection-route"
                  :href="createStoryPath(route.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ route.label }}</strong>
                </a>
              </div>
            </article>
          </section>

          <section class="ely-story-theme-selection-panel">
            <div class="ely-story-theme-selection-specimen">
              <div>
                <p class="ely-public-eyebrow">Live selection specimen</p>
                <h2 class="ely-public-section-title">The chosen family must still operate like a product</h2>
                <p>
                  The active toolbar theme styles this specimen through public
                  tokens. If the selected mood cannot support readable copy,
                  one primary path, and a repair action, choose again.
                </p>
              </div>
              <div class="ely-public-actions">
                <ElyPublicButton>Confirm theme choice</ElyPublicButton>
                <ElyPublicButton tone="secondary">Compare alternate</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open reject line</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
