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

const familyDossierCopy: Record<
  PublicThemePack["key"],
  {
    bestFit: string[]
    blockers: string
    intent: string
    ornamentBudget: string
    rejectLine: string
    rolePromises: string[]
  }
> = {
  "azure-aria": {
    bestFit: [
      "Creator tools that need airy comparison surfaces.",
      "Data summaries where calm blue structure helps scanning.",
      "Public dashboards that should feel clear rather than corporate.",
    ],
    blockers:
      "Reject if mint becomes a second CTA or the clear surface reads like a generic enterprise blue skin.",
    intent:
      "A crystalline, open-air family for products that need precision without losing front-stage softness.",
    ornamentBudget:
      "Luminous but cool: let glass sheen mark the hero and selected proof, then keep ordinary cards quiet.",
    rejectLine:
      "If the page could be mistaken for enterprise admin after removing the hero, the family has drifted.",
    rolePromises: [
      "Surface majority stays pale, open, and readable.",
      "Primary action remains blue, not mint.",
      "Accent is a single memory glint.",
      "Status containers keep factual contrast.",
      "Material is glass atmosphere, never content.",
    ],
  },
  "elysia-default": {
    bestFit: [
      "Default public entry, creator profile, and brand landing surfaces.",
      "Member journeys that need ceremony plus readable guidance.",
      "Theme Atelier previews where the preset thesis should be strongest.",
    ],
    blockers:
      "Reject if champagne trim becomes the main action or rose accents spread into every card.",
    intent:
      "The core moonlit porcelain mood: ornate enough to feel named, disciplined enough to ship.",
    ornamentBudget:
      "Ceremonial in one hero or focal surface, luminous in key controls, quiet everywhere else.",
    rejectLine:
      "If every panel glows, none of them feels precious and the Elysia mood becomes noise.",
    rolePromises: [
      "Porcelain and midnight surfaces carry the page.",
      "Azure owns the primary path.",
      "Champagne trim stays rare and supportive.",
      "Rose is a memory point, not a palette flood.",
      "Dark mode keeps the same ceremony, not a new product.",
    ],
  },
  "enterprise-calm": {
    bestFit: [
      "Account, billing, and settings surfaces near enterprise flows.",
      "Public pages that need trust before spectacle.",
      "Mixed B/C journeys where TDesign is adjacent but not dominant.",
    ],
    blockers:
      "Reject if the public preset inherits enterprise table, panel, or button assumptions.",
    intent:
      "A bridge family for quieter public surfaces that still belongs to Public Luxe.",
    ornamentBudget:
      "Quiet to luminous: keep sheen at the edges and let spacing, type, and role clarity do most work.",
    rejectLine:
      "If it becomes TDesign with softer corners, it is no longer a public-luxe theme family.",
    rolePromises: [
      "Neutral surfaces stay warm enough for C-side use.",
      "Slate primary keeps one dependable next step.",
      "Gold support appears only at decision moments.",
      "Status tones remain calm but unmistakable.",
      "Ornament proves restraint instead of absence.",
    ],
  },
  "rose-nocturne": {
    bestFit: [
      "Editorial campaigns, seasonal events, and high-touch collections.",
      "Member reward pages where romance supports scarcity.",
      "Content-led surfaces that can afford a richer emotional tone.",
    ],
    blockers:
      "Reject if romance turns into haze, pink saturation, or low-contrast body copy.",
    intent:
      "A composed nocturne family for warmer, more intimate public moments.",
    ornamentBudget:
      "Lacquered and selective: one candlelit feature, then disciplined reading planes.",
    rejectLine:
      "If the user has to squint through romance to read the job, the theme failed.",
    rolePromises: [
      "Rose ivory and wine surfaces create the stage.",
      "Primary action keeps structural depth.",
      "Candle gold supports scarcity and reward moments.",
      "Status messages cut through the atmosphere.",
      "Editorial warmth never replaces labels.",
    ],
  },
  "dreamy-sakura": {
    bestFit: [
      "Anime-inspired landing pages and whimsical creative showcases.",
      "Playful onboarding flows that benefit from a soft, inviting tone.",
      "Celebration or seasonal surfaces where pastel warmth feels intentional.",
    ],
    blockers:
      "Reject if pastel pinks wash out interactive hierarchy or reduce readability.",
    intent:
      "A dreamy, sakura-kissed family for surfaces that celebrate whimsy with discipline.",
    ornamentBudget:
      "Petal-soft gradients on one focal surface, then let blush accents mark interaction without flooding.",
    rejectLine:
      "If the page looks like a cotton candy explosion instead of a product, the theme has drifted.",
    rolePromises: [
      "Soft cream and blossom surfaces carry the majority of the view.",
      "Primary action remains legible against pastel backgrounds.",
      "Sakura pink stays a memory accent, not a universal fill.",
      "Status containers remain crisp and unmistakable.",
      "Whimsy never compromises the information hierarchy.",
    ],
  },
}

const dossierChecks = [
  "Family intent is visible before component decoration.",
  "Light and dark previews prove the same atmosphere.",
  "Primary, secondary, accent, and status roles are not swapped.",
  "Ornament budget names where glow is allowed.",
  "Reject line is concrete enough to block a pretty regression.",
] as const

