import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicText,
  publicThemePacks,
  publicThemeSemanticTokenDefinitions,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const tokenGroups = [
  {
    key: "surface",
    title: "Surface",
    description: "Atmosphere, page grounding, and component planes.",
  },
  {
    key: "content",
    title: "Content",
    description: "Readable copy, labels, dividers, and structural lines.",
  },
  {
    key: "emphasis",
    title: "Emphasis",
    description: "Primary path, ceremonial support, and rare memory points.",
  },
  {
    key: "status",
    title: "Status",
    description: "Fixed semantic feedback that never becomes brand decoration.",
  },
  {
    key: "material",
    title: "Material",
    description: "Crystal, silk, and sheen layers controlled by theme tokens.",
  },
] as const

const approvalRules = [
  "Theme family is selected before page polish starts.",
  "Primary owns action and focus; accent never becomes the default CTA color.",
  "Container tokens use their paired on-container text token.",
  "Status colors keep fixed meaning across all launch families.",
  "Material tokens enhance hierarchy but do not replace readable boundaries.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme System Spec",
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
      ElyPublicText,
    },
    setup() {
      return {
        approvalRules,
        semanticTokens: publicThemeSemanticTokenDefinitions,
        themePacks: publicThemePacks,
        tokenGroups,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme system spec</p>
            <h1 class="ely-public-section-title">Semantic roles before visual flourish</h1>
            <p class="ely-public-copy">
              Public Luxe themes are governed by role, not taste-by-page. Each family
              changes atmosphere while keeping surface, content, emphasis, status, and
              material responsibilities stable across light and dark mode.
            </p>
            <div class="ely-story-theme-system-family-grid ely-story-offset-md">
              <article
                v-for="theme in themePacks"
                :key="theme.key"
                class="ely-story-theme-system-family"
              >
                <div>
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <p>{{ theme.description }}</p>
                <div class="ely-story-theme-system-preview-pair">
                  <span
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.accent,
                      '--ely-story-theme-preview-from': theme.preview.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.surface,
                      '--ely-story-theme-preview-to': theme.preview.heroTo,
                    }"
                  >
                    Light
                  </span>
                  <span
                    :style="{
                      '--ely-story-theme-preview-accent': theme.preview.dark.accent,
                      '--ely-story-theme-preview-from': theme.preview.dark.heroFrom,
                      '--ely-story-theme-preview-surface': theme.preview.dark.surface,
                      '--ely-story-theme-preview-to': theme.preview.dark.heroTo,
                    }"
                  >
                    Dark
                  </span>
                </div>
                <ElyPublicBadge tone="primary">{{ theme.mood }}</ElyPublicBadge>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-system-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Role groups</p>
              <h2 class="ely-public-section-title">Five stable responsibilities</h2>
              <div class="ely-story-theme-system-group-list ely-story-offset-md">
                <div
                  v-for="group in tokenGroups"
                  :key="group.key"
                  class="ely-story-theme-system-group"
                >
                  <strong>{{ group.title }}</strong>
                  <span>{{ group.description }}</span>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval rules</p>
              <h2 class="ely-public-section-title">What keeps themes coherent</h2>
              <div class="ely-story-theme-system-checklist ely-story-offset-md">
                <div
                  v-for="rule in approvalRules"
                  :key="rule"
                  class="ely-story-theme-system-check"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Semantic token map</p>
            <h2 class="ely-public-section-title">Current theme values, governed meanings</h2>
            <p class="ely-public-copy">
              Swatches below read the active toolbar theme. Use them to inspect whether
              the selected family keeps text, containers, emphasis, and feedback roles distinct.
            </p>
            <div class="ely-story-theme-system-token-grid ely-story-offset-md">
              <article
                v-for="token in semanticTokens"
                :key="token.cssVar"
                class="ely-story-theme-system-token"
                :data-group="token.group"
              >
                <div
                  class="ely-story-theme-system-swatch"
                  :style="{ '--ely-story-token-swatch': 'var(' + token.cssVar + ')' }"
                ></div>
                <div>
                  <div class="ely-story-theme-system-token-head">
                    <strong>{{ token.label }}</strong>
                    <span>{{ token.group }}</span>
                  </div>
                  <code>{{ token.cssVar }}</code>
                  <p>{{ token.role }}</p>
                  <ElyPublicText v-if="token.pair" tone="muted">
                    Paired text: {{ token.pair }}
                  </ElyPublicText>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Action proof</p>
            <h2 class="ely-public-section-title">Roles should remain obvious in live components</h2>
            <div class="ely-public-actions">
              <ElyPublicButton>Primary path</ElyPublicButton>
              <ElyPublicButton tone="secondary">Secondary support</ElyPublicButton>
              <ElyPublicButton tone="ghost">Quiet recovery</ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
