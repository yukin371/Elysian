import type { UiSelectOption } from "@elysian/ui-core"
import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicInput,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSkeleton,
  ElyPublicSwitch,
} from "@elysian/ui-public-vue"
import type { ElyPublicRadioGroupItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const interactionRules = [
  {
    body: "Hover and active states can lift by one or two pixels, but the component boundary must stay readable.",
    title: "Movement stays subtle",
  },
  {
    body: "Focus rings are visible, theme-aware, and never replaced by color-only state changes.",
    title: "Focus is a contract",
  },
  {
    body: "Disabled and loading states keep layout stable while clearly blocking duplicate or unavailable actions.",
    title: "Blocked still reads",
  },
  {
    body: "Invalid and alert states use semantic status roles; brand accent never substitutes for error meaning.",
    title: "Status owns meaning",
  },
] as const

const densityOptions: ElyPublicRadioGroupItem[] = [
  {
    description:
      "Default public-luxe rhythm for editorial and account surfaces.",
    key: "comfortable",
    label: "Comfortable",
    value: "comfortable",
  },
  {
    description: "Tighter rhythm for information-heavy front-stage workspaces.",
    key: "compact",
    label: "Compact",
    value: "compact",
  },
  {
    description: "Ceremonial rhythm reserved for hero or membership moments.",
    key: "ceremonial",
    label: "Ceremonial",
    value: "ceremonial",
  },
]

const themeOptions: UiSelectOption[] = [
  { label: "Elysia Bloom", value: "elysia-default" },
  { label: "Rose Nocturne", value: "rose-nocturne" },
  { label: "Azure Aria", value: "azure-aria" },
]

const stateChecklist = [
  "Can keyboard users reach and leave every control?",
  "Is the blocked state explained by label, helper, or surrounding context?",
  "Does invalid feedback include correction copy, not just a red border?",
  "Does loading preserve the surface silhouette without becoming spectacle?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Interaction States",
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
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicInput,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSkeleton,
      ElyPublicSwitch,
    },
    setup() {
      return {
        densityOptions,
        interactionRules,
        stateChecklist,
        themeOptions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Interaction states</p>
            <h1 class="ely-public-section-title">Elegant controls still need hard edges</h1>
            <p class="ely-public-copy">
              The public preset can be luminous, but interaction states must stay
              practical: hover, focus, invalid, disabled, loading, and selected
              all need consistent meaning across every theme family.
            </p>

            <div class="ely-story-state-rule-grid" aria-label="Interaction state rules">
              <article
                v-for="rule in interactionRules"
                :key="rule.title"
                class="ely-story-state-rule"
              >
                <strong>{{ rule.title }}</strong>
                <span>{{ rule.body }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-state-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Action states</p>
              <h2 class="ely-public-section-title">Default, busy, disabled</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <div class="ely-public-inline">
                  <ElyPublicButton>Apply theme</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Save draft</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Cancel</ElyPublicButton>
                </div>
                <div class="ely-public-inline">
                  <ElyPublicButton loading>Syncing</ElyPublicButton>
                  <ElyPublicButton disabled tone="secondary">Locked</ElyPublicButton>
                </div>
                <ElyPublicProgress
                  label="Preference sync"
                  :value="64"
                  tone="accent"
                />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Form states</p>
              <h2 class="ely-public-section-title">Readable before decorative</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <ElyPublicInput
                  label="Public display name"
                  model-value="Crystal editor"
                  description="Helper copy explains stable behavior."
                />
                <ElyPublicInput
                  label="Invitation code"
                  model-value="elysia"
                  invalid-message="Use at least eight characters for invite codes."
                />
                <ElyPublicSelect
                  label="Theme family"
                  model-value="elysia-default"
                  :options="themeOptions"
                  description="Short native selects use the same field surface."
                />
              </div>
            </article>
          </section>

          <section class="ely-story-state-layout">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Choice states</p>
              <h2 class="ely-public-section-title">Selected, unchecked, unavailable</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <ElyPublicSwitch
                  label="Sync theme across devices"
                  description="Switches are immediate runtime settings."
                  :model-value="true"
                />
                <ElyPublicCheckbox
                  label="Include ceremonial highlights"
                  description="Checkboxes express independent inclusion."
                  :model-value="true"
                />
                <ElyPublicRadioGroup
                  aria-label="Density preference"
                  model-value="comfortable"
                  :items="densityOptions"
                />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Feedback states</p>
              <h2 class="ely-public-section-title">Status color is not decoration</h2>
              <div class="ely-public-stack ely-story-offset-md">
                <ElyPublicAlert
                  tone="warning"
                  title="Contrast requires review"
                  eyebrow="Guardrail"
                >
                  Accent text is too prominent for long-form copy. Move it back
                  to muted text or promote it to a real action.
                </ElyPublicAlert>
                <ElyPublicSkeleton :lines="3" tone="soft" />
              </div>
            </article>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Interaction acceptance before visual approval</h2>
            <div class="ely-story-state-checklist ely-story-offset-md">
              <div
                v-for="item in stateChecklist"
                :key="item"
                class="ely-story-state-check"
              >
                <span aria-hidden="true"></span>
                <strong>{{ item }}</strong>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
