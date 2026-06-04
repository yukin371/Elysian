import {
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicBreadcrumb,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicSegmentedControl,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, localeItems, websiteTeamI18n } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Website Team",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A team page template with member cards, department filtering, and team stats. Demonstrates building about-us or team showcase pages.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TeamDefault: Story = {
  name: "Team (default)",
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicSegmentedControl,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => websiteTeamI18n[locale.value])
      const activeDept = ref("all")
      const deptItems = computed(() =>
        t.value.departmentFilter.map((d) => ({
          key: d.key,
          label: d.label,
          value: d.value,
        })),
      )
      const filteredMembers = computed(() =>
        activeDept.value === "all"
          ? t.value.members
          : t.value.members.filter((m) => m.department === activeDept.value),
      )
      return { locale, t, localeItems, activeDept, deptItems, filteredMembers }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-tpl-page">

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <ElyPublicBreadcrumb :items="t.breadcrumb" />

          <div class="ely-tpl-hero">
            <div class="ely-tpl-hero-content">
              <h1>{{ t.title }}</h1>
              <p>{{ t.subtitle }}</p>
            </div>
          </div>

          <hr class="ely-tpl-divider" />

          <div class="ely-tpl-panel">
            <div class="ely-tpl-stats-row">
              <div v-for="stat in t.stats" :key="stat.label" class="ely-tpl-stat">
                <strong>{{ stat.value }}</strong>
                <span>{{ stat.label }}</span>
              </div>
            </div>
          </div>

          <hr class="ely-tpl-divider" />

          <div class="ely-tpl-toolbar">
            <ElyPublicSegmentedControl v-model="activeDept" :items="deptItems" aria-label="Department" />
          </div>

          <div class="ely-tpl-team-grid">
            <div v-for="member in filteredMembers" :key="member.key" class="ely-tpl-team-card">
              <ElyPublicAvatar :name="member.name" size="lg" />
              <h3>{{ member.name }}</h3>
              <p style="margin:0;color:var(--color-text-muted);font-size:0.84rem;">{{ member.role }}</p>
              <ElyPublicBadge tone="ghost">{{ member.department }}</ElyPublicBadge>
              <p style="margin:0;color:var(--color-text-muted);font-size:0.82rem;line-height:1.5;">{{ member.bio }}</p>
            </div>
          </div>

        </div>
      </section>
    `,
  }),
}

export const TeamDarkMode: Story = {
  ...TeamDefault,
  name: "Team (dark mode)",
  parameters: {
    globals: { mode: "dark" },
  },
}
