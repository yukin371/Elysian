import {
  ElyPublicAccordion,
  ElyPublicBreadcrumb,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicSearchInput,
  ElyPublicSegmentedControl,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, localeItems, websiteFAI18n } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Website FAQ",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A searchable FAQ page template with categorized accordion items and a contact support CTA. Demonstrates building help center pages.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FAQDefault: Story = {
  name: "FAQ (default)",
  render: () => ({
    components: {
      ElyPublicAccordion,
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicSearchInput,
      ElyPublicSegmentedControl,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => websiteFAI18n[locale.value])
      const searchQuery = ref("")
      const activeCategory = ref("all")
      const categoryItems = computed(() =>
        t.value.categories.map((c) => ({
          key: c.key,
          label: c.label,
          value: c.value,
        })),
      )
      const filteredGroups = computed(() => {
        const query = searchQuery.value.toLowerCase()
        return t.value.groups
          .filter(
            (g) =>
              activeCategory.value === "all" || g.key === activeCategory.value,
          )
          .map((g) => ({
            ...g,
            items: g.items.filter(
              (item) =>
                !query ||
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query),
            ),
          }))
          .filter((g) => g.items.length > 0)
      })
      const groupAccordionItems = computed(() =>
        filteredGroups.value.map((g) => ({
          key: g.key,
          heading: g.heading,
          accordionItems: g.items.map((item) => ({
            key: item.key,
            title: item.question,
            content: item.answer,
          })),
        })),
      )
      return {
        locale,
        t,
        localeItems,
        searchQuery,
        activeCategory,
        categoryItems,
        groupAccordionItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-tpl-page ely-tpl-page--narrow">

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <ElyPublicBreadcrumb :items="t.breadcrumb" />

          <div class="ely-tpl-page-header" style="text-align:center;">
            <h1>{{ t.title }}</h1>
            <p>{{ t.subtitle }}</p>
          </div>

          <hr class="ely-tpl-divider" />

          <div class="ely-tpl-toolbar" style="justify-content:center;">
            <ElyPublicSearchInput v-model="searchQuery" :placeholder="t.searchPlaceholder" :label="t.searchLabel" style="max-width:400px;" />
          </div>

          <div class="ely-tpl-toolbar" style="justify-content:center;">
            <ElyPublicSegmentedControl v-model="activeCategory" :items="categoryItems" aria-label="Category" />
          </div>

          <div v-for="group in groupAccordionItems" :key="group.key">
            <section class="ely-tpl-faq-category">
              <h3>{{ group.heading }}</h3>
              <ElyPublicAccordion :items="group.accordionItems" multiple />
            </section>
            <hr class="ely-tpl-divider" />
          </div>

          <section class="ely-tpl-cta">
            <h2>{{ t.contactTitle }}</h2>
            <p>{{ t.contactDesc }}</p>
            <ElyPublicButton>{{ t.contactBtn }}</ElyPublicButton>
          </section>

        </div>
      </section>
    `,
  }),
}

export const FAQDarkMode: Story = {
  ...FAQDefault,
  name: "FAQ (dark mode)",
  parameters: {
    globals: { mode: "dark" },
  },
}
