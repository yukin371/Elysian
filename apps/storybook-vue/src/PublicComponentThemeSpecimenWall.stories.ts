import {
  ElyPublicAlert,
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicDialog,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSkeleton,
  ElyPublicStat,
  ElyPublicSwitch,
  ElyPublicTabs,
  ElyPublicText,
  publicComponentDocs,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
  ElyPublicTabsItem,
  PublicThemePack,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import {
  type PublicComponentReviewFocus,
  publicComponentReviewFocusLabels,
  publicComponentScenarioCoverage,
} from "./component-story-coverage"
import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

interface SpecimenFamily {
  components: string[]
  focus: PublicComponentReviewFocus[]
  label: string
  proof: string
}

const themeModes = ["light", "dark"] as const

const specimenTabs: ElyPublicTabsItem[] = [
  {
    key: "compose",
    label: "Compose",
    description: "Actions, status, and supporting copy in one active surface.",
  },
  {
    key: "repair",
    label: "Repair",
    description: "Validation, warning, and recovery without changing language.",
  },
  {
    key: "finish",
    label: "Finish",
    description: "Loading, progress, and final state evidence.",
  },
]

const themeOptions: ElyPublicSelectOption[] = publicThemePacks.map((theme) => ({
  label: theme.displayName,
  value: theme.key,
}))

const densityOptions: ElyPublicRadioGroupItem[] = [
  {
    key: "quiet",
    label: "Quiet",
    description: "Low ornament, documentation-friendly review.",
    value: "quiet",
  },
  {
    key: "luminous",
    label: "Luminous",
    description: "Default public-luxe presence for launch surfaces.",
    value: "luminous",
  },
  {
    key: "ceremonial",
    label: "Ceremonial",
    description: "Reserved for hero or high-visibility approval moments.",
    value: "ceremonial",
  },
]

const specimenFamilies: SpecimenFamily[] = [
  {
    components: ["Button", "Link", "Badge", "Stat"],
    focus: ["interaction", "content"],
    label: "Action and signal",
    proof:
      "One primary path, quiet support action, compact status, and readable summary evidence.",
  },
  {
    components: ["Input", "Select", "Switch", "Checkbox", "Radio Group"],
    focus: ["state", "feedback", "accessibility"],
    label: "Form decision cluster",
    proof:
      "Label, helper text, invalid repair, explicit consent, and single-choice density stay in one visual grammar.",
  },
  {
    components: ["Alert", "Progress", "Skeleton", "Empty State"],
    focus: ["feedback", "composition"],
    label: "Feedback and recovery",
    proof:
      "The system explains what changed, what is still loading, and what the user can do next.",
  },
  {
    components: ["Tabs", "Card", "Avatar", "Text", "Divider"],
    focus: ["density", "composition", "accessibility"],
    label: "Surface rhythm",
    proof:
      "Section switching, identity, body copy, and dividers keep hierarchy without card nesting.",
  },
]

const reviewRoutes = [
  "theme-chooser",
  "component-index",
  "component-acceptance-board",
  "component-api-reference",
  "component-state-matrix",
  "component-operability-board",
  "component-failure-gallery",
]

const scenarioSummary = publicComponentScenarioCoverage.reduce(
  (summary, coverage) => {
    for (const scenario of coverage.scenarios) {
      for (const focus of scenario.reviewFocus) {
        summary[focus] = (summary[focus] ?? 0) + 1
      }
    }

    return summary
  },
  {} as Record<PublicComponentReviewFocus, number>,
)

const getThemePreviewStyle = (
  theme: PublicThemePack,
  mode: "light" | "dark",
) => {
  const preview = mode === "dark" ? theme.preview.dark : theme.preview

  return {
    "--ely-story-theme-specimen-accent": preview.accent,
    "--ely-story-theme-specimen-hero-from": preview.heroFrom,
    "--ely-story-theme-specimen-hero-to": preview.heroTo,
    "--ely-story-theme-specimen-surface": preview.surface,
  }
}

const showcaseEntryByKey = new Map(
  publicShowcaseEntries.map((entry) => [entry.key, entry]),
)

const meta = {
  title: "Public Luxe/Components/Theme Specimen Wall",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A live component specimen wall for checking whether public primitives feel coherent in the active theme before opening deeper governance boards.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicDialog,
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSkeleton,
      ElyPublicStat,
      ElyPublicSwitch,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("compose")
      const consentAccepted = ref(false)
      const density = ref("luminous")
      const selectedTheme = ref(publicThemePacks[0]?.key ?? "elysia-default")
      const syncEnabled = ref(true)
      const title = ref("Moonlit launch notes")
      const routeEntries = computed(() =>
        reviewRoutes
          .map((key) => showcaseEntryByKey.get(key))
          .filter((entry): entry is NonNullable<typeof entry> =>
            Boolean(entry),
          ),
      )

      return {
        activeTab,
        componentCount: Object.keys(publicComponentDocs).length,
        consentAccepted,
        createStoryPath,
        density,
        densityOptions,
        getThemePreviewStyle,
        publicComponentDocs,
        publicComponentReviewFocusLabels,
        publicThemePacks,
        routeEntries,
        scenarioSummary,
        selectedTheme,
        specimenFamilies,
        specimenTabs,
        syncEnabled,
        themeModes,
        themeOptions,
        title,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card ely-story-theme-specimen-hero" data-emphasis="feature">
            <div>
              <p class="ely-public-eyebrow">Component theme specimen</p>
              <h1 class="ely-public-section-title">Judge the component set from live surfaces, not only tables</h1>
              <p class="ely-public-copy">
                This wall keeps the toolbar theme live, then uses the launch families as compact identity lanes.
                Review the product surface first; only then jump into acceptance, API, state, and failure evidence.
              </p>
            </div>
            <div class="ely-story-theme-specimen-hero__facts" aria-label="Component specimen proof summary">
              <ElyPublicStat
                eyebrow="Owner docs"
                :value="String(componentCount)"
                tone="primary"
                trend="flat"
              >
                Public primitives
              </ElyPublicStat>
              <ElyPublicStat
                eyebrow="Detailed proof"
                :value="String(Object.values(scenarioSummary).reduce((total, count) => total + count, 0))"
                tone="accent"
                trend="up"
              >
                Review focus marks
              </ElyPublicStat>
              <ElyPublicBadge tone="success">active theme live</ElyPublicBadge>
            </div>
          </section>

          <section class="ely-story-theme-specimen-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Theme family proof</p>
                <h2 class="ely-public-section-title">Choose the family, then inspect live components</h2>
              </div>
              <p>
                These lanes use theme pack preview metadata only as a visual route.
                Use the toolbar or active theme strip to switch the actual live specimen below.
              </p>
            </div>
            <div class="ely-story-theme-specimen-theme-grid">
              <article
                v-for="theme in publicThemePacks"
                :key="theme.key"
                class="ely-story-theme-specimen-theme-card"
              >
                <div>
                  <span class="ely-story-link-eyebrow">{{ theme.accentLabel }}</span>
                  <h3>{{ theme.displayName }}</h3>
                  <p>{{ theme.description }}</p>
                  <div class="ely-story-theme-specimen-personality">
                    <span>{{ theme.expressionLevel }}</span>
                    <strong>{{ theme.personality }}</strong>
                    <small>{{ theme.designCue }}</small>
                  </div>
                </div>
                <div class="ely-story-theme-specimen-mode-grid" aria-label="Theme light and dark preview">
                  <div
                    v-for="mode in themeModes"
                    :key="mode"
                    class="ely-story-theme-specimen-mode-card"
                    :style="getThemePreviewStyle(theme, mode)"
                  >
                    <span>{{ mode }}</span>
                    <strong>{{ theme.mood }}</strong>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-specimen-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Theme personality strip</p>
                <h2 class="ely-public-section-title">The same primitives should carry different moods clearly</h2>
              </div>
              <p>
                These lanes translate theme metadata into product intent before the live component wall begins.
              </p>
            </div>
            <div class="ely-story-theme-specimen-personality-grid" aria-label="Theme personality lanes">
              <div
                v-for="theme in publicThemePacks"
                :key="theme.key"
                class="ely-story-theme-specimen-personality-card"
                :style="getThemePreviewStyle(theme, 'light')"
              >
                <div>
                  <span class="ely-story-link-eyebrow">{{ theme.key }}</span>
                  <h3>{{ theme.personality }}</h3>
                  <p>{{ theme.bestFor }}</p>
                </div>
                <ElyPublicBadge tone="accent">{{ theme.expressionLevel }}</ElyPublicBadge>
              </div>
            </div>
          </section>

          <section class="ely-story-theme-specimen-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Live active-theme specimen</p>
                <h2 class="ely-public-section-title">One surface, many primitives, one visual grammar</h2>
              </div>
              <p>
                If this panel feels incoherent after switching themes, fix token roles or component states before adding variants.
              </p>
            </div>

            <div class="ely-story-theme-specimen-live-grid">
              <article class="ely-story-theme-specimen-surface">
                <p class="ely-public-eyebrow">Launch workspace</p>
                <h3>Curated release surface</h3>
                <p>Buttons, links, badges, stats, and body copy should remain calm in the active family.</p>
                <div class="ely-public-stack">
                  <div class="ely-public-inline">
                    <ElyPublicButton>Approve theme</ElyPublicButton>
                    <ElyPublicButton tone="secondary">Compare mode</ElyPublicButton>
                    <ElyPublicButton tone="ghost">Save draft</ElyPublicButton>
                  </div>
                  <ElyPublicDivider label="Signal" tone="accent" />
                  <div class="ely-story-theme-specimen-stat-row">
                    <ElyPublicStat eyebrow="Mode pass" value="2/2" tone="primary" trend="flat">
                      Light and dark proof
                    </ElyPublicStat>
                    <ElyPublicStat eyebrow="Risk" value="04" tone="warning" trend="flat">
                      Review gates open
                    </ElyPublicStat>
                  </div>
                  <ElyPublicText tone="muted">
                    The active theme should change atmosphere without changing the action hierarchy or reading order.
                    <ElyPublicLink href="https://example.com/public-luxe-review" tone="accent">
                      Read review notes
                    </ElyPublicLink>
                  </ElyPublicText>
                </div>
              </article>

              <article class="ely-story-theme-specimen-surface">
                <p class="ely-public-eyebrow">Form cluster</p>
                <h3>Preference handoff</h3>
                <p>Form primitives prove labels, helper copy, runtime state, explicit consent, and invalid repair together.</p>
                <div class="ely-public-stack">
                  <ElyPublicInput
                    v-model="title"
                    label="Specimen title"
                    description="A named surface is easier to review than an anonymous component grid."
                  />
                  <ElyPublicSelect
                    v-model="selectedTheme"
                    :options="themeOptions"
                    label="Theme family reference"
                    description="This select is local proof; toolbar still owns the active preview theme."
                  />
                  <ElyPublicRadioGroup
                    v-model="density"
                    aria-label="Specimen density"
                    :items="densityOptions"
                  />
                  <ElyPublicSwitch
                    v-model="syncEnabled"
                    label="Sync polish notes"
                    description="Switches express runtime state, not one-time consent."
                  />
                  <ElyPublicCheckbox
                    v-model="consentAccepted"
                    label="I reviewed the active theme in both modes"
                    description="Checkboxes express explicit confirmation before handoff."
                  />
                </div>
              </article>

              <article class="ely-story-theme-specimen-surface">
                <p class="ely-public-eyebrow">State proof</p>
                <h3>Recovery and pending work</h3>
                <p>Feedback components should explain the next step without becoming a second page layout.</p>
                <div class="ely-public-stack">
                  <ElyPublicAlert tone="warning" title="Mode mismatch needs review">
                    Re-check text pairing if accent surfaces become louder than the primary action.
                  </ElyPublicAlert>
                  <ElyPublicProgress
                    label="Theme handoff readiness"
                    tone="success"
                    :value="78"
                  />
                  <ElyPublicSkeleton tone="soft" :lines="3" />
                  <ElyPublicEmptyState
                    eyebrow="Recovery"
                    title="No rejected state is hidden"
                    tone="accent"
                  >
                    Empty and error moments should keep one next action and one support path.
                    <template v-slot:actions>
                      <ElyPublicButton size="sm">Create proof</ElyPublicButton>
                      <ElyPublicButton size="sm" tone="ghost">Open failure gallery</ElyPublicButton>
                    </template>
                  </ElyPublicEmptyState>
                </div>
              </article>

              <article class="ely-story-theme-specimen-surface">
                <p class="ely-public-eyebrow">Navigation rhythm</p>
                <h3>Section changes stay inside one surface</h3>
                <p>Tabs, avatars, text, dividers, and badges should support orientation, not compete with the task.</p>
                <div class="ely-public-stack">
                  <div class="ely-public-inline">
                    <ElyPublicAvatar name="Elysia Atelier" status="online" />
                    <ElyPublicBadge tone="primary">reviewing</ElyPublicBadge>
                    <ElyPublicBadge tone="neutral">public-luxe</ElyPublicBadge>
                  </div>
                  <ElyPublicTabs v-model="activeTab" :items="specimenTabs">
                    <template v-slot:default="{ activeItem }">
                      <div class="ely-story-theme-specimen-tab-panel">
                        <ElyPublicText size="lg">{{ activeItem?.label }}</ElyPublicText>
                        <ElyPublicText tone="muted">{{ activeItem?.description }}</ElyPublicText>
                      </div>
                    </template>
                  </ElyPublicTabs>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-specimen-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Family coverage lanes</p>
                <h2 class="ely-public-section-title">Review component groups by what could fail</h2>
              </div>
              <p>
                The wall stays visual, but each lane still points back to owner docs and detailed scenarios.
              </p>
            </div>
            <div class="ely-story-theme-specimen-family-grid">
              <article
                v-for="family in specimenFamilies"
                :key="family.label"
                class="ely-story-theme-specimen-family-card"
              >
                <div>
                  <span class="ely-story-link-eyebrow">Specimen lane</span>
                  <h3>{{ family.label }}</h3>
                  <p>{{ family.proof }}</p>
                </div>
                <div class="ely-story-theme-specimen-chip-list">
                  <span v-for="component in family.components" :key="component">
                    {{ component }}
                  </span>
                </div>
                <div class="ely-story-theme-specimen-focus-list">
                  <span v-for="focus in family.focus" :key="focus">
                    <strong>{{ scenarioSummary[focus] ?? 0 }}</strong>
                    {{ publicComponentReviewFocusLabels[focus] }}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-specimen-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Review route</p>
                <h2 class="ely-public-section-title">From specimen beauty to component evidence</h2>
              </div>
              <p>
                Use this wall for first-pass coherence, then inspect the evidence boards before approving the component set.
              </p>
            </div>
            <div class="ely-story-theme-specimen-route">
              <a
                v-for="entry in routeEntries"
                :key="entry.key"
                :href="createStoryPath(entry.storyId)"
              >
                <span>{{ entry.eyebrow }}</span>
                <strong>{{ entry.title }}</strong>
                <small>{{ entry.stat }}</small>
              </a>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const InteractionLab: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCheckbox,
      ElyPublicDialog,
      ElyPublicDivider,
      ElyPublicInput,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSwitch,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("draft")
      const dialogOpen = ref(false)
      const inviteName = ref("Luna Atelier")
      const selectedTheme = ref("elysia-default")
      const density = ref("luminous")
      const syncEnabled = ref(true)
      const reviewedModes = ref(false)
      const qualityScore = computed(
        () =>
          46 +
          (inviteName.value.trim().length > 0 ? 18 : 0) +
          (syncEnabled.value ? 14 : 0) +
          (reviewedModes.value ? 22 : 0),
      )
      const readinessTone = computed(() =>
        reviewedModes.value ? "success" : "warning",
      )

      return {
        activeTab,
        closeDialog: () => {
          dialogOpen.value = false
        },
        density,
        densityOptions,
        dialogOpen,
        inviteName,
        openDialog: () => {
          dialogOpen.value = true
        },
        qualityScore,
        readinessTone,
        reviewedModes,
        selectedTheme,
        specimenTabs,
        syncEnabled,
        themeOptions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card ely-story-theme-specimen-hero" data-emphasis="feature">
            <div>
              <p class="ely-public-eyebrow">Component interaction lab</p>
              <h1 class="ely-public-section-title">Operate the primitives before approving the polish</h1>
              <p class="ely-public-copy">
                This lab is deliberately hands-on: type in the field, change the select, toggle runtime state,
                confirm the checkbox, switch tabs, and open the dialog. The goal is to catch awkward component
                behavior while the surface still feels like the same public-luxe system.
              </p>
            </div>
            <div class="ely-story-theme-specimen-hero__facts" aria-label="Interaction lab proof summary">
              <ElyPublicProgress
                label="Interaction readiness"
                :tone="readinessTone"
                :value="qualityScore"
              />
              <ElyPublicAlert
                :tone="reviewedModes ? 'success' : 'warning'"
                :title="reviewedModes ? 'Mode review confirmed' : 'Mode proof still pending'"
              >
                The lab only feels approved after controls, feedback, and confirmation all remain readable.
              </ElyPublicAlert>
            </div>
          </section>

          <section class="ely-story-theme-specimen-lab-grid">
            <article class="ely-story-theme-specimen-lab-panel">
              <p class="ely-public-eyebrow">01 · Form controls</p>
              <h3>Edit the specimen contract</h3>
              <p>Input, select, radio, switch, and checkbox should feel like one product decision surface.</p>
              <div class="ely-public-stack">
                <ElyPublicInput
                  v-model="inviteName"
                  label="Invite name"
                  description="Typing should not disturb spacing, contrast, or focus rhythm."
                />
                <ElyPublicSelect
                  v-model="selectedTheme"
                  :options="themeOptions"
                  label="Theme proof family"
                  description="The select remains native-accessible while keeping the public-luxe field shape."
                />
                <ElyPublicRadioGroup
                  v-model="density"
                  aria-label="Interaction density"
                  :items="densityOptions"
                />
                <ElyPublicSwitch
                  v-model="syncEnabled"
                  label="Sync component notes"
                  description="Runtime state should be obvious without using color alone."
                />
                <ElyPublicCheckbox
                  v-model="reviewedModes"
                  label="I checked both light and dark mode"
                  description="Explicit confirmation gates handoff readiness."
                />
              </div>
            </article>

            <article class="ely-story-theme-specimen-lab-panel">
              <p class="ely-public-eyebrow">02 · Feedback</p>
              <h3>Let state explain itself</h3>
              <p>Feedback, progress, and copy should respond to the same state without feeling patched together.</p>
              <div class="ely-public-stack">
                <ElyPublicAlert
                  :tone="reviewedModes ? 'success' : 'warning'"
                  :title="reviewedModes ? 'Ready for visual handoff' : 'Review both modes before handoff'"
                >
                  {{ inviteName }} is using {{ selectedTheme }} with {{ density }} density.
                </ElyPublicAlert>
                <ElyPublicProgress
                  label="Handoff score"
                  :tone="readinessTone"
                  :value="qualityScore"
                />
                <ElyPublicDivider label="State summary" tone="accent" />
                <ElyPublicText tone="muted">
                  Switch and checkbox state should change the evidence, not invent a second component language.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-story-theme-specimen-lab-panel">
              <p class="ely-public-eyebrow">03 · Navigation</p>
              <h3>Move through local sections</h3>
              <p>Tabs should preserve context and keyboard rhythm while content changes beneath them.</p>
              <div class="ely-public-stack">
                <ElyPublicTabs v-model="activeTab" :items="specimenTabs">
                  <template v-slot:default="{ activeItem }">
                    <div class="ely-story-theme-specimen-tab-panel">
                      <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                      <ElyPublicText tone="muted">{{ activeItem?.description }}</ElyPublicText>
                    </div>
                  </template>
                </ElyPublicTabs>
                <ElyPublicText tone="subtle" size="sm">
                  Use arrow keys, Home, and End here when reviewing keyboard operability.
                </ElyPublicText>
              </div>
            </article>

            <article class="ely-story-theme-specimen-lab-panel">
              <p class="ely-public-eyebrow">04 · Dialog</p>
              <h3>Confirm without changing worlds</h3>
              <p>The dialog should feel like a focused layer from the same theme, not a new app shell.</p>
              <div class="ely-public-stack">
                <ElyPublicText tone="muted">
                  Use this to verify focus entry, Escape close, backdrop close, and focus restoration.
                </ElyPublicText>
                <div class="ely-public-inline">
                  <ElyPublicButton @click="openDialog">Open lab dialog</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Keep editing</ElyPublicButton>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-theme-specimen-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Approval rule</p>
                <h2 class="ely-public-section-title">Do not approve from a still screenshot</h2>
              </div>
              <p>
                A component set is only elegant when typing, toggling, selecting, navigating, and confirming all preserve the same hierarchy.
              </p>
            </div>
            <div class="ely-story-theme-specimen-lab-checks">
              <span>Focus visible</span>
              <span>State readable</span>
              <span>One primary action</span>
              <span>Recovery path present</span>
            </div>
          </section>

          <ElyPublicDialog
            :open="dialogOpen"
            title="Interaction lab checkpoint"
            description="Confirm the component surface only after both mode proof and control state are readable."
            @close="closeDialog"
          >
            <div class="ely-public-stack">
              <ElyPublicText tone="muted">
                {{ inviteName }} is ready for {{ selectedTheme }} review at {{ qualityScore }} percent handoff confidence.
              </ElyPublicText>
              <ElyPublicAlert
                :tone="reviewedModes ? 'success' : 'warning'"
                :title="reviewedModes ? 'Mode proof complete' : 'Mode proof incomplete'"
              >
                The dialog inherits the same component grammar as the page surface.
              </ElyPublicAlert>
            </div>

            <template v-slot:footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Cancel</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Confirm lab pass</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}
