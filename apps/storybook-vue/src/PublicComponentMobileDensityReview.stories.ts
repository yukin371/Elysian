import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicStat,
  ElyPublicSwitch,
  ElyPublicTabs,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
  ElyPublicTabsItem,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const meta = {
  title: "Public Luxe/Components/Mobile Density Review",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const densityOptions: ElyPublicRadioGroupItem[] = [
  {
    key: "compact",
    label: "Compact",
    description: "Dense review list with ornament trimmed first.",
    value: "compact",
  },
  {
    key: "balanced",
    label: "Balanced",
    description: "Default mobile rhythm for public-luxe surfaces.",
    value: "balanced",
  },
  {
    key: "ceremonial",
    label: "Ceremonial",
    description: "Only for launch, reward, or approval moments.",
    value: "ceremonial",
  },
]

const reviewTabs: ElyPublicTabsItem[] = [
  {
    key: "action",
    label: "Action",
    description: "Primary path, support link, and status evidence.",
  },
  {
    key: "repair",
    label: "Repair",
    description: "Field error, alert, and recovery route.",
  },
  {
    key: "finish",
    label: "Finish",
    description: "Progress, confirmation, and final empty outcome.",
  },
]

const surfaceOptions: ElyPublicSelectOption[] = [
  { label: "Creator invite", value: "creator-invite" },
  { label: "Reward claim", value: "reward-claim" },
  { label: "Editorial save", value: "editorial-save" },
]

const mobileReviewChecks = [
  "One visible primary action",
  "Field label stays present",
  "Recovery path is reachable",
  "Ornament trims before copy",
]

const componentReviewRoutes = [
  "component-theme-specimen-wall",
  "component-operability-board",
  "component-state-matrix",
  "component-scenario-atlas",
].map((key) => {
  const entry = publicShowcaseEntries.find((item) => item.key === key)

  if (!entry) {
    throw new Error(`Missing public showcase entry: ${key}`)
  }

  return entry
})

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicStat,
      ElyPublicSwitch,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("action")
      const density = ref("balanced")
      const inviteName = ref("Elysia review guest")
      const selectedSurface = ref("creator-invite")
      const syncNotes = ref(true)
      const reviewedModes = ref(false)
      const compactCopy = ref(false)

      const densityLabel = computed(
        () =>
          densityOptions.find((option) => option.value === density.value)
            ?.label ?? "Balanced",
      )
      const componentProof = computed(() => [
        publicComponentDocs.Button.name,
        publicComponentDocs.Input.name,
        publicComponentDocs.Alert.name,
        publicComponentDocs.Progress.name,
        publicComponentDocs.Tabs.name,
        publicComponentDocs.EmptyState.name,
      ])

      return {
        activeTab,
        compactCopy,
        componentProof,
        componentReviewRoutes,
        createStoryPath,
        density,
        densityLabel,
        densityOptions,
        inviteName,
        mobileReviewChecks,
        reviewedModes,
        reviewTabs,
        selectedSurface,
        surfaceOptions,
        syncNotes,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell ely-story-mobile-review">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Component mobile density</p>
            <h1 class="ely-public-section-title">Approve the public primitives in a narrow surface</h1>
            <p class="ely-public-copy">
              A component system is not finished when the desktop specimen looks
              graceful. Public-luxe also needs a compact mobile rhythm where
              labels, recovery copy, focusable actions, and theme ornament still
              feel intentional instead of squeezed.
            </p>
            <div class="ely-story-mobile-review-proof" aria-label="Mobile review proof">
              <ElyPublicBadge
                v-for="name in componentProof"
                :key="name"
                tone="primary"
              >
                {{ name }}
              </ElyPublicBadge>
            </div>
          </section>

          <section class="ely-story-mobile-review-grid" aria-label="Mobile component review surfaces">
            <article class="ely-story-mobile-review-phone" data-density="compact">
              <div class="ely-story-mobile-review-phone-bar">
                <span>Compact</span>
                <ElyPublicBadge tone="neutral">review list</ElyPublicBadge>
              </div>
              <div class="ely-story-mobile-review-surface">
                <p class="ely-public-eyebrow">Action lane</p>
                <h3>One next step</h3>
                <p>Dense layouts trim ornament before they hide copy or labels.</p>
                <div class="ely-story-mobile-review-stack">
                  <ElyPublicStat
                    align="start"
                    eyebrow="Ready"
                    helper="Small summary, explicit meaning."
                    tone="muted"
                    trend="flat"
                    value="3 checks"
                  >
                    No hidden gate
                  </ElyPublicStat>
                  <ElyPublicProgress label="Profile proof" tone="primary" :value="72" />
                  <div class="ely-story-mobile-review-actions">
                    <ElyPublicButton size="sm">Continue</ElyPublicButton>
                    <ElyPublicLink href="#">Read policy</ElyPublicLink>
                  </div>
                </div>
              </div>
            </article>

            <article class="ely-story-mobile-review-phone" data-density="balanced">
              <div class="ely-story-mobile-review-phone-bar">
                <span>Balanced</span>
                <ElyPublicBadge tone="accent">{{ densityLabel }}</ElyPublicBadge>
              </div>
              <div class="ely-story-mobile-review-surface">
                <p class="ely-public-eyebrow">Interactive lane</p>
                <h3>Edit the compact contract</h3>
                <p>Controls remain real, not screenshot-only proof.</p>
                <div class="ely-story-mobile-review-stack">
                  <ElyPublicInput
                    v-model="inviteName"
                    description="Visible helper copy survives narrow width."
                    label="Invite name"
                  />
                  <ElyPublicSelect
                    v-model="selectedSurface"
                    description="Select stays for structured choices, not page navigation."
                    label="Surface type"
                    :options="surfaceOptions"
                  />
                  <ElyPublicRadioGroup
                    v-model="density"
                    aria-label="Mobile density"
                    :items="densityOptions"
                  />
                  <ElyPublicSwitch
                    v-model="syncNotes"
                    description="Runtime preference applies immediately."
                    label="Sync notes"
                  />
                  <ElyPublicCheckbox
                    v-model="reviewedModes"
                    description="Approval needs light and dark mode proof."
                    label="I reviewed both modes"
                  />
                </div>
              </div>
            </article>

            <article class="ely-story-mobile-review-phone" data-density="ceremonial">
              <div class="ely-story-mobile-review-phone-bar">
                <span>Ceremonial</span>
                <ElyPublicBadge tone="primary">trimmed</ElyPublicBadge>
              </div>
              <div class="ely-story-mobile-review-surface">
                <p class="ely-public-eyebrow">State lane</p>
                <h3>Repair before polish</h3>
                <p>The ornate moment still needs an actionable recovery path.</p>
                <div class="ely-story-mobile-review-stack">
                  <ElyPublicAlert
                    eyebrow="Repair"
                    title="Invite needs a named recipient"
                    tone="warning"
                  >
                    Keep the warning close to the field and keep the next step obvious.
                  </ElyPublicAlert>
                  <ElyPublicTabs
                    v-model="activeTab"
                    aria-label="Mobile review sections"
                    :items="reviewTabs"
                  >
                    <template v-slot:default="{ activeItem }">
                      <div class="ely-story-mobile-review-panel">
                        <strong>{{ activeItem.label }}</strong>
                        <span>{{ activeItem.description }}</span>
                      </div>
                    </template>
                  </ElyPublicTabs>
                  <ElyPublicEmptyState
                    title="No mobile invites yet"
                    tone="default"
                  >
                    The final empty state gives one recovery action and one quiet support route.

                    <template v-slot:actions>
                      <ElyPublicButton size="sm">Create invite</ElyPublicButton>
                      <ElyPublicLink href="#">Open archive</ElyPublicLink>
                    </template>
                  </ElyPublicEmptyState>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-mobile-review-board" aria-label="Mobile density approval board">
            <article class="ely-story-mobile-review-board-panel">
              <p class="ely-public-eyebrow">Review checks</p>
              <h2 class="ely-public-section-title">Mobile approval rejects decorative compression</h2>
              <p>The narrow version is allowed to be concise, but it cannot remove semantics.</p>
              <div class="ely-story-mobile-review-checks">
                <span v-for="check in mobileReviewChecks" :key="check">{{ check }}</span>
              </div>
              <ElyPublicDivider label="Route back to evidence" />
              <div class="ely-story-mobile-review-routes">
                <a
                  v-for="route in componentReviewRoutes"
                  :key="route.key"
                  :href="createStoryPath(route.storyId)"
                >
                  <small>{{ route.eyebrow }}</small>
                  <strong>{{ route.title }}</strong>
                  <span>{{ route.stat }}</span>
                </a>
              </div>
            </article>

            <article class="ely-story-mobile-review-board-panel">
              <p class="ely-public-eyebrow">Live state</p>
              <h2 class="ely-public-section-title">Current narrow-surface decision</h2>
              <p>This summarizes the interactive controls without inventing a production settings model.</p>
              <div class="ely-story-mobile-review-summary">
                <span>Density</span>
                <strong>{{ densityLabel }}</strong>
                <span>Surface</span>
                <strong>{{ selectedSurface }}</strong>
                <span>Notes sync</span>
                <strong>{{ syncNotes ? "On" : "Off" }}</strong>
                <span>Mode proof</span>
                <strong>{{ reviewedModes ? "Checked" : "Pending" }}</strong>
              </div>
              <ElyPublicDivider label="Copy stress" />
              <ElyPublicSwitch
                v-model="compactCopy"
                description="Use this to check whether helper copy still reads in compact rhythm."
                label="Compact explanatory copy"
              />
              <ElyPublicText :tone="compactCopy ? 'subtle' : 'primary'">
                {{ compactCopy
                  ? "Short copy is allowed, missing meaning is not."
                  : "The public preset keeps labels, state copy, and recovery paths visible before it adds ceremonial glow."
                }}
              </ElyPublicText>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
