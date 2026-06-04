import {
  ElyPublicAccordion,
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicBreadcrumb,
  ElyPublicButton,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicPagination,
  ElyPublicSegmentedControl,
  ElyPublicTable,
  ElyPublicText,
  ElyPublicTimeline,
  ElyPublicToolbar,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicAccordionItem,
  ElyPublicSegmentedControlItem,
  ElyPublicTableColumn,
  ElyPublicTableRow,
  ElyPublicTimelineItem,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, animeCommunityI18n, localeItems } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Anime Community Forum",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A community forum/discussion page template with thread cards, contributor leaderboard, pinned accordion, segmented view controls, and pagination. Uses glassmorphism, animated shimmer, and dot-grid backgrounds.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const leaderboardRows: ElyPublicTableRow[] = [
  {
    key: "1",
    cells: { rank: "1", creator: "Yukina Studio", works: "47", karma: "2,340" },
    tone: "primary",
  },
  {
    key: "2",
    cells: { rank: "2", creator: "AoiArt", works: "38", karma: "1,890" },
    tone: "accent",
  },
  {
    key: "3",
    cells: {
      rank: "3",
      creator: "StellarArchive",
      works: "31",
      karma: "1,520",
    },
  },
  {
    key: "4",
    cells: { rank: "4", creator: "Sakuya", works: "28", karma: "1,280" },
  },
]

const threadTones = ["primary", "accent", "primary", "accent"] as const

export const ForumWithThreads: Story = {
  name: "Forum with discussion threads",
  render: () => ({
    components: {
      ElyPublicAccordion,
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicPagination,
      ElyPublicSegmentedControl,
      ElyPublicTable,
      ElyPublicText,
      ElyPublicTimeline,
      ElyPublicToolbar,
    },
    setup() {
      const activeView = ref("recent")
      const page = ref(1)
      const locale = ref<Locale>("en")
      const t = computed(() => animeCommunityI18n[locale.value])
      const bc = computed(() =>
        t.value.breadcrumb.map((label, i) =>
          i < t.value.breadcrumb.length - 1 ? { label, href: "#" } : { label },
        ),
      )
      const viewModes = computed(
        () => t.value.viewModes as ElyPublicSegmentedControlItem[],
      )
      const pinned = computed(() => t.value.pinned as ElyPublicAccordionItem[])
      const threads = computed(() =>
        t.value.threads.map((thread, i) => ({
          ...thread,
          tone: threadTones[i] ?? "primary",
        })),
      )
      const leaderboardColumns = computed(
        () => t.value.leaderboardColumns as ElyPublicTableColumn[],
      )
      const recentActivity = computed(
        () => t.value.timeline as ElyPublicTimelineItem[],
      )
      return {
        activeView,
        page,
        locale,
        t,
        localeItems,
        bc,
        viewModes,
        pinned,
        threads,
        leaderboardColumns,
        leaderboardRows,
        recentActivity,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <ElyPublicBreadcrumb :items="bc" />

          <section style="display: grid; gap: 14px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                {{ t.sectionLabel }}
              </p>
              <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
                {{ t.title }}
              </h1>
            </div>
          </section>

          <div class="ely-anime-shimmer-bar--animated" />

          <ElyPublicToolbar>
            <template #leading>
              <ElyPublicSegmentedControl
                v-model="activeView"
                :items="viewModes"
                label="View mode"
              />
            </template>
            <template #trailing>
              <ElyPublicInput :placeholder="t.searchPlaceholder" style="max-width: 240px;" />
              <ElyPublicButton>{{ t.newThreadBtn }}</ElyPublicButton>
            </template>
          </ElyPublicToolbar>

          <div class="ely-anime-community-layout">
            <div style="display: grid; gap: 18px;">
              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.pinnedTitle }}</h3>
                <ElyPublicAccordion :items="pinned" multiple />
              </div>

              <div style="display: grid; gap: 12px;">
                <div
                  v-for="thread in threads"
                  :key="thread.title"
                  class="ely-anime-thread-card ely-animate-slide-up"
                >
                  <div class="ely-anime-thread-header">
                    <ElyPublicAvatar :name="thread.author" size="sm" />
                    <div style="flex: 1; display: grid; gap: 2px;">
                      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <strong style="font-size: 0.95rem;">{{ thread.title }}</strong>
                        <ElyPublicBadge :tone="thread.tone">{{ thread.badge }}</ElyPublicBadge>
                      </div>
                      <span style="color: var(--color-text-muted); font-size: 0.78rem;">
                        by {{ thread.author }} · {{ thread.time }}
                      </span>
                    </div>
                  </div>
                  <div class="ely-anime-thread-tags">
                    <span v-for="tag in thread.tags" :key="tag" class="ely-anime-card-tag">{{ tag }}</span>
                  </div>
                  <div class="ely-anime-thread-stats">
                    <span>{{ thread.replies }} {{ t.replies }}</span>
                    <span>{{ thread.views }} {{ t.views }}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: center;">
                <ElyPublicPagination v-model="page" :page-count="12" />
              </div>
            </div>

            <div style="display: grid; gap: 18px; align-content: start;">
              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.topContributors }}</h3>
                <ElyPublicTable
                  :columns="leaderboardColumns"
                  :rows="leaderboardRows"
                  caption="Contributor leaderboard"
                  density="compact"
                />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.recentActivity }}</h3>
                <ElyPublicTimeline :items="recentActivity" density="compact" />
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
}

