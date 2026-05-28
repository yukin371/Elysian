import {
  ElyPublicAlert,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicMenu,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { ElyPublicMenuItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const doc = publicComponentDocs.Menu

const menuItems = [
  {
    key: "duplicate",
    label: "Duplicate atelier",
    description: "Create a copy with the same theme family.",
    meta: "Local",
    tone: "primary",
  },
  {
    key: "share",
    label: "Share preview",
    description: "Open a lightweight public handoff path.",
    href: "#share-preview",
    meta: "Link",
  },
  {
    key: "archive",
    label: "Archive draft",
    description: "Keep the record but remove it from the live list.",
    meta: "Safe",
  },
  {
    key: "delete",
    label: "Delete permanently",
    description: "Only shown after the surface explains the risk.",
    meta: "Risk",
    tone: "danger",
  },
] satisfies ElyPublicMenuItem[]

const meta = {
  title: "Public Luxe/Components/Menu",
  component: ElyPublicMenu,
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
    align: {
      control: "select",
      options: ["start", "end"],
      description: "Horizontal alignment of the floating menu panel.",
    },
    ariaLabel: {
      control: "text",
      description: "Accessible label for the menu panel.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the trigger and prevents opening.",
    },
    items: {
      control: "object",
      description: "Single-level local action items rendered in order.",
    },
    open: {
      control: "boolean",
      description: "Optional controlled open state.",
    },
    placement: {
      control: "select",
      options: ["bottom", "top"],
      description: "Vertical placement of the floating panel.",
    },
    triggerLabel: {
      control: "text",
      description: "Fallback trigger label when no trigger slot is provided.",
    },
  },
  args: {
    align: "start",
    ariaLabel: "Draft actions",
    disabled: false,
    items: menuItems,
    placement: "bottom",
    triggerLabel: "More actions",
  },
} satisfies Meta<typeof ElyPublicMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicMenu, ElyPublicText },
    setup() {
      const selectedAction = ref("No action selected yet")
      const handleSelect = (key: string) => {
        selectedAction.value = `Selected ${key}`
      }

      return { args, handleSelect, selectedAction }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Menu playground</p>
            <h1 class="ely-public-section-title">Fold secondary choices without hiding the main path</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Menu keeps low-frequency actions local to the current surface while the visible primary action stays outside the panel.
              </ElyPublicText>
              <ElyPublicMenu v-bind="args" @select="handleSelect" />
              <ElyPublicText tone="muted">{{ selectedAction }}</ElyPublicText>
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
    components: { ElyPublicMenu, ElyPublicText },
    setup() {
      const currentItems = [
        { key: "active", label: "Active draft", current: true, meta: "Now" },
        {
          key: "rename",
          label: "Rename",
          description: "Edit the local title.",
        },
        {
          key: "locked",
          label: "Export locked",
          description: "Complete review before export.",
          disabled: true,
          meta: "Locked",
        },
      ] satisfies ElyPublicMenuItem[]

      return { currentItems, doc, menuItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Menu states</p>
            <h1 class="ely-public-section-title">Open state, alignment, current item, disabled item, and danger tone</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-actions">
                <ElyPublicMenu trigger-label="Start aligned" aria-label="Start aligned actions" :items="menuItems" />
                <ElyPublicMenu trigger-label="End aligned" align="end" aria-label="End aligned actions" :items="currentItems" />
                <ElyPublicMenu trigger-label="Disabled menu" aria-label="Disabled menu" :items="menuItems" disabled />
              </div>
              <ElyPublicText tone="muted">
                Current and disabled states carry structural meaning; tone only reinforces the text and native control state.
              </ElyPublicText>
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

export const ActionOverflowScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicMenu,
      ElyPublicText,
    },
    setup() {
      const actionItems = [
        {
          key: "copy-link",
          label: "Copy preview link",
          description: "Share this draft without changing publish status.",
          meta: "Copy",
          tone: "primary",
        },
        {
          key: "request-review",
          label: "Request review",
          description: "Ask the atelier reviewer to check rhythm and contrast.",
          meta: "Team",
        },
        {
          key: "archive",
          label: "Archive local draft",
          description: "Hide this draft from the active list.",
          meta: "Safe",
        },
      ] satisfies ElyPublicMenuItem[]

      return { actionItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Action overflow scenarios</p>
            <h1 class="ely-public-section-title">The primary action stays visible; secondary work folds behind one quiet trigger</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div>
                <ElyPublicText>
                  Draft “Crystal aria landing” is ready for local review. Publish remains the visible commitment.
                </ElyPublicText>
              </div>
              <ElyPublicDivider label="Local actions" />
              <div class="ely-public-actions">
                <ElyPublicButton>Publish preview</ElyPublicButton>
                <ElyPublicMenu trigger-label="More draft actions" aria-label="More draft actions" :items="actionItems" />
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
    components: { ElyPublicAlert, ElyPublicMenu, ElyPublicText },
    setup() {
      const keyboardItems = [
        {
          key: "first",
          label: "Focus first action",
          description:
            "ArrowDown, Enter, or Space opens the first enabled item.",
          meta: "First",
          tone: "primary",
        },
        {
          key: "middle",
          label: "Move through choices",
          description: "Arrow keys cycle without creating a command palette.",
          meta: "Arrows",
        },
        {
          key: "last",
          label: "Close and restore focus",
          description: "Escape closes the panel and returns to the trigger.",
          meta: "Esc",
        },
      ] satisfies ElyPublicMenuItem[]

      return { keyboardItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Keyboard scenarios</p>
            <h1 class="ely-public-section-title">Menu must be operable before its polish is approved</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Open this menu with keyboard, move through enabled items, then close with Escape.
              </ElyPublicText>
              <ElyPublicMenu trigger-label="Keyboard review menu" aria-label="Keyboard review actions" :items="keyboardItems" />
              <ElyPublicAlert tone="info" title="Keyboard proof">
                This story is intentionally small so reviewers can test focus, movement, dismissal, and native button or anchor behavior directly.
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicMenu, ElyPublicText },
    setup() {
      const boundaryItems = [
        {
          key: "support",
          label: "Open support note",
          description: "A local help exit is acceptable.",
          href: "#support-note",
          meta: "Link",
        },
        {
          key: "delete",
          label: "Delete draft",
          description:
            "Only acceptable when the surrounding copy names the risk.",
          meta: "Danger",
          tone: "danger",
        },
      ] satisfies ElyPublicMenuItem[]

      return { boundaryItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Menu boundary</p>
            <h1 class="ely-public-section-title">Do not turn a local action menu into navigation or a hidden workflow</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Good: a local overflow menu holds draft support actions after the page names the current item and primary path.
              </ElyPublicText>
              <ElyPublicMenu trigger-label="Local support actions" aria-label="Local support actions" :items="boundaryItems" />
              <ElyPublicAlert tone="warning" title="Reject hidden structure">
                Global route menus, multi-level submenus, command palettes, pricing confirmations, and primary publish actions need their own visible component or flow.
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
