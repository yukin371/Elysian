import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  type ElyPublicDescriptionItem,
  ElyPublicDescriptionList,
  ElyPublicLink,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.DescriptionList

const defaultItems = [
  {
    key: "theme",
    label: "Theme family",
    value: "Elysia default",
    description:
      "Petal primary, pale-blue secondary, pearl surface, champagne accent.",
    tone: "accent",
  },
  {
    key: "mode",
    label: "Mode proof",
    value: "Light and dark",
    description: "Both modes must preserve readable surface hierarchy.",
    tone: "primary",
  },
  {
    key: "radius",
    label: "Radius scale",
    value: "sm / md / lg",
    description: "No oversized local radius values for detail rows.",
    tone: "success",
  },
  {
    key: "risk",
    label: "Review risk",
    value: "Do not card-stack",
    description: "Use one detail block instead of a grid of tiny facts.",
    tone: "warning",
  },
] satisfies ElyPublicDescriptionItem[]

const meta = {
  title: "Public Luxe/Components/Description List",
  component: ElyPublicDescriptionList,
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
      description: "Accessible label for the detail section.",
    },
    columns: {
      control: "select",
      options: ["single", "double"],
      description: "One-column reading rhythm or two-column compact summary.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Spacing rhythm for comfortable or compact detail groups.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible lightweight copy when no detail facts are present.",
    },
    items: {
      control: "object",
      description: "Ordered label-value detail items.",
    },
  },
  args: {
    ariaLabel: "Theme details",
    columns: "double",
    density: "comfortable",
    emptyMessage: "No details have been recorded yet.",
    items: defaultItems,
  },
} satisfies Meta<typeof ElyPublicDescriptionList>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicDescriptionList },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Description list playground</p>
            <h1 class="ely-public-section-title">Keep detail facts together instead of making tiny cards</h1>
            <div class="ely-story-offset-md">
              <ElyPublicDescriptionList v-bind="args" />
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
    components: { ElyPublicDescriptionList },
    setup() {
      return { defaultItems, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Description list states</p>
            <h1 class="ely-public-section-title">Single, double, comfortable, compact, and semantic tone rows</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDescriptionList :items="defaultItems" aria-label="Double-column detail states" />
              <ElyPublicDescriptionList :items="defaultItems" columns="single" density="compact" aria-label="Compact detail states" />
              <ElyPublicDescriptionList
                :items="[]"
                aria-label="Empty detail state"
                empty-message="No profile facts yet. Do not add a second card just to explain absence."
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

export const ProfileScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicDescriptionList, ElyPublicText },
    setup() {
      const profileItems = [
        {
          key: "identity",
          label: "Creator identity",
          value: "Moonlit atelier",
          description:
            "A short value keeps the identity readable without a separate profile card.",
          tone: "accent",
        },
        {
          key: "tier",
          label: "Member tier",
          value: "Seraph preview",
          description:
            "Use Badge nearby when the tier itself needs stronger status treatment.",
          tone: "primary",
        },
        {
          key: "status",
          label: "Review status",
          value: "Ready",
          description:
            "Success tone supports the value; the word still carries the meaning.",
          tone: "success",
        },
      ] satisfies ElyPublicDescriptionItem[]

      return { profileItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Description profile</p>
            <h1 class="ely-public-section-title">Profile facts should read as one elegant block</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-actions">
                <ElyPublicBadge tone="accent">Identity</ElyPublicBadge>
                <ElyPublicBadge tone="success">Ready</ElyPublicBadge>
              </div>
              <ElyPublicDescriptionList :items="profileItems" aria-label="Creator profile details" />
              <ElyPublicText tone="muted">
                Use DescriptionList for facts; use Avatar or Card only when the visual identity itself is the content.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const PolicyScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicDescriptionList, ElyPublicLink },
    setup() {
      const policyItems = [
        {
          key: "window",
          label: "Reservation window",
          value: "24 hours",
          description:
            "The value is short; longer policy text belongs in Accordion or a linked route.",
          tone: "primary",
        },
        {
          key: "capacity",
          label: "Seat limit",
          value: "32 guests",
          description:
            "Use Progress when the important part is remaining capacity.",
          tone: "accent",
        },
        {
          key: "risk",
          label: "Late change",
          value: "Needs review",
          description:
            "Warning tone supports the fact, but the value names the consequence.",
          tone: "warning",
        },
      ] satisfies ElyPublicDescriptionItem[]

      return { policyItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Description policy</p>
            <h1 class="ely-public-section-title">Rules and constraints need labels, not decorative mini cards</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDescriptionList :items="policyItems" columns="single" aria-label="Event policy facts" />
              <div class="ely-public-actions">
                <ElyPublicButton>Confirm reservation</ElyPublicButton>
                <ElyPublicLink href="#" tone="muted">Open full policy</ElyPublicLink>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicDescriptionList },
    setup() {
      const boundaryItems = [
        {
          key: "fact",
          label: "Use",
          value: "Stable facts",
          description:
            "Best for profile facts, order attributes, event rules, and compact specifications.",
          tone: "success",
        },
        {
          key: "form",
          label: "Reject",
          value: "Editable fields",
          description:
            "Use Input, Select, Checkbox, or Radio Group when the user changes values.",
          tone: "warning",
        },
        {
          key: "table",
          label: "Reject",
          value: "Auditable rows",
          description:
            "If users need sorting, comparison, or row actions, do not stretch DescriptionList into a table.",
          tone: "accent",
        },
      ] satisfies ElyPublicDescriptionItem[]

      return { boundaryItems, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Description boundary</p>
            <h1 class="ely-public-section-title">DescriptionList is facts, not forms, tables, or timelines</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDescriptionList :items="boundaryItems" density="compact" aria-label="Description list boundary review" />
              <ElyPublicAlert tone="warning" title="Do not make facts interactive by styling alone">
                If a value needs edit, compare, sort, or approve behavior, choose the component that owns that interaction first.
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
