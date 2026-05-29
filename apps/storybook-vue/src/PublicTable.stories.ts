import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicTable,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicTableColumn,
  ElyPublicTableRow,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Table

const defaultColumns = [
  {
    key: "family",
    label: "Family",
    description: "Theme choice",
  },
  {
    key: "tone",
    label: "Tone",
    description: "Primary impression",
  },
  {
    key: "proof",
    label: "Proof",
    description: "Required evidence",
  },
  {
    key: "ready",
    label: "Ready",
    align: "center",
  },
] satisfies ElyPublicTableColumn[]

const defaultRows = [
  {
    key: "elysia",
    cells: {
      family: "Elysia default",
      proof: "Light and dark token pair",
      ready: "Yes",
      tone: "Petal, moonlight, pale blue",
    },
    tone: "primary",
  },
  {
    key: "rose",
    cells: {
      family: "Rose nocturne",
      proof: "Ornament budget review",
      ready: "Review",
      tone: "Rose, satin, night banquet",
    },
    tone: "accent",
  },
  {
    key: "enterprise",
    cells: {
      family: "Enterprise calm",
      proof: "Low ornament fallback",
      ready: "Yes",
      tone: "Stable, quiet, low risk",
    },
    tone: "success",
  },
] satisfies ElyPublicTableRow[]

