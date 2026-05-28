import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCard,
  ElyPublicDivider,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const anatomyLayers = [
  {
    body: "Theme family, mode, surface, text, emphasis, status, radius, and material tokens stay in ui-public-vue.",
    label: "01",
    title: "Token contract",
  },
  {
    body: "Button, Input, Card, Stat, Badge, and feedback primitives consume semantic slots instead of raw colors.",
    label: "02",
    title: "Component shell",
  },
  {
    body: "Creator Center, Theme Atelier, and future C-side pages compose primitives without redefining visual truth.",
    label: "03",
    title: "Pattern assembly",
  },
] as const

const anatomyRules = [
  "A component should expose clear content slots before decorative parts.",
  "The outer silhouette uses the governed radius scale; inner rhythm uses spacing and dividers.",
  "Primary action appears once per local decision area.",
  "Supporting copy uses Text or component descriptions, not one-off muted classes.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Component Anatomy",
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
      ElyPublicCard,
      ElyPublicDivider,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        anatomyLayers,
        anatomyRules,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-anatomy-hero-panel">
            <p class="ely-public-eyebrow">Component anatomy</p>
            <h1 class="ely-public-section-title">One visual grammar from token to page</h1>
            <p class="ely-public-copy">
              Public Luxe components should feel ornate because their parts agree:
              surfaces, text, action, state, and rhythm all come from the same
              governed contract instead of page-level improvisation.
            </p>

            <div class="ely-story-anatomy-layers" aria-label="Public Luxe anatomy layers">
              <article
                v-for="layer in anatomyLayers"
                :key="layer.title"
                class="ely-story-anatomy-layer"
              >
                <span>{{ layer.label }}</span>
                <strong>{{ layer.title }}</strong>
                <p>{{ layer.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-anatomy-layout">
            <article class="ely-story-anatomy-example-panel">
              <p class="ely-public-eyebrow">Example surface</p>
              <h2 class="ely-public-section-title">Creator membership card anatomy</h2>
              <div class="ely-story-anatomy-example ely-story-offset-md">
                <ElyPublicCard
                  title="Moonlit Atelier"
                  eyebrow="Active theme"
                  description="A compact composition using public primitives only: no local palette, no local radius, no nested card stack."
                  tone="featured"
                >
                  <template #meta>
                    <ElyPublicBadge tone="accent">Curated</ElyPublicBadge>
                  </template>

                  <div class="ely-story-anatomy-stats">
                    <ElyPublicStat
                      value="94%"
                      label="contrast ready"
                      eyebrow="Readability"
                      helper="Light and dark modes keep text stable."
                      trend="up"
                    />
                    <ElyPublicStat
                      value="4"
                      label="theme families"
                      eyebrow="Launch"
                      tone="muted"
                      helper="Small set, higher polish."
                    />
                  </div>

                  <ElyPublicDivider label="Local decision" align="start" />

                  <div class="ely-story-anatomy-field">
                    <ElyPublicInput
                      label="Display name"
                      model-value="Elysian creator"
                      description="Input, label, helper, border, and focus all share the public field language."
                    />
                  </div>

                  <template #footer>
                    <ElyPublicButton>Save preference</ElyPublicButton>
                    <ElyPublicButton tone="ghost">Preview only</ElyPublicButton>
                  </template>
                </ElyPublicCard>
              </div>
            </article>

            <article class="ely-story-anatomy-rules-panel">
              <p class="ely-public-eyebrow">Anatomy rules</p>
              <h2 class="ely-public-section-title">Elegant parts, governed order</h2>
              <div class="ely-story-anatomy-rule-list ely-story-offset-md">
                <div
                  v-for="rule in anatomyRules"
                  :key="rule"
                  class="ely-story-anatomy-rule"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>

              <ElyPublicDivider label="Reading rhythm" align="start" tone="accent" />

              <div class="ely-story-anatomy-copy">
                <ElyPublicText size="lg">
                  The decorative layer should be removable without destroying the
                  user's ability to read, decide, and act.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  If a page needs a new color or radius to feel complete, the
                  design system is missing a token or the composition is trying
                  to do too much.
                </ElyPublicText>
                <ElyPublicLink href="/?path=/story/public-luxe-components-index--coverage">
                  Review component coverage
                </ElyPublicLink>
              </div>
            </article>
          </section>

          <section class="ely-story-anatomy-progress-panel">
            <p class="ely-public-eyebrow">Progressive disclosure</p>
            <h2 class="ely-public-section-title">Show the local state before adding decoration</h2>
            <div class="ely-story-anatomy-progress ely-story-offset-md">
              <ElyPublicProgress
                label="Theme contract coverage"
                tone="success"
                :value="82"
              />
              <ElyPublicText tone="muted">
                This is the kind of foundation-level story that lets reviewers
                judge whether components are coherent before discussing page polish.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
