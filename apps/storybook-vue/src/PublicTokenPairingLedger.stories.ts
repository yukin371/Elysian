import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicStat,
  ElyPublicText,
  publicThemePacks,
  publicThemeSemanticTokenDefinitions,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath } from "./public-luxe-showcase"

const pairedTokenRows = publicThemeSemanticTokenDefinitions
  .filter((token) => Boolean(token.pair))
  .map((token) => ({
    ...token,
    pair: token.pair ?? "",
  }))

const unpairedTokenRows = publicThemeSemanticTokenDefinitions.filter(
  (token) => !token.pair,
)

const pairingGates = [
  {
    label: "Container owns text",
    proof:
      "Primary, secondary, accent, and status containers must use their documented on-* partner.",
    risk: "A card borrows a container color but keeps default body text.",
  },
  {
    label: "Reading base stays neutral",
    proof:
      "Text, muted text, and line tokens remain the readable skeleton before theme ornament.",
    risk: "Brand tint becomes the only reading strategy.",
  },
  {
    label: "Status meaning survives mood",
    proof:
      "Success, warning, danger, and info containers keep fixed semantic labels across families.",
    risk: "Romantic or crystalline palettes make warning and accent feel interchangeable.",
  },
  {
    label: "Material never carries meaning alone",
    proof:
      "Sheen and glint can frame a surface but cannot replace labels, borders, or text pairing.",
    risk: "A glow becomes the only signal for selected, focus, or progress.",
  },
] as const

const reviewRoutes = [
  {
    key: "theme-system-spec",
    label: "Theme System Spec",
    storyId: "public-luxe-foundations-theme-system-spec--overview",
  },
  {
    key: "theme-role-matrix",
    label: "Theme Role Matrix",
    storyId: "public-luxe-foundations-theme-role-matrix--overview",
  },
  {
    key: "accessibility-inclusion",
    label: "Accessibility & Inclusion",
    storyId: "public-luxe-foundations-accessibility-inclusion--overview",
  },
  {
    key: "theme-failure-gallery",
    label: "Theme Failure Gallery",
    storyId: "public-luxe-foundations-theme-failure-gallery--overview",
  },
] as const

const sampleSurfaces = [
  {
    body: "The main action and focus path must stay readable in every theme.",
    label: "Primary path",
    cssVar: "--color-primary",
    pair: "--color-on-primary",
  },
  {
    body: "Supporting ceremony uses secondary without stealing the next step.",
    label: "Secondary support",
    cssVar: "--color-secondary",
    pair: "--color-on-secondary",
  },
  {
    body: "Accent is a rare memory point, not a second primary button.",
    label: "Accent memory",
    cssVar: "--color-accent",
    pair: "--color-on-accent",
  },
  {
    body: "Danger needs explicit text so the state survives theme mood.",
    label: "Danger state",
    cssVar: "--color-danger-container",
    pair: "--color-on-danger-container",
  },
] as const