const meta = {
  title: "Public Luxe/Components/Table",
  component: ElyPublicTable,
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
    caption: {
      control: "text",
      description: "Visible title and native table caption.",
    },
    columns: {
      control: "object",
      description: "Ordered read-only table columns.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Cell rhythm for regular or compact review contexts.",
    },
    description: {
      control: "text",
      description: "Supporting copy above the table.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible lightweight copy when no rows are available.",
    },
    rows: {
      control: "object",
      description: "Ordered read-only rows.",
    },
  },
  args: {
    caption: "Theme readiness matrix",
    columns: defaultColumns,
    density: "comfortable",
    description:
      "Use Table when comparison across rows and columns is the main reading job.",
    emptyMessage: "No comparison rows are available yet.",
    rows: defaultRows,
  },
} satisfies Meta<typeof ElyPublicTable>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicTable },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Table playground</p>
            <h1 class="ely-public-section-title">Compare structured facts without turning public pages into data grids</h1>
            <div class="ely-story-offset-md">
              <ElyPublicTable v-bind="args" />
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
    components: { ElyPublicTable },
    setup() {
      const stateRows = [
        {
          key: "default",
          cells: {
            family: "Default row",
            proof: "Plain comparison",
            ready: "Read",
            tone: "No special emphasis",
          },
        },
        {
          key: "warning",
          cells: {
            family: "Warning row",
            proof: "Needs repair text",
            ready: "Check",
            tone: "Risk is named in text",
          },
          tone: "warning",
        },
        {
          key: "danger",
          cells: {
            family: "Danger row",
            proof: "Blocked until fixed",
            ready: "No",
            tone: "Consequence is explicit",
          },
          tone: "danger",
        },
      ] satisfies ElyPublicTableRow[]

      return { defaultColumns, doc, stateRows }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Table states</p>
            <h1 class="ely-public-section-title">Caption, density, alignment, and semantic row tones</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTable
                caption="Comfortable review rows"
                description="Use row tone only as support; cell text still carries the meaning."
                :columns="defaultColumns"
                :rows="stateRows"
              />
              <ElyPublicTable
                caption="Compact review rows"
                density="compact"
                :columns="defaultColumns"
                :rows="stateRows"
              />
              <ElyPublicTable
                caption="Empty comparison rows"
                description="The table keeps its caption, headers, and reading purpose without requiring an extra empty-state card."
                :columns="defaultColumns"
                :rows="[]"
                empty-message="No theme checks have been added yet."
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

export const ComparisonScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicTable,
      ElyPublicText,
    },
    setup() {
      const columns = [
        { key: "tier", label: "Tier" },
        { key: "access", label: "Access" },
        { key: "support", label: "Support" },
        { key: "fit", label: "Fit", align: "center" },
      ] satisfies ElyPublicTableColumn[]
      const rows = [
        {
          key: "guest",
          cells: {
            access: "Preview only",
            fit: "Quiet",
            support: "Public FAQ",
            tier: "Guest",
          },
        },
        {
          key: "member",
          cells: {
            access: "Saved themes",
            fit: "Default",
            support: "Creator notes",
            tier: "Member",
          },
          tone: "primary",
        },
        {
          key: "seraph",
          cells: {
            access: "Early atelier",
            fit: "Feature",
            support: "Priority review",
            tier: "Seraph",
          },
          tone: "accent",
        },
      ] satisfies ElyPublicTableRow[]

      return { columns, rows }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Comparison scenarios</p>
            <h1 class="ely-public-section-title">Reward and specification comparisons need one clear matrix</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-actions">
                <ElyPublicBadge tone="accent">Member tiers</ElyPublicBadge>
                <ElyPublicBadge tone="primary">Read-only</ElyPublicBadge>
              </div>
              <ElyPublicDivider label="Tier matrix" />
              <ElyPublicTable
                caption="Member reward comparison"
                description="Rows compare tier promises; actions and eligibility rules stay outside the table."
                :columns="columns"
                :rows="rows"
              />
              <ElyPublicText tone="muted">
                Use Table for comparison. Use Button, Link, or Alert nearby when the user needs to act on one outcome.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const CompactAuditScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicTable },
    setup() {
      const columns = [
        { key: "check", label: "Check" },
        { key: "result", label: "Result" },
        { key: "owner", label: "Owner" },
        { key: "state", label: "State", align: "center" },
      ] satisfies ElyPublicTableColumn[]
      const rows = [
        {
          key: "contrast",
          cells: {
            check: "Dark contrast",
            owner: "Theme",
            result: "Paired token proof",
            state: "Pass",
          },
          tone: "success",
        },
        {
          key: "radius",
          cells: {
            check: "Radius scale",
            owner: "Design",
            result: "No off-scale local values",
            state: "Pass",
          },
          tone: "success",
        },
        {
          key: "action",
          cells: {
            check: "Action hierarchy",
            owner: "Pattern",
            result: "One page still has two primary paths",
            state: "Fix",
          },
          tone: "warning",
        },
      ] satisfies ElyPublicTableRow[]

      return { columns, rows }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Compact audit scenarios</p>
            <h1 class="ely-public-section-title">Audit snapshots can stay compact without becoming spreadsheets</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTable
                caption="Release review snapshot"
                description="A bounded review table names the check, evidence, owner, and state."
                density="compact"
                :columns="columns"
                :rows="rows"
              />
              <ElyPublicAlert tone="warning" title="Keep repair outside the table">
                If a row needs editing, approval, assignment, or bulk operations, move that workflow into an owning page or enterprise component.
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
    components: { ElyPublicAlert, ElyPublicLink, ElyPublicTable },
    setup() {
      const columns = [
        { key: "intent", label: "Intent" },
        { key: "use", label: "Use" },
        { key: "reject", label: "Reject" },
      ] satisfies ElyPublicTableColumn[]
      const rows = [
        {
          key: "compare",
          cells: {
            intent: "Compare facts",
            reject: "Decorative card grid",
            use: "Table",
          },
          tone: "success",
        },
        {
          key: "edit",
          cells: {
            intent: "Edit values",
            reject: "Editable cells in Table",
            use: "Input or form pattern",
          },
          tone: "warning",
        },
        {
          key: "operate",
          cells: {
            intent: "Sort, filter, select, act",
            reject: "Public Table",
            use: "Enterprise table or future data grid",
          },
          tone: "danger",
        },
      ] satisfies ElyPublicTableRow[]

      return { columns, rows }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Table boundary</p>
            <h1 class="ely-public-section-title">A public table is a reading primitive, not an operations workspace</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTable
                caption="Table choice boundary"
                description="Choose table only when row and column reading is the main user job."
                :columns="columns"
                :rows="rows"
              />
              <ElyPublicAlert tone="info" title="Keep the owner honest">
                Public Table owns read-only comparison. Use <ElyPublicLink href="#" tone="primary">enterprise components</ElyPublicLink> when the task becomes operational.
              </ElyPublicAlert>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
