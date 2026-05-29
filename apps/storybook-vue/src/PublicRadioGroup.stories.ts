import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicRadioGroup,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicRadioGroupItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.RadioGroup

const items: ElyPublicRadioGroupItem[] = [
  {
    key: "comfortable",
    label: "Comfortable",
    description: "More air and display presence",
    value: "comfortable",
  },
  {
    key: "balanced",
    label: "Balanced",
    description: "Default application rhythm",
    value: "balanced",
  },
  {
    key: "compact",
    label: "Compact",
    description: "Denser but still decorative-safe",
    value: "compact",
  },
]

const meta = {
  title: "Public Luxe/Components/Radio Group",
  component: ElyPublicRadioGroup,
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
    ariaLabel: { control: "text", description: "Accessible group label." },
    description: {
      control: "text",
      description: "Visible group helper copy.",
    },
    disabled: {
      control: "boolean",
      description: "Disable every radio option.",
    },
    invalidMessage: {
      control: "text",
      description: "Visible group repair copy.",
    },
    items: { control: "object", description: "Radio option definitions." },
    label: { control: "text", description: "Visible group label." },
    modelValue: { control: "text", description: "Controlled selected value." },
  },
  args: {
    ariaLabel: "Density preset",
    description:
      "Choose one density for the current public surface; each option keeps the same theme contract.",
    disabled: false,
    invalidMessage: undefined,
    items,
    label: "Density preset",
    modelValue: "balanced",
  },
} satisfies Meta<typeof ElyPublicRadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicRadioGroup },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Radio group playground</p>
            <h1 class="ely-public-section-title">Tune a single-choice decision</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRadioGroup v-bind="args" />
              <p class="ely-public-muted-copy">Use controls to change the selected value or option copy.</p>
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

export const DecisionSets: Story = {
  render: () => ({
    components: { ElyPublicRadioGroup },
    setup() {
      const selectedDensity = ref("balanced")
      const selectedTone = ref("luminous")
      const toneItems: ElyPublicRadioGroupItem[] = [
        {
          key: "luminous",
          label: "Luminous",
          description: "More ceremonial and brand-led.",
          value: "luminous",
        },
        {
          key: "clear",
          label: "Clear",
          description: "More informational and restrained.",
          value: "clear",
        },
        {
          key: "calm",
          label: "Calm",
          description: "Less ornament for enterprise-adjacent pages.",
          value: "calm",
        },
      ]

      return {
        items,
        selectedDensity,
        selectedTone,
        toneItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Radio decision sets</p>
            <h1 class="ely-public-section-title">Radio groups choose exactly one path</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRadioGroup
                aria-label="Density preset"
                v-model="selectedDensity"
                :items="items"
              />
              <ElyPublicRadioGroup
                aria-label="Tone direction"
                v-model="selectedTone"
                :items="toneItems"
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicRadioGroup },
    setup() {
      const selectedDensity = ref("balanced")
      const selectedStage = ref("draft")
      const stageItems: ElyPublicRadioGroupItem[] = [
        {
          key: "draft",
          label: "Draft",
          description: "Keep editing before the review lane opens.",
          value: "draft",
        },
        {
          key: "review",
          label: "Review",
          description: "Invite reviewers and lock the comparison scope.",
          value: "review",
        },
        {
          key: "release",
          label: "Release",
          description: "Publish the approved public theme snapshot.",
          value: "release",
        },
      ]

      return {
        doc,
        items,
        selectedDensity,
        selectedStage,
        stageItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Radio group states</p>
            <h1 class="ely-public-section-title">Selected, unselected, descriptive, keyboard</h1>
            <p class="ely-public-copy">Try Arrow keys, Home, and End to validate single-choice focus movement.</p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRadioGroup
                aria-label="Density preset"
                v-model="selectedDensity"
                :items="items"
              />
              <p class="ely-public-muted-copy">Density value: {{ selectedDensity }}</p>
              <ElyPublicRadioGroup
                aria-label="Publishing stage"
                v-model="selectedStage"
                :items="stageItems"
              />
              <p class="ely-public-muted-copy">Stage value: {{ selectedStage }}</p>
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

export const KeyboardScenarios: Story = {
  render: () => ({
    components: { ElyPublicRadioGroup },
    setup() {
      const selectedDensity = ref("balanced")

      return {
        items,
        selectedDensity,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Radio keyboard scenarios</p>
            <h1 class="ely-public-section-title">Arrow keys should move through one decision set</h1>
            <p class="ely-public-copy">
              Focus a radio item and use ArrowRight, ArrowLeft, Home, or End.
            </p>
            <div class="ely-story-offset-md">
              <ElyPublicRadioGroup
                aria-label="Density preset keyboard scenario"
                v-model="selectedDensity"
                :items="items"
              />
              <p class="ely-public-muted-copy">Selected value: {{ selectedDensity }}</p>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const DecisionBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicRadioGroup },
    setup() {
      const selectedLaunchTone = ref("luminous")
      const selectedDensity = ref("balanced")
      const launchToneItems: ElyPublicRadioGroupItem[] = [
        {
          key: "luminous",
          label: "Luminous",
          description:
            "Use for public launch and celebratory creator surfaces.",
          value: "luminous",
        },
        {
          key: "editorial",
          label: "Editorial",
          description: "Use for slower reading and campaign collections.",
          value: "editorial",
        },
        {
          key: "calm",
          label: "Calm",
          description:
            "Use when enterprise-adjacent clarity matters more than spectacle.",
          value: "calm",
        },
      ]

      return {
        items,
        launchToneItems,
        selectedDensity,
        selectedLaunchTone,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Radio boundary</p>
            <h1 class="ely-public-section-title">Radio groups choose one comparable option inside one decision</h1>
            <p class="ely-public-copy">
              Use radio groups when all options are visible, mutually exclusive, and small enough to compare without opening a menu.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Good decision set</p>
              <h2 class="ely-public-section-title">Launch tone is one choice</h2>
              <ElyPublicRadioGroup
                aria-label="Launch tone boundary"
                v-model="selectedLaunchTone"
                :items="launchToneItems"
              />
              <p class="ely-public-muted-copy ely-story-offset-md">
                Selected tone: {{ selectedLaunchTone }}.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Density decision</p>
              <h2 class="ely-public-section-title">All options remain visible</h2>
              <ElyPublicRadioGroup
                aria-label="Density boundary"
                v-model="selectedDensity"
                :items="items"
              />
              <p class="ely-public-muted-copy ely-story-offset-md">
                Selected density: {{ selectedDensity }}.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected use</p>
              <h2 class="ely-public-section-title">Do not use radio as navigation or confirmation</h2>
              <ElyPublicAlert
                tone="warning"
                title="Route and commit elsewhere"
                description="If the choice changes pages, use navigation. If it commits public availability, use an explicit button and confirmation flow."
              />
              <div class="ely-public-inline ely-story-offset-md">
                <ElyPublicButton size="sm">Review decision proof</ElyPublicButton>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
