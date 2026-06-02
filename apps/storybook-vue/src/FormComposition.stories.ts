import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicFieldset,
  ElyPublicFileInput,
  ElyPublicInput,
  ElyPublicNumberInput,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSlider,
  ElyPublicStat,
  ElyPublicTextarea,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const meta = {
  title: "Public Luxe/Patterns/Form Composition",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Form composition patterns show how multiple input primitives work together inside a flat, reviewable form lane. Each primitive owns one question; the page owns validation, submission, and privacy.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const densityItems: ElyPublicRadioGroupItem[] = [
  {
    key: "comfortable",
    label: "Comfortable",
    description: "More air and display presence",
    value: "comfortable",
  },
  {
    key: "balanced",
    label: "Balanced",
    description: "Default application rhythm",
    value: "balanced",
  },
  {
    key: "compact",
    label: "Compact",
    description: "Denser but still decorative-safe",
    value: "compact",
  },
]

const categoryOptions: ElyPublicSelectOption[] = [
  { label: "Launch event", value: "launch" },
  { label: "Collection update", value: "collection" },
  { label: "Maintenance notice", value: "maintenance" },
]

export const CreatorSubmissionForm: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicFieldset,
      ElyPublicFileInput,
      ElyPublicInput,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicTextarea,
    },
    setup() {
      const title = ref("")
      const category = ref("")
      const density = ref("balanced")
      const description = ref("")
      const reviewedPolicy = ref(false)
      const confirmedIdentity = ref(false)
      const canSubmit = computed(
        () =>
          title.value.trim().length > 0 &&
          category.value.length > 0 &&
          reviewedPolicy.value &&
          confirmedIdentity.value,
      )

      return {
        canSubmit,
        category,
        categoryOptions,
        confirmedIdentity,
        density,
        densityItems,
        description,
        reviewedPolicy,
        title,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Form composition</p>
            <h1 class="ely-public-section-title">Creator submission form</h1>
            <p class="ely-public-copy">
              A flat form lane keeps every question visible. Fieldset groups related controls, and each primitive owns exactly one question.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="title"
                label="Submission title"
                description="The title appears on the public collection page."
                placeholder="Name this submission"
                :invalid-message="title.trim() ? undefined : 'A title is required.'"
              />

              <ElyPublicSelect
                v-model="category"
                label="Submission category"
                description="Choose the category that matches the public surface."
                :items="categoryOptions"
                placeholder="Select a category"
              />

              <ElyPublicFieldset
                legend="Display preference"
                tone="accent"
                description="These settings change how the submission looks, not what it contains."
              >
                <ElyPublicRadioGroup
                  aria-label="Display density"
                  v-model="density"
                  :items="densityItems"
                />
              </ElyPublicFieldset>

              <ElyPublicTextarea
                v-model="description"
                label="Submission description"
                description="Write the description reviewers will see before approving."
                placeholder="Describe the intent and evidence"
                :max-length="320"
                show-count
              />

              <ElyPublicFileInput
                label="Evidence attachment"
                description="Attach a proof document or image. Upload transport is owned by the page."
                accept="image/*,.pdf"
              />

              <ElyPublicFieldset
                legend="Consent checklist"
                density="compact"
                :invalid-message="reviewedPolicy && confirmedIdentity ? undefined : 'Both confirmations are required before submission.'"
              >
                <ElyPublicCheckbox
                  v-model="reviewedPolicy"
                  label="I reviewed the public copy standard"
                  description="Policy review is required before the submission enters the approval lane."
                />
                <ElyPublicCheckbox
                  v-model="confirmedIdentity"
                  label="I confirm this is my original work"
                  description="Identity confirmation protects creator ownership."
                />
              </ElyPublicFieldset>

              <ElyPublicAlert
                tone="info"
                title="Form composition rules"
                description="Each primitive owns one question. Validation, submission, privacy handling, and routing belong to the page flow, not to individual components."
              />

              <div class="ely-public-actions">
                <ElyPublicButton :disabled="!canSubmit">Submit for review</ElyPublicButton>
                <ElyPublicButton tone="ghost">Save as draft</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const PreferenceTuningForm: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicFieldset,
      ElyPublicNumberInput,
      ElyPublicSlider,
      ElyPublicStat,
    },
    setup() {
      const intensity = ref(62)
      const motion = ref(35)
      const guestSeats = ref(8)

      return { guestSeats, intensity, motion }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Preference tuning form</p>
            <h1 class="ely-public-section-title">Sliders, numbers, and fieldsets tune one surface together</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset
                legend="Expression tuning"
                description="These sliders adjust visual atmosphere without changing component grammar."
              >
                <ElyPublicSlider
                  v-model="intensity"
                  label="Ornament intensity"
                  description="Controls how much decorative emphasis appears on public surfaces."
                  unit="%"
                />
                <ElyPublicSlider
                  v-model="motion"
                  label="Reveal motion"
                  description="Controls animation speed. Keep below 50 for accessible defaults."
                  unit="%"
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Capacity settings"
                tone="primary"
                description="Exact numbers for resource allocation."
              >
                <ElyPublicNumberInput
                  v-model="guestSeats"
                  label="Guest preview seats"
                  description="Exact seat count. Changes here update the capacity metric above."
                  :min="0"
                  :max="40"
                  unit="seats"
                />
              </ElyPublicFieldset>

              <div class="ely-public-card__header">
                <ElyPublicStat
                  label="Ornament"
                  :value="String(intensity)"
                  suffix="%"
                  tone="primary"
                />
                <ElyPublicStat
                  label="Guest capacity"
                  :value="String(guestSeats)"
                  suffix="/40"
                  tone="accent"
                />
              </div>

              <ElyPublicAlert
                tone="info"
                title="Tuning stays local"
                description="Preference changes affect the current surface only. Global defaults are managed in a separate settings flow."
              />

              <div class="ely-public-actions">
                <ElyPublicButton>Apply preferences</ElyPublicButton>
                <ElyPublicButton tone="ghost">Reset to defaults</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
