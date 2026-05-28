import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSkeleton,
  ElyPublicSwitch,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const atelierThemeFamilies: ElyPublicSelectOption[] = [
  { value: "elysia-default", label: "Elysia Bloom" },
  { value: "rose-nocturne", label: "Rose Nocturne" },
  { value: "azure-aria", label: "Azure Aria" },
  { value: "enterprise-calm", label: "Enterprise Calm" },
]

const atelierDensityOptions: ElyPublicRadioGroupItem[] = [
  {
    key: "balanced",
    label: "Balanced",
    description:
      "Default editorial rhythm with enough air for ornate surfaces.",
    value: "balanced",
  },
  {
    key: "compact",
    label: "Compact",
    description:
      "Tighter controls for tool-heavy members and denser preference panels.",
    value: "compact",
  },
  {
    key: "ceremonial",
    label: "Ceremonial",
    description:
      "More spacing for reward or spotlight views that want stage presence.",
    value: "ceremonial",
  },
]

const atelierPatternBrief = [
  {
    description:
      "A front-stage preference studio for theme, density, and sync.",
    title: "Use case",
  },
  {
    description: "Expressive settings without becoming a dense admin form.",
    title: "Tone",
  },
  {
    description: "Governed families first; no free color mashups in phase one.",
    title: "Guardrail",
  },
]

const meta = {
  title: "Public Luxe/Patterns/Theme Atelier",
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
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSkeleton,
      ElyPublicSwitch,
    },
    setup() {
      const selectedThemeFamily = ref("elysia-default")
      const selectedDensity = ref("balanced")
      const syncMoments = ref(true)
      const syncRewardLane = ref(false)
      const reducedGlow = ref(false)

      return {
        atelierDensityOptions,
        atelierPatternBrief,
        atelierThemeFamilies,
        reducedGlow,
        selectedDensity,
        selectedThemeFamily,
        syncMoments,
        syncRewardLane,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero ely-public-hero--atelier">
            <div>
              <p class="ely-public-eyebrow">Pattern · Theme Atelier</p>
              <h1 class="ely-public-title">
                Govern personal atmosphere with a
                <span class="ely-public-title-accent">curated preference studio</span>
              </h1>
              <p class="ely-public-copy">
                This pattern is less about content publishing and more about
                user-controlled presentation. It tests whether theme family
                choice, density, sync toggles, and loading previews can live on
                the same page without turning into a busy settings slab.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Save atelier preset</ElyPublicButton>
                <ElyPublicButton tone="secondary">Preview alternate family</ElyPublicButton>
                <ElyPublicButton tone="ghost">Restore default cadence</ElyPublicButton>
              </div>
              <div class="ely-story-pattern-brief" aria-label="Theme Atelier pattern brief">
                <div
                  v-for="item in atelierPatternBrief"
                  :key="item.title"
                  class="ely-story-pattern-brief-item"
                >
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
            </div>

            <div class="ely-public-preview-stat-row">
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">04</span>
                <span class="ely-public-preview-stat-label">Governed theme families</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">03</span>
                <span class="ely-public-preview-stat-label">Density rhythms</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">2.1s</span>
                <span class="ely-public-preview-stat-label">Preview warm-up target</span>
              </div>
            </div>
          </section>

          <section class="ely-story-atelier-layout">
            <section class="ely-story-atelier-studio" aria-labelledby="atelier-studio-title">
              <div class="ely-story-atelier-section-head">
                <div>
                  <p class="ely-public-eyebrow">Preference studio</p>
                  <h2 id="atelier-studio-title">Theme and rhythm choices</h2>
                </div>
                <p>
                  The page should feel expressive, but each control still needs
                  a single obvious purpose.
                </p>
              </div>

              <div class="ely-public-stack">
                <ElyPublicAlert
                  eyebrow="Guardrail"
                  tone="info"
                  title="Theme families stay curated before free composition opens"
                >
                  Keep the palette roster fixed until each family has stable
                  light and dark surfaces, governed accents, and verified
                  feedback semantics.
                </ElyPublicAlert>

                <ElyPublicSelect
                  v-model="selectedThemeFamily"
                  :options="atelierThemeFamilies"
                  label="Theme family"
                  description="Choose a family, not an ad-hoc color mashup."
                />

                <ElyPublicDivider label="Density rhythm" tone="accent" />

                <ElyPublicRadioGroup
                  aria-label="Atelier density"
                  v-model="selectedDensity"
                  :items="atelierDensityOptions"
                />

                <ElyPublicDivider label="Sync surfaces" />

                <ElyPublicCheckbox
                  v-model="syncMoments"
                  label="Sync editorial moments"
                  description="Carry this atelier preset into release notes, curation cards, and spotlight headers."
                />
                <ElyPublicCheckbox
                  v-model="syncRewardLane"
                  label="Sync reward surfaces"
                  description="Only enable if accent usage remains sparse enough for collector and member tiers."
                />
                <ElyPublicSwitch
                  v-model="reducedGlow"
                  label="Reduced glow preview"
                  description="Use a gentler highlight pass for longer reading sessions or lower-contrast needs."
                />
              </div>
            </section>

            <section class="ely-story-atelier-preview" aria-labelledby="atelier-preview-title">
              <div class="ely-story-atelier-section-head">
                <div>
                  <p class="ely-public-eyebrow">Preview queue</p>
                  <h2 id="atelier-preview-title">Live preview states</h2>
                </div>
                <p>
                  A preference page should show confidence and waiting states,
                  not just controls.
                </p>
              </div>

              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">{{ selectedThemeFamily }}</ElyPublicBadge>
                  <ElyPublicBadge tone="neutral">{{ selectedDensity }}</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">
                    editorial {{ syncMoments ? "sync on" : "sync off" }}
                  </ElyPublicBadge>
                  <ElyPublicBadge :tone="syncRewardLane ? 'accent' : 'neutral'">
                    reward {{ syncRewardLane ? "sync on" : "sync off" }}
                  </ElyPublicBadge>
                  <ElyPublicBadge :tone="reducedGlow ? 'accent' : 'neutral'">
                    {{ reducedGlow ? "reduced glow" : "full glow" }}
                  </ElyPublicBadge>
                </div>

                <div class="ely-story-atelier-preview-list">
                  <article class="ely-story-atelier-preview-item">
                    <h3>Saved suite</h3>
                    <p>Show the stable applied state with family, density, and sync behavior summarized in one glance.</p>
                  </article>
                  <article class="ely-story-atelier-preview-item">
                    <h3>Pending warm-up</h3>
                    <p>Use loading placeholders to signal that curated surfaces are being recomposed, not silently frozen.</p>
                  </article>
                </div>

                <ElyPublicDivider label="Warm-up placeholders" tone="accent" />

                <div class="ely-public-stack">
                  <ElyPublicSkeleton />
                  <ElyPublicSkeleton tone="soft" :lines="2" />
                </div>

                <ElyPublicEmptyState
                  eyebrow="Variant queue"
                  title="No alternate preset has been pinned yet"
                >
                  Add a second governed preset if this member space needs a
                  calmer reading lane or a more ceremonial reward presentation.

                  <template v-slot:actions>
                    <ElyPublicButton>Create alternate preset</ElyPublicButton>
                    <ElyPublicButton tone="ghost">Duplicate current setup</ElyPublicButton>
                  </template>
                </ElyPublicEmptyState>
              </div>
            </section>
          </section>
        </div>
      </section>
    `,
  }),
}
