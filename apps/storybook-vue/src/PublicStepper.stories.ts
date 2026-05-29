import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicStepper,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Stepper

const publishSteps = [
  {
    key: "draft",
    label: "Draft",
    description: "Shape the public story.",
  },
  {
    key: "theme",
    label: "Theme proof",
    description: "Check light and dark fit.",
  },
  {
    key: "review",
    label: "Review",
    description: "Repair risky states.",
  },
  {
    key: "release",
    label: "Release",
    description: "Publish after approval.",
  },
]

const meta = {
  title: "Public Luxe/Components/Stepper",
  component: ElyPublicStepper,
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
      description: "Accessible label for the ordered step navigation.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible lightweight copy when no ordered steps exist.",
    },
    interactive: {
      control: "boolean",
      description: "Allows users to revisit safe steps.",
    },
    modelValue: {
      control: "text",
      description: "Current step key.",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Step rhythm for wide or narrow review surfaces.",
    },
  },
  args: {
    ariaLabel: "Publish flow",
    emptyMessage: "No publish steps have been defined yet.",
    interactive: false,
    items: publishSteps,
    modelValue: "theme",
    orientation: "horizontal",
  },
} satisfies Meta<typeof ElyPublicStepper>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicStepper },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stepper playground</p>
            <h1 class="ely-public-section-title">Tune ordered journeys without turning them into tabs</h1>
            <div class="ely-story-offset-md">
              <ElyPublicStepper v-bind="args" />
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
    components: { ElyPublicStepper },
    setup() {
      const repairSteps = [
        { key: "start", label: "Start", status: "complete" },
        { key: "theme", label: "Theme", status: "current" },
        { key: "a11y", label: "Accessibility", status: "error" },
        { key: "publish", label: "Publish", status: "disabled" },
      ]

      return { doc, publishSteps, repairSteps }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stepper states</p>
            <h1 class="ely-public-section-title">Current, complete, upcoming, error, and disabled states</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicStepper :items="publishSteps" model-value="review" aria-label="Derived publish steps" />
              <ElyPublicStepper :items="repairSteps" aria-label="Repair steps" orientation="vertical" />
              <ElyPublicStepper
                :items="[]"
                aria-label="Empty stepper"
                empty-message="No ordered journey exists yet. Keep the lane flat until the workflow is real."
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

export const FlowStates: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicStepper },
    setup() {
      const steps = [
        {
          key: "profile",
          label: "Profile",
          description: "Public identity is ready.",
          status: "complete",
        },
        {
          key: "palette",
          label: "Palette",
          description: "Elysia default needs dark proof.",
          status: "current",
        },
        {
          key: "copy",
          label: "Voice",
          description: "Review visible user wording.",
          status: "upcoming",
        },
        {
          key: "publish",
          label: "Publish",
          description: "Locked until review passes.",
          status: "disabled",
        },
      ]

      return { steps }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Stepper flow states</p>
            <h1 class="ely-public-section-title">Ordered journeys should name what is done and what is blocked</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicStepper :items="steps" aria-label="Theme onboarding flow" />
              <ElyPublicAlert tone="warning" title="Dark proof is still missing">
                The stepper explains why publish is locked; the alert names the repair before the next action appears.
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const InteractiveScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicStepper, ElyPublicText },
    setup() {
      const currentStep = ref("theme")
      const currentCopy = computed(
        () =>
          publishSteps.find((step) => step.key === currentStep.value)
            ?.description ?? "Choose a step to review.",
      )

      return { currentCopy, currentStep, publishSteps }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stepper interaction</p>
            <h1 class="ely-public-section-title">Interactive steps revisit safe work; the next action stays outside</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicStepper
                v-model="currentStep"
                interactive
                :items="publishSteps"
                aria-label="Interactive publish flow"
              />
              <ElyPublicText tone="muted">{{ currentCopy }}</ElyPublicText>
              <div class="ely-public-actions">
                <ElyPublicButton>Continue current step</ElyPublicButton>
                <ElyPublicButton tone="ghost">Save for later</ElyPublicButton>
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
    components: { ElyPublicAlert, ElyPublicButton, ElyPublicStepper },
    setup() {
      const blockedSteps = [
        {
          key: "draft",
          label: "Draft",
          description: "Complete",
          status: "complete",
        },
        {
          key: "review",
          label: "Review",
          description: "Fix two blockers",
          status: "error",
        },
        {
          key: "publish",
          label: "Publish",
          description: "Not available yet",
          status: "disabled",
        },
      ]

      return { blockedSteps, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Stepper boundary</p>
            <h1 class="ely-public-section-title">Stepper is a journey marker, not a route menu or progress meter</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicStepper
                interactive
                :items="blockedSteps"
                aria-label="Blocked review flow"
                orientation="vertical"
              />
              <ElyPublicAlert tone="danger" title="Review cannot be skipped">
                Keep the repair step visible and disabled future steps honest; do not style this as a clickable release menu.
              </ElyPublicAlert>
              <div class="ely-public-actions">
                <ElyPublicButton tone="secondary">Open repair list</ElyPublicButton>
                <ElyPublicButton disabled>Publish locked</ElyPublicButton>
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
