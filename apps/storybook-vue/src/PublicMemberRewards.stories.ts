import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicTabs,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const rewardTabs: ElyPublicTabsItem[] = [
  {
    key: "available",
    label: "Available",
    description: "Benefits ready to claim in the current cycle",
  },
  {
    key: "progress",
    label: "Progress",
    description: "Tier progress, renewal cadence, and unlock path",
  },
  {
    key: "history",
    label: "History",
    description: "Recently claimed rewards and quiet recovery path",
  },
]

const rewardCards = [
  {
    description:
      "Member-only preview access for the next editorial release lane.",
    eyebrow: "Preview",
    label: "Moonlit early access",
    status: "Ready",
  },
  {
    description:
      "A small atmosphere badge that follows the active theme family.",
    eyebrow: "Identity",
    label: "Crystal profile mark",
    status: "Limited",
  },
  {
    description:
      "One curated note from the creator archive, delivered without extra route noise.",
    eyebrow: "Archive",
    label: "Atelier dispatch",
    status: "Review",
  },
] as const

const rewardPrinciples = [
  "Rewards use accent as a scarce highlight, not as the page's main action color.",
  "Tier progress explains the next unlock with text, number, and progress together.",
  "Claim history stays quiet so it does not compete with available benefits.",
  "Unavailable rewards show a recovery path instead of a decorative locked card.",
] as const

