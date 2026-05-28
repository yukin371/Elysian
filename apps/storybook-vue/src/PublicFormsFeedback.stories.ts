import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicInput,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSwitch,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const toneOptions: ElyPublicSelectOption[] = [
  { value: "elysia-default", label: "Elysia Bloom" },
  { value: "rose-nocturne", label: "Rose Nocturne" },
  { value: "azure-aria", label: "Azure Aria" },
  { value: "enterprise-calm", label: "Enterprise Calm" },
]

const publishModes: ElyPublicRadioGroupItem[] = [
  {
    key: "draft",
    label: "Draft",
    description: "Keep the ritual private while copy and media are refined.",
    value: "draft",
  },
  {
    key: "member",
    label: "Member preview",
    description: "Open to members with clear reward and access feedback.",
    value: "member",
  },
  {
    key: "public",
    label: "Public release",
    description: "Publish after accessibility, media, and state review pass.",
    value: "public",
  },
]

const reviewSteps = [
  {
    label: "Copy",
    status: "Needs fix",
    tone: "accent",
  },
  {
    label: "Theme",
    status: "Aligned",
    tone: "primary",
  },
  {
    label: "A11y",
    status: "Review",
    tone: "neutral",
  },
  {
    label: "Publish",
    status: "Blocked",
    tone: "danger",
  },
] as const

const handoffNotes = [
  "Primary action is blocked until required fields and consent are clear.",
  "Warnings explain the next step instead of asking users to guess.",
  "Progress pairs a number with a label so color and motion are not the only cues.",
  "Empty-state copy offers a recovery path instead of decorative absence.",
] as const

const meta = {
  title: "Public Luxe/Patterns/Forms & Feedback",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Showcase: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicInput,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSwitch,
      ElyPublicText,
    },
    setup() {
      const title = ref("Moonlit atelier release")
      const contact = ref("curator@example.com")
      const themeFamily = ref("elysia-default")
      const publishMode = ref("member")
      const acceptedReview = ref(false)
      const reducedMotion = ref(true)

      const titleMessage = computed(() =>
        title.value.trim().length >= 8
          ? undefined
          : "Name the release with at least 8 characters.",
      )
      const contactMessage = computed(() =>
        contact.value.includes("@")
          ? undefined
          : "Enter a reachable email for review follow-up.",
      )
      const formReady = computed(
        () =>
          !titleMessage.value && !contactMessage.value && acceptedReview.value,
      )
      const readiness = computed(() => (formReady.value ? 92 : 64))

      return {
        acceptedReview,
        contact,
        contactMessage,
        formReady,
        handoffNotes,
        publishMode,
        publishModes,
        readiness,
        reducedMotion,
        reviewSteps,
        themeFamily,
        title,
        titleMessage,
        toneOptions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero ely-public-hero--atelier">
            <div>
              <p class="ely-public-eyebrow">Pattern · Forms & Feedback</p>
              <h1 class="ely-public-title">
                Make high-touch forms feel
                <span class="ely-public-title-accent">ornate, calm, and recoverable</span>
              </h1>
              <p class="ely-public-copy">
                Public-luxe forms should not become enterprise slabs, but they
                still need field labels, validation, status feedback, consent,
                progress, and empty-state recovery. This pattern shows the
                default rhythm for creator, member, and account-facing flows.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton :disabled="!formReady">Publish release</ElyPublicButton>
                <ElyPublicButton tone="secondary">Save as draft</ElyPublicButton>
                <ElyPublicButton tone="ghost">Preview member view</ElyPublicButton>
              </div>
            </div>

            <div class="ely-story-form-status">
              <p class="ely-public-eyebrow">Readiness</p>
              <strong>{{ readiness }}%</strong>
              <ElyPublicProgress
                label="Release review progress"
                :value="readiness"
              />
              <ElyPublicText tone="muted">
                The primary action stays disabled until field validity and
                explicit review consent are both satisfied.
              </ElyPublicText>
            </div>
          </section>

          <section class="ely-story-form-layout">
            <section class="ely-story-form-setup" aria-label="Release setup">
              <p class="ely-public-eyebrow">Release setup</p>
              <h2>Field rhythm with visible recovery</h2>
              <ElyPublicText tone="muted">
                Labels, helper copy, invalid messages, and state badges should read as one calm form language.
              </ElyPublicText>
              <div class="ely-public-stack">
                <ElyPublicInput
                  v-model="title"
                  description="Used in member notifications, archive cards, and reward slips."
                  :invalid-message="titleMessage"
                  label="Release title"
                />
                <ElyPublicInput
                  v-model="contact"
                  description="Receives reviewer notes if publication is blocked."
                  :invalid-message="contactMessage"
                  label="Review contact"
                  type="email"
                />
                <ElyPublicSelect
                  v-model="themeFamily"
                  description="Choose a governed family rather than mixing one-off colors."
                  label="Theme family"
                  :options="toneOptions"
                />

                <ElyPublicDivider label="Publication mode" tone="accent" />

                <ElyPublicRadioGroup
                  aria-label="Publication mode"
                  v-model="publishMode"
                  :items="publishModes"
                />

                <ElyPublicDivider label="Consent and motion" />

                <ElyPublicCheckbox
                  v-model="acceptedReview"
                  label="I reviewed copy, media, and accessibility notes"
                  description="Required before publishing to members or public surfaces."
                />
                <ElyPublicSwitch
                  v-model="reducedMotion"
                  label="Prefer reduced-motion preview"
                  description="Keeps state and progress readable without relying on reveal animation."
                />
              </div>
            </section>

            <div class="ely-story-form-side">
              <ElyPublicAlert
                :eyebrow="formReady ? 'Ready' : 'Blocked'"
                :title="formReady ? 'Release can move forward' : 'One review step still needs attention'"
                :tone="formReady ? 'success' : 'warning'"
              >
                {{ formReady
                  ? "All required fields and review consent are complete."
                  : "Complete the visible invalid fields and confirm review consent before publishing."
                }}

                <template v-slot:actions>
                  <ElyPublicButton size="sm" :disabled="!formReady">
                    Continue
                  </ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">
                    Inspect blockers
                  </ElyPublicButton>
                </template>
              </ElyPublicAlert>

              <section class="ely-story-form-review">
                <p class="ely-public-eyebrow">Review states</p>
                <h2>Pair tone with text</h2>
                <div class="ely-story-form-step-list ely-story-offset-md">
                  <div
                    v-for="step in reviewSteps"
                    :key="step.label"
                    class="ely-story-form-step"
                  >
                    <strong>{{ step.label }}</strong>
                    <ElyPublicBadge :tone="step.tone">{{ step.status }}</ElyPublicBadge>
                  </div>
                </div>
              </section>

              <ElyPublicEmptyState
                eyebrow="Fallback path"
                title="No media variant has been attached"
              >
                Continue with a text-only release if the message is ready, or
                attach a governed image ratio before opening member preview.

                <template v-slot:actions>
                  <ElyPublicButton>Add media</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Use text-only</ElyPublicButton>
                </template>
              </ElyPublicEmptyState>
            </div>
          </section>

          <section class="ely-story-form-handoff">
            <div class="ely-story-form-section-head">
              <div>
                <p class="ely-public-eyebrow">Implementation handoff</p>
                <h2>Form polish is approved by recovery quality</h2>
              </div>
            </div>
            <div class="ely-story-form-note-grid ely-story-offset-md">
              <div
                v-for="note in handoffNotes"
                :key="note"
                class="ely-story-form-note"
              >
                <span aria-hidden="true"></span>
                <ElyPublicText weight="semibold">{{ note }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
