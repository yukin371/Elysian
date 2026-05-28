import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const colorRoleRules = [
  {
    label: "Primary",
    proof: "One next step, selected state, focus path, or key progress signal.",
    cssVar: "--color-primary",
    warning:
      "Do not use it for decorative strips, badges, and secondary links at once.",
  },
  {
    label: "Secondary",
    proof: "Ceremonial warmth, supporting trim, and quiet hierarchy.",
    cssVar: "--color-secondary",
    warning: "Do not let it become a second primary CTA.",
  },
  {
    label: "Accent",
    proof:
      "Rare memory point: small labels, editorial glints, or one local highlight.",
    cssVar: "--color-accent",
    warning:
      "Do not flood cards, backgrounds, or action rows with accent color.",
  },
  {
    label: "Status",
    proof: "Meaning-bearing state only: info, success, warning, danger.",
    cssVar: "status tokens",
    warning: "Do not use status color as brand decoration.",
  },
] as const

const radiusRules = [
  {
    label: "Small",
    sampleClass: "ely-story-radius-color-sample--sm",
    cssVar: "--ely-public-radius-sm",
    usage: "compact chips, control marks, fine-grain labels",
  },
  {
    label: "Medium",
    sampleClass: "ely-story-radius-color-sample--md",
    cssVar: "--ely-public-radius-md",
    usage: "buttons, inputs, badges, local preview blocks",
  },
  {
    label: "Large",
    sampleClass: "ely-story-radius-color-sample--lg",
    cssVar: "--ely-public-radius-lg",
    usage: "cards, dialogs, tab panels, large content surfaces",
  },
  {
    label: "Pill",
    sampleClass: "ely-story-radius-color-sample--pill",
    cssVar: "999px",
    usage: "true pills, avatar circles, switch and progress tracks only",
  },
] as const

const approvalChecks = [
  "One surface has one primary color job.",
  "Accent appears as a memory point, not as page paint.",
  "Status colors only communicate state.",
  "Ordinary surfaces use 6 / 10 / 14px radii through public tokens.",
  "999px appears only where the shape is semantically circular or pill-like.",
] as const

const blockedExamples = [
  "A hero using primary, accent, warning, and success as equal decoration.",
  "A card with a custom 22px radius because it looks softer.",
  "A danger color used for a romantic glow or sale badge.",
  "A page that changes accent role between light and dark mode.",
] as const

const meta = {
  title: "Public Luxe/Foundations/Radius & Color Discipline",
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
      ElyPublicText,
    },
    setup() {
      return {
        approvalChecks,
        blockedExamples,
        colorRoleRules,
        radiusRules,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-radius-color-hero-panel">
            <p class="ely-public-eyebrow">Radius & color discipline</p>
            <h1 class="ely-public-section-title">The theme stays elegant because the rules stay narrow</h1>
            <p class="ely-public-copy">
              Public Luxe can be luminous, ornate, and personal only if color
              jobs and radius scale do not drift by page. This story is the
              quick approval surface for those two high-risk visual contracts.
            </p>
            <div class="ely-story-radius-color-approval">
              <article
                v-for="check in approvalChecks"
                :key="check"
                class="ely-story-radius-color-check"
              >
                <span aria-hidden="true"></span>
                <strong>{{ check }}</strong>
              </article>
            </div>
          </section>

          <section class="ely-story-radius-color-layout">
            <article class="ely-story-radius-color-role-panel">
              <p class="ely-public-eyebrow">Color roles</p>
              <h2 class="ely-public-section-title">Color is a job, not decoration inventory</h2>
              <div class="ely-story-radius-color-role-list">
                <article
                  v-for="role in colorRoleRules"
                  :key="role.label"
                  class="ely-story-radius-color-role"
                  :data-role="role.label.toLowerCase()"
                >
                  <div class="ely-story-radius-color-role-mark"></div>
                  <div>
                    <div class="ely-story-radius-color-role-head">
                      <strong>{{ role.label }}</strong>
                      <code>{{ role.cssVar }}</code>
                    </div>
                    <p>{{ role.proof }}</p>
                    <ElyPublicText tone="muted">{{ role.warning }}</ElyPublicText>
                  </div>
                </article>
              </div>
            </article>

            <article class="ely-story-radius-color-scale-panel">
              <p class="ely-public-eyebrow">Radius scale</p>
              <h2 class="ely-public-section-title">Soft enough for luxury, strict enough for system work</h2>
              <div class="ely-story-radius-color-samples">
                <article
                  v-for="rule in radiusRules"
                  :key="rule.cssVar"
                  class="ely-story-radius-color-radius"
                >
                  <span :class="['ely-story-radius-color-sample', rule.sampleClass]"></span>
                  <div>
                    <strong>{{ rule.label }}</strong>
                    <code>{{ rule.cssVar }}</code>
                    <p>{{ rule.usage }}</p>
                  </div>
                </article>
              </div>
            </article>
          </section>

          <section class="ely-story-radius-color-blocker-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Blockers</p>
                <h2 class="ely-public-section-title">Reject visual polish that breaks the contract</h2>
              </div>
              <p>
                These are deliberately plain. If a surface triggers one, fix the
                role or radius before tuning glow, shadow, or texture.
              </p>
            </div>
            <div class="ely-story-radius-color-blockers">
              <article
                v-for="item in blockedExamples"
                :key="item"
                class="ely-story-radius-color-blocker"
              >
                <ElyPublicBadge tone="warning">Block</ElyPublicBadge>
                <strong>{{ item }}</strong>
              </article>
            </div>
            <ElyPublicDivider label="Approval action" align="start" />
            <div class="ely-public-actions">
              <ElyPublicButton>Approve visual discipline</ElyPublicButton>
              <ElyPublicButton tone="secondary">Compare theme readiness</ElyPublicButton>
              <ElyPublicButton tone="ghost">Send back to tokens</ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
