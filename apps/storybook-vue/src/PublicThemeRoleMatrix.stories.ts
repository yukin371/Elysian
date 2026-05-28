import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
  publicThemeSemanticTokenDefinitions,
} from "@elysian/ui-public-vue"
import type {
  PublicThemePack,
  PublicThemeSemanticTokenGroup,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath } from "./public-luxe-showcase"

const roleGroupCopy = {
  content: {
    label: "Readable content",
    promise: "Copy, labels, and structure stay legible before ornament speaks.",
    reviewerQuestion:
      "Can the user still read the page if every decorative layer disappears?",
  },
  emphasis: {
    label: "Action hierarchy",
    promise:
      "Primary owns the next step; secondary and accent remain supporting.",
    reviewerQuestion:
      "Is there one obvious action path, or are accent and status colors competing?",
  },
  material: {
    label: "Ornament budget",
    promise: "Sheen and glint create ceremony without replacing boundaries.",
    reviewerQuestion:
      "Does the material layer clarify hierarchy, or is it carrying missing layout logic?",
  },
  status: {
    label: "State meaning",
    promise:
      "Success, warning, danger, and info keep fixed meaning in every family.",
    reviewerQuestion:
      "Would the same status still be recognizable in light and dark mode?",
  },
  surface: {
    label: "Surface majority",
    promise:
      "Neutral surfaces carry most of the screen so luminous accents have restraint.",
    reviewerQuestion:
      "Is the majority of the page calm enough for the ceremonial moments to breathe?",
  },
} satisfies Record<
  PublicThemeSemanticTokenGroup,
  {
    label: string
    promise: string
    reviewerQuestion: string
  }
>

const familyRoleGuidance: Record<
  PublicThemePack["key"],
  {
    content: string
    emphasis: string
    material: string
    status: string
    surface: string
  }
> = {
  "azure-aria": {
    content:
      "Protect airy contrast so data and comparison views do not flatten.",
    emphasis: "Keep mint as a crystalline memory point, not the main CTA.",
    material: "Use glassy sheen lightly; clarity is the signature.",
    status: "Let status containers stay factual beside the cool atmosphere.",
    surface:
      "Favor clear sky surfaces with silver structure and generous quiet.",
  },
  "elysia-default": {
    content: "Keep moonlit copy crisp against porcelain and midnight surfaces.",
    emphasis: "Primary carries ceremony; champagne and rose stay rare trim.",
    material: "Use crystal glint for hero and selected states, then recede.",
    status: "Status meaning stays fixed so romance never hides risk.",
    surface:
      "Let porcelain and deep azure planes own the majority of the view.",
  },
  "enterprise-calm": {
    content:
      "Maintain public warmth even when the rhythm is deliberately quieter.",
    emphasis: "Use slate-blue action with restrained gold support.",
    material:
      "Reduce sheen before the surface starts reading as enterprise admin.",
    status: "Status cues should feel calm but still impossible to miss.",
    surface:
      "Neutral planes bridge account, billing, and settings without becoming bland.",
  },
  "rose-nocturne": {
    content: "Preserve readable copy so romance does not become haze.",
    emphasis: "Wine structure and candle gold support one primary story path.",
    material: "Let soft lacquer live in feature surfaces, not every card.",
    status:
      "Feedback containers must cut through the nocturne palette clearly.",
    surface:
      "Use rose ivory and wine-dark grounding as a composed editorial stage.",
  },
}

const routeSteps = [
  {
    key: "theme-system-spec",
    title: "Theme System Spec",
    storyId: "public-luxe-foundations-theme-system-spec--overview",
  },
  {
    key: "theme-readiness",
    title: "Theme Readiness",
    storyId: "public-luxe-foundations-theme-readiness--overview",
  },
  {
    key: "mode-pairing-lab",
    title: "Mode Pairing Lab",
    storyId: "public-luxe-foundations-mode-pairing-lab--overview",
  },
  {
    key: "theme-application-recipes",
    title: "Theme Application Recipes",
    storyId: "public-luxe-foundations-theme-application-recipes--overview",
  },
  {
    key: "theme-customization-guardrails",
    title: "Theme Customization Guardrails",
    storyId: "public-luxe-foundations-theme-customization-guardrails--overview",
  },
] as const

const roleOrder: PublicThemeSemanticTokenGroup[] = [
  "surface",
  "content",
  "emphasis",
  "status",
  "material",
]

