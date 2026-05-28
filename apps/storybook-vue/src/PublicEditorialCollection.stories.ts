import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicImage,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicTabs,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

import { usePublicThemeArtwork } from "./publicThemeArtwork"

const collectionTabs: ElyPublicTabsItem[] = [
  {
    key: "editorial",
    label: "Editorial",
    description: "Lead story, supporting copy, and one primary path",
  },
  {
    key: "drops",
    label: "Drops",
    description: "A governed collection grid with restrained rarity cues",
  },
  {
    key: "archive",
    label: "Archive",
    description: "Quiet recovery and historical reading paths",
  },
]

const collectionCards = [
  {
    description:
      "A long-form note that anchors the collection without becoming a marketing splash page.",
    eyebrow: "Essay",
    title: "Moonwake prelude",
  },
  {
    description:
      "A small gallery rhythm for release details, creator notes, and member context.",
    eyebrow: "Gallery",
    title: "Crystal sequence",
  },
  {
    description:
      "A low-noise route back to prior releases when the current collection is complete.",
    eyebrow: "Archive",
    title: "Silk record",
  },
] as const

const collectionRules = [
  "The editorial image sets atmosphere, but the headline and primary action still own the decision.",
  "Supporting cards use low-contrast surfaces and governed badges instead of one-off colors.",
  "Collection progress pairs a label, number, and next step so it remains readable without motion.",
  "Archive and policy routes stay as links, not extra primary buttons.",
] as const

const meta = {
  title: "Public Luxe/Patterns/Editorial Collection",
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
      ElyPublicImage,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("editorial")
      const heroArtwork = usePublicThemeArtwork("landscape")
      const portraitArtwork = usePublicThemeArtwork("portrait")

      return {
        activeTab,
        collectionCards,
        collectionRules,
        collectionTabs,
        heroArtwork,
        portraitArtwork,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-editorial-hero">
            <div class="ely-story-editorial-copy">
              <div class="ely-public-inline">
                <ElyPublicBadge tone="accent">Editorial collection</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">Season 03</ElyPublicBadge>
              </div>
              <p class="ely-public-eyebrow">Pattern · Editorial Collection</p>
              <h1 class="ely-public-title">
                Build a content collection with
                <span class="ely-public-title-accent">one luminous focal point</span>
              </h1>
              <p class="ely-public-copy">
                Content-heavy public pages can be expressive without drifting
                into campaign chaos. The image, headline, stats, links, and
                collection grid all need a single reading order.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Read collection</ElyPublicButton>
                <ElyPublicButton tone="secondary">Save to library</ElyPublicButton>
                <ElyPublicButton tone="ghost">Open archive</ElyPublicButton>
              </div>
            </div>

            <div class="ely-story-editorial-media">
              <ElyPublicImage
                :src="heroArtwork"
                alt="Abstract wide artwork for the active public-luxe theme"
                aspect="wide"
              />
            </div>
          </section>

          <section class="ely-story-editorial-layout">
            <article class="ely-story-editorial-feature">
              <div class="ely-story-editorial-feature-media">
                <ElyPublicImage
                  :src="portraitArtwork"
                  alt="Abstract portrait artwork for editorial collection rhythm"
                  aspect="portrait"
                  fit="contain"
                />
              </div>
              <div class="ely-story-editorial-feature-copy">
                <p class="ely-public-eyebrow">Lead story</p>
                <h2>Moonlit atelier notes</h2>
                <ElyPublicText tone="muted">
                  The lead story gets the only strong media emphasis. Supporting
                  items remain quieter so the page feels curated rather than
                  crowded.
                </ElyPublicText>
                <div class="ely-story-editorial-stat-grid">
                  <ElyPublicStat
                    eyebrow="Reading time"
                    helper="Short enough for a front-stage feature."
                    tone="primary"
                    value="08 min"
                  />
                  <ElyPublicStat
                    eyebrow="Collection"
                    helper="Current release sequence."
                    tone="accent"
                    value="03 / 07"
                  />
                </div>
              </div>
            </article>

            <aside class="ely-story-editorial-publishing" aria-label="Publishing state">
              <p class="ely-public-eyebrow">Publishing state</p>
              <h2>Keep content status calmer than the story</h2>
              <ElyPublicText tone="muted">
                Status explains where the collection is, not why every card should glow.
              </ElyPublicText>
              <div class="ely-public-stack">
                <ElyPublicProgress
                  label="Collection readiness"
                  tone="primary"
                  :value="86"
                />
                <ElyPublicAlert
                  eyebrow="Review note"
                  title="Alt text and archive route are ready"
                  tone="success"
                >
                  The current collection can publish with a governed abstract
                  artwork and a quiet path back to earlier releases.
                </ElyPublicAlert>
              </div>
            </aside>
          </section>

          <section class="ely-story-editorial-lanes">
            <div class="ely-story-editorial-section-head">
              <div>
                <p class="ely-public-eyebrow">Collection lanes</p>
                <h2>Tabs organize peer content, links leave the collection</h2>
              </div>
              <p>
                Editorial, drops, and archive are peer sections inside one
                collection surface. Policy, subscription, or creator routes stay
                honest as links.
              </p>
            </div>

            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="collectionTabs" aria-label="Editorial collection lanes">
                <template v-slot:default="{ activeKey }">
                  <div class="ely-story-editorial-panel">
                    <div
                      v-if="activeKey === 'editorial'"
                      class="ely-story-editorial-card-grid"
                    >
                      <article
                        v-for="card in collectionCards"
                        :key="card.title"
                        class="ely-story-editorial-card"
                      >
                        <span>{{ card.eyebrow }}</span>
                        <h3>{{ card.title }}</h3>
                        <ElyPublicText tone="muted">{{ card.description }}</ElyPublicText>
                      </article>
                    </div>

                    <div
                      v-else-if="activeKey === 'drops'"
                      class="ely-story-editorial-drops"
                    >
                      <ElyPublicBadge tone="accent">Featured drop</ElyPublicBadge>
                      <ElyPublicText tone="muted">
                        Drops can use accent as a scarce cue, but the claim or
                        read action should remain the only primary path.
                      </ElyPublicText>
                      <ElyPublicDivider label="Support routes" align="start" />
                      <ElyPublicText tone="muted">
                        Need more context?
                        <ElyPublicLink href="#">Read release policy</ElyPublicLink>
                        or
                        <ElyPublicLink href="#" tone="muted">compare previous collection</ElyPublicLink>.
                      </ElyPublicText>
                    </div>

                    <ElyPublicEmptyState
                      v-else
                      eyebrow="Archive"
                      title="No archived collection needs recovery"
                    >
                      Archive should stay quiet until the user needs context,
                      receipts, or a recovery path for a missing item.

                      <template v-slot:actions>
                        <ElyPublicButton>Open archive</ElyPublicButton>
                        <ElyPublicButton tone="ghost">Contact curator</ElyPublicButton>
                      </template>
                    </ElyPublicEmptyState>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>

          <section class="ely-story-editorial-guardrails">
            <div class="ely-story-editorial-section-head">
              <div>
                <p class="ely-public-eyebrow">Pattern guardrails</p>
                <h2>Editorial polish is approved by reading order</h2>
              </div>
            </div>
            <div class="ely-story-editorial-rule-grid ely-story-offset-md">
              <div
                v-for="rule in collectionRules"
                :key="rule"
                class="ely-story-editorial-rule"
              >
                <span aria-hidden="true"></span>
                <ElyPublicText weight="semibold">{{ rule }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
