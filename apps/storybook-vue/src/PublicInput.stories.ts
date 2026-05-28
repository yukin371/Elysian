import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicInput,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Input

const meta = {
  title: "Public Luxe/Components/Input",
  component: ElyPublicInput,
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
    modelValue: { control: "text", description: "Controlled field value." },
    label: { control: "text", description: "Visible field label." },
    description: {
      control: "text",
      description: "Helper copy linked through aria-describedby.",
    },
    invalidMessage: {
      control: "text",
      description: "Validation message linked through aria-describedby.",
    },
    multiline: { control: "boolean", description: "Render textarea." },
    disabled: { control: "boolean", description: "Disable native control." },
    rows: { control: "number", description: "Textarea rows." },
    type: {
      control: "select",
      options: ["email", "number", "password", "search", "text", "url"],
      description: "Native input type.",
    },
  },
  args: {
    description: "Use a clear label and keep helper copy short.",
    disabled: false,
    invalidMessage: undefined,
    label: "Collection title",
    modelValue: "Celestial archive",
    multiline: false,
    placeholder: "Enter a title",
    rows: 4,
    type: "text",
  },
} satisfies Meta<typeof ElyPublicInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicInput },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Input playground</p>
            <h1 class="ely-public-section-title">Tune field semantics through controls</h1>
            <div class="ely-story-offset-md">
              <ElyPublicInput v-bind="args" />
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

export const FieldTypes: Story = {
  render: () => ({
    components: { ElyPublicInput },
    setup() {
      const search = ref("")
      const email = ref("atelier@example.com")
      const password = ref("moonlit-access")
      const link = ref("https://elysian.local/theme")

      return {
        email,
        link,
        password,
        search,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Input field types</p>
            <h1 class="ely-public-section-title">Native type changes behavior, not surface language</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="search"
                type="search"
                label="Search moments"
                description="Search fields stay calm and readable inside dense review flows."
                placeholder="Search by theme, status, or reviewer"
              />
              <ElyPublicInput
                v-model="email"
                type="email"
                label="Reviewer email"
                description="Email fields keep the same focus and validation surface."
              />
              <ElyPublicInput
                v-model="password"
                type="password"
                label="Access phrase"
                description="Password fields should not become visually louder than the main action."
              />
              <ElyPublicInput
                v-model="link"
                type="url"
                label="Reference link"
                description="Use links for review evidence, not hidden comments."
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
    components: { ElyPublicInput },
    setup() {
      const title = ref("Celestial archive")
      const narrative = ref(
        "Keep input surfaces bright enough for readability, not thick enough to become glass ornaments.",
      )

      return {
        doc,
        narrative,
        title,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Input states</p>
            <h1 class="ely-public-section-title">Label, helper, multiline, invalid, disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="title"
                label="Collection title"
                description="Use the same field language across search, editing, and settings."
                placeholder="Enter a title"
              />
              <ElyPublicInput
                v-model="narrative"
                label="Narrative"
                description="Multiline stays inside the same surface system."
                multiline
              />
              <ElyPublicInput
                label="Guardrail"
                model-value="Unpaired overrides"
                invalid-message="Choose a governed family before introducing a custom override."
              />
              <ElyPublicInput
                disabled
                label="Locked source"
                model-value="Inherited from theme family"
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

export const ValidationScenarios: Story = {
  render: () => ({
    components: { ElyPublicInput },
    setup() {
      const title = ref("")
      const slug = ref("rose nocturne")
      const note = ref(
        "The title is readable, but the slug must be corrected before publishing.",
      )

      return {
        note,
        slug,
        title,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Input validation scenarios</p>
            <h1 class="ely-public-section-title">Errors explain the next repair step</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicInput
                v-model="title"
                label="Published title"
                description="Required before reviewers can approve the family."
                placeholder="Name the theme comparison"
                invalid-message="Add a title so this snapshot can be found later."
              />
              <ElyPublicInput
                v-model="slug"
                label="Public slug"
                description="Use lowercase letters, numbers, and hyphens."
                invalid-message="Replace spaces with hyphens before publishing."
              />
              <ElyPublicInput
                v-model="note"
                label="Review note"
                description="Multiline copy remains readable and steady during correction."
                multiline
              />
              <ElyPublicInput
                disabled
                label="Resolved theme"
                model-value="rose-nocturne / dark"
                description="Locked fields should remain legible while clearly non-editable."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const RepairFlowScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicInput },
    setup() {
      const email = ref("reviewer")
      const title = ref("")
      const note = ref(
        "Keep the public copy concise enough to survive mobile review.",
      )

      return {
        email,
        note,
        title,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Input repair flow</p>
            <h1 class="ely-public-section-title">Field errors stay close to the repair action</h1>
            <p class="ely-public-copy">
              Inputs are approved when label, helper copy, invalid message, and
              recovery action create one readable path. A pretty field without
              repair copy is still not ready.
            </p>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicAlert tone="warning" title="Two fields need attention">
                The title is missing and the reviewer email is incomplete. Fix the affected fields before publishing.
              </ElyPublicAlert>
              <ElyPublicInput
                v-model="title"
                label="Release title"
                description="Shown in review history and notification copy."
                placeholder="Name this public preview"
                invalid-message="Add a title so reviewers can find this snapshot later."
              />
              <ElyPublicInput
                v-model="email"
                type="email"
                label="Reviewer email"
                description="Use a valid address for handoff confirmation."
                invalid-message="Enter a complete email address before sending the review."
              />
              <ElyPublicInput
                v-model="note"
                label="Visible repair note"
                description="Multiline repair copy should remain shorter than the action group."
                multiline
              />
              <div class="ely-public-actions">
                <ElyPublicButton>Send review</ElyPublicButton>
                <ElyPublicButton tone="ghost">Save draft</ElyPublicButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
