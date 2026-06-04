import {
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicSearchInput,
  ElyPublicSegmentedControl,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, localeItems, websiteError404I18n } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Website Error 404",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A 404 error page template with search, popular links, and recovery actions. Demonstrates building user-friendly error states.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Error404Default: Story = {
  name: "Error 404 (default)",
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicSearchInput,
      ElyPublicSegmentedControl,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => websiteError404I18n[locale.value])
      const searchQuery = ref("")
      return { locale, t, localeItems, searchQuery }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-tpl-page">

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <div class="ely-tpl-error-center">
            <h1>404</h1>
            <h2 style="margin:0;font-family:var(--ely-public-font-display);font-size:1.4rem;">{{ t.title }}</h2>
            <p style="margin:0;max-width:480px;color:var(--color-text-muted);line-height:1.6;">{{ t.subtitle }}</p>

            <ElyPublicSearchInput v-model="searchQuery" :placeholder="t.searchPlaceholder" :label="t.searchLabel" style="max-width:400px;width:100%;" />

            <div style="display:grid;gap:8px;">
              <p style="margin:0;font-size:0.76rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-text-muted);">{{ t.popularLinksTitle }}</p>
              <div class="ely-tpl-error-links">
                <ElyPublicLink v-for="link in t.popularLinks" :key="link">{{ link }}</ElyPublicLink>
              </div>
            </div>

            <div style="display:flex;gap:12px;">
              <ElyPublicButton>{{ t.goHome }}</ElyPublicButton>
              <ElyPublicButton tone="ghost">{{ t.goBack }}</ElyPublicButton>
            </div>
          </div>

        </div>
      </section>
    `,
  }),
}

export const Error404DarkMode: Story = {
  ...Error404Default,
  name: "Error 404 (dark mode)",
  parameters: {
    globals: { mode: "dark" },
  },
}
