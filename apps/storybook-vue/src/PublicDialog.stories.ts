import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicDialog,
  ElyPublicProgress,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Dialog

const meta = {
  title: "Public Luxe/Components/Dialog",
  component: ElyPublicDialog,
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
    open: { control: "boolean", description: "Controls dialog visibility." },
    title: { control: "text", description: "Dialog heading." },
    description: { control: "text", description: "Supporting copy." },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Panel width preset.",
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "Allows backdrop click dismissal.",
    },
    closeOnEscape: {
      control: "boolean",
      description: "Allows Escape key dismissal.",
    },
  },
  args: {
    closeOnBackdrop: true,
    closeOnEscape: true,
    description:
      "Dialogs preserve atmosphere while keeping focus and exit paths obvious.",
    open: false,
    size: "md",
    title: "Apply selected family",
  },
} satisfies Meta<typeof ElyPublicDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicButton, ElyPublicDialog },
    setup() {
      const open = ref(Boolean(args.open))

      return {
        args,
        closeDialog: () => {
          open.value = false
        },
        open,
        openDialog: () => {
          open.value = true
        },
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Dialog playground</p>
            <h1 class="ely-public-section-title">Tune overlay semantics through controls</h1>
            <div class="ely-public-actions">
              <ElyPublicButton @click="openDialog">Open configured dialog</ElyPublicButton>
            </div>
          </section>

          <ElyPublicDialog v-bind="args" :open="open" @close="closeDialog">
            <p class="ely-public-muted-copy">
              The playground keeps trigger, focus, and dismissal behavior visible while controls adjust the panel contract.
            </p>

            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Cancel</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Confirm</ElyPublicButton>
            </template>
          </ElyPublicDialog>
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

export const Sizes: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicDialog },
    setup() {
      const openSize = ref<"lg" | "md" | "sm" | null>(null)

      return {
        closeDialog: () => {
          openSize.value = null
        },
        openSize,
        showLarge: () => {
          openSize.value = "lg"
        },
        showMedium: () => {
          openSize.value = "md"
        },
        showSmall: () => {
          openSize.value = "sm"
        },
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Dialog sizes</p>
            <h1 class="ely-public-section-title">Size follows task complexity</h1>
            <p class="ely-public-copy">
              Small is for confirmation, medium for decisions, and large for evidence-heavy review.
            </p>
            <div class="ely-public-actions">
              <ElyPublicButton size="sm" @click="showSmall">Open small</ElyPublicButton>
              <ElyPublicButton tone="secondary" @click="showMedium">Open medium</ElyPublicButton>
              <ElyPublicButton tone="ghost" @click="showLarge">Open large</ElyPublicButton>
            </div>
          </section>

          <ElyPublicDialog
            :open="openSize === 'sm'"
            size="sm"
            title="Restore previous snapshot"
            description="Small dialogs should ask one clear question."
            @close="closeDialog"
          >
            <p class="ely-public-muted-copy">This will return the preview to the last approved family.</p>
            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Cancel</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Restore</ElyPublicButton>
            </template>
          </ElyPublicDialog>

          <ElyPublicDialog
            :open="openSize === 'md'"
            size="md"
            title="Approve selected family"
            description="Medium dialogs can carry one decision and a short reason."
            @close="closeDialog"
          >
            <p class="ely-public-muted-copy">Confirm that both light and dark mode snapshots are ready for review.</p>
            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Keep editing</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Approve</ElyPublicButton>
            </template>
          </ElyPublicDialog>

          <ElyPublicDialog
            :open="openSize === 'lg'"
            size="lg"
            title="Review comparison evidence"
            description="Large dialogs are for evidence, not extra decoration."
            @close="closeDialog"
          >
            <div class="ely-story-doc-matrix">
              <div class="ely-story-doc-state">
                <strong>Light mode</strong>
                <span>Readable surface and action hierarchy verified.</span>
              </div>
              <div class="ely-story-doc-state">
                <strong>Dark mode</strong>
                <span>Container text and status tones remain paired.</span>
              </div>
            </div>
            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Close</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Pin evidence</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicDialog },
    setup() {
      const open = ref(false)

      return {
        closeDialog: () => {
          open.value = false
        },
        doc,
        open,
        openDialog: () => {
          open.value = true
        },
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Dialog states</p>
            <h1 class="ely-public-section-title">Focused confirmation overlay</h1>
            <p class="ely-public-copy">Open the panel, press Escape, and verify focus returns to the trigger.</p>
            <div class="ely-public-actions">
              <ElyPublicButton @click="openDialog">Open dialog</ElyPublicButton>
            </div>
          </section>

          <section class="ely-story-doc-panel">
            <h3>Accessibility notes</h3>
            <ul class="ely-story-doc-list">
              <li v-for="item in doc.accessibility" :key="item">{{ item }}</li>
            </ul>
          </section>

          <ElyPublicDialog
            :open="open"
            title="Apply selected family"
            description="Dialogs should preserve the preset atmosphere while keeping focus and exit paths obvious."
            @close="closeDialog"
          >
            <p class="ely-public-muted-copy">
              Escape closes the panel, and focus returns to the trigger after dismissal.
            </p>

            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Cancel</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Apply</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}

export const DismissalRules: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicDialog },
    setup() {
      const guardedOpen = ref(false)
      const flexibleOpen = ref(false)

      return {
        closeFlexible: () => {
          flexibleOpen.value = false
        },
        closeGuarded: () => {
          guardedOpen.value = false
        },
        flexibleOpen,
        guardedOpen,
        openFlexible: () => {
          flexibleOpen.value = true
        },
        openGuarded: () => {
          guardedOpen.value = true
        },
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Dialog dismissal rules</p>
            <h1 class="ely-public-section-title">Exit behavior should match risk</h1>
            <div class="ely-public-actions">
              <ElyPublicButton @click="openFlexible">Open flexible dialog</ElyPublicButton>
              <ElyPublicButton tone="secondary" @click="openGuarded">Open guarded dialog</ElyPublicButton>
            </div>
          </section>

          <ElyPublicDialog
            :open="flexibleOpen"
            title="Preview details"
            description="Low-risk overlays may close from backdrop or Escape."
            @close="closeFlexible"
          >
            <p class="ely-public-muted-copy">Use flexible dismissal for information that can be safely reopened.</p>
            <template #footer>
              <ElyPublicButton @click="closeFlexible">Done</ElyPublicButton>
            </template>
          </ElyPublicDialog>

          <ElyPublicDialog
            :open="guardedOpen"
            :close-on-backdrop="false"
            :close-on-escape="false"
            title="Unsubmitted changes"
            description="Higher-risk overlays require an explicit action."
            @close="closeGuarded"
          >
            <p class="ely-public-muted-copy">
              Backdrop and Escape are disabled here so the user chooses a visible recovery path.
            </p>
            <template #footer>
              <ElyPublicButton tone="ghost" @click="closeGuarded">Discard changes</ElyPublicButton>
              <ElyPublicButton @click="closeGuarded">Save changes</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}

export const ConfirmationFlowScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicButton,
      ElyPublicDialog,
      ElyPublicProgress,
    },
    setup() {
      const open = ref(false)

      return {
        closeDialog: () => {
          open.value = false
        },
        open,
        openDialog: () => {
          open.value = true
        },
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Dialog confirmation flow</p>
            <h1 class="ely-public-section-title">Confirmation overlays need evidence, not extra spectacle</h1>
            <p class="ely-public-copy">
              Dialogs should interrupt only when the next step needs focused
              confirmation. The panel carries concise evidence, a visible safe
              exit, and one primary commitment.
            </p>
            <div class="ely-public-actions">
              <ElyPublicButton @click="openDialog">Review confirmation</ElyPublicButton>
              <ElyPublicButton tone="ghost">Keep editing</ElyPublicButton>
            </div>
          </section>

          <ElyPublicDialog
            :open="open"
            size="md"
            title="Publish public preview"
            description="Confirm the preview only after theme, component, and mobile density evidence are ready."
            @close="closeDialog"
          >
            <div class="ely-public-stack">
              <ElyPublicProgress label="Release evidence" tone="success" :value="92" />
              <ElyPublicAlert tone="success" title="Required evidence is available">
                Theme pairing, component operability, and mobile density review have all been checked.
              </ElyPublicAlert>
              <p class="ely-public-muted-copy">
                Publishing will make this preview visible to reviewers. You can still return to editing before confirming.
              </p>
            </div>

            <template v-slot:footer>
              <ElyPublicButton tone="ghost" @click="closeDialog">Keep editing</ElyPublicButton>
              <ElyPublicButton @click="closeDialog">Publish preview</ElyPublicButton>
            </template>
          </ElyPublicDialog>
        </div>
      </section>
    `,
  }),
}
