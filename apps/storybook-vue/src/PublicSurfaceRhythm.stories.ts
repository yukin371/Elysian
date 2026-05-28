import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const surfaceLayers = [
  {
    body: "Page atmosphere uses neutral background, subtle tint, and wide breathing room. It should never become the loudest object.",
    label: "Background",
  },
  {
    body: "Primary surface carries the local decision area. One surface can be ornate; sibling surfaces stay quieter.",
    label: "Primary surface",
  },
  {
    body: "Local groups use spacing, dividers, badges, and low-contrast panels before adding another full card.",
    label: "Local rhythm",
  },
  {
    body: "Actions, alerts, and progress bars provide state. They should not create a fourth competing visual system.",
    label: "State layer",
  },
] as const

const spacingRules = [
  "Use larger gaps between decisions than inside one decision.",
  "Prefer Divider or whitespace before nesting a card inside a card.",
  "Keep secondary panels lower contrast than the primary surface.",
  "Let typography and alignment create order before adding glow.",
] as const

const densityBands = [
  {
    copy: "Landing, membership, creator identity, and curated theme moments.",
    label: "Ceremonial",
    value: "More breathing room",
  },
  {
    copy: "Default public account, preference, gallery, and content surfaces.",
    label: "Comfortable",
    value: "Balanced rhythm",
  },
  {
    copy: "Information-heavy creator tools, review lanes, and settings panels.",
    label: "Compact",
    value: "Controlled density",
  },
] as const

const reviewQuestions = [
  "Can the page be explained as background, primary surface, local groups, and state layer?",
  "Is there only one ornate or highly emphasized surface in the viewport?",
  "Are nested groups using dividers and whitespace instead of extra card shells?",
  "Would the view still work if decorative gradients were reduced by half?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Surface Rhythm",
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
        densityBands,
        reviewQuestions,
        spacingRules,
        surfaceLayers,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-surface-principle">
            <p class="ely-public-eyebrow">Surface rhythm</p>
            <h1 class="ely-public-section-title">Elegance comes from hierarchy before ornament</h1>
            <p class="ely-public-copy">
              Public Luxe should feel luminous, but the layout still needs a
              dependable rhythm: background atmosphere, one primary surface,
              local grouping, and clear state feedback.
            </p>

            <div class="ely-story-surface-layer-grid" aria-label="Surface layer model">
              <article
                v-for="layer in surfaceLayers"
                :key="layer.label"
                class="ely-story-surface-layer"
              >
                <strong>{{ layer.label }}</strong>
                <span>{{ layer.body }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-surface-layout">
            <article class="ely-story-surface-demo">
              <div class="ely-story-surface-demo-shell">
                <div class="ely-story-surface-demo-hero">
                  <span class="ely-public-eyebrow">Primary surface</span>
                  <h2>Moonlit creator review</h2>
                  <p>
                    A single ornate surface anchors the view. Local details use
                    rhythm and tokenized components rather than another visual system.
                  </p>
                  <div class="ely-public-actions">
                    <ElyPublicButton>Approve rhythm</ElyPublicButton>
                    <ElyPublicButton tone="ghost">Reduce ornament</ElyPublicButton>
                  </div>
                </div>

                <div class="ely-story-surface-demo-groups">
                  <ElyPublicStat
                    value="3"
                    label="surface layers"
                    eyebrow="Hierarchy"
                    helper="Background, primary, local."
                    tone="accent"
                  />
                  <ElyPublicStat
                    value="1"
                    label="main focus"
                    eyebrow="Composition"
                    helper="One lead surface per view."
                    tone="muted"
                  />
                </div>

                <ElyPublicDivider label="Local rhythm" align="start" />

                <div class="ely-story-surface-demo-local">
                  <ElyPublicBadge tone="primary">Primary action named</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">Nested cards avoided</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Accent is rare</ElyPublicBadge>
                </div>

                <ElyPublicProgress
                  label="Hierarchy readiness"
                  :value="76"
                  tone="success"
                />
              </div>
            </article>

            <article class="ely-story-surface-density-panel">
              <p class="ely-public-eyebrow">Density bands</p>
              <h2>Choose rhythm by intent</h2>
              <div class="ely-story-surface-density-list ely-story-offset-md">
                <div
                  v-for="band in densityBands"
                  :key="band.label"
                  class="ely-story-surface-density"
                >
                  <span>{{ band.value }}</span>
                  <strong>{{ band.label }}</strong>
                  <p>{{ band.copy }}</p>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-surface-layout">
            <article class="ely-story-surface-rule-panel">
              <p class="ely-public-eyebrow">Spacing rules</p>
              <h2>Use whitespace before extra shells</h2>
              <div class="ely-story-surface-rule-list ely-story-offset-md">
                <div
                  v-for="rule in spacingRules"
                  :key="rule"
                  class="ely-story-surface-rule"
                >
                  <span aria-hidden="true"></span>
                  <strong>{{ rule }}</strong>
                </div>
              </div>
            </article>

            <article class="ely-story-surface-review-panel">
              <p class="ely-public-eyebrow">Review questions</p>
              <h2>Before calling a page elegant</h2>
              <div class="ely-story-surface-review ely-story-offset-md">
                <div
                  v-for="question in reviewQuestions"
                  :key="question"
                  class="ely-story-surface-question"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ question }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-surface-anti-pattern">
            <p class="ely-public-eyebrow">Anti-pattern</p>
            <h2>Do not solve hierarchy with louder decoration</h2>
            <ElyPublicText tone="muted">
              If every card needs glow, the page is missing hierarchy. Make one
              surface responsible for the decision, lower the surrounding panels,
              and let the theme system carry atmosphere quietly.
            </ElyPublicText>
          </section>
        </div>
      </section>
    `,
  }),
}
