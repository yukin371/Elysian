import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicSegmentedControl,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicSegmentedControlItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.SegmentedControl

const viewItems: ElyPublicSegmentedControlItem[] = [
  {
    key: "gallery",
    label: "Gallery",
    description: "Visual-first cards in the current surface.",
    value: "gallery",
  },
  {
    key: "list",
    label: "List",
    description: "Compact reading order in the current surface.",
    value: "list",
  },
  {
    key: "proof",
    label: "Proof",
    description: "Evidence-first review lane.",
    value: "proof",
  },
]

const meta = {
  title: "Public Luxe/Components/Segmented Control",
  component: ElyPublicSegmentedControl,
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
    items: {
      control: "object",
      description:
        "Segment definitions with key, value, label, and description.",
    },
    modelValue: {
      control: "text",
      description: "Controlled selected segment value.",
    },
    ariaLabel: {
      control: "text",
      description: "Accessible label for the compact radiogroup.",
    },
  },
  args: {
    ariaLabel: "View mode",
    items: viewItems,
    modelValue: "gallery",
  },
} satisfies Meta<typeof ElyPublicSegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicSegmentedControl },
    setup() {
      const selected = ref(String(args.modelValue ?? "gallery"))

      return {
        args,
        selected,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Segmented control playground</p>
            <h1 class="ely-public-section-title">Tune a compact preference without opening a menu</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSegmentedControl v-bind="args" v-model="selected" />
              <p class="ely-public-muted-copy">Selected value: {{ selected }}.</p>
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
    components: { ElyPublicBadge, ElyPublicSegmentedControl },
    setup() {
      const selected = ref("gallery")

      return {
        doc,
        selected,
        viewItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Segmented states</p>
            <h1 class="ely-public-section-title">Selected, inactive, keyboard, compact</h1>
            <p class="ely-public-copy">Try Arrow keys, Home, and End. The selected badge mirrors the active segment.</p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSegmentedControl
                aria-label="View state"
                v-model="selected"
                :items="viewItems"
              />
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">{{ selected }}</ElyPublicBadge>
                <ElyPublicBadge>roving focus</ElyPublicBadge>
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

export const ViewModeScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicSegmentedControl },
    setup() {
      const selectedView = ref("gallery")
      const viewCopy = computed(() => {
        if (selectedView.value === "list") {
          return "List mode favors reading order and compact scanning."
        }
        if (selectedView.value === "proof") {
          return "Proof mode foregrounds evidence before ornamental browsing."
        }
        return "Gallery mode keeps media and personality near the first glance."
      })

      return {
        selectedView,
        viewCopy,
        viewItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">View mode scenarios</p>
            <h1 class="ely-public-section-title">A compact switch for nearby presentation</h1>
            <p class="ely-public-copy">
              Segmented Control is strongest when the selected option changes the current surface, not the route.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSegmentedControl
                aria-label="Collection view mode"
                v-model="selectedView"
                :items="viewItems"
              />
              <div class="ely-story-doc-matrix">
                <div class="ely-story-doc-state">
                  <strong>Current mode</strong>
                  <span>{{ selectedView }}</span>
                </div>
                <div class="ely-story-doc-state">
                  <strong>Surface impact</strong>
                  <span>{{ viewCopy }}</span>
                </div>
                <div class="ely-story-doc-state">
                  <strong>Proof</strong>
                  <span>Every option stays visible and short enough for quick comparison.</span>
                </div>
              </div>
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">same surface</ElyPublicBadge>
                <ElyPublicBadge>three options</ElyPublicBadge>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const DensityToggleScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicSegmentedControl },
    setup() {
      const selectedDensity = ref("balanced")
      const densityItems: ElyPublicSegmentedControlItem[] = [
        {
          key: "compact",
          label: "Compact",
          description: "Reduce vertical rhythm while preserving touch targets.",
          value: "compact",
        },
        {
          key: "balanced",
          label: "Balanced",
          description: "Default public-luxe review rhythm.",
          value: "balanced",
        },
        {
          key: "ceremony",
          label: "Ceremony",
          description: "More breathing room for theme expression.",
          value: "ceremony",
        },
      ]

      return {
        densityItems,
        selectedDensity,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Density toggle scenarios</p>
            <h1 class="ely-public-section-title">Density can change rhythm without changing theme rules</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSegmentedControl
                aria-label="Density toggle"
                v-model="selectedDensity"
                :items="densityItems"
              />
              <ElyPublicAlert
                tone="info"
                title="Density is not a new visual language"
                :description="'Current density is ' + selectedDensity + '. It may change spacing, not color roles, radius, or action hierarchy.'"
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
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicSegmentedControl,
    },
    setup() {
      const selectedTone = ref("lively")
      const toneItems: ElyPublicSegmentedControlItem[] = [
        {
          key: "lively",
          label: "Lively",
          description: "A little more Elysia-like sparkle in the same surface.",
          value: "lively",
        },
        {
          key: "clear",
          label: "Clear",
          description: "Reduce ornament while keeping the public preset.",
          value: "clear",
        },
        {
          key: "quiet",
          label: "Quiet",
          description: "Prefer clarity over ceremony for the nearby preview.",
          value: "quiet",
        },
      ]

      return {
        selectedTone,
        toneItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Segmented boundary</p>
            <h1 class="ely-public-section-title">Segments choose presentation, not navigation or commitment</h1>
            <p class="ely-public-copy">
              Keep it small, local, and reversible. If the choice changes route, opens a full section, or commits release, use another primitive.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicSegmentedControl
                aria-label="Tone boundary"
                v-model="selectedTone"
                :items="toneItems"
              />
              <ElyPublicAlert
                tone="warning"
                title="Rejected uses"
                description="Do not hide long option lists, destructive actions, publish confirmation, or route navigation inside a segmented control."
              />
              <div class="ely-public-actions">
                <ElyPublicButton size="sm">Apply local preview</ElyPublicButton>
                <ElyPublicLink href="#">Use tabs for full sections</ElyPublicLink>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
