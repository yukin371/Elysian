import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicLink,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const actionRules = [
  {
    body: "One surface owns the next step. Primary buttons are scarce, visible, and named by outcome.",
    label: "Primary is singular",
  },
  {
    body: "Secondary actions are peers or safe alternatives. Ghost actions are exits, resets, or quiet support.",
    label: "Support stays quiet",
  },
  {
    body: "Links navigate or disclose supporting context. They should not imitate buttons to fight for attention.",
    label: "Navigation is honest",
  },
  {
    body: "Badges and alerts explain state. They do not become alternate CTAs or decorative color patches.",
    label: "State is not action",
  },
] as const

const actionLanes = [
  {
    body: "Continue, publish, confirm, save, checkout, or apply the current decision.",
    label: "Primary button",
    sample: "Publish release",
  },
  {
    body: "Preview, save draft, duplicate, compare, or choose a safe peer action.",
    label: "Secondary button",
    sample: "Save draft",
  },
  {
    body: "Cancel, reset, inspect details, restore defaults, or leave the flow.",
    label: "Ghost button",
    sample: "Cancel",
  },
  {
    body: "Open documentation, review policy, view history, or leave the current page.",
    label: "Link",
    sample: "Review policy",
  },
] as const

const reviewChecklist = [
  "Is there exactly one primary next step in the current surface?",
  "Are destructive or blocked states explained before the user reaches the action?",
  "Do badges summarize state instead of acting like buttons?",
  "Can link labels stand alone without surrounding decorative copy?",
  "Does mobile stacking keep the same decision order?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Action Hierarchy",
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
      ElyPublicEmptyState,
      ElyPublicLink,
      ElyPublicText,
    },
    setup() {
      return {
        actionLanes,
        actionRules,
        reviewChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-action-principle">
            <p class="ely-public-eyebrow">Action hierarchy</p>
            <h1 class="ely-public-section-title">A luminous page still needs one obvious next step</h1>
            <p class="ely-public-copy">
              Public-luxe actions should feel refined, not competitive. Primary
              buttons, secondary actions, ghost exits, links, badges, and alerts
              each carry a different job so ornament never becomes decision
              noise.
            </p>

            <div class="ely-story-action-rule-grid" aria-label="Action hierarchy rules">
              <article
                v-for="rule in actionRules"
                :key="rule.label"
                class="ely-story-action-rule-card"
              >
                <strong>{{ rule.label }}</strong>
                <p>{{ rule.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-action-layout">
            <article class="ely-story-action-specimen">
              <p class="ely-public-eyebrow">Decision specimen</p>
              <h2>One focal action, several quieter supports</h2>
              <ElyPublicText tone="muted">
                The eye should land on the next step first, then understand
                status, alternatives, and supporting navigation.
              </ElyPublicText>

              <div class="ely-story-action-state-row">
                <ElyPublicBadge tone="primary">Ready</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">2 reviewers</ElyPublicBadge>
                <ElyPublicBadge tone="accent">Member preview</ElyPublicBadge>
              </div>

              <ElyPublicAlert
                eyebrow="Decision guardrail"
                title="Release copy is ready, media remains optional"
                tone="info"
              >
                Publish can proceed with a text-only release, or attach media
                before opening the member preview.
              </ElyPublicAlert>

              <div class="ely-public-actions">
                <ElyPublicButton>Publish release</ElyPublicButton>
                <ElyPublicButton tone="secondary">Save draft</ElyPublicButton>
                <ElyPublicButton tone="ghost">Preview member view</ElyPublicButton>
              </div>

              <ElyPublicDivider label="Support navigation" align="start" />

              <ElyPublicText tone="muted">
                Need context?
                <ElyPublicLink href="#">Review publication policy</ElyPublicLink>
                or
                <ElyPublicLink href="#" tone="muted">open version history</ElyPublicLink>.
              </ElyPublicText>
            </article>

            <aside class="ely-story-action-risk-panel" aria-label="Action hierarchy anti-pattern">
              <p class="ely-public-eyebrow">Anti-pattern</p>
              <h2>Do not make every element shout</h2>
              <ElyPublicText tone="muted">
                If everything is primary, the user must design the decision path themselves.
              </ElyPublicText>
              <div class="ely-public-stack">
                <ElyPublicAlert
                  eyebrow="Blocked"
                  title="Danger needs explanation before action"
                  tone="warning"
                >
                  Warning copy should explain the blocker and recovery. It
                  should not become a decorative orange card beside a primary
                  destructive button.
                </ElyPublicAlert>
                <div class="ely-public-actions">
                  <ElyPublicButton>Resolve blocker</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Read details</ElyPublicButton>
                </div>
              </div>
            </aside>
          </section>

          <section class="ely-story-action-lane-grid">
            <article
              v-for="lane in actionLanes"
              :key="lane.label"
              class="ely-story-action-lane"
            >
              <span>{{ lane.sample }}</span>
              <strong>{{ lane.label }}</strong>
              <p>{{ lane.body }}</p>
            </article>
          </section>

          <section class="ely-story-action-layout">
            <article class="ely-story-action-recovery-panel">
              <p class="ely-public-eyebrow">Empty and blocked states</p>
              <h2>Recovery still has a hierarchy</h2>
              <ElyPublicText tone="muted">
                Empty states should offer one recovery action and one quiet escape.
              </ElyPublicText>
              <ElyPublicEmptyState
                eyebrow="Media variant"
                title="No preview image has been attached"
              >
                Publish the text-only release now, or add one governed image
                ratio before opening the member preview.

                <template v-slot:actions>
                  <ElyPublicButton>Add media</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Use text-only</ElyPublicButton>
                </template>
              </ElyPublicEmptyState>
            </article>

            <article class="ely-story-action-check-panel">
              <p class="ely-public-eyebrow">Review checklist</p>
              <h2>Approve actions by decision order</h2>
              <div class="ely-story-action-checklist ely-story-offset-md">
                <div
                  v-for="item in reviewChecklist"
                  :key="item"
                  class="ely-story-action-check"
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
