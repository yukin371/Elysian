import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicInput,
  ElyPublicSwitch,
  ElyPublicTabs,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const accountTabs: ElyPublicTabsItem[] = [
  {
    key: "moments",
    label: "Moments",
    description: "Recent releases and curation beats",
  },
  {
    key: "rewards",
    label: "Rewards",
    description: "Membership and collector benefits",
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Theme and atmosphere controls",
  },
]

const creatorPatternBrief = [
  {
    description: "Member-facing account and creator surfaces with reward cues.",
    title: "Use case",
  },
  {
    description: "Luminous and editorial, but every lane still has one job.",
    title: "Tone",
  },
  {
    description:
      "No one-off colors, oversized corners, or decorative-only cards.",
    title: "Guardrail",
  },
]

const meta = {
  title: "Public Luxe/Patterns/Creator Center",
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
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicInput,
      ElyPublicSwitch,
      ElyPublicTabs,
    },
    setup() {
      const activeTab = ref("moments")
      const collectorName = ref("Aurelia")
      const ritualNotes = ref(
        "Prefer luminous layouts with restrained contrast and slower highlight rhythm.",
      )
      const notificationsEnabled = ref(true)
      const reducedGlow = ref(false)

      return {
        activeTab,
        accountTabs,
        collectorName,
        creatorPatternBrief,
        notificationsEnabled,
        reducedGlow,
        ritualNotes,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero">
            <div>
              <p class="ely-public-eyebrow">Pattern · Creator Center</p>
              <h1 class="ely-public-title">
                Curate a member-facing space with
                <span class="ely-public-title-accent">ornament under control</span>
              </h1>
              <p class="ely-public-copy">
                This pattern shows how the public preset can step beyond isolated
                primitives and become a polished account or creator-facing
                experience. The atmosphere stays luminous, but the structure is
                still product-first: state, tasks, rewards, and settings all stay
                legible.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Open member suite</ElyPublicButton>
                <ElyPublicButton tone="secondary">Review reward lane</ElyPublicButton>
                <ElyPublicButton tone="ghost">Save atmosphere preset</ElyPublicButton>
              </div>
              <div class="ely-story-pattern-brief" aria-label="Creator Center pattern brief">
                <div
                  v-for="item in creatorPatternBrief"
                  :key="item.title"
                  class="ely-story-pattern-brief-item"
                >
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
              <div class="ely-public-chip-row">
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Preset Fit</span>
                  <span class="ely-public-chip-value">Front-stage member surfaces</span>
                </div>
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Rhythm</span>
                  <span class="ely-public-chip-value">Editorial, reward-led, calm</span>
                </div>
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Guardrail</span>
                  <span class="ely-public-chip-value">No oversized corners or split color logic</span>
                </div>
              </div>
            </div>

            <div class="ely-public-preview-stat-row">
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">08</span>
                <span class="ely-public-preview-stat-label">Curated reward drops</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">92%</span>
                <span class="ely-public-preview-stat-label">Preference sync health</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">3</span>
                <span class="ely-public-preview-stat-label">Active atmosphere presets</span>
              </div>
            </div>
          </section>

          <section class="ely-story-creator-layout">
            <section class="ely-story-creator-command" aria-labelledby="creator-cue-lane">
              <div class="ely-story-creator-section-head">
                <div>
                  <p class="ely-public-eyebrow">Priority</p>
                  <h2 id="creator-cue-lane">Member cue lane</h2>
                </div>
                <p>
                  Surface the next action before diving into collectibles and
                  polish controls.
                </p>
              </div>

              <div class="ely-public-stack">
                <ElyPublicAlert
                  eyebrow="Release pulse"
                  tone="success"
                  title="Tonight's collection note is ready to publish"
                >
                  Reward copy, visual variant, and member-only badge are aligned
                  with the active theme family.

                  <template v-slot:actions>
                    <ElyPublicButton size="sm">Publish note</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Review copy</ElyPublicButton>
                  </template>
                </ElyPublicAlert>

                <ElyPublicDivider label="Curated tasks" tone="accent" />

                <div class="ely-story-creator-task-list">
                  <article class="ely-story-creator-task">
                    <h3>Reward cadence</h3>
                    <p>Keep scarce benefits bright enough to feel precious, but never louder than the primary action path.</p>
                  </article>
                  <article class="ely-story-creator-task">
                    <h3>Surface discipline</h3>
                    <p>Use tinted neutrals and semantic highlights instead of introducing one-off decorative colors.</p>
                  </article>
                </div>
              </div>
            </section>

            <section class="ely-story-creator-preferences" aria-labelledby="creator-preferences">
              <div class="ely-story-creator-section-head">
                <div>
                  <p class="ely-public-eyebrow">Settings</p>
                  <h2 id="creator-preferences">Atmosphere preferences</h2>
                </div>
                <p>
                  A real front-stage panel should still feel governable when
                  users personalize it.
                </p>
              </div>

              <div class="ely-public-stack">
                <ElyPublicInput
                  v-model="collectorName"
                  label="Collector name"
                  description="Shown in welcome lines, reward slips, and curation notes."
                />
                <ElyPublicInput
                  v-model="ritualNotes"
                  label="Ritual notes"
                  description="Design intent carried into editorial and member-facing surfaces."
                  multiline
                />
                <ElyPublicSwitch
                  v-model="notificationsEnabled"
                  label="Reward pulse notifications"
                  description="Keep members aware of new drops and limited-time highlights."
                />
                <ElyPublicSwitch
                  v-model="reducedGlow"
                  label="Reduced glow mode"
                  description="Preserve tone while softening highlight intensity for longer reading sessions."
                />
              </div>
            </section>
          </section>

          <section class="ely-story-creator-lanes" aria-labelledby="creator-experience-lanes">
            <div class="ely-story-creator-section-head">
              <div>
                <p class="ely-public-eyebrow">Experience lanes</p>
                <h2 id="creator-experience-lanes">Structured sections instead of decorative sprawl</h2>
              </div>
              <p>
                A themed front-stage page still needs clear territory. Rewards,
                latest moments, and preferences each get a lane with distinct
                semantics, not just a new color treatment.
              </p>
            </div>

            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="accountTabs">
                <template v-slot:default="{ activeKey }">
                  <div class="ely-public-stack">
                    <div v-if="activeKey === 'moments'" class="ely-public-stack">
                      <div class="ely-public-inline">
                        <ElyPublicBadge tone="primary">Fresh sequence</ElyPublicBadge>
                        <ElyPublicBadge tone="accent">Editorial lane</ElyPublicBadge>
                      </div>
                      <div class="ely-story-creator-lane-list">
                        <article class="ely-story-creator-lane-item">
                          <h3>Moonwake dispatch</h3>
                          <p>Lead with one strong release note, one supporting context block, and one clear action.</p>
                        </article>
                        <article class="ely-story-creator-lane-item">
                          <h3>Theme continuity</h3>
                          <p>Let the active family tint the atmosphere, but keep reward and danger semantics stable.</p>
                        </article>
                      </div>
                    </div>

                    <div v-else-if="activeKey === 'rewards'" class="ely-public-stack">
                      <div class="ely-public-inline">
                        <ElyPublicBadge tone="accent">Collector tier</ElyPublicBadge>
                        <ElyPublicBadge tone="neutral">2 pending claims</ElyPublicBadge>
                      </div>
                      <div class="ely-story-creator-lane-list">
                        <article class="ely-story-creator-lane-item">
                          <h3>Celestia pass</h3>
                          <p>Unlock member-only previews, tighter reward sequencing, and elevated card ornament.</p>
                        </article>
                        <article class="ely-story-creator-lane-item">
                          <h3>Anniversary reserve</h3>
                          <p>Time-limited bundles should read as rare without hijacking the whole page with gold.</p>
                        </article>
                      </div>
                    </div>

                    <div v-else class="ely-public-stack">
                      <ElyPublicEmptyState
                        eyebrow="Preference drafts"
                        title="No secondary preset has been pinned yet"
                      >
                        Save a second atmosphere preset if this member suite needs
                        a calmer reading mode for long-form content.

                        <template v-slot:actions>
                          <ElyPublicButton>Create preset</ElyPublicButton>
                          <ElyPublicButton tone="ghost">Use current family</ElyPublicButton>
                        </template>
                      </ElyPublicEmptyState>
                    </div>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
