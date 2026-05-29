import {
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicLink,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Checkbox

const meta = {
  title: "Public Luxe/Components/Checkbox",
  component: ElyPublicCheckbox,
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
    modelValue: {
      control: "boolean",
      description: "Controlled checked state.",
    },
    label: { control: "text", description: "Visible checkbox label." },
    description: {
      control: "text",
      description: "Supporting copy under the label.",
    },
    invalidMessage: {
      control: "text",
      description: "Actionable repair copy linked through aria-describedby.",
    },
    id: {
      control: "text",
      description: "Optional id for the checkbox button.",
    },
    disabled: {
      control: "boolean",
      description: "Disables selection changes.",
    },
  },
  args: {
    description: "Use compact density for denser review surfaces.",
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: "Enable compact control density",
    modelValue: false,
  },
} satisfies Meta<typeof ElyPublicCheckbox>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicCheckbox },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Checkbox playground</p>
            <h1 class="ely-public-section-title">Tune an explicit inclusion choice</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicCheckbox v-bind="args" />
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

export const SelectionScenarios: Story = {
  render: () => ({
    components: { ElyPublicCheckbox },
    setup() {
      const compact = ref(false)
      const motion = ref(true)
      const recovery = ref(true)

      return {
        compact,
        motion,
        recovery,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Checkbox selection scenarios</p>
            <h1 class="ely-public-section-title">Checkboxes include independent review scopes</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicCheckbox
                v-model="compact"
                label="Include compact density"
                description="Review compact mode as an independent scope."
              />
              <ElyPublicCheckbox
                v-model="motion"
                label="Include motion review"
                description="Check reveal and shimmer behavior before approval."
              />
              <ElyPublicCheckbox
                v-model="recovery"
                label="Include recovery paths"
                description="Verify restore, archive, and support links."
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
    components: { ElyPublicCheckbox },
    setup() {
      const compactControls = ref(false)
      const includeMotion = ref(true)

      return {
        compactControls,
        doc,
        includeMotion,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Checkbox states</p>
            <h1 class="ely-public-section-title">Checked, unchecked, disabled, described</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicCheckbox
                v-model="compactControls"
                label="Enable compact control density"
                description="Use compact density for denser review surfaces."
              />
              <ElyPublicCheckbox
                v-model="includeMotion"
                label="Include motion review"
                description="Let the comparison include reveal and shimmer decisions."
              />
              <ElyPublicCheckbox
                :model-value="true"
                disabled
                label="Locked editorial sync"
                description="An already-governed setting can appear read-only."
              />
              <ElyPublicCheckbox
                :model-value="false"
                label="I reviewed the dark mode snapshot"
                description="Required before the theme evidence can move forward."
                invalid-message="Review the dark mode snapshot before continuing."
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

export const ConsentScenarios: Story = {
  render: () => ({
    components: { ElyPublicCheckbox },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review consent</p>
              <h2 class="ely-public-section-title">Explicit confirmation</h2>
              <ElyPublicCheckbox
                :model-value="false"
                label="I reviewed both light and dark snapshots"
                description="Consent-style choices should be checkboxes, not switches."
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Locked evidence</p>
              <h2 class="ely-public-section-title">Read-only inclusion</h2>
              <ElyPublicCheckbox
                :model-value="true"
                disabled
                label="Theme token contract included"
                description="Locked checked choices remain visible and explain ownership."
              />
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ConsentChecklistScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicCheckbox, ElyPublicLink },
    setup() {
      const reviewedModes = ref(false)
      const acceptedPolicy = ref(false)
      const includeRecovery = ref(true)

      return {
        acceptedPolicy,
        includeRecovery,
        reviewedModes,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Checkbox boundary</p>
            <h1 class="ely-public-section-title">Checkboxes collect explicit inclusion and consent</h1>
            <p class="ely-public-copy">
              Each checkbox should represent an independent condition the user can inspect, accept, or leave out.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Approval checklist</p>
              <h2 class="ely-public-section-title">Independent evidence gates</h2>
              <div class="ely-public-stack">
                <ElyPublicCheckbox
                  v-model="reviewedModes"
                  label="I reviewed light and dark snapshots"
                  description="The reviewer explicitly confirms both mode proofs."
                />
                <ElyPublicCheckbox
                  v-model="includeRecovery"
                  label="Include recovery path in handoff"
                  description="Recovery evidence can be included without changing the theme choice."
                />
                <ElyPublicCheckbox
                  v-model="acceptedPolicy"
                  label="I accept the public release policy"
                  description="Consent remains explicit and inspectable before the final action."
                />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Reference before consent</p>
              <h2 class="ely-public-section-title">The policy remains a link</h2>
              <p class="ely-public-muted-copy">
                Consent copy should point to supporting text without hiding the choice:
                <ElyPublicLink href="https://example.com/release-policy" tone="muted">
                  read release policy
                </ElyPublicLink>.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Commitment action</p>
              <h2 class="ely-public-section-title">The final commit remains a button</h2>
              <p class="ely-public-muted-copy">
                Checked conditions prepare the surface; they do not publish by themselves.
              </p>
              <div class="ely-public-inline ely-story-offset-md">
                <ElyPublicButton size="sm" :disabled="!(reviewedModes && acceptedPolicy)">
                  Continue review
                </ElyPublicButton>
                <span class="ely-public-muted-copy">
                  {{ reviewedModes && acceptedPolicy ? 'Ready to continue' : 'Two required checks remain' }}
                </span>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