const meta = {
  title: "Public Luxe/Foundations/Token Pairing Ledger",
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
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        createStoryPath,
        pairedCount: String(pairedTokenRows.length),
        pairedTokenRows,
        pairingGates,
        reviewRoutes,
        sampleSurfaces,
        themeCount: String(publicThemePacks.length),
        tokenCount: String(publicThemeSemanticTokenDefinitions.length),
        unpairedCount: String(unpairedTokenRows.length),
        unpairedTokenRows,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Token pairing ledger</p>
            <h1 class="ely-public-section-title">Luxury color stays safe when every surface knows its text partner</h1>
            <p class="ely-public-copy">
              This ledger turns semantic tokens into a reviewer-readable pairing
              map. It consumes ui-public-vue token definitions and active CSS
              variables, then shows which roles must travel together. It does
              not calculate contrast, approve palettes, or create a second token truth.
            </p>

            <div class="ely-story-token-ledger-hero-grid ely-story-offset-md">
              <ElyPublicStat
                :value="tokenCount"
                eyebrow="Semantic definitions"
                helper="Owned by ui-public-vue, displayed here as review evidence."
                tone="primary"
              >
                token roles
              </ElyPublicStat>
              <ElyPublicStat
                :value="pairedCount"
                eyebrow="Paired roles"
                helper="Container and emphasis roles with explicit text partners."
                tone="success"
              >
                on-* pairs
              </ElyPublicStat>
              <ElyPublicStat
                :value="unpairedCount"
                eyebrow="Base roles"
                helper="Reading, structure, surface, and material roles without paired text."
                tone="accent"
              >
                base tokens
              </ElyPublicStat>
              <ElyPublicStat
                :value="themeCount"
                eyebrow="Theme families"
                helper="The same pairing rule applies to every launch mood."
                tone="primary"
              >
                governed moods
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-token-ledger-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Pairing gates</p>
              <h2 class="ely-public-section-title">Review the rule before the swatch</h2>
              <div class="ely-story-token-ledger-gate-list ely-story-offset-md">
                <article
                  v-for="gate in pairingGates"
                  :key="gate.label"
                  class="ely-story-token-ledger-gate"
                >
                  <strong>{{ gate.label }}</strong>
                  <p>{{ gate.proof }}</p>
                  <ElyPublicText tone="muted">{{ gate.risk }}</ElyPublicText>
                </article>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Move from pair map to accessible proof</h2>
              <div class="ely-story-token-ledger-route-list ely-story-offset-md">
                <a
                  v-for="(route, index) in reviewRoutes"
                  :key="route.key"
                  class="ely-story-token-ledger-route"
                  :href="createStoryPath(route.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ route.label }}</strong>
                </a>
              </div>
              <ElyPublicDivider label="Reject line" align="start" />
              <ElyPublicText tone="muted">
                If text and container tokens are separated, reject the design
                before trying to solve it with stronger glow or local color.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-public-card">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Paired token table</p>
                <h2 class="ely-public-section-title">Every container role names the text it expects</h2>
              </div>
              <p>
                The chips below read the active toolbar theme. They are visual
                specimens, not a separate contrast test or palette source.
              </p>
            </div>

            <div class="ely-story-token-ledger-pair-grid">
              <article
                v-for="row in pairedTokenRows"
                :key="row.cssVar"
                class="ely-story-token-ledger-pair"
                :style="{
                  '--ely-story-token-ledger-bg': 'var(' + row.cssVar + ')',
                  '--ely-story-token-ledger-fg': 'var(' + row.pair + ')',
                }"
              >
                <div class="ely-story-token-ledger-sample">
                  <strong>{{ row.label }}</strong>
                  <span>{{ row.group }}</span>
                </div>
                <div class="ely-story-token-ledger-pair-copy">
                  <code>{{ row.cssVar }}</code>
                  <code>{{ row.pair }}</code>
                  <p>{{ row.role }}</p>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-token-ledger-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Base token roles</p>
              <h2 class="ely-public-section-title">Not every token needs a partner, but every token needs a job</h2>
              <div class="ely-story-token-ledger-base-list ely-story-offset-md">
                <article
                  v-for="row in unpairedTokenRows"
                  :key="row.cssVar"
                  class="ely-story-token-ledger-base"
                  :style="{ '--ely-story-token-ledger-chip': 'var(' + row.cssVar + ')' }"
                >
                  <span aria-hidden="true"></span>
                  <div>
                    <strong>{{ row.label }}</strong>
                    <code>{{ row.cssVar }}</code>
                    <p>{{ row.role }}</p>
                  </div>
                </article>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Live specimen</p>
              <h2 class="ely-public-section-title">Pairs should survive real component composition</h2>
              <div class="ely-story-token-ledger-specimen ely-story-offset-md">
                <ElyPublicAlert
                  eyebrow="Pairing proof"
                  title="Readable before ornamental"
                  tone="info"
                >
                  If a surface uses a semantic container, its text role must be
                  explicit before shimmer, accent, or motion is approved.
                </ElyPublicAlert>
                <div class="ely-story-token-ledger-surface-stack">
                  <article
                    v-for="surface in sampleSurfaces"
                    :key="surface.cssVar"
                    class="ely-story-token-ledger-surface"
                    :style="{
                      '--ely-story-token-ledger-bg': 'var(' + surface.cssVar + ')',
                      '--ely-story-token-ledger-fg': 'var(' + surface.pair + ')',
                    }"
                  >
                    <strong>{{ surface.label }}</strong>
                    <span>{{ surface.body }}</span>
                  </article>
                </div>
                <div class="ely-public-actions">
                  <ElyPublicButton>Approve pair map</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Review accessibility</ElyPublicButton>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
