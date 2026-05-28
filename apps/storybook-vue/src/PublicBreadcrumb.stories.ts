import {
  ElyPublicBreadcrumb,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicTabs,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Breadcrumb

const defaultItems = [
  { href: "#", label: "Home" },
  { href: "#", label: "Collections" },
  { label: "Moonlit archive" },
]

const meta = {
  title: "Public Luxe/Components/Breadcrumb",
  component: ElyPublicBreadcrumb,
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
      description: "Accessible label for the breadcrumb navigation region.",
    },
    maxItems: {
      control: "number",
      description: "Optional cap that collapses middle route levels.",
    },
    overflowLabel: {
      control: "text",
      description: "Accessible label for the collapsed middle marker.",
    },
    separatorLabel: {
      control: "text",
      description: "Screen-reader-only phrase between route levels.",
    },
  },
  args: {
    ariaLabel: "Story route",
    items: defaultItems,
    maxItems: undefined,
    overflowLabel: "Collapsed route levels",
    separatorLabel: "Next level",
  },
} satisfies Meta<typeof ElyPublicBreadcrumb>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicBreadcrumb },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Breadcrumb playground</p>
            <h1 class="ely-public-section-title">Tune route hierarchy without adding a navigation card</h1>
            <div class="ely-story-offset-md">
              <ElyPublicBreadcrumb v-bind="args" />
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

export const RouteDepths: Story = {
  render: () => ({
    components: { ElyPublicBreadcrumb },
    setup() {
      const accountItems = [
        { href: "#", label: "Member center" },
        { href: "#", label: "Rewards" },
        { label: "Seasonal benefit" },
      ]
      const editorialItems = [
        { href: "#", label: "Stories" },
        { href: "#", label: "Elysia studies" },
        { href: "#", label: "Palette notes" },
        { label: "Moonlit petals and crystal rhythm" },
      ]
      const eventItems = [
        { href: "#", label: "Events" },
        { label: "Spring release preview", current: true },
      ]

      return { accountItems, editorialItems, eventItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Breadcrumb route depths</p>
            <h1 class="ely-public-section-title">Ancestry stays quiet while the page keeps one main focus</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicBreadcrumb aria-label="Rewards route" :items="accountItems" />
              <ElyPublicBreadcrumb aria-label="Editorial route" :items="editorialItems" />
              <ElyPublicBreadcrumb aria-label="Event route" :items="eventItems" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicBreadcrumb },
    setup() {
      const linkedAncestors = [
        { href: "#", label: "Home" },
        { href: "#", label: "Creator center" },
        { label: "Profile settings" },
      ]
      const explicitCurrent = [
        { href: "#", label: "Events" },
        { href: "#", label: "Live previews" },
        { current: true, label: "Invitation gate" },
      ]
      const longTrail = [
        { href: "#", label: "Editorial" },
        { href: "#", label: "A very luminous but still governed archive name" },
        { label: "Current article" },
      ]
      const singleItem = [{ label: "Public home" }]

      return { explicitCurrent, linkedAncestors, longTrail, singleItem }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Breadcrumb states</p>
            <h1 class="ely-public-section-title">Linked ancestors, current page, wrapping, single location</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicBreadcrumb aria-label="Linked ancestor route" :items="linkedAncestors" />
              <ElyPublicBreadcrumb aria-label="Explicit current route" :items="explicitCurrent" />
              <ElyPublicBreadcrumb aria-label="Long route" :items="longTrail" />
              <ElyPublicBreadcrumb aria-label="Single location route" :items="singleItem" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const CollapsedRouteScenarios: Story = {
  render: () => ({
    components: { ElyPublicBreadcrumb },
    setup() {
      const collectionPath = [
        { href: "#", label: "Home" },
        { href: "#", label: "Collections" },
        { href: "#", label: "Moonlit archive" },
        { href: "#", label: "Character palettes" },
        { href: "#", label: "Elysia inspired notes" },
        { label: "Crystal petal route proof" },
      ]
      const accountPath = [
        { href: "#", label: "Member center" },
        { href: "#", label: "Rewards" },
        { href: "#", label: "Seasonal atelier" },
        { href: "#", label: "Invitation history" },
        { label: "Spring benefit receipt" },
      ]

      return { accountPath, collectionPath }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Breadcrumb collapsed route</p>
            <h1 class="ely-public-section-title">Deep paths collapse the middle without becoming navigation</h1>
            <p class="ely-public-copy">
              The first parent, recent context, and current page stay visible. The hidden middle is announced as route overflow, not exposed as a menu.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicBreadcrumb
                aria-label="Collapsed editorial route"
                :items="collectionPath"
                :max-items="4"
                overflow-label="Hidden editorial route levels"
              />
              <ElyPublicBreadcrumb
                aria-label="Collapsed member route"
                :items="accountPath"
                :max-items="3"
                overflow-label="Hidden member route levels"
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const WayfindingScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBreadcrumb,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicTabs,
    },
    setup() {
      const items = [
        { href: "#", label: "Creator center" },
        { href: "#", label: "Theme atelier" },
        { label: "Rose nocturne proof" },
      ]
      const tabs = [
        { key: "proof", label: "Proof", description: "Current evidence" },
        {
          key: "history",
          label: "History",
          description: "Earlier review notes",
        },
      ]

      return { items, tabs }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <ElyPublicBreadcrumb aria-label="Theme proof route" :items="items" />
            <div class="ely-story-offset-md">
              <p class="ely-public-eyebrow">Breadcrumb wayfinding</p>
              <h1 class="ely-public-section-title">Breadcrumb names ancestry; tabs switch local evidence</h1>
              <p class="ely-public-copy">
                The trail stays above the surface as route memory. The primary action and local tabs keep their own jobs.
              </p>
            </div>
            <div class="ely-story-offset-md">
              <ElyPublicTabs :items="tabs" aria-label="Proof sections">
                <template #default="{ activeItem }">
                  <p class="ely-public-copy">
                    {{ activeItem.label }} stays inside the current proof page; it does not rewrite the breadcrumb.
                  </p>
                </template>
              </ElyPublicTabs>
            </div>
            <div class="ely-public-actions">
              <ElyPublicButton>Approve proof</ElyPublicButton>
              <ElyPublicLink href="#" tone="muted">Return to atelier</ElyPublicLink>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const AccessibilityBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicBreadcrumb },
    setup() {
      const items = [
        { href: "#", label: "Home" },
        { href: "#", label: "Collections" },
        { href: "#", label: "Archive" },
        { label: "Current page" },
      ]

      return { doc, items }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Breadcrumb accessibility boundary</p>
            <h1 class="ely-public-section-title">Current location is announced, not linked again</h1>
            <div class="ely-story-offset-md">
              <ElyPublicBreadcrumb aria-label="Accessible route" :items="items" />
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
