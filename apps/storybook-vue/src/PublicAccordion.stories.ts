import {
  ElyPublicAccordion,
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Accordion

const defaultItems = [
  {
    key: "theme",
    eyebrow: "Theme",
    title: "How does the Elysia default theme stay lively without color drift?",
    content:
      "It keeps petal pink as primary, pale blue as secondary, and champagne accent as a restrained highlight. The accordion should reveal this rule without becoming another decorative card.",
  },
  {
    key: "radius",
    eyebrow: "Shape",
    title: "Why are large rounded cards avoided?",
    content:
      "Public-luxe uses small and medium radii for crisp elegance. Roundness supports touch targets and soft character, but it should not turn every surface into a toy-like bubble.",
  },
  {
    key: "motion",
    eyebrow: "Motion",
    title: "When should shimmer or glow appear?",
    content:
      "Use glow for focus, active states, or rare ceremony. Loading shimmer belongs to Skeleton and should never compete with readable content.",
  },
]

const meta = {
  title: "Public Luxe/Components/Accordion",
  component: ElyPublicAccordion,
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
      description: "Accessible label for the disclosure group.",
    },
    idBase: {
      control: "text",
      description: "Stable id prefix for trigger and panel linkage.",
    },
    modelValue: {
      control: "object",
      description: "Open item keys.",
    },
    multiple: {
      control: "boolean",
      description: "Allows more than one panel to remain open.",
    },
  },
  args: {
    ariaLabel: "Theme FAQ",
    items: defaultItems,
    modelValue: ["theme"],
    multiple: false,
  },
} satisfies Meta<typeof ElyPublicAccordion>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicAccordion },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Accordion playground</p>
            <h1 class="ely-public-section-title">Disclose detail without adding another layer of cards</h1>
            <div class="ely-story-offset-md">
              <ElyPublicAccordion v-bind="args" />
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
    components: { ElyPublicAccordion },
    setup() {
      const singleOpen = ref(["theme"])
      const multiOpen = ref(["theme", "motion"])

      return { defaultItems, doc, multiOpen, singleOpen }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Accordion states</p>
            <h1 class="ely-public-section-title">Collapsed, expanded, single-open, and multiple-open disclosure</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAccordion v-model="singleOpen" :items="defaultItems" aria-label="Single open example" />
              <ElyPublicAccordion v-model="multiOpen" multiple :items="defaultItems" aria-label="Multiple open example" />
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

export const DisclosureStates: Story = {
  render: () => ({
    components: { ElyPublicAccordion, ElyPublicText },
    setup() {
      const openKeys = ref(["theme"])
      const openCopy = computed(() =>
        openKeys.value.length === 0
          ? "No section is open; the page still keeps its primary action visible."
          : `Open section: ${openKeys.value.join(", ")}`,
      )

      return { defaultItems, openCopy, openKeys }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Accordion disclosure states</p>
            <h1 class="ely-public-section-title">Disclosure should clarify the current surface, not become the surface</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAccordion v-model="openKeys" :items="defaultItems" aria-label="Design disclosure states" />
              <ElyPublicText tone="muted">{{ openCopy }}</ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const FaqScenarios: Story = {
  render: () => ({
    components: { ElyPublicAccordion, ElyPublicButton, ElyPublicLink },
    setup() {
      const openKeys = ref(["theme", "radius"])

      return { defaultItems, openKeys }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Accordion FAQ</p>
            <h1 class="ely-public-section-title">FAQ stays near the decision but does not steal the main action</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAccordion
                v-model="openKeys"
                multiple
                :items="defaultItems"
                aria-label="Theme decision FAQ"
              />
              <div class="ely-public-actions">
                <ElyPublicButton>Apply theme rules</ElyPublicButton>
                <ElyPublicLink href="#" tone="muted">Open full design guide</ElyPublicLink>
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
    components: { ElyPublicAccordion, ElyPublicAlert },
    setup() {
      const riskItems = [
        {
          key: "visible",
          eyebrow: "Visible",
          title: "This guidance can be disclosed because it is supplemental",
          content:
            "The user can still complete the current decision without opening this section. Opening it adds confidence, not required repair.",
        },
        {
          key: "blocked",
          eyebrow: "Rejected",
          title: "Do not hide blockers inside disclosure",
          content:
            "Required validation, pricing, legal consent, and destructive warnings must remain visible near the affected control.",
        },
      ]

      return { doc, riskItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Accordion boundary</p>
            <h1 class="ely-public-section-title">Optional context can fold; required recovery cannot</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAccordion :items="riskItems" :model-value="['visible']" aria-label="Disclosure boundary" />
              <ElyPublicAlert tone="danger" title="Required repair stays visible">
                Do not put this message inside Accordion. The user needs to see it before continuing.
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
