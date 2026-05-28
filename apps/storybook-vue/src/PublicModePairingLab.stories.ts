import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicInput,
  ElyPublicProgress,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type { PublicThemePack } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const modeProofChecks = [
  {
    label: "Action contrast",
    proof:
      "Primary and secondary actions remain visually ordered in both modes.",
  },
  {
    label: "State evidence",
    proof: "Info, warning, and invalid states keep text evidence beyond hue.",
  },
  {
    label: "Surface majority",
    proof: "Neutral surfaces carry most of the viewport before accents appear.",
  },
  {
    label: "Recovery path",
    proof:
      "Quiet links and ghost actions remain findable without becoming primary.",
  },
] as const

const familyModeRisks: Record<PublicThemePack["key"], string> = {
  "azure-aria":
    "Avoid turning dark mode into generic cyan-on-navy; keep neutral structure visible.",
  "elysia-default":
    "Champagne and rose cues must stay ceremonial, not become dark-mode button color.",
  "enterprise-calm":
    "Do not flatten the public preset into enterprise gray; keep a small crafted edge.",
  "rose-nocturne":
    "Rose atmosphere must not reduce text contrast or make danger/warning ambiguous.",
}

const approvalQuestions = [
  "Does each family show both light and dark proof before page polish starts?",
  "Can the same primary action be identified in both previews?",
  "Are warning and invalid states readable without relying only on color?",
  "Does dark mode reduce ornament before it reduces comprehension?",
  "Can recovery links be found without creating another primary action?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Mode Pairing Lab",
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
      ElyPublicInput,
      ElyPublicProgress,
      ElyPublicText,
    },
    setup() {
      return {
        approvalQuestions,
        familyModeRisks,
        modeProofChecks,
        themePacks: publicThemePacks,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Mode pairing lab</p>
            <h1 class="ely-public-section-title">A theme family is only launch-ready when both modes prove the same job</h1>
            <p class="ely-public-copy">
              Light and dark mode should preserve the same hierarchy: primary
              moves the user forward, status explains risk, neutral surfaces do
              the reading work, and accent remains a rare memory point.
            </p>

            <div class="ely-story-mode-lab-check-grid" aria-label="Mode proof checks">
              <article
                v-for="check in modeProofChecks"
                :key="check.label"
                class="ely-story-mode-lab-check"
              >
                <strong>{{ check.label }}</strong>
                <span>{{ check.proof }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-mode-lab-family-grid">
            <article
              v-for="theme in themePacks"
              :key="theme.key"
              class="ely-story-mode-lab-family"
            >
              <div class="ely-story-mode-lab-family-head">
                <div>
                  <p class="ely-public-eyebrow">{{ theme.key }}</p>
                  <h2>{{ theme.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">{{ theme.accentLabel }}</ElyPublicBadge>
              </div>

              <div class="ely-story-mode-lab-pair">
                <div
                  class="ely-story-mode-lab-preview"
                  :style="{
                    '--ely-story-theme-preview-accent': theme.preview.accent,
                    '--ely-story-theme-preview-from': theme.preview.heroFrom,
                    '--ely-story-theme-preview-surface': theme.preview.surface,
                    '--ely-story-theme-preview-to': theme.preview.heroTo,
                  }"
                >
                  <span>Light proof</span>
                  <i></i>
                  <b></b>
                  <em></em>
                </div>
                <div
                  class="ely-story-mode-lab-preview"
                  :style="{
                    '--ely-story-theme-preview-accent': theme.preview.dark.accent,
                    '--ely-story-theme-preview-from': theme.preview.dark.heroFrom,
                    '--ely-story-theme-preview-surface': theme.preview.dark.surface,
                    '--ely-story-theme-preview-to': theme.preview.dark.heroTo,
                  }"
                >
                  <span>Dark proof</span>
                  <i></i>
                  <b></b>
                  <em></em>
                </div>
              </div>

              <ElyPublicDivider label="Risk to review" align="start" />
              <ElyPublicText tone="muted">{{ familyModeRisks[theme.key] }}</ElyPublicText>
            </article>
          </section>

          <section class="ely-story-mode-lab-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">State specimen</p>
              <h2 class="ely-public-section-title">Mode proof includes interaction and recovery</h2>
              <div class="ely-story-mode-lab-specimen ely-story-offset-md">
                <div class="ely-story-mode-lab-specimen-actions">
                  <ElyPublicButton>Save preference</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Preview pairing</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Recover previous mode</ElyPublicButton>
                </div>
                <ElyPublicInput
                  label="Public display name"
                  model-value="Elysian member"
                  helper="Field boundaries and helper copy must stay readable in both modes."
                />
                <ElyPublicAlert tone="warning" title="Dark-mode proof required">
                  The warning state must name the issue; hue alone is not enough.
                </ElyPublicAlert>
                <ElyPublicProgress label="Pairing confidence" :value="84" tone="success" />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval questions</p>
              <h2 class="ely-public-section-title">Pair modes before approving theme polish</h2>
              <div class="ely-story-mode-lab-question-list ely-story-offset-md">
                <div
                  v-for="question in approvalQuestions"
                  :key="question"
                  class="ely-story-mode-lab-question"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ question }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