const meta = {
  title: "Public Luxe/Foundations/Theme Role Matrix",
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
      const roleGroups = roleOrder.map((group) => ({
        group,
        ...roleGroupCopy[group],
        tokens: publicThemeSemanticTokenDefinitions.filter(
          (token) => token.group === group,
        ),
      }))
      const familyRows = publicThemePacks.map((theme) => ({
        ...theme,
        guidance: familyRoleGuidance[theme.key],
      }))
      const tokenCount = publicThemeSemanticTokenDefinitions.length
      const pairedTokenCount = publicThemeSemanticTokenDefinitions.filter(
        (token) => Boolean(token.pair),
      ).length

      return {
        createStoryPath,
        familyRows,
        pairedTokenCount: String(pairedTokenCount),
        roleGroups,
        routeSteps,
        themeCount: String(publicThemePacks.length),
        tokenCount: String(tokenCount),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme role matrix</p>
            <h1 class="ely-public-section-title">Every theme family changes mood, not responsibility</h1>
            <p class="ely-public-copy">
              This matrix compares the launch families by stable role jobs:
              surface majority, readable content, action hierarchy, state
              meaning, and ornament budget. It consumes ui-public-vue theme
              packs and semantic token definitions; it does not create a second
              palette, contrast algorithm, or theme approval source.
            </p>

            <div class="ely-story-theme-role-hero-grid ely-story-offset-md">
              <ElyPublicStat
                :value="themeCount"
                eyebrow="Launch families"
                helper="Each family keeps the same role jobs across light and dark mode."
                tone="primary"
              >
                theme moods
              </ElyPublicStat>
              <ElyPublicStat
                :value="String(roleGroups.length)"
                eyebrow="Role groups"
                helper="Review by responsibility instead of screenshot taste."
                tone="accent"
              >
                stable jobs
              </ElyPublicStat>
              <ElyPublicStat
                :value="tokenCount"
                eyebrow="Semantic tokens"
                helper="Definitions remain owned by ui-public-vue."
                tone="primary"
              >
                owner slots
              </ElyPublicStat>
              <ElyPublicStat
                :value="pairedTokenCount"
                eyebrow="Paired roles"
                helper="Container roles with explicit readable text partners."
                tone="success"
              >
                text pairs
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-theme-role-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Role groups</p>
              <h2 class="ely-public-section-title">Five responsibilities that prevent color drift</h2>
              <div class="ely-story-theme-role-group-list ely-story-offset-md">
                <article
                  v-for="role in roleGroups"
                  :key="role.group"
                  class="ely-story-theme-role-group"
                >
                  <div class="ely-story-theme-role-group-head">
                    <ElyPublicBadge tone="primary">{{ role.group }}</ElyPublicBadge>
                    <strong>{{ role.label }}</strong>
                  </div>
                  <p>{{ role.promise }}</p>
                  <ElyPublicText tone="muted">{{ role.reviewerQuestion }}</ElyPublicText>
                  <div class="ely-story-theme-role-token-row">
                    <span
                      v-for="token in role.tokens.slice(0, 4)"
                      :key="token.cssVar"
                      :style="{ '--ely-story-role-token': 'var(' + token.cssVar + ')' }"
                    >
                      {{ token.label }}
                    </span>
                  </div>
                </article>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from token contract to applied proof</h2>
              <div class="ely-story-theme-role-route-list ely-story-offset-md">
                <a
                  v-for="(step, index) in routeSteps"
                  :key="step.key"
                  class="ely-story-theme-role-route-step"
                  :href="createStoryPath(step.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ step.title }}</strong>
                </a>
              </div>
              <ElyPublicDivider label="Rule" align="start" />
              <ElyPublicText tone="muted">
                If a theme fails this route, repair the owner token or the
                documented role first. Do not patch a single story with local color.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-public-card">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Family comparison</p>
                <h2 class="ely-public-section-title">One matrix, four moods, fixed responsibilities</h2>
              </div>
              <p>
                These notes are review prompts only. The values, theme keys, and
                preview colors still come from the public preset owner.
              </p>
            </div>

            <div class="ely-story-theme-role-family-grid">
              <article
                v-for="theme in familyRows"
                :key="theme.key"
                class="ely-story-theme-role-family"
              >
                <div class="ely-story-theme-role-family-head">
                  <div>
                    <p class="ely-public-eyebrow">{{ theme.key }}</p>
                    <h3>{{ theme.displayName }}</h3>
                  </div>
                  <ElyPublicBadge tone="accent">{{ theme.accentLabel }}</ElyPublicBadge>
                </div>
                <p>{{ theme.description }}</p>
                <div class="ely-story-theme-role-preview-pair">
                  <div
                    class="ely-story-theme-role-preview"
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.accent,
                      '--ely-story-theme-preview-from': theme.preview.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.surface,
                      '--ely-story-theme-preview-to': theme.preview.heroTo,
                    }"
                  >
                    <span>Light role proof</span>
                  </div>
                  <div
                    class="ely-story-theme-role-preview"
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.dark.accent,
                      '--ely-story-theme-preview-from': theme.preview.dark.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.dark.surface,
                      '--ely-story-theme-preview-to': theme.preview.dark.heroTo,
                    }"
                  >
                    <span>Dark role proof</span>
                  </div>
                </div>
                <dl class="ely-story-theme-role-guidance">
                  <div v-for="role in roleGroups" :key="role.group">
                    <dt>{{ role.label }}</dt>
                    <dd>{{ theme.guidance[role.group] }}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-role-bottom">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Live specimen</p>
              <h2 class="ely-public-section-title">Role discipline should survive real components</h2>
              <div class="ely-story-theme-role-specimen ely-story-offset-md">
                <div>
                  <ElyPublicBadge tone="primary">Primary owns the next step</ElyPublicBadge>
                  <h3>Invite the user into one luminous path</h3>
                  <ElyPublicText tone="muted">
                    Surfaces stay calm, content stays readable, and accent memory
                    appears only after the main action is obvious.
                  </ElyPublicText>
                </div>
                <div class="ely-public-actions">
                  <ElyPublicButton>Continue journey</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Compare families</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Review rules</ElyPublicButton>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Reject line</p>
              <h2 class="ely-public-section-title">Do not approve a theme that only works as a mood board</h2>
              <ElyPublicText class="ely-story-offset-md">
                A theme can be ornate, romantic, or crystalline only after it
                proves the same role map in both modes. Pretty color without
                role ownership is not personalization; it is drift.
              </ElyPublicText>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
