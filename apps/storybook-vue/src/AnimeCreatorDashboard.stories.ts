import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicSegmentedControl,
  ElyPublicStat,
  ElyPublicTabs,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, animeCreatorI18n, localeItems } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Anime Creator Dashboard",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A creator profile/dashboard template with glassmorphism sidebar, achievement badges, progress tracking, and content tabs. Demonstrates how to build a two-column anime-styled dashboard using the theme token system.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const FullDashboard: Story = {
  name: "Creator profile dashboard",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicSegmentedControl,
      ElyPublicStat,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("works")
      const locale = ref<Locale>("en")
      const t = computed(() => animeCreatorI18n[locale.value])
      const profileTabs = computed<ElyPublicTabsItem[]>(
        () => t.value.tabs as ElyPublicTabsItem[],
      )
      return { activeTab, locale, t, localeItems, profileTabs }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <div class="ely-anime-profile-layout">
            <div class="ely-anime-profile-sidebar">
              <div class="ely-anime-glass ely-anime-profile-avatar">
                <div class="ely-anime-avatar-ring">
                  <span>YK</span>
                </div>
                <h2>{{ t.profileName }}</h2>
                <p>{{ t.profileRole }}</p>
                <ElyPublicBadge tone="primary">{{ t.seasonBadge }}</ElyPublicBadge>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px;">
                  <ElyPublicButton size="sm">{{ t.followBtn }}</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">{{ t.messageBtn }}</ElyPublicButton>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-profile-stats">
                <div class="ely-anime-profile-stat">
                  <strong>47</strong>
                  <span>{{ t.statWorks }}</span>
                </div>
                <div class="ely-anime-profile-stat">
                  <strong>2.1k</strong>
                  <span>{{ t.statFollowers }}</span>
                </div>
                <div class="ely-anime-profile-stat">
                  <strong>128</strong>
                  <span>{{ t.statFollowing }}</span>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3>{{ t.seasonProgress }}</h3>
                <div style="display: grid; gap: 14px;">
                  <ElyPublicProgress :label="t.collectionCompletion" :value="72" tone="primary" />
                  <ElyPublicProgress :label="t.communityRating" :value="89" tone="accent" />
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3>{{ t.achievements }}</h3>
                <div class="ely-anime-achievement-grid">
                  <div class="ely-anime-achievement" v-for="a in t.achievementItems" :key="a.label">
                    <div class="ely-anime-achievement-icon" />
                    <strong>{{ a.label }}</strong>
                    <span>{{ a.icon }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="ely-anime-profile-main">
              <ElyPublicTabs v-model="activeTab" :items="profileTabs" />

              <div class="ely-anime-glass ely-anime-section">
                <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                  <h3>{{ t.recentWorks }}</h3>
                  <ElyPublicLink>{{ t.viewAll }}</ElyPublicLink>
                </div>
                <div class="ely-anime-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                  <div
                    v-for="work in t.works"
                    :key="work.title"
                    class="ely-anime-card"
                  >
                    <div class="ely-anime-card-image" style="aspect-ratio: 4/3;"><svg viewBox="0 0 160 100" fill="none" style="width:72px;opacity:.5"><circle cx="55" cy="38" r="20" stroke="white" stroke-width="2" opacity=".5"/><circle cx="100" cy="28" r="10" stroke="white" stroke-width="1.5" opacity=".35"/><path d="M20 72L50 48L80 60L110 40L145 52" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/><circle cx="125" cy="65" r="5" fill="white" opacity=".2"/></svg></div>
                    <div class="ely-anime-card-body">
                      <span class="ely-anime-card-tag">{{ work.tag }}</span>
                      <h3 style="font-size: 0.95rem;">{{ work.title }}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h3>{{ t.activityFeed }}</h3>
                <div style="display: grid; gap: 0;">
                  <div
                    v-for="(item, i) in t.activities"
                    :key="i"
                    style="display: flex; gap: 14px; align-items: start; padding: 14px 0; border-bottom: 1px solid color-mix(in oklab, var(--color-line) 40%, transparent);"
                    :style="i === t.activities.length - 1 ? 'border-bottom: 0;' : ''"
                  >
                    <span style="flex: 0 0 auto; width: 8px; height: 8px; margin-top: 0.4rem; border-radius: 999px; background: var(--color-primary); box-shadow: 0 0 8px color-mix(in oklab, var(--color-primary) 30%, transparent);" />
                    <div style="flex: 1; display: grid; gap: 2px;">
                      <span style="font-size: 0.88rem;">{{ item.text }}</span>
                      <span style="color: var(--color-text-muted); font-size: 0.75rem;">{{ item.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
}