export const ForumDarkMode: Story = {
  name: "Forum (dark mode)",
  render: () => ({
    components: {
      ElyPublicAccordion,
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicPagination,
      ElyPublicSegmentedControl,
      ElyPublicTable,
      ElyPublicText,
      ElyPublicTimeline,
      ElyPublicToolbar,
    },
    setup() {
      const activeView = ref("recent")
      const page = ref(1)
      const locale = ref<Locale>("en")
      const t = computed(() => animeCommunityI18n[locale.value])
      const bc = computed(() =>
        t.value.breadcrumb.map((label, i) =>
          i < t.value.breadcrumb.length - 1 ? { label, href: "#" } : { label },
        ),
      )
      const viewModes = computed(
        () => t.value.viewModes as ElyPublicSegmentedControlItem[],
      )
      const pinned = computed(() => t.value.pinned as ElyPublicAccordionItem[])
      const threads = computed(() =>
        t.value.threads.map((thread, i) => ({
          ...thread,
          tone: threadTones[i] ?? "primary",
        })),
      )
      const leaderboardColumns = computed(
        () => t.value.leaderboardColumns as ElyPublicTableColumn[],
      )
      const recentActivity = computed(
        () => t.value.timeline as ElyPublicTimelineItem[],
      )
      return {
        activeView,
        page,
        locale,
        t,
        localeItems,
        bc,
        viewModes,
        pinned,
        threads,
        leaderboardColumns,
        leaderboardRows,
        recentActivity,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <ElyPublicBreadcrumb :items="bc" />

          <section class="ely-anime-bg-aurora" style="display: grid; gap: 14px; padding: 32px; border-radius: var(--ely-public-radius-lg); position: relative; overflow: hidden;">
            <div class="ely-anime-orb ely-anime-orb--lg" style="top: -60px; right: -40px; opacity: 0.4;" />
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
              {{ t.sectionLabel }}
            </p>
            <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
              {{ t.title }}
            </h1>
          </section>

          <div class="ely-anime-shimmer-bar--animated" />

          <ElyPublicToolbar>
            <template #leading>
              <ElyPublicSegmentedControl
                v-model="activeView"
                :items="viewModes"
                label="View mode"
              />
            </template>
            <template #trailing>
              <ElyPublicInput :placeholder="t.searchPlaceholder" style="max-width: 240px;" />
              <ElyPublicButton>{{ t.newThreadBtn }}</ElyPublicButton>
            </template>
          </ElyPublicToolbar>

          <div class="ely-anime-community-layout">
            <div style="display: grid; gap: 18px;">
              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.pinnedTitle }}</h3>
                <ElyPublicAccordion :items="pinned" multiple />
              </div>

              <div style="display: grid; gap: 12px;">
                <div
                  v-for="thread in threads"
                  :key="thread.title"
                  class="ely-anime-thread-card ely-animate-slide-up"
                >
                  <div class="ely-anime-thread-header">
                    <ElyPublicAvatar :name="thread.author" size="sm" />
                    <div style="flex: 1; display: grid; gap: 2px;">
                      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <strong style="font-size: 0.95rem;">{{ thread.title }}</strong>
                        <ElyPublicBadge :tone="thread.tone">{{ thread.badge }}</ElyPublicBadge>
                      </div>
                      <span style="color: var(--color-text-muted); font-size: 0.78rem;">
                        by {{ thread.author }} · {{ thread.time }}
                      </span>
                    </div>
                  </div>
                  <div class="ely-anime-thread-tags">
                    <span v-for="tag in thread.tags" :key="tag" class="ely-anime-card-tag">{{ tag }}</span>
                  </div>
                  <div class="ely-anime-thread-stats">
                    <span>{{ thread.replies }} {{ t.replies }}</span>
                    <span>{{ thread.views }} {{ t.views }}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: center;">
                <ElyPublicPagination v-model="page" :page-count="12" />
              </div>
            </div>

            <div style="display: grid; gap: 18px; align-content: start;">
              <div class="ely-anime-glass ely-anime-glow ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.topContributors }}</h3>
                <ElyPublicTable
                  :columns="leaderboardColumns"
                  :rows="leaderboardRows"
                  caption="Contributor leaderboard"
                  density="compact"
                />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.05rem;">{{ t.recentActivity }}</h3>
                <ElyPublicTimeline :items="recentActivity" density="compact" />
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
