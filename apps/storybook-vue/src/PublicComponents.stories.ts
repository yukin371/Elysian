import {
  ElyPublicAlert,
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCard,
  ElyPublicCheckbox,
  ElyPublicDialog,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicImage,
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
} from "@elysian/ui-public-vue"
import type { ElyPublicRadioGroupItem } from "@elysian/ui-public-vue"
import type { ElyPublicSelectOption } from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"
import { usePublicThemeArtwork } from "./publicThemeArtwork"

const workspaceTabs: ElyPublicTabsItem[] = [
  {
    key: "discover",
    label: "Discover",
    description: "Mood and first impression",
  },
  {
    key: "compose",
    label: "Compose",
    description: "High-frequency form surfaces",
  },
  {
    key: "deliver",
    label: "Deliver",
    description: "Release-ready finish",
  },
]

const toneOptions: ElyPublicSelectOption[] = [
  { value: "elysia-default", label: "Elysia Bloom" },
  { value: "rose-nocturne", label: "Rose Nocturne" },
  { value: "azure-aria", label: "Azure Aria" },
  { value: "enterprise-calm", label: "Enterprise Calm" },
]

const densityOptions: ElyPublicRadioGroupItem[] = [
  {
    key: "comfortable",
    label: "Comfortable",
    description: "More air, more showcase presence",
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
    description: "Tighter but still decorative-safe",
    value: "compact",
  },
]

const componentLanes = [
  {
    description: "Buttons, badges, cards, and section rhythm.",
    label: "Action and status",
  },
  {
    description: "Inputs, selects, switches, checkbox, and radio decisions.",
    label: "Form controls",
  },
  {
    description: "Tabs, dialog, alert, empty state, and loading surfaces.",
    label: "Interaction states",
  },
  {
    description: "Focus paths, keyboard movement, and disabled/error states.",
    label: "Accessibility review",
  },
]

