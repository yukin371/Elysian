import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicCheckbox,
  ElyPublicFieldset,
  ElyPublicInput,
  ElyPublicRadioGroup,
  ElyPublicTextarea,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicRadioGroupItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Fieldset

const toneItems: ElyPublicRadioGroupItem[] = [
  {
    key: "soft",
    label: "Soft",
    description: "Gentle visuals with quieter ornament.",
    value: "soft",
  },
  {
    key: "luminous",
    label: "Luminous",
    description: "More ceremonial and character-led.",
    value: "luminous",
  },
  {
    key: "minimal",
    label: "Minimal",
    description: "Cleaner rhythm for information-first users.",
    value: "minimal",
  },
]

const meta = {
  title: "Public Luxe/Components/Fieldset",
  component: ElyPublicFieldset,
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
      description: "Fallback accessible label when no legend is provided.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Group spacing rhythm.",
    },
    description: {
      control: "text",
      description: "Helper copy linked to the fieldset.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the native fieldset and contained controls.",
    },
    invalidMessage: {
      control: "text",
      description: "Group-level repair copy.",
    },
    legend: {
      control: "text",
      description: "Visible fieldset legend.",
    },
    tone: {
      control: "select",
      options: ["accent", "danger", "neutral", "primary"],
      description: "Semantic emphasis for the group.",
    },
  },
  args: {
    density: "comfortable",
    description:
      "Group related controls under one visible question instead of nesting cards.",
    disabled: false,
    invalidMessage: undefined,
    legend: "Theme preference",
    tone: "neutral",
  },
} satisfies Meta<typeof ElyPublicFieldset>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicCheckbox, ElyPublicFieldset },
    setup() {
      const selected = ref(true)

      return { args, selected }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Fieldset playground</p>
            <h1 class="ely-public-section-title">Group related form controls without adding another card</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset v-bind="args">
                <ElyPublicCheckbox
                  v-model="selected"
                  label="Include theme preview in handoff"
                  description="A grouped checkbox keeps its shared context visible."
                />
              </ElyPublicFieldset>
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
    components: { ElyPublicCheckbox, ElyPublicFieldset, ElyPublicInput },
    setup() {
      const includePreview = ref(true)
      const includeRecovery = ref(false)
      const reviewerName = ref("")

      return {
        doc,
        includePreview,
        includeRecovery,
        reviewerName,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Fieldset states</p>
            <h1 class="ely-public-section-title">Neutral, emphasized, compact, invalid, and disabled groups</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset
                legend="Review evidence"
                description="Neutral grouping keeps related controls in one flat lane."
              >
                <ElyPublicCheckbox
                  v-model="includePreview"
                  label="Include theme preview"
                  description="The reviewer can confirm the visual proof is attached."
                />
                <ElyPublicCheckbox
                  v-model="includeRecovery"
                  label="Include recovery path"
                  description="Recovery evidence remains independent from visual approval."
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Reviewer signature"
                tone="primary"
                density="compact"
                description="Compact density works when the grouped question is simple."
              >
                <ElyPublicInput
                  v-model="reviewerName"
                  label="Reviewer name"
                  placeholder="Name used in handoff"
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Release consent"
                tone="danger"
                invalid-message="Confirm light and dark review before continuing."
              >
                <ElyPublicCheckbox
                  label="I reviewed both theme modes"
                  description="Group-level invalid copy explains the missing requirement."
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Locked policy"
                disabled
                description="Native disabled fieldset blocks contained controls."
              >
                <ElyPublicCheckbox
                  :model-value="true"
                  label="Policy inherited from organization"
                  description="Locked groups still explain why the controls cannot change."
                />
              </ElyPublicFieldset>
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

export const PreferenceGroupScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicFieldset, ElyPublicRadioGroup },
    setup() {
      const tone = ref("luminous")

      return { tone, toneItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Preference group scenarios</p>
            <h1 class="ely-public-section-title">One group can frame a theme decision without becoming a card stack</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset
                legend="Theme personality"
                tone="accent"
                description="The fieldset owns the shared question; Radio Group owns the single-choice interaction."
              >
                <ElyPublicRadioGroup
                  aria-label="Theme personality"
                  v-model="tone"
                  :items="toneItems"
                />
              </ElyPublicFieldset>
              <ElyPublicAlert
                tone="info"
                title="Keep ownership separate"
                description="Fieldset groups controls. It does not define options, save state, or become a theme editor."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ConsentGroupScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicCheckbox, ElyPublicFieldset },
    setup() {
      const reviewedMode = ref(false)
      const acceptedCopy = ref(false)
      const attachedEvidence = ref(true)

      return {
        acceptedCopy,
        attachedEvidence,
        reviewedMode,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Consent group scenarios</p>
            <h1 class="ely-public-section-title">Checklist groups should stay explicit and flat</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset
                legend="Release checklist"
                density="compact"
                :invalid-message="reviewedMode && acceptedCopy ? undefined : 'Two explicit checks are required before release.'"
              >
                <ElyPublicCheckbox
                  v-model="reviewedMode"
                  label="I reviewed light and dark snapshots"
                  description="Mode review is a separate approval condition."
                />
                <ElyPublicCheckbox
                  v-model="acceptedCopy"
                  label="I accept the public copy standard"
                  description="Consent copy stays visible before the action."
                />
                <ElyPublicCheckbox
                  v-model="attachedEvidence"
                  label="Attach evidence packet"
                  description="Optional evidence can be included without changing consent."
                />
              </ElyPublicFieldset>
              <ElyPublicButton :disabled="!(reviewedMode && acceptedCopy)">
                Continue release
              </ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const TonesMatrix: Story = {
  render: () => ({
    components: { ElyPublicCheckbox, ElyPublicFieldset },
    setup() {
      const checked = ref(true)

      return { checked }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Fieldset tones</p>
            <h1 class="ely-public-section-title">Neutral, primary, accent, and danger change semantic emphasis</h1>
            <p class="ely-public-copy">
              Each tone adjusts the fieldset border and legend color. Use neutral for standard groups, primary for key decisions, accent for preference groups, and danger for required consent or warning groups.
            </p>
            <div class="ely-public-card-grid ely-story-offset-md">
              <ElyPublicFieldset
                legend="Neutral (default)"
                tone="neutral"
                description="Standard grouping without extra emphasis."
              >
                <ElyPublicCheckbox
                  v-model="checked"
                  label="Standard option"
                  description="Neutral tone keeps focus on content."
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Primary"
                tone="primary"
                description="Emphasizes an important grouped decision."
              >
                <ElyPublicCheckbox
                  v-model="checked"
                  label="Key decision"
                  description="Primary draws attention to the group."
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Accent"
                tone="accent"
                description="Highlights preference or personalisation groups."
              >
                <ElyPublicCheckbox
                  v-model="checked"
                  label="Preference option"
                  description="Accent signals personalisation context."
                />
              </ElyPublicFieldset>

              <ElyPublicFieldset
                legend="Danger"
                tone="danger"
                description="Warns about required or irreversible consent."
                invalid-message="This consent group requires explicit confirmation."
              >
                <ElyPublicCheckbox
                  label="Required consent"
                  description="Danger tone signals the group needs attention."
                />
              </ElyPublicFieldset>
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
      ElyPublicFieldset,
      ElyPublicTextarea,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject fieldsets that become disguised layout cards</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFieldset
                legend="Revision reason"
                description="A fieldset can group a writing task with its repair copy."
                invalid-message="Name the visible decision this group answers."
              >
                <ElyPublicTextarea
                  label="Why this group exists"
                  description="The textarea owns writing; the fieldset owns the shared context."
                  :max-length="220"
                  show-count
                />
              </ElyPublicFieldset>
              <ElyPublicAlert
                tone="warning"
                title="Do not use Fieldset as surface decoration"
                description="Use it for related controls only. Do not nest fieldsets to create visual hierarchy, dashboard panels, tabs, or cards inside cards."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
