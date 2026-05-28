import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const failureCases = [
  {
    label: "Color drift",
    signal: "Accent acts like primary",
    impact:
      "The user sees two forward paths and cannot tell which action owns the flow.",
    repair:
      "Move the accent back to badge, divider, caption, or one memory detail.",
  },
  {
    label: "Mode mismatch",
    signal: "Dark proof changes the hierarchy",
    impact: "The same page reads as a different product when the mode changes.",
    repair:
      "Review paired previews and keep primary, status, neutral, and recovery roles stable.",
  },
  {
    label: "Ornament overspend",
    signal: "Multiple ceremonial surfaces",
    impact:
      "The page feels expensive but noisy, and attention no longer follows the user job.",
    repair:
      "Give one surface the ceremonial budget and downgrade the rest to luminous or quiet.",
  },
  {
    label: "Action conflict",
    signal: "Many strong choices compete",
    impact:
      "A beautiful surface becomes slower because the next step is no longer obvious.",
    repair:
      "Keep one primary action, then use secondary, ghost, link, badge, or alert by role.",
  },
  {
    label: "Radius drift",
    signal: "Local px guesses appear",
    impact:
      "The system starts feeling toy-like or stitched together across components.",
    repair:
      "Return ordinary surfaces to sm, md, lg, and reserve 999px for true pills or circles.",
  },
] as const

const failureReviewOrder = [
  "Name the user job before judging visual taste.",
  "Find the single primary action and remove competitors.",
  "Check theme family, mode pair, and color-role discipline.",
  "Reduce ornament until hierarchy survives without effects.",
  "Confirm radius, status, and recovery rules before approving polish.",
] as const

const repairChecklist = [
  "Does the fix remove a role conflict rather than add a new style?",
  "Does the repaired surface still consume public tokens or owner metadata?",
  "Can a screenshot explain the same hierarchy in light and dark mode?",
  "Does the repaired page need fewer effects than the rejected version?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Theme Failure Gallery",
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
      ElyPublicProgress,
      ElyPublicText,
    },
    setup() {
      return {
        failureCases,
        failureReviewOrder,
        repairChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Theme failure gallery</p>
            <h1 class="ely-public-section-title">A rejected design should teach the system what to protect</h1>
            <p class="ely-public-copy">
              This gallery turns common public-luxe failures into reviewable
              evidence. It does not add new tokens or component APIs; it names
              what must be repaired before a surface can be called elegant.
            </p>

            <div class="ely-story-theme-failure-order" aria-label="Failure review order">
              <div
                v-for="(step, index) in failureReviewOrder"
                :key="step"
                class="ely-story-theme-failure-step"
              >
                <span>0{{ index + 1 }}</span>
                <strong>{{ step }}</strong>
              </div>
            </div>
          </section>

          <section class="ely-story-theme-failure-grid">
            <article
              v-for="item in failureCases"
              :key="item.label"
              class="ely-story-theme-failure-card"
            >
              <div class="ely-story-theme-failure-card-head">
                <div>
                  <p class="ely-public-eyebrow">{{ item.signal }}</p>
                  <h2>{{ item.label }}</h2>
                </div>
                <ElyPublicBadge tone="warning">Reject</ElyPublicBadge>
              </div>

              <div class="ely-story-theme-failure-specimen" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <ElyPublicAlert tone="warning" :title="item.signal">
                {{ item.impact }}
              </ElyPublicAlert>

              <ElyPublicDivider label="Repair" align="start" />
              <ElyPublicText tone="muted">{{ item.repair }}</ElyPublicText>
            </article>
          </section>

          <section class="ely-story-theme-failure-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Repair specimen</p>
              <h2 class="ely-public-section-title">The fix should be quieter than the failure</h2>
              <div class="ely-story-theme-failure-repair ely-story-offset-md">
                <ElyPublicBadge tone="primary">One primary path</ElyPublicBadge>
                <ElyPublicText tone="muted">
                  The repaired surface keeps accent as memory, status as
                  evidence, and recovery as quiet support.
                </ElyPublicText>
                <div class="ely-public-actions">
                  <ElyPublicButton>Approve repaired surface</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Review mode pair</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Send back to checklist</ElyPublicButton>
                </div>
                <ElyPublicProgress label="Repair confidence" :value="88" tone="success" />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Repair checklist</p>
              <h2 class="ely-public-section-title">Do not fix drift by adding more style</h2>
              <div class="ely-story-theme-failure-checklist ely-story-offset-md">
                <div
                  v-for="item in repairChecklist"
                  :key="item"
                  class="ely-story-theme-failure-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
