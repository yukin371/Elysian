import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicFileInput,
  ElyPublicProgress,
  ElyPublicText,
  ElyPublicTextarea,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Textarea

const meta = {
  title: "Public Luxe/Components/Textarea",
  component: ElyPublicTextarea,
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
    description: {
      control: "text",
      description: "Helper copy linked to the textarea.",
    },
    disabled: { control: "boolean", description: "Disables writing." },
    invalidMessage: {
      control: "text",
      description: "Visible invalid recovery copy.",
    },
    label: { control: "text", description: "Visible field label." },
    maxLength: {
      control: "number",
      description: "Native maximum character count.",
    },
    modelValue: { control: "text", description: "Controlled text content." },
    placeholder: { control: "text", description: "Placeholder hint." },
    readOnly: { control: "boolean", description: "Prevents editing." },
    resize: {
      control: "select",
      options: ["block", "both", "inline", "none"],
      description: "Native resize direction.",
    },
    rows: { control: "number", description: "Native row count." },
    showCount: { control: "boolean", description: "Shows character count." },
  },
  args: {
    description:
      "Write a clear, reviewable note. Keep policy and privacy copy visible.",
    disabled: false,
    invalidMessage: undefined,
    label: "Creator note",
    maxLength: 240,
    modelValue:
      "I want this collection to feel gentle, ceremonial, and easy to scan before the launch.",
    placeholder: "Write the note reviewers will see",
    readOnly: false,
    resize: "block",
    rows: 5,
    showCount: true,
  },
} satisfies Meta<typeof ElyPublicTextarea>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicTextarea },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Textarea playground</p>
            <h1 class="ely-public-section-title">Write long-form copy with count, guidance, and repair text</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTextarea v-bind="args" />
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
    components: { ElyPublicTextarea },
    setup() {
      const draft = ref("")
      const note = ref("Please keep the launch copy concise, warm, and clear.")
      const counted = ref(
        "This description will appear on the public collection page.",
      )

      return {
        counted,
        doc,
        draft,
        note,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Textarea states</p>
            <h1 class="ely-public-section-title">Empty, composed, counted, invalid, read-only, and disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTextarea
                v-model="draft"
                label="Optional launch note"
                description="Empty long text still needs a visible writing task."
                placeholder="Write a short note for reviewers"
              />
              <ElyPublicTextarea
                v-model="note"
                label="Reviewer note"
                description="Composed text keeps native editing and selection behavior."
              />
              <ElyPublicTextarea
                v-model="counted"
                label="Public description"
                description="Counted writing makes length visible before submission."
                :max-length="180"
                show-count
              />
              <ElyPublicTextarea
                model-value="Too vague"
                label="Moderation reason"
                description="Invalid copy explains how to repair the text."
                invalid-message="Add a specific reason that helps the creator revise the submission."
              />
              <ElyPublicTextarea
                model-value="Submitted copy remains visible during final review."
                read-only
                label="Submitted note"
                description="Read-only preserves copy without inviting edits."
              />
              <ElyPublicTextarea
                model-value="Locked by current review stage."
                disabled
                label="Locked note"
                description="Disabled state explains unavailable editing nearby."
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

export const CreatorNoteScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicProgress,
      ElyPublicText,
      ElyPublicTextarea,
    },
    setup() {
      const note = ref(
        "This launch introduces the archive with a soft invitation, clear eligibility, and one primary action.",
      )
      const readiness = computed(() =>
        Math.min(
          100,
          Math.max(35, Math.round((note.value.length / 180) * 100)),
        ),
      )

      return {
        note,
        readiness,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Creator note scenarios</p>
                <h1 class="ely-public-section-title">Let long-form copy support the launch without becoming the page</h1>
              </div>
              <ElyPublicBadge :tone="readiness >= 70 ? 'primary' : 'accent'">
                {{ readiness >= 70 ? 'Reviewable' : 'Needs detail' }}
              </ElyPublicBadge>
            </div>
            <ElyPublicText class="ely-story-offset-sm">
              Textarea should sit beside evidence and submit actions. It should not become a rich editor, comment thread, or AI writing surface.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTextarea
                v-model="note"
                label="Launch note"
                description="Write the note reviewers will use to approve tone and intent."
                :max-length="180"
                show-count
              />
              <ElyPublicProgress label="Description readiness" :value="readiness" tone="primary" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SupportMessageScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicFileInput,
      ElyPublicTextarea,
    },
    setup() {
      const message = ref(
        "I need help recovering access to my creator collection after the email change.",
      )

      return { message }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Support message scenarios</p>
            <h1 class="ely-public-section-title">Compose a support request in one flat repair lane</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTextarea
                v-model="message"
                label="Support message"
                description="Describe what changed and what outcome you need. Do not include passwords or payment secrets."
                :max-length="320"
                show-count
              />
              <ElyPublicFileInput
                label="Optional evidence"
                description="Attach a screenshot only if it helps support verify the issue."
                accept="image/*,.pdf"
              />
              <ElyPublicAlert
                tone="info"
                title="Privacy copy stays visible"
                description="The component helps collect text. Support routing, triage, and privacy handling belong to the page flow."
              />
              <ElyPublicButton>Send support request</ElyPublicButton>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicTextarea },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject textareas that are secretly publishing tools</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTextarea
                label="Revision reason"
                description="A plain writing surface can collect the reason, but workflow policy stays outside."
                invalid-message="Name the specific issue and the next repair step."
                :max-length="220"
                show-count
              />
              <ElyPublicAlert
                tone="warning"
                title="Do not hide rich editing inside Textarea"
                description="Use a dedicated editor for markdown preview, mentions, moderation rules, AI drafting, comments, versioning, or publishing automation."
              />
              <ElyPublicAlert
                tone="info"
                title="Choose the simpler primitive first"
                description="Use Input for short values, Text for read-only copy, FileInput for evidence, and a page-owned flow for threaded discussion."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