const meta = {
  title: "Public Luxe/Showcase/Component Gallery",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCard,
      ElyPublicCheckbox,
      ElyPublicDivider,
      ElyPublicDialog,
      ElyPublicEmptyState,
      ElyPublicImage,
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
      const dialogOpen = ref(false)
      const activeTab = ref("discover")
      const compactControls = ref(false)
      const galleryPreview = usePublicThemeArtwork("gallery")
      const selectedDensity = ref("balanced")
      const searchKeyword = ref("")
      const selectedThemeFamily = ref("elysia-default")
      const polishedMode = ref(true)
      const narrative = ref(
        "Luminous interfaces should still feel deliberate, stable, and product-ready.",
      )

      return {
        activeTab,
        compactControls,
        componentLanes,
        dialogOpen,
        densityOptions,
        galleryPreview,
        narrative,
        openDialog: () => {
          dialogOpen.value = true
        },
        closeDialog: () => {
          dialogOpen.value = false
        },
        polishedMode,
        searchKeyword,
        selectedDensity,
        selectedThemeFamily,
        toneOptions,
        workspaceTabs,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Component baseline</p>
            <h1 class="ely-public-section-title">High-frequency public preset components</h1>
            <p class="ely-public-copy">
              This layer turns the theme system into reusable primitives. The
              goal is not enterprise density; it is expressive, brand-forward
              clarity that still behaves like a product system. Keyboard paths
              and focus behavior are part of that baseline, not an afterthought.
            </p>
            <div class="ely-public-inline ely-story-offset-inline">
              <ElyPublicBadge tone="primary">public-luxe</ElyPublicBadge>
              <ElyPublicBadge tone="accent">theme-aware</ElyPublicBadge>
              <ElyPublicBadge tone="neutral">moderate radius</ElyPublicBadge>
            </div>
            <div class="ely-story-component-map" aria-label="Component review lanes">
              <div
                v-for="lane in componentLanes"
                :key="lane.label"
                class="ely-story-component-lane"
              >
                <strong>{{ lane.label }}</strong>
                <span>{{ lane.description }}</span>
              </div>
            </div>
          </section>

          <section class="ely-story-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Feedback and rhythm</p>
                <h2 class="ely-public-section-title">Start with state explanation and section cadence</h2>
              </div>
              <p>
                These primitives decide whether a page feels guided or noisy.
                They stay expressive, but they should never overpower the task.
              </p>
            </div>
          <section class="ely-public-component-grid">
            <ElyPublicCard
              eyebrow="Alert"
              title="Guided feedback surfaces"
              subtitle="Feedback should explain state shifts without falling back to flat enterprise banners."
            >
              <div class="ely-public-stack">
                <ElyPublicAlert tone="info" title="Theme preview updated">
                  The active preview now reflects the selected family and resolved mode.
                </ElyPublicAlert>
                <ElyPublicAlert
                  eyebrow="Guardrail"
                  tone="warning"
                  title="Free color overrides are still locked"
                >
                  Keep the roster governed until each theme family has a paired light and dark surface set.

                  <template #actions>
                    <ElyPublicButton size="sm" tone="secondary">Review token scope</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Dismiss</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Divider"
              title="Section rhythm without hard chrome"
              subtitle="Dividers separate narrative blocks while staying inside the same luminous surface language."
            >
              <div class="ely-public-stack">
                <ElyPublicDivider label="Review lane" tone="accent" />
                <p class="ely-public-muted-copy">
                  Use labeled dividers to mark a new slice of information without introducing a second header system.
                </p>
                <ElyPublicDivider align="start" label="Hand-off" />
                <p class="ely-public-muted-copy">
                  Start- and end-aligned variants help when a flow needs a more editorial break.
                </p>
              </div>
            </ElyPublicCard>
          </section>
          </section>

          <section class="ely-story-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Action and status</p>
                <h2 class="ely-public-section-title">Then check emphasis without letting ornaments win</h2>
              </div>
              <p>
                Buttons and badges carry the most visible brand pressure, so
                their hierarchy needs to remain obvious across every theme family.
              </p>
            </div>
          <section class="ely-public-component-grid">
            <ElyPublicCard
              eyebrow="Buttons"
              title="Actions with layered emphasis"
              subtitle="Primary, secondary, and ghost tones stay consistent across theme families."
            >
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicButton>Launch preview</ElyPublicButton>
                  <ElyPublicButton tone="secondary">Compare preset</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Archive draft</ElyPublicButton>
                </div>
                <div class="ely-public-inline">
                  <ElyPublicButton size="sm">Small action</ElyPublicButton>
                  <ElyPublicButton size="lg" tone="secondary">Large action</ElyPublicButton>
                  <ElyPublicButton loading>Applying</ElyPublicButton>
                </div>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Link"
              title="Lightweight navigation with product tone"
              subtitle="Inline actions should keep their link semantics while still feeling like part of the same public language."
            >
              <div class="ely-public-stack">
                <p class="ely-public-muted-copy">
                  Need a lower-emphasis path after review?
                  <ElyPublicLink
                    href="https://example.com/theme-guidelines"
                    class="ely-story-inline-link"
                  >
                    Open theme guidelines
                  </ElyPublicLink>
                </p>
                <div class="ely-public-inline">
                  <ElyPublicLink href="https://example.com/theme-notes" tone="accent">
                    Review editorial notes
                  </ElyPublicLink>
                  <ElyPublicLink
                    href="https://example.com/reference-library"
                    external
                    tone="muted"
                  >
                    External reference library
                  </ElyPublicLink>
                </div>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Stat"
              title="Summary blocks with governed emphasis"
              subtitle="Theme-heavy front-stage surfaces still need compact, reusable metric modules instead of ad hoc numbers."
            >
              <div class="ely-public-component-grid ely-story-grid-two">
                <ElyPublicStat
                  eyebrow="Theme roster"
                  helper="Locked before free customization."
                  tone="primary"
                  trend="flat"
                  value="04"
                >
                  Launch families
                </ElyPublicStat>
                <ElyPublicStat
                  eyebrow="Review signal"
                  helper="Latest guided pass improved clarity."
                  tone="accent"
                  trend="up"
                  value="92%"
                >
                  Preference sync health
                </ElyPublicStat>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Text"
              title="Body copy with governed reading rhythm"
              subtitle="Content systems need a reusable body primitive so supporting copy does not drift page by page."
            >
              <div class="ely-public-stack">
                <ElyPublicText size="lg">
                  Lead copy should stay elegant, readable, and controlled even in the most atmospheric themes.
                </ElyPublicText>
                <ElyPublicText tone="muted">
                  Muted copy helps controls, summaries, and explanatory notes coexist without collapsing into noisy paragraphs.
                </ElyPublicText>
                <ElyPublicText tone="subtle" size="sm">
                  Subtle copy is best reserved for low-priority hints and secondary context.
                </ElyPublicText>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Badges"
              title="Identity, status, and tone markers"
              subtitle="Avatars and badges stay compact and polished instead of becoming oversized decoration."
            >
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicAvatar name="Elysia Atelier" status="online" />
                  <ElyPublicAvatar name="Rose Nocturne" shape="circle" status="away" />
                  <ElyPublicAvatar name="Azure Aria" shape="square" status="busy" />
                </div>
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="neutral">Draft</ElyPublicBadge>
                  <ElyPublicBadge tone="primary">Signature</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Featured</ElyPublicBadge>
                  <ElyPublicBadge tone="danger">Attention</ElyPublicBadge>
                </div>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Image"
              title="Media surfaces with governed proportion"
              subtitle="Public previews keep their rhythm through aspect presets, soft framing, and resilient fallback behavior."
            >
              <div class="ely-public-stack">
                <ElyPublicImage
                  :src="galleryPreview"
                  alt="Theme gallery feature preview"
                  aspect="wide"
                />
                <p class="ely-public-muted-copy">
                  A public preset needs a first-class media frame so showcases, galleries, and editorial cards do not fall back to unstable raw images.
                </p>
              </div>
            </ElyPublicCard>
          </section>
          </section>

          <section class="ely-story-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Text input and overlays</p>
                <h2 class="ely-public-section-title">Review high-risk reading and focus surfaces</h2>
              </div>
              <p>
                Forms and dialogs reveal whether the theme remains usable after
                the first impression fades. Focus, errors, and copy density matter here.
              </p>
            </div>
          <section class="ely-public-component-grid">
            <ElyPublicCard
              eyebrow="Input"
              title="Readable surfaces first"
              subtitle="Inputs favor focus clarity, spacing, and text contrast over decorative glass."
            >
              <div class="ely-public-stack">
                <ElyPublicInput
                  v-model="searchKeyword"
                  label="Search theme family"
                  description="Use a restrained field style even in ornate themes."
                  placeholder="Try elysia-default"
                />
                <ElyPublicInput
                  v-model="narrative"
                  label="Narrative"
                  description="Multiline is still part of the same field language."
                  multiline
                />
                <ElyPublicInput
                  label="Guardrail example"
                  invalid-message="Color and layout direction should be chosen before free customization."
                  model-value="Unpaired light/dark colors"
                />
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Dialog"
              title="Focused overlays"
              subtitle="The modal stays luminous and centered without becoming a heavy enterprise slab."
            >
              <div class="ely-public-stack">
                <p class="ely-public-muted-copy">
                  Keep overlays elegant, well-bounded, and mode-safe. The panel
                  should feel like a curated layer, not a separate application shell.
                </p>
                <div class="ely-public-inline">
                  <ElyPublicButton @click="openDialog">Open dialog</ElyPublicButton>
                  <ElyPublicButton tone="ghost">Secondary flow</ElyPublicButton>
                </div>
              </div>
            </ElyPublicCard>
          </section>
          </section>

          <section class="ely-story-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Choice controls</p>
                <h2 class="ely-public-section-title">Separate runtime state from explicit decisions</h2>
              </div>
              <p>
                Select, switch, checkbox, and radio controls should not blur
                together. Each one carries a different product decision.
              </p>
            </div>
          <section class="ely-public-component-grid">
            <ElyPublicCard
              eyebrow="Select"
              title="Theme-aware native choice surfaces"
              subtitle="The native select keeps the same field language instead of dropping back to browser default styling."
            >
              <div class="ely-public-stack">
                <ElyPublicSelect
                  v-model="selectedThemeFamily"
                  :options="toneOptions"
                  label="Preset family"
                  description="Use a small, governed theme roster before enabling free color composition."
                />
                <ElyPublicSelect
                  :options="toneOptions"
                  invalid-message="A fallback theme family should always exist before a custom override is introduced."
                  label="Guardrail select"
                  model-value=""
                  placeholder="Choose a governed theme family"
                />
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Switch & Checkbox"
              title="State controls with clear intent"
              subtitle="Switches express runtime state, while checkboxes express explicit inclusion or confirmation."
            >
              <div class="ely-public-stack">
                <ElyPublicSwitch
                  v-model="polishedMode"
                  label="Polished mode"
                  description="Keep subtle highlight layers and curated gradients enabled."
                />
                <ElyPublicSwitch
                  :model-value="false"
                  label="Experimental override"
                  description="Disabled here to signal a not-yet-approved customization path."
                  disabled
                />
                <ElyPublicCheckbox
                  v-model="compactControls"
                  label="Enable compact control density"
                  description="Use this for denser component matrices, not to change the brand personality itself."
                />
              </div>
            </ElyPublicCard>
          </section>
          </section>

          <section class="ely-story-section">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Selection and loading</p>
                <h2 class="ely-public-section-title">Finish with keyboard rhythm and unresolved states</h2>
              </div>
              <p>
                These states are where decorative systems often wobble. The
                baseline keeps the interaction path explicit even while content is missing.
              </p>
            </div>
          <section class="ely-public-component-grid">
            <ElyPublicCard
              eyebrow="Radio Group"
              title="Single-choice rhythm decisions"
              subtitle="Use radio groups when the user should commit to one governed option."
            >
              <div class="ely-public-stack">
                <ElyPublicRadioGroup
                  aria-label="Density preset"
                  v-model="selectedDensity"
                  :items="densityOptions"
                />
                <p class="ely-public-muted-copy">
                  Current density preset: {{ selectedDensity }}
                </p>
                <p class="ely-public-muted-copy">
                  Arrow keys, Home, and End now follow the same governed keyboard path as tabs.
                </p>
              </div>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Skeleton & Progress"
              title="Loading and completion without visual collapse"
              subtitle="Skeletons and progress bars should preserve expectation and state clarity while content is still resolving."
            >
              <div class="ely-public-stack">
                <ElyPublicSkeleton />
                <ElyPublicSkeleton tone="soft" :lines="2" />
                <ElyPublicProgress
                  label="Theme rollout readiness"
                  tone="success"
                  :value="72"
                />
              </div>
            </ElyPublicCard>
          </section>
          </section>

          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tabs</p>
            <h2 class="ely-public-section-title">Section switching without enterprise chrome</h2>
            <p class="ely-public-copy">
              Tabs keep the current section visible and tactile, but the overall
              silhouette stays softer and more editorial than a back-office nav bar.
            </p>
            <p class="ely-public-muted-copy">
              Try Arrow keys, Home, and End to confirm the interaction model.
            </p>
            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="workspaceTabs">
                <template #default="{ activeItem }">
                  <div class="ely-public-stack">
                    <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                    <p class="ely-public-muted-copy">
                      {{ activeItem?.description }}
                    </p>
                    <p class="ely-public-muted-copy">
                      A theme-aware tab surface should maintain the same semantic
                      slots while shifting atmosphere with the selected family.
                    </p>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>

          <ElyPublicEmptyState
            eyebrow="Empty state"
            title="A curated surface still needs a next-step invitation"
            tone="accent"
          >
            No preview has been pinned yet. Create a saved comparison so brand,
            product, and engineering can review the same theme family snapshot.

            <template #actions>
              <ElyPublicButton>Create comparison</ElyPublicButton>
              <ElyPublicButton tone="ghost">Open recent presets</ElyPublicButton>
            </template>
          </ElyPublicEmptyState>

          <ElyPublicDialog
            :open="dialogOpen"
            title="Theme application checkpoint"
            description="Use this layer to confirm a high-visibility action without breaking the preset atmosphere."
            @close="closeDialog"
          >
            <p class="ely-public-muted-copy">
              The first phase keeps dialog behavior intentionally focused and
              controlled, but it now includes Escape close and focus return so
              the overlay is not mouse-only.
            </p>

            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Cancel</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Apply theme pack</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}
