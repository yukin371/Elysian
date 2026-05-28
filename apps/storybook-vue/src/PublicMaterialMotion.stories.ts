import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicSkeleton,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const materialLayers = [
  {
    body: "Base atmosphere may use gradients and low-contrast texture, but it must stay quieter than content.",
    label: "Atmosphere",
  },
  {
    body: "Primary surfaces use tokenized overlay, fine border light, and restrained shadow for a crystal edge.",
    label: "Crystal surface",
  },
  {
    body: "Silk and pearl effects belong to small highlights, section rails, and occasional dividers.",
    label: "Sheen",
  },
  {
    body: "Glow is reserved for focus, active state, progress, and one ceremonial focal point.",
    label: "Glow",
  },
] as const

const motionRules = [
  {
    body: "Use staged opacity and vertical reveal for page entrance. Avoid unrelated elements drifting in different directions.",
    title: "Reveal has choreography",
  },
  {
    body: "Shimmer belongs to loading and material sheen. It should not turn static cards into animated ornaments.",
    title: "Shimmer has purpose",
  },
  {
    body: "Focus can breathe softly, but it must remain a visible accessibility affordance before it becomes decorative.",
    title: "Focus stays functional",
  },
  {
    body: "Respect reduced-motion users and keep critical state readable without animation.",
    title: "Motion is optional",
  },
] as const

const intensityScale = [
  {
    copy: "Default component surfaces, forms, and dense account areas.",
    label: "Quiet",
    value: "No spectacle",
  },
  {
    copy: "Theme cards, creator summaries, and selected local panels.",
    label: "Luminous",
    value: "Token sheen",
  },
  {
    copy: "Hero, membership, celebration, or launch moments only.",
    label: "Ceremonial",
    value: "One focal glow",
  },
] as const

const reviewChecklist = [
  "Can the interface still be read if all motion is disabled?",
  "Is each glow tied to focus, active state, progress, or one focal surface?",
  "Are material effects created from public tokens instead of local color values?",
  "Does the animation support hierarchy rather than competing with primary action?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Material & Motion",
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
      ElyPublicSkeleton,
      ElyPublicText,
    },
    setup() {
      return {
        intensityScale,
        materialLayers,
        motionRules,
        reviewChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Material & motion</p>
            <h1 class="ely-public-section-title">Crystal surfaces should glow with discipline</h1>
            <p class="ely-public-copy">
              Public Luxe can use pearl sheen, crystal edges, and soft reveal
              motion, but every material effect must explain hierarchy, state,
              or ceremony. Decoration that cannot name its job is removed.
            </p>

            <div class="ely-story-material-layer-grid" aria-label="Material layer model">
              <article
                v-for="layer in materialLayers"
                :key="layer.label"
                class="ely-story-material-layer"
              >
                <span aria-hidden="true"></span>
                <strong>{{ layer.label }}</strong>
                <p>{{ layer.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-material-layout">
            <article class="ely-story-material-specimen">
              <div class="ely-story-material-orbit" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p class="ely-public-eyebrow">Specimen</p>
              <h2>Moonlit material stack</h2>
              <ElyPublicText tone="muted">
                The focal surface uses a crystal line, a restrained pearl veil,
                and one soft accent. It should feel crafted without turning into
                a glassmorphism poster.
              </ElyPublicText>
              <div class="ely-public-actions">
                <ElyPublicButton>Preview surface</ElyPublicButton>
                <ElyPublicButton tone="ghost">Reduce motion</ElyPublicButton>
              </div>
              <ElyPublicDivider label="State motion" align="start" />
              <ElyPublicProgress
                label="Motion restraint"
                :value="82"
                tone="success"
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Intensity scale</p>
              <h2 class="ely-public-section-title">Use ornament by moment, not by habit</h2>
              <div class="ely-story-material-intensity-list ely-story-offset-md">
                <div
                  v-for="item in intensityScale"
                  :key="item.label"
                  class="ely-story-material-intensity"
                >
                  <span>{{ item.value }}</span>
                  <strong>{{ item.label }}</strong>
                  <p>{{ item.copy }}</p>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-material-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Motion rules</p>
              <h2 class="ely-public-section-title">Animation should clarify rhythm</h2>
              <div class="ely-story-material-rule-grid ely-story-offset-md">
                <article
                  v-for="rule in motionRules"
                  :key="rule.title"
                  class="ely-story-material-rule"
                >
                  <strong>{{ rule.title }}</strong>
                  <p>{{ rule.body }}</p>
                </article>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Loading material</p>
              <h2 class="ely-public-section-title">Shimmer is a state, not decoration</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <ElyPublicSkeleton :lines="4" tone="soft" />
                <div class="ely-story-material-badges">
                  <ElyPublicBadge tone="primary">State-owned shimmer</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">Stable silhouette</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Rare highlight</ElyPublicBadge>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Approve material after hierarchy</h2>
            <div class="ely-story-material-checklist ely-story-offset-md">
              <div
                v-for="item in reviewChecklist"
                :key="item"
                class="ely-story-material-check"
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