const reviewRoutes = [
  {
    key: "theme-role-matrix",
    label: "Theme Role Matrix",
    storyId: "public-luxe-foundations-theme-role-matrix--overview",
  },
  {
    key: "token-pairing-ledger",
    label: "Token Pairing Ledger",
    storyId: "public-luxe-foundations-token-pairing-ledger--overview",
  },
  {
    key: "mode-pairing-lab",
    label: "Mode Pairing Lab",
    storyId: "public-luxe-foundations-mode-pairing-lab--overview",
  },
  {
    key: "theme-readiness",
    label: "Theme Readiness",
    storyId: "public-luxe-foundations-theme-readiness--overview",
  },
  {
    key: "theme-application-recipes",
    label: "Theme Application Recipes",
    storyId: "public-luxe-foundations-theme-application-recipes--overview",
  },
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Family Dossier",
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
      const dossiers = publicThemePacks.map((theme) => ({
        ...theme,
        dossier: familyDossierCopy[theme.key],
      }))
      const promiseCount = dossiers.reduce(
        (total, item) => total + item.dossier.rolePromises.length,
        0,
      )

      return {
        createStoryPath,
        dossierChecks,
        dossiers,
        promiseCount: String(promiseCount),
        reviewRoutes,
        routeCount: String(reviewRoutes.length),
        themeCount: String(publicThemePacks.length),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme family dossier</p>
            <h1 class="ely-public-section-title">A theme family is approved when its mood has a job</h1>
            <p class="ely-public-copy">
              This dossier gives each launch family a reviewer-ready packet:
              intent, best-fit surfaces, paired mode proof, role promises,
              ornament budget, blockers, and a concrete reject line. It consumes
              ui-public-vue theme pack metadata and links to existing evidence;
              it does not create another palette, token source, or approval engine.
            </p>

            <div class="ely-story-theme-dossier-hero-grid ely-story-offset-md">
              <ElyPublicStat
                :value="themeCount"
                eyebrow="Launch families"
                helper="Each family gets a stable delivery packet."
                tone="primary"
              >
                dossiers
              </ElyPublicStat>
              <ElyPublicStat
                :value="promiseCount"
                eyebrow="Role promises"
                helper="Promises stay about responsibility, not taste."
                tone="accent"
              >
                review lines
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(dossierChecks.length)"
                eyebrow="Approval checks"
                helper="The same checks apply across all moods."
                tone="success"
              >
                family gates
              </ElyPublicStat>
              <ElyPublicStat
                :value="routeCount"
                eyebrow="Evidence routes"
                helper="Move from dossier to detailed proof."
                tone="primary"
              >
                review stops
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-theme-dossier-layout">
            <article
              v-for="theme in dossiers"
              :key="theme.key"
              class="ely-story-theme-dossier-card"
            >
              <div class="ely-story-theme-dossier-head">
                <div>
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
              </div>

              <p class="ely-story-theme-dossier-intent">{{ theme.dossier.intent }}</p>

              <div class="ely-story-theme-dossier-preview-pair" aria-label="Light and dark family proof">
                <div
                  class="ely-story-theme-dossier-preview"
                  :style="{
                    '--ely-story-dossier-accent': theme.preview.accent,
                    '--ely-story-dossier-from': theme.preview.heroFrom,
                    '--ely-story-dossier-surface': theme.preview.surface,
                    '--ely-story-dossier-to': theme.preview.heroTo,
                  }"
                >
                  <span>Light proof</span>
                  <i></i>
                  <b></b>
                </div>
                <div
                  class="ely-story-theme-dossier-preview"
                  :style="{
                    '--ely-story-dossier-accent': theme.preview.dark.accent,
                    '--ely-story-dossier-from': theme.preview.dark.heroFrom,
                    '--ely-story-dossier-surface': theme.preview.dark.surface,
                    '--ely-story-dossier-to': theme.preview.dark.heroTo,
                  }"
                >
                  <span>Dark proof</span>
                  <i></i>
                  <b></b>
                </div>
              </div>

              <div class="ely-story-theme-dossier-section">
                <strong>Best-fit surfaces</strong>
                <ul>
                  <li v-for="item in theme.dossier.bestFit" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="ely-story-theme-dossier-promise-grid">
                <div
                  v-for="promise in theme.dossier.rolePromises"
                  :key="promise"
                  class="ely-story-theme-dossier-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText>{{ promise }}</ElyPublicText>
                </div>
              </div>

              <ElyPublicDivider label="Budget and blocker" align="start" />

              <div class="ely-story-theme-dossier-budget">
                <strong>Ornament budget</strong>
                <p>{{ theme.dossier.ornamentBudget }}</p>
              </div>
              <div class="ely-story-theme-dossier-blocker">
                <strong>Blocker</strong>
                <p>{{ theme.dossier.blockers }}</p>
              </div>
              <ElyPublicText tone="muted">{{ theme.dossier.rejectLine }}</ElyPublicText>
            </article>
          </section>

          <section class="ely-story-theme-dossier-bottom">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval checklist</p>
              <h2 class="ely-public-section-title">Mood must pass the same gates as structure</h2>
              <div class="ely-story-theme-dossier-checklist ely-story-offset-md">
                <div
                  v-for="check in dossierChecks"
                  :key="check"
                  class="ely-story-theme-dossier-review-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ check }}</ElyPublicText>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from family dossier to proof</h2>
              <div class="ely-story-theme-dossier-route-list ely-story-offset-md">
                <a
                  v-for="(route, index) in reviewRoutes"
                  :key="route.key"
                  class="ely-story-theme-dossier-route"
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

          <section class="ely-public-card">
            <div class="ely-story-theme-dossier-specimen">
              <div>
                <p class="ely-public-eyebrow">Live specimen</p>
                <h2 class="ely-public-section-title">A dossier should end in an operable surface</h2>
                <p>
                  The active toolbar theme styles this specimen through public
                  tokens. It proves the dossier can land on real components
                  without local color values or oversized radius.
                </p>
              </div>
              <div class="ely-public-actions">
                <ElyPublicButton>Approve family dossier</ElyPublicButton>
                <ElyPublicButton tone="secondary">Compare mode proof</ElyPublicButton>
                <ElyPublicButton tone="ghost">Send to repair</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
