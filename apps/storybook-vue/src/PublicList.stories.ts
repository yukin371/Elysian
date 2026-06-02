import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicList,
  type ElyPublicListItem,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.List

const defaultItems = [
  {
    key: "theme",
    meta: "Theme",
    title: "Elysia default palette",
    description:
      "Petal pink, pale blue, pearl surface, and champagne accent stay governed by theme tokens.",
    href: "#theme",
    current: true,
    tone: "accent",
  },
  {
    key: "density",
    meta: "Layout",
    title: "Compact review rhythm",
    description:
      "Rows keep comparison scannable without turning every decision into a card.",
    href: "#density",
    tone: "primary",
  },
  {
    key: "proof",
    meta: "Evidence",
    title: "Dark mode proof required",
    description:
      "A disabled row stays readable and names why it cannot be opened yet.",
    disabled: true,
    tone: "warning",
  },
] satisfies ElyPublicListItem[]

const meta = {
  title: "Public Luxe/Components/List",
  component: ElyPublicList,
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
      description: "Accessible label for the structured list section.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Row rhythm for comfortable or dense list contexts.",
    },
    divided: {
      control: "boolean",
      description: "Shows subtle separators between rows.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible lightweight copy when the list has no rows.",
    },
    items: {
      control: "object",
      description: "Ordered list rows.",
    },
  },
  args: {
    ariaLabel: "Theme review list",
    density: "comfortable",
    divided: true,
    emptyMessage: "No review rows are available yet.",
    items: defaultItems,
  },
} satisfies Meta<typeof ElyPublicList>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicList },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">List playground</p>
            <h1 class="ely-public-section-title">Scan repeated items without creating a card tower</h1>
            <div class="ely-story-offset-md">
              <ElyPublicList v-bind="args" />
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
    components: { ElyPublicList },
    setup() {
      return { defaultItems, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">List states</p>
            <h1 class="ely-public-section-title">Plain, linked, current, disabled, comfortable, and compact rows</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicList :items="defaultItems" aria-label="Comfortable list states" />
              <ElyPublicList :items="defaultItems" density="compact" aria-label="Compact list states" />
              <ElyPublicList
                :items="[]"
                aria-label="Empty list state"
                empty-message="No saved routes yet. Keep the surface flat until a recovery action is needed."
              />
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

export const CollectionScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicList, ElyPublicText },
    setup() {
      const collectionItems = [
        {
          key: "editorial",
          meta: "Collection",
          title: "Moonlit editorial set",
          description:
            "A content group can show title, status, and reading context without wrapping every entry in a card.",
          href: "#editorial",
          tone: "primary",
        },
        {
          key: "member",
          meta: "Rewards",
          title: "Member ritual archive",
          description:
            "Use the list for peer entries; use Timeline only when chronology is the core meaning.",
          href: "#member",
          tone: "accent",
        },
        {
          key: "system",
          meta: "Fallback",
          title: "Enterprise calm profile",
          description:
            "A muted row can stay in the same list without bringing enterprise-gray mood into the whole theme.",
          tone: "muted",
        },
      ] satisfies ElyPublicListItem[]

      return { collectionItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">List collection</p>
            <h1 class="ely-public-section-title">Peer content entries should share one calm rhythm</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-actions">
                <ElyPublicBadge tone="accent">Flat rhythm</ElyPublicBadge>
                <ElyPublicBadge tone="primary">No card tower</ElyPublicBadge>
              </div>
              <ElyPublicList :items="collectionItems" aria-label="Collection entries" />
              <ElyPublicText tone="muted">
                The parent surface carries the mood; each row only carries its item meaning.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const NavigationScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicLink, ElyPublicList },
    setup() {
      const navigationItems = [
        {
          key: "profile",
          meta: "Current",
          title: "Profile and identity",
          description: "Current linked row exposes the selected destination.",
          href: "#profile",
          current: true,
          tone: "primary",
        },
        {
          key: "theme",
          meta: "Next",
          title: "Theme personality",
          description: "A linked row is a quiet route, not a primary CTA.",
          href: "#theme",
          tone: "accent",
        },
        {
          key: "billing",
          meta: "Locked",
          title: "Reward billing",
          description:
            "Disabled rows must explain why the destination is unavailable.",
          disabled: true,
          tone: "warning",
        },
      ] satisfies ElyPublicListItem[]

      return { navigationItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">List navigation</p>
            <h1 class="ely-public-section-title">Lightweight row links can guide without competing with the main action</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicList :items="navigationItems" aria-label="Account settings routes" />
              <div class="ely-public-actions">
                <ElyPublicButton>Save current profile</ElyPublicButton>
                <ElyPublicLink href="#" tone="muted">Open support policy</ElyPublicLink>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const KeyboardScenarios: Story = {
  render: () => ({
    components: { ElyPublicList, ElyPublicText },
    setup() {
      const items = [
        {
          key: "profile",
          title: "Profile settings",
          description: "Display name, avatar, and public bio",
          meta: "Settings",
          href: "#profile",
        },
        {
          key: "notifications",
          title: "Notification preferences",
          description: "Email and in-app alert rules",
          meta: "Settings",
          href: "#notifications",
        },
        {
          key: "privacy",
          title: "Privacy controls",
          description: "Visibility and data sharing rules",
          meta: "Settings",
          href: "#privacy",
        },
        {
          key: "locked",
          title: "Organization policy",
          description: "Managed by your organization",
          meta: "Locked",
          disabled: true,
        },
      ]

      return { items }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">List keyboard scenarios</p>
            <h1 class="ely-public-section-title">Tab to links, Enter to activate, disabled items are skipped</h1>
            <p class="ely-public-copy">
              Linked list items are focusable. Tab moves between them, and Enter activates the link. Disabled items are not focusable and aria-disabled is set.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicList
                aria-label="Keyboard navigation list"
                :items="items"
              />
              <ElyPublicText>
                Linked items render as anchor elements with native keyboard behavior. Disabled items use aria-disabled and are excluded from the tab order.
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
    components: { ElyPublicAlert, ElyPublicList },
    setup() {
      const boundaryItems = [
        {
          key: "good",
          meta: "Use",
          title: "Use List for peer rows on one surface",
          description:
            "Settings entries, content indexes, and lightweight summaries stay scan-friendly here.",
          tone: "success",
        },
        {
          key: "table",
          meta: "Reject",
          title: "Do not use List for sortable audit data",
          description:
            "If users compare many rows by columns, the system needs a table-like component instead.",
          tone: "warning",
        },
        {
          key: "route",
          meta: "Reject",
          title: "Do not turn List into the global menu",
          description:
            "Global navigation, route hierarchy, and local sections already have their own primitives.",
          tone: "accent",
        },
      ] satisfies ElyPublicListItem[]

      return { boundaryItems, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">List boundary</p>
            <h1 class="ely-public-section-title">List reduces card nesting, but it is not a table, menu, or feed platform</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicList :items="boundaryItems" density="compact" aria-label="List boundary review" />
              <ElyPublicAlert tone="warning" title="Choose the owner before styling the rows">
                If the row needs sorting, bulk selection, live updates, or workflow state, stop before making List more powerful.
              </ElyPublicAlert>
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
