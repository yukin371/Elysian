import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicEmptyState,
  ElyPublicFileInput,
  ElyPublicProgress,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.FileInput

const meta = {
  title: "Public Luxe/Components/File Input",
  component: ElyPublicFileInput,
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
    accept: {
      control: "text",
      description: "Native accept filter for the platform file picker.",
    },
    clearLabel: {
      control: "text",
      description: "Visible copy for clearing selected files.",
    },
    description: {
      control: "text",
      description: "Helper copy linked to the file input.",
    },
    disabled: { control: "boolean", description: "Disables file selection." },
    invalidMessage: {
      control: "text",
      description: "Visible invalid recovery copy.",
    },
    label: { control: "text", description: "Visible field label." },
    multiple: {
      control: "boolean",
      description: "Allows selecting multiple files.",
    },
    noFileLabel: {
      control: "text",
      description: "Summary copy before selection.",
    },
  },
  args: {
    accept: "image/*,.pdf",
    clearLabel: "Clear files",
    description:
      "Attach a profile image or proof document. Upload transport stays page-owned.",
    disabled: false,
    invalidMessage: undefined,
    label: "Creator verification file",
    multiple: false,
    noFileLabel: "No verification file selected",
  },
} satisfies Meta<typeof ElyPublicFileInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicFileInput },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">File input playground</p>
            <h1 class="ely-public-section-title">Choose local evidence without turning the field into an upload engine</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFileInput v-bind="args" />
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
    components: { ElyPublicFileInput },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">File input states</p>
            <h1 class="ely-public-section-title">Empty, single, multiple, invalid, and disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFileInput
                label="Optional avatar"
                description="A native picker keeps platform file selection behavior available."
                accept="image/*"
                no-file-label="No avatar selected"
              />
              <ElyPublicFileInput
                label="Gallery evidence"
                description="Multiple files summarize count and list filenames after selection."
                accept="image/*,.pdf"
                multiple
              />
              <ElyPublicFileInput
                label="Proof document"
                description="Visible copy explains why this file is rejected."
                invalid-message="Attach a PDF or image smaller than the page policy allows."
                accept="image/*,.pdf"
              />
              <ElyPublicFileInput
                label="Locked attachment"
                description="Disabled state explains unavailable changes in the surrounding flow."
                disabled
                no-file-label="Attachment changes are locked"
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

export const VerificationScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicFileInput,
      ElyPublicProgress,
      ElyPublicText,
    },
    setup() {
      const selectedNames = ref<string[]>([])
      const readiness = computed(() =>
        selectedNames.value.length > 0 ? 72 : 48,
      )
      const onChange = (files: File[]) => {
        selectedNames.value = files.map((file) => file.name)
      }

      return {
        onChange,
        readiness,
        selectedNames,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Verification scenarios</p>
                <h1 class="ely-public-section-title">Collect creator proof while keeping upload policy visible</h1>
              </div>
              <ElyPublicBadge :tone="selectedNames.length > 0 ? 'primary' : 'accent'">
                {{ selectedNames.length > 0 ? 'Evidence added' : 'Evidence needed' }}
              </ElyPublicBadge>
            </div>
            <ElyPublicText class="ely-story-offset-sm">
              FileInput names the attachment task and selection. The page still owns privacy, review policy, upload transport, and final validation.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFileInput
                label="Verification evidence"
                description="Use an image or PDF that proves creator ownership. Personal data should be masked before submission."
                accept="image/*,.pdf"
                @change="onChange"
              />
              <ElyPublicProgress label="Review packet readiness" :value="readiness" tone="primary" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MultiAttachmentScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicFileInput, ElyPublicText },
    setup() {
      const selectedCount = ref(0)
      const attachmentDescription = computed(() =>
        selectedCount.value > 0
          ? `${selectedCount.value} local file(s) selected. Upload is still owned by the page flow.`
          : "No files selected yet.",
      )
      const onChange = (files: File[]) => {
        selectedCount.value = files.length
      }

      return {
        attachmentDescription,
        onChange,
        selectedCount,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Multi attachment scenarios</p>
            <h1 class="ely-public-section-title">Let multiple files stay readable without becoming a queue</h1>
            <ElyPublicText class="ely-story-offset-sm">
              Multiple files should still read as one form field. Sorting, upload progress, retry, and preview editing require a page-owned uploader.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFileInput
                label="Submission attachments"
                description="Attach up to the page policy limit. The primitive only displays selected filenames."
                accept="image/*,.pdf,.txt"
                multiple
                @change="onChange"
              />
              <ElyPublicAlert
                tone="info"
                title="Attachment count"
                :description="attachmentDescription"
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
    components: { ElyPublicAlert, ElyPublicEmptyState, ElyPublicFileInput },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject file inputs that are secretly upload products</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicFileInput
                label="Support evidence"
                description="A native picker is enough for simple evidence collection."
                invalid-message="Choose an image or PDF that matches the visible policy."
                accept="image/*,.pdf"
              />
              <ElyPublicAlert
                tone="warning"
                title="Do not hide product behavior in the primitive"
                description="Use a dedicated uploader for drag sorting, resumable upload, progress, preview cropping, virus scan, cloud storage, or document parsing."
              />
              <ElyPublicEmptyState
                title="No upload queue here"
              >
                FileInput stops at local selection and filename review. Queue behavior belongs to a page-owned flow.
              </ElyPublicEmptyState>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