const meta = {
  title: "Public Luxe/Patterns/Member Rewards",
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
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("available")
      const claimedCount = ref(2)
      const cycleProgress = computed(() => 76 + claimedCount.value * 3)
      const nextUnlock = computed(() =>
        cycleProgress.value >= 82
          ? "Seraph note unlocked"
          : "Claim one more reward",
      )

      return {
        activeTab,
        claimedCount,
        cycleProgress,
        nextUnlock,
        rewardCards,
        rewardPrinciples,
        rewardTabs,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero ely-story-rewards-hero">
            <div>
              <p class="ely-public-eyebrow">Pattern · Member Rewards</p>
              <h1 class="ely-public-title">
                Make rewards feel precious
                <span class="ely-public-title-accent">without turning the page into gold noise</span>
              </h1>
              <p class="ely-public-copy">
                A C-end theme needs more than pretty cards. Member rewards
                require hierarchy: one claim action, clear tier progress,
                restrained scarcity cues, and a quiet route back to history.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Claim featured reward</ElyPublicButton>
                <ElyPublicButton tone="secondary">Preview member suite</ElyPublicButton>
                <ElyPublicButton tone="ghost">View reward policy</ElyPublicButton>
              </div>
            </div>

            <div class="ely-story-rewards-pass">
              <p class="ely-public-eyebrow">Celestia pass</p>
              <strong>Level 07</strong>
              <ElyPublicProgress
                label="Cycle progress"
                tone="accent"
                :value="cycleProgress"
              />
              <ElyPublicText tone="muted">
                {{ nextUnlock }} · {{ claimedCount }} rewards claimed this cycle.
              </ElyPublicText>
            </div>
          </section>

          <section class="ely-story-rewards-layout">
            <article class="ely-story-rewards-feature">
              <div class="ely-story-rewards-feature-head">
                <div>
                  <p class="ely-public-eyebrow">Featured benefit</p>
                  <h2>Moonlit archive invitation</h2>
                </div>
                <ElyPublicBadge tone="accent">Rare claim</ElyPublicBadge>
              </div>
              <ElyPublicText tone="muted">
                The featured reward is the only highly ornamented object in
                this view. Its job is to make the claim feel special while the
                surrounding system stays calm and legible.
              </ElyPublicText>
              <div class="ely-story-rewards-stat-grid">
                <ElyPublicStat
                  eyebrow="Availability"
                  helper="The current cycle keeps scarcity readable."
                  tone="accent"
                  value="18 left"
                />
                <ElyPublicStat
                  eyebrow="Unlock path"
                  helper="Progress and requirement appear together."
                  tone="primary"
                  value="82%"
                />
                <ElyPublicStat
                  eyebrow="Cycle"
                  helper="The benefit resets with the member cadence."
                  tone="neutral"
                  value="06 days"
                />
              </div>
              <div class="ely-public-actions">
                <ElyPublicButton>Claim invitation</ElyPublicButton>
                <ElyPublicButton tone="ghost">Read archive note</ElyPublicButton>
              </div>
            </article>

            <section class="ely-story-rewards-claim" aria-labelledby="member-rewards-claim">
              <div class="ely-story-rewards-section-head">
                <div>
                  <p class="ely-public-eyebrow">Claim state</p>
                  <h2 id="member-rewards-claim">Explain scarcity before asking for action</h2>
                </div>
                <p>
                  Scarcity is useful only when the user understands what
                  changes next.
                </p>
              </div>

              <div class="ely-public-stack">
                <ElyPublicAlert
                  eyebrow="Claim window"
                  title="Featured reward closes after this cycle"
                  tone="info"
                >
                  Claiming the invitation reserves access now. It does not
                  change the active theme family or introduce a separate color
                  system.

                  <template v-slot:actions>
                    <ElyPublicButton size="sm">Reserve access</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Open details</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
                <ElyPublicDivider label="Cycle health" align="start" />
                <ElyPublicProgress
                  label="Reward cycle completion"
                  :value="cycleProgress"
                />
              </div>
            </section>
          </section>

          <section class="ely-story-rewards-lanes" aria-labelledby="member-rewards-lanes">
            <div class="ely-story-rewards-section-head">
              <div>
                <p class="ely-public-eyebrow">Reward lanes</p>
                <h2 id="member-rewards-lanes">Use tabs for peer reward sections, not for unrelated routes</h2>
              </div>
              <p>
                Benefits, progress, and history are peer sections inside the
                same reward surface. Policy, billing, and creator pages should
                remain links rather than hidden tabs.
              </p>
            </div>

            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="rewardTabs" aria-label="Member reward lanes">
                <template v-slot:default="{ activeKey }">
                  <div class="ely-story-rewards-panel">
                    <div
                      v-if="activeKey === 'available'"
                      class="ely-story-rewards-benefit-list"
                    >
                      <article
                        v-for="reward in rewardCards"
                        :key="reward.label"
                        class="ely-story-rewards-benefit"
                      >
                        <div class="ely-story-rewards-card-head">
                          <span>{{ reward.eyebrow }}</span>
                          <ElyPublicBadge tone="accent">{{ reward.status }}</ElyPublicBadge>
                        </div>
                        <h3>{{ reward.label }}</h3>
                        <ElyPublicText tone="muted">{{ reward.description }}</ElyPublicText>
                      </article>
                    </div>

                    <div
                      v-else-if="activeKey === 'progress'"
                      class="ely-story-rewards-progress"
                    >
                      <ElyPublicProgress
                        label="Current tier"
                        tone="primary"
                        :value="cycleProgress"
                      />
                      <ElyPublicProgress
                        label="Archive access"
                        tone="accent"
                        :value="64"
                      />
                      <ElyPublicText tone="muted">
                        Tier progress remains readable without animation or
                        color alone. Each bar names the benefit it advances.
                      </ElyPublicText>
                    </div>

                    <ElyPublicEmptyState
                      v-else
                      eyebrow="History"
                      title="No archived claims need action"
                    >
                      Claim history stays quiet. If a claim fails, this section
                      should expose one recovery action and one support link.

                      <template v-slot:actions>
                        <ElyPublicButton>Download receipt</ElyPublicButton>
                        <ElyPublicButton tone="ghost">Contact support</ElyPublicButton>
                      </template>
                    </ElyPublicEmptyState>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>

          <section class="ely-story-rewards-guardrails" aria-labelledby="member-rewards-guardrails">
            <div class="ely-story-rewards-section-head">
              <div>
                <p class="ely-public-eyebrow">Pattern guardrails</p>
                <h2 id="member-rewards-guardrails">Reward polish is approved by restraint</h2>
              </div>
            </div>
            <div class="ely-story-rewards-rule-list ely-story-offset-md">
              <div
                v-for="principle in rewardPrinciples"
                :key="principle"
                class="ely-story-rewards-rule"
              >
                <span aria-hidden="true"></span>
                <ElyPublicText weight="semibold">{{ principle }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
