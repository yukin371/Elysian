import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicChip,
  ElyPublicInput,
  ElyPublicLink,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

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

const collections = [
  {
    title: "Midnight Aurora",
    tag: "Digital Art",
    desc: "A visual journey through light and darkness.",
    collectors: "340 collectors",
    featured: true,
  },
  {
    title: "Sakura Dreams",
    tag: "Illustration",
    desc: "Delicate ink and watercolor pieces capturing spring.",
    collectors: "580 collectors",
    featured: false,
  },
  {
    title: "Neon Chronicle",
    tag: "Photography",
    desc: "City nights captured in vivid color and texture.",
    collectors: "210 collectors",
    featured: false,
  },
  {
    title: "Stellar Archive",
    tag: "3D Render",
    desc: "Cosmic scenes rendered with volumetric light.",
    collectors: "425 collectors",
    featured: true,
  },
  {
    title: "Ceramic Garden",
    tag: "Craft",
    desc: "Handmade pottery with organic glazing techniques.",
    collectors: "190 collectors",
    featured: false,
  },
  {
    title: "Pixel Memoir",
    tag: "Pixel Art",
    desc: "Retro-inspired scenes with modern composition.",
    collectors: "310 collectors",
    featured: false,
  },
]

export const GalleryWithFilter: Story = {
  name: "Gallery with filter bar",
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicChip,
      ElyPublicInput,
      ElyPublicLink,
      ElyPublicText,
    },
    setup() {
      const search = ref("")
      const activeFilter = ref("All")
      const filters = [
        "All",
        "Digital Art",
        "Illustration",
        "Photography",
        "3D Render",
        "Craft",
        "Pixel Art",
      ]

      return { search, activeFilter, filters, collections }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section style="display: grid; gap: 14px;">
            <div>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                Creator collections
              </p>
              <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
                Browse curated works
              </h1>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <ElyPublicInput
                v-model="search"
                placeholder="Search collections..."
                style="max-width: 280px;"
              />
              <ElyPublicChip
                v-for="filter in filters"
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
              v-for="card in collections"
              :key="card.title"
              class="ely-anime-card ely-anime-glass"
            >
              <div class="ely-anime-card-image" :style="card.featured ? 'aspect-ratio: 16/10;' : ''">
                <div
                  v-if="card.featured"
                  style="position: absolute; top: 12px; right: 12px;"
                >
                  <ElyPublicBadge tone="primary">Featured</ElyPublicBadge>
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
                <ElyPublicLink style="margin-left: auto;">View</ElyPublicLink>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; padding: 16px 0;">
            <ElyPublicButton tone="ghost">Load more collections</ElyPublicButton>
          </div>
        </div>
      </section>
    `,
  }),
}

export const CharacterShowcaseGrid: Story = {
  name: "Character showcase grid",
  render: () => ({
    components: { ElyPublicBadge, ElyPublicButton },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <section style="display: grid; gap: 14px;">
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
              Character roster
            </p>
            <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.05;">
              Meet the cast
            </h1>
          </section>

          <div class="ely-anime-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
            <div
              v-for="char in [
                { name: 'Aoi', role: 'Protagonist', element: 'Water' },
                { name: 'Hikari', role: 'Guide', element: 'Light' },
                { name: 'Ren', role: 'Rival', element: 'Fire' },
                { name: 'Sakuya', role: 'Ally', element: 'Wind' },
                { name: 'Yuki', role: 'Mentor', element: 'Ice' },
                { name: 'Kuro', role: 'Shadow', element: 'Void' },
                { name: 'Mei', role: 'Healer', element: 'Earth' },
                { name: 'Sora', role: 'Wanderer', element: 'Sky' },
              ]"
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
