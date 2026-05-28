import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicMenu,
  ElyPublicSegmentedControl,
  ElyPublicToolbar,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicMenuItem,
  ElyPublicSegmentedControlItem,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Toolbar

const viewItems: ElyPublicSegmentedControlItem[] = [
  {
    key: "gallery",
    label: "Gallery",
    description: "Show media-first review.",
    value: "gallery",
  },
  {
    key: "list",
    label: "List",
    description: "Show compact reading order.",
    value: "list",
  },
  {
    key: "proof",
    label: "Proof",
    description: "Show evidence-first review.",
    value: "proof",
  },
]

const menuItems: ElyPublicMenuItem[] = [
  {
    key: "copy",
    label: "Copy preview link",
    description: "Share this surface without changing release state.",
    meta: "Copy",
    tone: "primary",
  },
  {
    key: "history",
    label: "Open history",
    description: "Review previous local snapshots.",
    meta: "Audit",
  },
  {
    key: "archive",
    label: "Archive draft",
    description: "Remove from the active lane after review.",
    meta: "Safe",
  },
]

const meta = {
  title: "Public Luxe/Components/Toolbar",
  component: ElyPublicToolbar,
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
      description: "Accessible label for the grouped local action lane.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Spacing density for the toolbar.",
    },
    justify: {
      control: "select",
      options: ["between", "end", "start"],
      description: "Horizontal distribution of toolbar groups.",
    },
  },
  args: {
    ariaLabel: "Draft review actions",
    density: "comfortable",
    justify: "between",
  },
} satisfies Meta<typeof ElyPublicToolbar>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicMenu,
      ElyPublicSegmentedControl,
      ElyPublicToolbar,
    },
    setup() {
      const selectedView = ref("gallery")

      return {
        args,
        menuItems,
        selectedView,
        viewItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toolbar playground</p>
            <h1 class="ely-public-section-title">Group local controls in one flat action lane</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar v-bind="args">
                <template #leading>
                  <ElyPublicBadge tone="primary">Draft</ElyPublicBadge>
                </template>
                <ElyPublicSegmentedControl
                  aria-label="Preview mode"
                  v-model="selectedView"
                  :items="viewItems"
                />
                <template #trailing>
                  <ElyPublicButton size="sm">Publish preview</ElyPublicButton>
                  <ElyPublicMenu trigger-label="More" aria-label="More draft actions" :items="menuItems" />
                </template>
              </ElyPublicToolbar>
              <p class="ely-public-muted-copy">Selected view: {{ selectedView }}.</p>
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
    components: { ElyPublicBadge, ElyPublicButton, ElyPublicToolbar },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Toolbar states</p>
            <h1 class="ely-public-section-title">Grouped, leading, trailing, compact, responsive</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Comfortable toolbar">
                <template #leading>
                  <ElyPublicBadge>Comfortable</ElyPublicBadge>
                </template>
                <ElyPublicButton size="sm" tone="secondary">Preview</ElyPublicButton>
                <template #trailing>
                  <ElyPublicButton size="sm">Continue</ElyPublicButton>
                </template>
              </ElyPublicToolbar>
              <ElyPublicToolbar aria-label="Compact toolbar" density="compact" justify="start">
                <ElyPublicBadge tone="primary">Compact</ElyPublicBadge>
                <ElyPublicButton size="sm" tone="ghost">Restore</ElyPublicButton>
                <ElyPublicButton size="sm">Save</ElyPublicButton>
              </ElyPublicToolbar>
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

export const ActionLaneScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicMenu,
      ElyPublicToolbar,
    },
    setup() {
      return { menuItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Action lane scenarios</p>
            <h1 class="ely-public-section-title">One visible next step, one grouped local lane</h1>
            <p class="ely-public-copy">
              Toolbar keeps draft context, primary action, support route, and overflow action in one readable row without adding another card.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Launch draft toolbar">
                <template #leading>
                  <ElyPublicBadge tone="primary">Ready</ElyPublicBadge>
                </template>
                <ElyPublicLink href="#">Review evidence</ElyPublicLink>
                <template #trailing>
                  <ElyPublicButton size="sm">Publish preview</ElyPublicButton>
                  <ElyPublicMenu trigger-label="More" aria-label="More launch draft actions" :items="menuItems" />
                </template>
              </ElyPublicToolbar>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const PreferenceToolbarScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicSegmentedControl,
      ElyPublicToolbar,
    },
    setup() {
      const selectedView = ref("proof")

      return {
        selectedView,
        viewItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Preference toolbar scenarios</p>
            <h1 class="ely-public-section-title">Local preferences belong beside their evidence</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Review preference toolbar" density="compact">
                <template #leading>
                  <ElyPublicBadge>Review mode</ElyPublicBadge>
                </template>
                <ElyPublicSegmentedControl
                  aria-label="Review mode"
                  v-model="selectedView"
                  :items="viewItems"
                />
              </ElyPublicToolbar>
              <ElyPublicAlert
                tone="info"
                title="Preference stays local"
                :description="'Current mode is ' + selectedView + '. It changes the nearby review lane, not the route or release state.'"
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
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicToolbar },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Toolbar boundary</p>
            <h1 class="ely-public-section-title">Toolbar is a local action lane, not an application shell</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicToolbar aria-label="Rejected toolbar example" justify="start">
                <ElyPublicButton size="sm">Publish</ElyPublicButton>
                <ElyPublicButton size="sm">Delete</ElyPublicButton>
                <ElyPublicButton size="sm">Buy plan</ElyPublicButton>
              </ElyPublicToolbar>
              <ElyPublicAlert
                tone="warning"
                title="Reject action conflict"
                description="Multiple high-commitment actions in one toolbar means the workflow needs clearer structure, not stronger styling."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
