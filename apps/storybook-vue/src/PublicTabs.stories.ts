import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicTabs,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Tabs

const items: ElyPublicTabsItem[] = [
  {
    key: "discover",
    label: "Discover",
    description: "Mood and first impression",
  },
  {
    key: "compose",
    label: "Compose",
    description: "High-frequency editing lane",
  },
  { key: "deliver", label: "Deliver", description: "Release-ready finish" },
]

const meta = {
  title: "Public Luxe/Components/Tabs",
  component: ElyPublicTabs,
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
    items: { control: "object", description: "Tab item definitions." },
    modelValue: { control: "text", description: "Controlled active key." },
    ariaLabel: { control: "text", description: "Accessible tablist label." },
    idBase: { control: "text", description: "Stable id prefix." },
  },
  args: {
    ariaLabel: "Creation stages",
    items,
    modelValue: "discover",
  },
} satisfies Meta<typeof ElyPublicTabs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicBadge, ElyPublicTabs },
    setup() {
      const activeTab = ref(String(args.modelValue ?? "discover"))

      return {
        activeTab,
        args,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tabs playground</p>
            <h1 class="ely-public-section-title">Tune a section switcher through controls</h1>
            <div class="ely-story-offset-md">
              <ElyPublicTabs v-bind="args" v-model="activeTab">
                <template #default="{ activeItem }">
                  <div class="ely-public-stack">
                    <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                    <p class="ely-public-muted-copy">{{ activeItem?.description }}</p>
                  </div>
                </template>
              </ElyPublicTabs>
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

export const ContentPatterns: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicTabs },
    setup() {
      const activeTab = ref("discover")
      const editorialItems: ElyPublicTabsItem[] = [
        {
          key: "discover",
          label: "Discover",
          description: "Gather the first impression and theme mood.",
        },
        {
          key: "compose",
          label: "Compose",
          description: "Adjust content rhythm and component density.",
        },
        {
          key: "deliver",
          label: "Deliver",
          description: "Confirm release evidence and recovery paths.",
        },
      ]

      return {
        activeTab,
        editorialItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tabs content patterns</p>
            <h1 class="ely-public-section-title">Tabs switch sections inside one surface</h1>
            <div class="ely-story-offset-md">
              <ElyPublicTabs
                v-model="activeTab"
                :items="editorialItems"
                aria-label="Editorial review lanes"
              >
                <template #default="{ activeItem, activeKey }">
                  <div class="ely-public-stack">
                    <div class="ely-public-inline">
                      <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                      <ElyPublicBadge>{{ activeKey }}</ElyPublicBadge>
                    </div>
                    <p class="ely-public-muted-copy">{{ activeItem?.description }}</p>
                    <div class="ely-story-doc-matrix">
                      <div class="ely-story-doc-state">
                        <strong>When to use</strong>
                        <span>Same route, same owner, parallel sections.</span>
                      </div>
                      <div class="ely-story-doc-state">
                        <strong>When not to use</strong>
                        <span>Cross-route navigation or workflow jumps.</span>
                      </div>
                    </div>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicTabs },
    setup() {
      const activeTab = ref("discover")

      return {
        activeTab,
        doc,
        items,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tabs states</p>
            <h1 class="ely-public-section-title">Section switching with keyboard support</h1>
            <p class="ely-public-copy">Try Arrow keys, Home, and End to validate the navigation path.</p>
            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="items" aria-label="Creation stages">
                <template #default="{ activeItem, activeKey }">
                  <div class="ely-public-stack">
                    <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                    <p class="ely-public-muted-copy">{{ activeItem?.description }}</p>
                    <p class="ely-public-muted-copy">Active key: {{ activeKey }}</p>
                  </div>
                </template>
              </ElyPublicTabs>
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

export const KeyboardReview: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicTabs },
    setup() {
      const activeTab = ref("discover")

      return {
        activeTab,
        items,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Tabs keyboard review</p>
            <h1 class="ely-public-section-title">Arrow, Home, and End stay visible</h1>
            <p class="ely-public-copy">
              Focus a tab and use ArrowRight, Home, or End. The selected badge mirrors the active section.
            </p>
            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="items" aria-label="Keyboard review stages">
                <template #default="{ activeItem, activeKey }">
                  <div class="ely-public-inline">
                    <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                    <ElyPublicBadge>{{ activeKey }}</ElyPublicBadge>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SectionBoundaryScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicTabs,
    },
    setup() {
      const activeTab = ref("overview")
      const reviewItems: ElyPublicTabsItem[] = [
        {
          key: "overview",
          label: "Overview",
          description: "Summarize evidence in the current surface.",
        },
        {
          key: "repair",
          label: "Repair",
          description: "Show local fixes without route navigation.",
        },
        {
          key: "handoff",
          label: "Handoff",
          description: "Prepare reviewer notes in the same context.",
        },
      ]

      return {
        activeTab,
        reviewItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Tabs section boundary</p>
            <h1 class="ely-public-section-title">Tabs switch local sections, not product routes</h1>
            <p class="ely-public-copy">
              A tablist is approved when each tab remains a peer section inside
              one surface. Cross-page movement belongs to links, not tabs.
            </p>
            <div class="ely-story-offset-md">
              <ElyPublicTabs
                v-model="activeTab"
                :items="reviewItems"
                aria-label="Component review sections"
              >
                <template v-slot:default="{ activeItem, activeKey }">
                  <div class="ely-public-stack">
                    <div class="ely-public-inline">
                      <ElyPublicBadge tone="primary">{{ activeItem?.label }}</ElyPublicBadge>
                      <ElyPublicBadge>{{ activeKey }}</ElyPublicBadge>
                    </div>
                    <p class="ely-public-muted-copy">{{ activeItem?.description }}</p>
                    <ElyPublicAlert tone="info" title="Same owner, same surface">
                      Keep local evidence here. Use a link if the next step leaves this component review surface.
                    </ElyPublicAlert>
                    <div class="ely-public-actions">
                      <ElyPublicButton size="sm">Save section note</ElyPublicButton>
                      <ElyPublicLink href="#">Open scenario atlas</ElyPublicLink>
                    </div>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
