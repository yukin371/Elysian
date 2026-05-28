import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicEmptyState,
  ElyPublicList,
  ElyPublicSearchInput,
  ElyPublicToolbar,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicListItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.SearchInput

const archiveItems: ElyPublicListItem[] = [
  {
    key: "elysia",
    title: "Elysia atelier guide",
    description: "Theme personality, radius discipline, and action hierarchy.",
    meta: "Guide",
    tone: "primary",
  },
  {
    key: "aria",
    title: "Azure aria release notes",
    description: "Clear theme family notes for information-heavy surfaces.",
    meta: "Notes",
    tone: "accent",
  },
  {
    key: "reward",
    title: "Member reward launch",
    description: "Eligibility, tier progress, and recovery path proof.",
    meta: "Event",
    tone: "warning",
  },
]

const meta = {
  title: "Public Luxe/Components/Search Input",
  component: ElyPublicSearchInput,
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
    modelValue: { control: "text", description: "Controlled search query." },
    label: { control: "text", description: "Visible search scope label." },
    description: {
      control: "text",
      description: "Helper copy linked through aria-describedby.",
    },
    placeholder: { control: "text", description: "Example query hint." },
    buttonLabel: { control: "text", description: "Submit button label." },
    clearLabel: {
      control: "text",
      description: "Accessible clear button label.",
    },
    disabled: { control: "boolean", description: "Disable search controls." },
  },
  args: {
    buttonLabel: "Search",
    clearLabel: "Clear archive search",
    description: "Search titles, theme notes, and public handoff evidence.",
    disabled: false,
    label: "Search archive",
    modelValue: "",
    placeholder: "Try Elysia or reward",
  },
} satisfies Meta<typeof ElyPublicSearchInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSearchInput },
    setup() {
      const query = ref(String(args.modelValue ?? ""))
      const submitted = ref("No search submitted yet")
      const handleSearch = (value: string) => {
        submitted.value = value
          ? `Submitted query: ${value}`
          : "Submitted empty search"
      }
      const handleClear = () => {
        submitted.value = "Query cleared"
      }

      return {
        args,
        handleClear,
        handleSearch,
        query,
        submitted,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Search input playground</p>
            <h1 class="ely-public-section-title">Search stays explicit and recoverable</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSearchInput
                v-bind="args"
                v-model="query"
                @search="handleSearch"
                @clear="handleClear"
              />
              <p class="ely-public-muted-copy">{{ submitted }}</p>
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
    components: { ElyPublicBadge, ElyPublicSearchInput },
    setup() {
      const emptyQuery = ref("")
      const filledQuery = ref("Elysia")

      return {
        doc,
        emptyQuery,
        filledQuery,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Search input states</p>
            <h1 class="ely-public-section-title">Empty, has value, submitted, disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSearchInput
                label="Empty search"
                placeholder="Search guides"
                v-model="emptyQuery"
              />
              <ElyPublicSearchInput
                label="Filled search"
                description="Clear appears only when a query exists."
                v-model="filledQuery"
              />
              <ElyPublicSearchInput
                label="Disabled search"
                model-value="Locked query"
                disabled
              />
              <div class="ely-public-inline">
                <ElyPublicBadge>role search</ElyPublicBadge>
                <ElyPublicBadge tone="primary">clear action</ElyPublicBadge>
              </div>
            </div>
          </section>
          <section class="ely-story-doc-panel">
            <h3>Accessibility notes</h3>
            <ul class="ely-story-doc-list">
              <li v-for="item in doc.accessibility" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
      </section>
    `,
  }),
}

export const QueryScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicList, ElyPublicSearchInput },
    setup() {
      const query = ref("elysia")
      const submittedQuery = ref("elysia")
      const visibleItems = computed(() =>
        archiveItems.filter((item) =>
          `${item.title} ${item.description}`
            .toLowerCase()
            .includes(submittedQuery.value.toLowerCase()),
        ),
      )
      const handleSearch = (value: string) => {
        submittedQuery.value = value
      }
      const handleClear = () => {
        submittedQuery.value = ""
      }

      return {
        handleClear,
        handleSearch,
        query,
        submittedQuery,
        visibleItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Query scenarios</p>
            <h1 class="ely-public-section-title">Submit a query before changing the nearby collection</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSearchInput
                label="Search public archive"
                description="Search applies to the nearby archive list only."
                placeholder="Try Elysia, aria, or reward"
                v-model="query"
                @search="handleSearch"
                @clear="handleClear"
              />
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">Submitted: {{ submittedQuery || 'all' }}</ElyPublicBadge>
                <ElyPublicBadge>{{ visibleItems.length }} results</ElyPublicBadge>
              </div>
              <ElyPublicList
                aria-label="Filtered archive results"
                :items="visibleItems"
                density="compact"
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RecoveryScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicEmptyState,
      ElyPublicSearchInput,
      ElyPublicToolbar,
    },
    setup() {
      const query = ref("missing moon shard")
      const submittedQuery = ref("missing moon shard")
      const handleSearch = (value: string) => {
        submittedQuery.value = value
      }
      const handleClear = () => {
        submittedQuery.value = ""
      }

      return {
        handleClear,
        handleSearch,
        query,
        submittedQuery,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Recovery scenarios</p>
            <h1 class="ely-public-section-title">A failed query still needs a clear recovery path</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Archive search toolbar">
                <ElyPublicSearchInput
                  label="Search archive"
                  placeholder="Search guide title"
                  v-model="query"
                  @search="handleSearch"
                  @clear="handleClear"
                />
              </ElyPublicToolbar>
              <ElyPublicEmptyState
                tone="soft"
                title="No archive entries match this query"
                :description="'Search query: ' + (submittedQuery || 'all entries') + '. Clear the query or try a broader term.'"
              />
              <ElyPublicAlert
                tone="info"
                title="Recovery belongs near the results"
                description="Search Input provides the clear action; Empty State explains the missing result and next step."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicSearchInput },
    setup() {
      const query = ref("")

      return { query }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Search input boundary</p>
            <h1 class="ely-public-section-title">Search Input is not autocomplete, filters, or a result system</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSearchInput
                label="Search support notes"
                description="This primitive only owns query entry, submit, and clear."
                placeholder="Search known notes"
                v-model="query"
              />
              <ElyPublicAlert
                tone="warning"
                title="Reject hidden search platforms"
                description="Suggestions, faceted filters, ranking, saved searches, command palettes, and global search belong to later dedicated owners."
              />
              <div class="ely-public-actions">
                <ElyPublicButton size="sm">Review search results pattern</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
