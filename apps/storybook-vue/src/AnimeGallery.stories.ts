import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicChip,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicSegmentedControl,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { type Locale, animeGalleryI18n, localeItems } from "./template-i18n"

const meta = {
  title: "Public Luxe/Showcase/Anime Content Gallery",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A content/character gallery template inspired by anime and gaming card grids. Demonstrates glassmorphism cards with hover effects, tag filtering, and grid layouts. Uses only theme tokens — switch themes and modes to see adaptation.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const GalleryWithFilter: Story = {
  name: "Gallery with filter bar",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicChip,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicSegmentedControl,
      ElyPublicText,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeGalleryI18n[locale.value])
      const search = ref("")
      const activeFilter = ref("All")

      return { locale, t, localeItems, search, activeFilter }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <section style="display: grid; gap: 14px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                {{ t.sectionLabel }}
              </p>
              <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
                {{ t.title }}
              </h1>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <ElyPublicInput
                v-model="search"
                :placeholder="t.searchPlaceholder"
                style="max-width: 280px;"
              />
              <ElyPublicChip
                v-for="filter in t.filters"
                :key="filter"
                :active="activeFilter === filter"
                style="cursor: pointer;"
                @click="activeFilter = filter"
              >
                {{ filter }}
              </ElyPublicChip>
            </div>
          </section>

          <div class="ely-anime-shimmer-bar" />

          <div class="ely-anime-grid--featured">
            <div
              v-for="card in t.collections"
              :key="card.title"
              class="ely-anime-card ely-anime-glass"
            >
              <div class="ely-anime-card-image" :style="card.featured ? 'aspect-ratio: 16/10;' : ''">
                <div
                  v-if="card.featured"
                  style="position: absolute; top: 12px; right: 12px;"
                >
                  <ElyPublicBadge tone="primary">{{ t.featured }}</ElyPublicBadge>
                </div>
                  <svg viewBox="0 0 160 100" fill="none" style="width:72px;opacity:.5"><circle cx="55" cy="38" r="20" stroke="white" stroke-width="2" opacity=".5"/><circle cx="100" cy="28" r="10" stroke="white" stroke-width="1.5" opacity=".35"/><path d="M20 72L50 48L80 60L110 40L145 52" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/></svg>
              </div>
              <div class="ely-anime-card-body">
                <span class="ely-anime-card-tag">{{ card.tag }}</span>
                <h3>{{ card.title }}</h3>
                <p>{{ card.desc }}</p>
              </div>
              <div class="ely-anime-card-footer">
                <span>{{ card.collectors }}</span>
                <ElyPublicLink style="margin-left: auto;">{{ t.view }}</ElyPublicLink>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; padding: 16px 0;">
            <ElyPublicButton tone="ghost">{{ t.loadMore }}</ElyPublicButton>
          </div>
        </div>
      </section>
    `,
  }),
}

export const CharacterShowcaseGrid: Story = {
  name: "Character showcase grid",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicSegmentedControl,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeGalleryI18n[locale.value])

      return { locale, t, localeItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>
          <section style="display: grid; gap: 14px;">
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
              {{ t.charLabel }}
            </p>
            <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
              {{ t.charTitle }}
            </h1>
          </section>

          <div class="ely-anime-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
            <div
              v-for="char in t.characters"
              :key="char.name"
              class="ely-anime-card ely-anime-glass"
            >
              <div class="ely-anime-card-image ely-anime-card-image--portrait"><svg viewBox="0 0 100 120" fill="none" style="width:56px;opacity:.5"><circle cx="50" cy="35" r="18" stroke="white" stroke-width="2" opacity=".5"/><path d="M30 60C30 52 40 47 50 47C60 47 70 52 70 60L72 85H28L30 60Z" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".35"/><circle cx="65" cy="75" r="4" fill="white" opacity=".2"/></svg></div>
              <div class="ely-anime-card-body">
                <span class="ely-anime-card-tag">{{ char.element }}</span>
                <h3>{{ char.name }}</h3>
                <p style="color: var(--color-text-muted);">{{ char.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
}
