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
import {
  type Locale,
  localeItems,
  websiteBlogDetailI18n,
} from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Website Blog Detail",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A blog article detail page template with table of contents, author info, and related posts. Demonstrates building long-form content layouts.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BlogDetailDefault: Story = {
  name: "Blog detail (default)",
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
      const t = computed(() => websiteBlogDetailI18n[locale.value])
      const breadcrumbItems = computed(() =>
        t.value.breadcrumb.map((label, i) =>
          i < t.value.breadcrumb.length - 1 ? { label, href: "#" } : { label },
        ),
      )
      return { locale, t, localeItems, breadcrumbItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-tpl-page">

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <ElyPublicBreadcrumb :items="breadcrumbItems" />
          <hr class="ely-tpl-divider" />

          <div class="ely-tpl-blog-detail-layout">
            <article class="ely-tpl-blog-article">
              <div>
                <h1 style="margin:0;font-family:var(--ely-public-font-display);font-size:clamp(1.5rem,3vw,2rem);font-weight:600;">{{ t.title }}</h1>
              </div>

              <div class="ely-tpl-blog-card-meta">
                <ElyPublicAvatar :name="t.author" size="sm" />
                <span>{{ t.author }}</span>
                <span>·</span>
                <span>{{ t.authorRole }}</span>
                <span>·</span>
                <span>{{ t.publishedDate }}</span>
                <span>·</span>
                <span>{{ t.readTime }}</span>
              </div>

              <hr class="ely-tpl-divider" />

              <div v-for="section in t.sections" :key="section.key">
                <h2>{{ section.heading }}</h2>
                <p>{{ section.content }}</p>
              </div>

              <div class="ely-tpl-blog-tags">
                <ElyPublicBadge v-for="tag in t.tags" :key="tag" tone="primary">{{ tag }}</ElyPublicBadge>
              </div>

              <hr class="ely-tpl-divider" />

              <div style="display:grid;gap:16px;">
                <h3 style="margin:0;font-family:var(--ely-public-font-display);font-size:1.1rem;">{{ t.relatedTitle }}</h3>
                <div class="ely-tpl-blog-related">
                  <div v-for="post in t.relatedPosts" :key="post.key" class="ely-tpl-panel" style="padding:16px;">
                    <ElyPublicBadge tone="ghost" style="margin-bottom:8px;">{{ post.tag }}</ElyPublicBadge>
                    <ElyPublicLink>{{ post.title }}</ElyPublicLink>
                  </div>
                </div>
              </div>
            </article>

            <aside class="ely-tpl-blog-sidebar">
              <div class="ely-tpl-panel">
                <h3 style="margin:0 0 12px;font-family:var(--ely-public-font-display);font-size:0.9rem;font-weight:600;">Table of Contents</h3>
                <nav class="ely-tpl-blog-toc">
                  <a v-for="item in t.tableOfContents" :key="item.key" href="#">· {{ item.title }}</a>
                </nav>
              </div>
              <ElyPublicButton tone="ghost" block>{{ t.backToBlog }}</ElyPublicButton>
            </aside>
          </div>

        </div>
      </section>
    `,
  }),
}

export const BlogDetailDarkMode: Story = {
  ...BlogDetailDefault,
  name: "Blog detail (dark mode)",
  parameters: {
    globals: { mode: "dark" },
  },
}
