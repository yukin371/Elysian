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
import { type Locale, localeItems, websiteBlogListI18n } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Website Blog List",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A blog listing page template with category filters, post cards grid, and pagination. Demonstrates building public-facing blog or news pages.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BlogListDefault: Story = {
  name: "Blog list (default)",
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
      const t = computed(() => websiteBlogListI18n[locale.value])
      const activeCategory = ref("all")
      const categoryItems = computed(() =>
        t.value.categories.map((c) => ({
          key: c.key,
          label: c.label,
          value: c.value,
        })),
      )
      const filteredPosts = computed(() =>
        activeCategory.value === "all"
          ? t.value.posts
          : t.value.posts.filter((p) => p.category === activeCategory.value),
      )
      return {
        locale,
        t,
        localeItems,
        activeCategory,
        categoryItems,
        filteredPosts,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-tpl-page">

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <ElyPublicBreadcrumb :items="t.breadcrumb" />

          <div class="ely-tpl-page-header">
            <h1>{{ t.title }}</h1>
            <p>{{ t.subtitle }}</p>
          </div>

          <hr class="ely-tpl-divider" />

          <div class="ely-tpl-toolbar">
            <ElyPublicSegmentedControl v-model="activeCategory" :items="categoryItems" aria-label="Category" />
          </div>

          <section class="ely-tpl-blog-grid">
            <article v-for="post in filteredPosts" :key="post.key" class="ely-tpl-blog-card">
              <div class="ely-tpl-blog-card-image">
                <svg viewBox="0 0 160 100" fill="none" style="width:56px;opacity:.4"><circle cx="55" cy="38" r="20" stroke="white" stroke-width="2" opacity=".5"/><circle cx="100" cy="28" r="10" stroke="white" stroke-width="1.5" opacity=".35"/><path d="M20 72L50 48L80 60L110 40L145 52" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/></svg>
              </div>
              <div style="display:grid;gap:8px;">
                <ElyPublicBadge tone="primary">{{ post.category }}</ElyPublicBadge>
                <ElyPublicLink><strong style="font-size:1.05rem;">{{ post.title }}</strong></ElyPublicLink>
                <p class="ely-tpl-blog-card-excerpt">{{ post.excerpt }}</p>
              </div>
              <ElyPublicDivider />
              <div class="ely-tpl-blog-card-meta">
                <ElyPublicAvatar :name="post.author" size="sm" />
                <span>{{ post.author }}</span>
                <span>·</span>
                <span>{{ post.readTime }}</span>
                <span>·</span>
                <span>{{ post.date }}</span>
              </div>
            </article>
          </section>

          <div class="ely-tpl-pagination-bar">
            <span>{{ t.pagination }}</span>
            <ElyPublicButton tone="ghost">{{ t.loadMore }}</ElyPublicButton>
          </div>

        </div>
      </section>
    `,
  }),
}

export const BlogListDarkMode: Story = {
  ...BlogListDefault,
  name: "Blog list (dark mode)",
  parameters: {
    globals: { mode: "dark" },
  },
}
