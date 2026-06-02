import {
  ElyPublicButton,
  ElyPublicPagination,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Pagination

const meta = {
  title: "Public Luxe/Components/Pagination",
  component: ElyPublicPagination,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: doc.description,
      },
    },
  },
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "Accessible label for the pagination nav.",
    },
    currentPageLabel: {
      control: "text",
      description: "Accessible prefix for the current page button.",
    },
    ellipsisLabel: {
      control: "text",
      description: "Screen-reader-only text for collapsed page ranges.",
    },
    modelValue: { control: "number", description: "Current page." },
    nextLabel: { control: "text", description: "Next button label." },
    pageLabel: {
      control: "text",
      description: "Accessible prefix for page number buttons.",
    },
    pageCount: { control: "number", description: "Total page count." },
    previousLabel: { control: "text", description: "Previous button label." },
  },
  args: {
    ariaLabel: "Archive pages",
    currentPageLabel: "Current page",
    ellipsisLabel: "Skipped pages",
    modelValue: 4,
    nextLabel: "Next page",
    pageLabel: "Page",
    pageCount: 12,
    previousLabel: "Previous page",
  },
} satisfies Meta<typeof ElyPublicPagination>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicPagination },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Pagination playground</p>
            <h1 class="ely-public-section-title">Tune bounded collection navigation</h1>
            <div class="ely-story-offset-md">
              <ElyPublicPagination v-bind="args" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const Anatomy: Story = {
  render: () => ({
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-doc-grid">
            <div class="ely-story-doc-panel">
              <p class="ely-public-eyebrow">{{ doc.category }}</p>
              <h2>{{ doc.name }}</h2>
              <p class="ely-story-offset-sm">{{ doc.description }}</p>
              <ul class="ely-story-doc-list">
                <li v-for="item in doc.usage" :key="item">{{ item }}</li>
              </ul>
              <div class="ely-story-doc-guidance">
                <h3>Decision guidance</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.decision" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="ely-story-doc-guidance">
                <h3>Composition</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.composition" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="ely-story-doc-guidance" data-kind="avoid">
                <h3>Anti-patterns</h3>
                <ul class="ely-story-doc-list">
                  <li v-for="item in doc.antiPatterns" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>

            <div class="ely-story-demo-frame">
              <div class="ely-story-doc-panel">
                <h3>State matrix</h3>
                <div class="ely-story-doc-matrix">
                  <div v-for="state in doc.states" :key="state.name" class="ely-story-doc-state">
                    <strong>{{ state.name }}</strong>
                    <span>{{ state.description }}</span>
                  </div>
                </div>
              </div>

              <div class="ely-story-doc-panel">
                <h3>Props</h3>
                <div class="ely-story-doc-table">
                  <div class="ely-story-doc-row" data-heading="true">
                    <span>Name</span><span>Type</span><span>Default</span><span>Description</span>
                  </div>
                  <div v-for="prop in doc.props" :key="prop.name" class="ely-story-doc-row">
                    <span class="ely-story-doc-code">{{ prop.name }}{{ prop.required ? ' *' : '' }}</span>
                    <span class="ely-story-doc-code">{{ prop.type }}</span>
                    <span class="ely-story-doc-cell">{{ prop.defaultValue ?? '-' }}</span>
                    <span class="ely-story-doc-cell">{{ prop.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicPagination },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Pagination states</p>
            <h1 class="ely-public-section-title">Start, middle, ellipsis, final boundary</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicPagination aria-label="First page example" :model-value="1" :page-count="6" />
              <ElyPublicPagination aria-label="Middle page example" :model-value="4" :page-count="12" />
              <ElyPublicPagination aria-label="Last page example" :model-value="12" :page-count="12" />
              <ElyPublicPagination aria-label="Single page example" :model-value="1" :page-count="1" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const PageRangeScenarios: Story = {
  render: () => ({
    components: { ElyPublicPagination, ElyPublicText },
    setup() {
      const shortRange = ref(2)
      const longRange = ref(9)

      return { longRange, shortRange }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Pagination ranges</p>
            <h1 class="ely-public-section-title">Small ranges stay explicit; long ranges collapse calmly</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-stack">
                <ElyPublicText tone="muted">Six pages can stay fully visible without becoming a menu.</ElyPublicText>
                <ElyPublicPagination v-model="shortRange" aria-label="Short collection pages" :page-count="6" />
              </div>
              <div class="ely-public-stack">
                <ElyPublicText tone="muted">Longer archives keep first, nearby, and final pages visible.</ElyPublicText>
                <ElyPublicPagination v-model="longRange" aria-label="Long archive pages" :page-count="28" />
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const CollectionScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicPagination,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      const page = ref(3)
      const rangeCopy = computed(() => {
        const start = (page.value - 1) * 8 + 1
        const end = page.value * 8

        return `${start}-${end} of 96 entries`
      })

      return { page, rangeCopy }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Collection pagination</p>
            <h1 class="ely-public-section-title">Pagination belongs to the collection it moves</h1>
            <div class="ely-story-offset-md">
              <ElyPublicStat
                :helper="rangeCopy"
                label="Review archive"
                tone="muted"
                value="96"
              />
            </div>
            <ElyPublicText class="ely-story-offset-md" tone="muted">
              The range text explains what the page controls; the primary action stays separate from movement.
            </ElyPublicText>
            <div class="ely-public-actions">
              <ElyPublicButton>Open selected entry</ElyPublicButton>
              <ElyPublicPagination v-model="page" aria-label="Review archive pages" :page-count="12" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const LocalizedLabelScenarios: Story = {
  render: () => ({
    components: { ElyPublicPagination, ElyPublicText },
    setup() {
      const page = ref(5)

      return { page }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Pagination labels</p>
            <h1 class="ely-public-section-title">Accessible page labels follow product language</h1>
            <ElyPublicText class="ely-story-offset-md" tone="muted">
              Visible controls can stay compact while the nav landmark, page buttons, current page, and skipped range use localized review copy.
            </ElyPublicText>
            <div class="ely-story-offset-md">
              <ElyPublicPagination
                v-model="page"
                aria-label="作品归档分页"
                current-page-label="当前页"
                ellipsis-label="已折叠的页码"
                next-label="下一页"
                page-label="第"
                :page-count="18"
                previous-label="上一页"
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const KeyboardScenarios: Story = {
  render: () => ({
    components: { ElyPublicPagination, ElyPublicText },
    setup() {
      const page = ref(4)

      return { page }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Pagination keyboard scenarios</p>
            <h1 class="ely-public-section-title">Tab to focus, Enter or Space to navigate</h1>
            <p class="ely-public-copy">
              Each page button is focusable. Tab moves between buttons, and Enter or Space activates the page change. Previous and Next buttons work the same way.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicPagination
                v-model="page"
                aria-label="Keyboard navigation example"
                :page-count="12"
              />
              <ElyPublicText>
                Current page is {{ page }}. Focus any page button and press Enter to navigate. The active page is indicated with aria-current="page".
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicPagination },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Pagination boundary</p>
            <h1 class="ely-public-section-title">Do not use pagination as progress, tabs, or filters</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicPagination aria-label="Boundary example" :model-value="5" :page-count="18" />
            </div>
            <div class="ely-story-doc-panel ely-story-offset-md">
              <h3>Accessibility notes</h3>
              <ul class="ely-story-doc-list">
                <li v-for="item in doc.accessibility" :key="item">{{ item }}</li>
              </ul>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
