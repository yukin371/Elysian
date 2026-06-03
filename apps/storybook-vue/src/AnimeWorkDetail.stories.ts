import {
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicBreadcrumb,
  ElyPublicButton,
  ElyPublicDescriptionList,
  ElyPublicLink,
  ElyPublicMeter,
  ElyPublicRating,
  ElyPublicText,
  ElyPublicTimeline,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicDescriptionItem,
  ElyPublicTimelineItem,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const meta = {
  title: "Public Luxe/Showcase/Anime Work Detail",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A work/collection detail page template showing hero image, structured metadata, creator info, star rating, edition availability, and activity timeline. Demonstrates how to build a rich detail view using glassmorphism cards, animated gradients, and floating orbs.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const breadcrumbs = [
  { label: "Home", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Midnight Aurora" },
]

const metadata: ElyPublicDescriptionItem[] = [
  { key: "medium", label: "Medium", value: "Digital Illustration" },
  { key: "dimensions", label: "Dimensions", value: "3840 × 2160 px" },
  { key: "created", label: "Created", value: "March 2026" },
  { key: "edition", label: "Edition", value: "7 of 50", tone: "accent" },
  { key: "category", label: "Category", value: "Fantasy" },
  { key: "license", label: "License", value: "Personal Use" },
]

const activity: ElyPublicTimelineItem[] = [
  {
    key: "1",
    title: "Yukina Studio published this work",
    meta: "2 days ago",
    tone: "primary",
  },
  {
    key: "2",
    title: "StellarArchive collected this piece",
    meta: "1 day ago",
    tone: "accent",
  },
  {
    key: "3",
    title: "New comment from AoiArt",
    description: "Incredible use of light and shadow!",
    meta: "5 hours ago",
    tone: "success",
  },
  {
    key: "4",
    title: 'Added to "Dreamy Picks" curated list',
    meta: "3 hours ago",
    tone: "primary",
  },
]

const relatedWorks = [
  { title: "First Light", tag: "Illustration" },
  { title: "Quiet Garden", tag: "Watercolor" },
  { title: "Lantern Festival", tag: "Digital Art" },
  { title: "Winter Bloom", tag: "Photography" },
  { title: "Crystal Dawn", tag: "3D Render" },
]

export const WorkDetailWithMetadata: Story = {
  name: "Work detail with metadata",
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicDescriptionList,
      ElyPublicLink,
      ElyPublicMeter,
      ElyPublicRating,
      ElyPublicText,
      ElyPublicTimeline,
    },
    setup() {
      const rating = ref(4)
      return { breadcrumbs, metadata, activity, relatedWorks, rating }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <ElyPublicBreadcrumb :items="breadcrumbs" />

          <div class="ely-anime-detail-layout ely-animate-fade-in">
            <div style="display: grid; gap: 20px;">
              <div class="ely-anime-detail-hero-image">
                <div class="ely-anime-orb ely-anime-orb--accent ely-anime-orb--sm" style="top: 20px; right: 40px;" />
                <div class="ely-anime-orb ely-anime-orb--lg" style="bottom: -30px; left: -40px; opacity: 0.5;" />
                <svg viewBox="0 0 320 200" fill="none" style="width:200px;opacity:.45"><circle cx="110" cy="70" r="40" stroke="white" stroke-width="2" opacity=".5"/><circle cx="200" cy="50" r="22" stroke="white" stroke-width="1.5" opacity=".4"/><path d="M40 140L110 90L160 120L220 80L290 100" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/><circle cx="250" cy="130" r="8" fill="white" opacity=".2"/><circle cx="70" cy="110" r="5" fill="white" opacity=".25"/></svg>
              </div>

              <div style="display: grid; gap: 18px;">
                <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                  <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.4rem;">Activity</h2>
                </div>
                <ElyPublicTimeline :items="activity" />
              </div>
            </div>

            <div style="display: grid; gap: 18px; align-content: start;">
              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.3rem;">Midnight Aurora</h2>
                <p style="margin: 0; color: var(--color-text-muted); line-height: 1.6;">
                  A visual journey through light and darkness. This piece captures the
                  ethereal beauty of aurora borealis reflected on still water at midnight.
                </p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <ElyPublicBadge tone="primary">Digital Art</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Featured</ElyPublicBadge>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <ElyPublicRating v-model="rating" :max="5" label="Rating" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <div class="ely-anime-detail-creator">
                  <ElyPublicAvatar name="Yukina Studio" size="lg" status="online" />
                  <div style="display: grid; gap: 2px;">
                    <strong style="font-family: var(--ely-public-font-display);">Yukina Studio</strong>
                    <span style="color: var(--color-text-muted); font-size: 0.82rem;">Creator · Illustrator · Collector</span>
                  </div>
                  <ElyPublicButton size="sm" style="margin-left: auto;">Follow</ElyPublicButton>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">Details</h3>
                <ElyPublicDescriptionList :items="metadata" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">Availability</h3>
                <ElyPublicMeter :value="43" :max="50" tone="primary" label="Editions claimed" helper="7 of 50 remaining" />
                <ElyPublicButton block>Collect this work</ElyPublicButton>
              </div>
            </div>
          </div>

          <div class="ely-anime-shimmer-bar--animated" />

          <section style="display: grid; gap: 18px;">
            <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
              <div>
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                  More from this creator
                </p>
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.3rem, 2.5vw, 1.8rem);">
                  Related works
                </h2>
              </div>
              <ElyPublicLink>View all</ElyPublicLink>
            </div>
            <div class="ely-anime-related-scroll">
              <div
                v-for="work in relatedWorks"
                :key="work.title"
                class="ely-anime-card ely-anime-glass"
              >
                <div class="ely-anime-card-image" style="aspect-ratio: 4/3;">
                  <svg viewBox="0 0 160 100" fill="none" style="width:56px;opacity:.4"><circle cx="55" cy="38" r="20" stroke="white" stroke-width="2" opacity=".5"/><circle cx="100" cy="28" r="10" stroke="white" stroke-width="1.5" opacity=".35"/><path d="M20 72L50 48L80 60L110 40L145 52" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/></svg>
                </div>
                <div class="ely-anime-card-body">
                  <span class="ely-anime-card-tag">{{ work.tag }}</span>
                  <h3 style="font-size: 0.9rem;">{{ work.title }}</h3>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const WorkDetailDarkMode: Story = {
  name: "Work detail (dark mode)",
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicDescriptionList,
      ElyPublicLink,
      ElyPublicMeter,
      ElyPublicRating,
      ElyPublicText,
      ElyPublicTimeline,
    },
    setup() {
      const rating = ref(5)
      return { breadcrumbs, metadata, activity, relatedWorks, rating }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <ElyPublicBreadcrumb :items="breadcrumbs" />

          <div class="ely-anime-detail-layout ely-animate-fade-in">
            <div style="display: grid; gap: 20px;">
              <div class="ely-anime-detail-hero-image ely-anime-bg-aurora">
                <div class="ely-anime-orb ely-anime-orb--accent ely-anime-orb--md" style="top: -20px; right: 30px;" />
                <div class="ely-anime-orb ely-anime-orb--sm" style="bottom: 20px; left: 60px;" />
                <svg viewBox="0 0 320 200" fill="none" style="width:200px;opacity:.45"><circle cx="110" cy="70" r="40" stroke="white" stroke-width="2" opacity=".5"/><circle cx="200" cy="50" r="22" stroke="white" stroke-width="1.5" opacity=".4"/><path d="M40 140L110 90L160 120L220 80L290 100" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/><circle cx="250" cy="130" r="8" fill="white" opacity=".2"/><circle cx="70" cy="110" r="5" fill="white" opacity=".25"/></svg>
              </div>

              <div class="ely-anime-glass ely-anime-glow--breathe ely-anime-section">
                <ElyPublicTimeline :items="activity" density="compact" />
              </div>
            </div>

            <div style="display: grid; gap: 18px; align-content: start;">
              <div class="ely-anime-glass ely-anime-glow ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.3rem;">Midnight Aurora</h2>
                <p style="margin: 0; color: var(--color-text-muted); line-height: 1.6;">
                  A visual journey through light and darkness. This piece captures the
                  ethereal beauty of aurora borealis reflected on still water at midnight.
                </p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <ElyPublicBadge tone="primary">Digital Art</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">Featured</ElyPublicBadge>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <ElyPublicRating v-model="rating" :max="5" label="Rating" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <ElyPublicDescriptionList :items="metadata" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <ElyPublicMeter :value="43" :max="50" tone="accent" label="Editions claimed" helper="7 of 50 remaining" />
                <ElyPublicButton block>Collect this work</ElyPublicButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
  parameters: {
    globals: { mode: "dark" },
  },
}
