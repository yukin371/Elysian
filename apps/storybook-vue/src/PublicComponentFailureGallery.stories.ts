import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const componentFailureCases = [
  {
    component: "Button",
    title: "Button used as decoration",
    symptom:
      "A primary-looking control labels a category but does not perform an action.",
    repair: publicComponentDocs.Button.antiPatterns[0],
    evidence: "Button Anatomy",
    storyId: "public-luxe-components-button--anatomy",
  },
  {
    component: "Badge",
    title: "Badge behaves like a CTA",
    symptom:
      "A status marker is clickable, stealing priority from the real action.",
    repair: publicComponentDocs.Badge.antiPatterns[0],
    evidence: "Badge States",
    storyId: "public-luxe-components-badge--states",
  },
  {
    component: "Input",
    title: "Placeholder-only field",
    symptom:
      "The field looks clean, but the label disappears once the user types.",
    repair: publicComponentDocs.Input.antiPatterns[0],
    evidence: "Input States",
    storyId: "public-luxe-components-input--states",
  },
  {
    component: "Dialog",
    title: "Dialog becomes a page shell",
    symptom:
      "A modal contains a long workflow, hidden recovery, and too many decisions.",
    repair: publicComponentDocs.Dialog.antiPatterns[0],
    evidence: "Dialog States",
    storyId: "public-luxe-components-dialog--states",
  },
  {
    component: "Tabs",
    title: "Tabs replace route navigation",
    symptom:
      "Global sections hide behind tabs, so users lose wayfinding and recovery.",
    repair: publicComponentDocs.Tabs.antiPatterns[0],
    evidence: "Tabs Keyboard",
    storyId: "public-luxe-components-tabs--keyboard-scenarios",
  },
  {
    component: "Skeleton",
    title: "Skeleton becomes final content",
    symptom: "Loading placeholders remain after the data outcome is known.",
    repair: publicComponentDocs.Skeleton.antiPatterns[0],
    evidence: "Skeleton Loading",
    storyId: "public-luxe-components-skeleton--loading-scenarios",
  },
] as const

const componentFailureReviewOrder = [
  "Identify whether the primitive still matches its semantic job.",
  "Check owner docs before inventing a local workaround.",
  "Demote visual emphasis before adding another variant.",
  "Prefer an existing primitive with the right semantics over styling the wrong one.",
  "Reject the story if state, focus, recovery, or label evidence is absent.",
] as const

const componentRepairChecklist = [
  "The primitive's native role matches the user job.",
  "The visible label explains action, destination, status, or recovery.",
  "State is not communicated by color alone.",
  "The fix links back to owner docs or a detailed scenario story.",
] as const

const meta = {
  title: "Public Luxe/Components/Component Failure Gallery",
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
      ElyPublicLink,
      ElyPublicText,
    },
    setup() {
      return {
        componentFailureCases,
        componentFailureReviewOrder,
        componentRepairChecklist,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Component failure gallery</p>
            <h1 class="ely-public-section-title">Rejected primitive use should point back to the owner contract</h1>
            <p class="ely-public-copy">
              Component mistakes are usually semantic before they are visual.
              This gallery turns common primitive misuse into reviewable
              rejection cases, while keeping the component API and token truth in
              ui-public-vue.
            </p>

            <div class="ely-story-component-failure-order ely-story-offset-md">
              <article
                v-for="(step, index) in componentFailureReviewOrder"
                :key="step"
                class="ely-story-component-failure-step"
              >
                <span>0{{ index + 1 }}</span>
                <ElyPublicText weight="semibold">{{ step }}</ElyPublicText>
              </article>
            </div>
          </section>

          <section class="ely-story-component-failure-grid">
            <article
              v-for="failure in componentFailureCases"
              :key="failure.title"
              class="ely-story-component-failure-card"
            >
              <div class="ely-story-component-failure-head">
                <div>
                  <span>{{ failure.component }}</span>
                  <h2>{{ failure.title }}</h2>
                </div>
                <ElyPublicBadge tone="danger">Reject</ElyPublicBadge>
              </div>

              <div class="ely-story-component-failure-specimen" aria-label="Rejected component specimen">
                <ElyPublicButton
                  v-if="failure.component === 'Button'"
                  size="sm"
                >
                  Featured
                </ElyPublicButton>
                <ElyPublicBadge
                  v-else-if="failure.component === 'Badge'"
                  tone="primary"
                >
                  Claim reward
                </ElyPublicBadge>
                <div
                  v-else-if="failure.component === 'Input'"
                  class="ely-story-component-failure-field"
                >
                  <span>Placeholder only</span>
                  <strong>Where should this be repaired?</strong>
                </div>
                <div
                  v-else-if="failure.component === 'Dialog'"
                  class="ely-story-component-failure-modal"
                >
                  <strong>Entire page hidden in a modal</strong>
                  <span>Five sections, no route, no recovery.</span>
                </div>
                <div
                  v-else-if="failure.component === 'Tabs'"
                  class="ely-story-component-failure-tabs"
                >
                  <span>Billing</span>
                  <span>Security</span>
                  <span>Support</span>
                </div>
                <div
                  v-else
                  class="ely-story-component-failure-skeleton"
                >
                  <span />
                  <span />
                  <span />
                </div>
                <ElyPublicAlert
                  eyebrow="Misuse"
                  :title="failure.title"
                  tone="warning"
                >
                  {{ failure.symptom }}
                </ElyPublicAlert>
              </div>

              <div class="ely-story-component-failure-copy">
                <ElyPublicText tone="muted">{{ failure.symptom }}</ElyPublicText>
                <ElyPublicText weight="semibold">{{ failure.repair }}</ElyPublicText>
                <ElyPublicLink :href="'/?path=/story/' + failure.storyId">
                  Review {{ failure.evidence }}
                </ElyPublicLink>
              </div>
            </article>
          </section>

          <section class="ely-story-component-failure-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Repair checklist</p>
              <h2 class="ely-public-section-title">Do not solve semantic drift with stronger styling</h2>
              <div class="ely-story-component-failure-checks ely-story-offset-md">
                <div
                  v-for="check in componentRepairChecklist"
                  :key="check"
                  class="ely-story-component-failure-check"
                >
                  <ElyPublicBadge tone="accent">Repair</ElyPublicBadge>
                  <ElyPublicText weight="semibold">{{ check }}</ElyPublicText>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval sentence</p>
              <h2 class="ely-public-section-title">The right primitive should make the intent obvious</h2>
              <ElyPublicText class="ely-story-offset-md">
                A component passes review when its native role, visible label,
                state behavior, and owner-doc guidance all describe the same
                user job.
              </ElyPublicText>
              <ElyPublicDivider label="Next evidence" align="start" />
              <ElyPublicLink href="/?path=/story/public-luxe-components-index--coverage">
                Return to component coverage
              </ElyPublicLink>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
