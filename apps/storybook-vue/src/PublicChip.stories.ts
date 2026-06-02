import {
  ElyPublicButton,
  ElyPublicChip,
  ElyPublicInput,
  ElyPublicSelect,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Chip

const meta = {
  title: "Public Luxe/Components/Chip",
  component: ElyPublicChip,
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
    disabled: { control: "boolean", description: "Disable chip removal." },
    removable: { control: "boolean", description: "Show remove button." },
    removeLabel: {
      control: "text",
      description: "Accessible label for the remove button.",
    },
    selected: { control: "boolean", description: "Mark active selection." },
    tone: {
      control: "select",
      options: ["neutral", "primary", "accent"],
      description: "Visual emphasis for the selected item token.",
    },
  },
  args: {
    disabled: false,
    removable: true,
    removeLabel: "Remove moonlit filter",
    selected: true,
    tone: "primary",
  },
} satisfies Meta<typeof ElyPublicChip>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicChip },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Chip playground</p>
            <h1 class="ely-public-section-title">Tune a selected context token</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicChip v-bind="args">Moonlit filter</ElyPublicChip>
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

export const TonesAndSelection: Story = {
  render: () => ({
    components: { ElyPublicChip },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Chip tones and selection</p>
            <h1 class="ely-public-section-title">Selection tokens stay lighter than actions</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicChip>Quiet trait</ElyPublicChip>
              <ElyPublicChip selected tone="primary">Selected family</ElyPublicChip>
              <ElyPublicChip selected tone="accent">Petal accent</ElyPublicChip>
              <ElyPublicChip disabled>Inherited</ElyPublicChip>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicChip },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Chip states</p>
            <h1 class="ely-public-section-title">Neutral, primary, accent, removable, disabled</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicChip>Neutral</ElyPublicChip>
              <ElyPublicChip selected tone="primary">Selected</ElyPublicChip>
              <ElyPublicChip selected tone="accent">Accent</ElyPublicChip>
              <ElyPublicChip removable remove-label="Remove atmosphere">Atmosphere</ElyPublicChip>
              <ElyPublicChip removable disabled remove-label="Remove locked source">Locked source</ElyPublicChip>
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

export const RemovableFilterScenarios: Story = {
  render: () => ({
    components: { ElyPublicChip, ElyPublicInput, ElyPublicSelect },
    setup() {
      const query = ref("petal")
      const family = ref("elysia-default")
      const filters = ref(["light mode", "petal accent", "mobile ready"])
      const removeFilter = (filter: string) => {
        filters.value = filters.value.filter((item) => item !== filter)
      }

      return { family, filters, query, removeFilter }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Chip removable filters</p>
            <h1 class="ely-public-section-title">Selected filters summarize local context</h1>
            <p class="ely-public-copy">
              Chips let a search or chooser show active constraints without adding another card layer.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="query"
                label="Search theme evidence"
                description="The input owns freeform search; chips only summarize selected context."
              />
              <ElyPublicSelect
                v-model="family"
                label="Theme family"
                description="Select owns the structured single choice."
                :options="[
                  { label: 'Elysia Bloom', value: 'elysia-default' },
                  { label: 'Rose Nocturne', value: 'rose-nocturne' },
                  { label: 'Azure Aria', value: 'azure-aria' },
                ]"
              />
              <div class="ely-public-inline" aria-label="Active filters">
                <ElyPublicChip
                  v-for="filter in filters"
                  :key="filter"
                  removable
                  selected
                  tone="primary"
                  :remove-label="'Remove ' + filter"
                  @remove="removeFilter(filter)"
                >
                  {{ filter }}
                </ElyPublicChip>
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
    components: { ElyPublicChip, ElyPublicText },
    setup() {
      const selected = ref(false)

      return { selected }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Chip keyboard scenarios</p>
            <h1 class="ely-public-section-title">Tab to focus, Enter or Space to toggle selection</h1>
            <p class="ely-public-copy">
              Selectable chips respond to keyboard interaction. Tab moves focus between chips, and Enter or Space toggles the selected state.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicChip>Unselected chip</ElyPublicChip>
                <ElyPublicChip selected>Selected chip</ElyPublicChip>
              </div>
              <ElyPublicText>
                Selectable chips use roving tabindex or standard button keyboard patterns. Removable chips add a separate focus target for the remove action.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BadgeBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicChip },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Chip boundary</p>
            <h1 class="ely-public-section-title">Chip is selected context, not the primary next step</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicChip selected tone="primary">Creator mode</ElyPublicChip>
                <ElyPublicChip removable remove-label="Remove compact density">Compact density</ElyPublicChip>
                <ElyPublicChip tone="accent">Petal accent</ElyPublicChip>
              </div>
              <p class="ely-public-muted-copy">
                If the element commits, publishes, buys, or navigates, use Button or Link instead.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Apply selection</ElyPublicButton>
                <ElyPublicButton tone="ghost">Reset filters</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
