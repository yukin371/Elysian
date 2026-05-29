import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicDateInput,
  ElyPublicProgress,
  ElyPublicStepper,
  ElyPublicText,
  ElyPublicTimeline,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.DateInput

const meta = {
  title: "Public Luxe/Components/Date Input",
  component: ElyPublicDateInput,
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
      description: "Helper copy linked to the date input.",
    },
    disabled: { control: "boolean", description: "Disables date editing." },
    invalidMessage: {
      control: "text",
      description: "Visible invalid recovery copy.",
    },
    label: { control: "text", description: "Visible field label." },
    max: { control: "text", description: "Inclusive YYYY-MM-DD upper bound." },
    min: { control: "text", description: "Inclusive YYYY-MM-DD lower bound." },
    modelValue: {
      control: "text",
      description: "Controlled native YYYY-MM-DD date value.",
    },
    placeholder: { control: "text", description: "Native placeholder hint." },
    rangeText: {
      control: "text",
      description: "Visible date-window hint linked through aria-describedby.",
    },
    readOnly: { control: "boolean", description: "Prevents editing." },
  },
  args: {
    description:
      "Choose one exact day; availability and timezone rules stay page-owned.",
    disabled: false,
    invalidMessage: undefined,
    label: "Event date",
    max: "2026-09-30",
    min: "2026-06-01",
    modelValue: "2026-07-18",
    placeholder: "YYYY-MM-DD",
    rangeText: "Allowed event window: 2026-06-01 to 2026-09-30.",
    readOnly: false,
  },
} satisfies Meta<typeof ElyPublicDateInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicDateInput },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Date input playground</p>
            <h1 class="ely-public-section-title">Pick one exact day without turning a field into a scheduler</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDateInput v-bind="args" />
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
    components: { ElyPublicDateInput },
    setup() {
      const emptyDate = ref("")
      const selectedDate = ref("2026-07-18")
      const boundedDate = ref("2026-08-09")

      return {
        boundedDate,
        doc,
        emptyDate,
        selectedDate,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Date input states</p>
            <h1 class="ely-public-section-title">Empty, selected, bounded, invalid, read-only, and disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDateInput
                v-model="emptyDate"
                label="Optional reminder date"
                description="Empty stays intentionally unset until the user commits a day."
              />
              <ElyPublicDateInput
                v-model="selectedDate"
                label="Premiere date"
                description="The selected day remains a native YYYY-MM-DD value."
              />
              <ElyPublicDateInput
                v-model="boundedDate"
                label="Creator review day"
                description="Boundaries are visible and simple; policy copy stays outside the primitive."
                min="2026-08-01"
                max="2026-08-31"
              />
              <ElyPublicDateInput
                model-value="2026-05-20"
                label="Access extension"
                description="Invalid copy explains how to repair the date."
                invalid-message="Choose a day between 2026-06-01 and 2026-09-30."
                min="2026-06-01"
                max="2026-09-30"
              />
              <ElyPublicDateInput
                model-value="2026-07-01"
                read-only
                label="Submitted renewal date"
                description="Read-only dates remain visible during final review."
              />
              <ElyPublicDateInput
                model-value="2026-07-30"
                disabled
                label="Locked billing date"
                description="Disabled dates explain unavailable changes in the surrounding flow."
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

export const EventDateScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicDateInput,
      ElyPublicProgress,
      ElyPublicStepper,
      ElyPublicText,
    },
    setup() {
      const eventDate = ref("2026-07-18")
      const isEarlyWindow = computed(() => eventDate.value < "2026-07-15")
      const stageItems = [
        {
          key: "draft",
          label: "Draft",
          description: "Details are still editable.",
          status: "complete",
        },
        {
          key: "date",
          label: "Date",
          description: "One exact day anchors promotion.",
          status: "current",
        },
        {
          key: "open",
          label: "Open",
          description: "Registration can publish after review.",
          status: "upcoming",
        },
      ]

      return {
        eventDate,
        isEarlyWindow,
        stageItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Event date scenarios</p>
                <h1 class="ely-public-section-title">Anchor a public event with one calm, exact date</h1>
              </div>
              <ElyPublicBadge :tone="isEarlyWindow ? 'accent' : 'primary'">
                {{ isEarlyWindow ? 'Early access' : 'Main window' }}
              </ElyPublicBadge>
            </div>
            <ElyPublicText class="ely-story-offset-sm">
              DateInput should sit beside the decision it controls. Promotion rules, seats, and calendar integration remain page-owned.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDateInput
                v-model="eventDate"
                label="Public event date"
                description="Pick the day that will appear on invitations and the landing page."
                min="2026-07-01"
                max="2026-08-31"
              />
              <ElyPublicProgress label="Launch readiness" :value="68" tone="primary" />
              <ElyPublicStepper :items="stageItems" model-value="date" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ValidityWindowScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicDateInput,
      ElyPublicText,
      ElyPublicTimeline,
    },
    setup() {
      const startDate = ref("2026-06-01")
      const endDate = ref("2026-08-31")
      const timelineItems = computed(() => [
        {
          key: "start",
          title: "Access opens",
          description: startDate.value || "Waiting for a start date.",
          tone: "primary",
        },
        {
          key: "review",
          title: "Mid-window review",
          description: "Support copy and renewal prompts stay visible.",
          tone: "warning",
        },
        {
          key: "end",
          title: "Access closes",
          description: endDate.value || "Waiting for an end date.",
          tone: "accent",
        },
      ])

      return {
        endDate,
        startDate,
        timelineItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Validity window scenarios</p>
            <h1 class="ely-public-section-title">Keep related dates in one flat window lane</h1>
            <ElyPublicText class="ely-story-offset-sm">
              A pair of DateInput fields can describe a simple validity window, but renewal logic and timezone policy should stay outside the primitive.
            </ElyPublicText>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDateInput
                v-model="startDate"
                label="Access starts"
                description="The first eligible day for the member benefit."
                min="2026-06-01"
                max="2026-08-31"
              />
              <ElyPublicDateInput
                v-model="endDate"
                label="Access ends"
                description="The final eligible day before renewal is required."
                min="2026-06-01"
                max="2026-09-30"
              />
              <ElyPublicTimeline :items="timelineItems" />
              <ElyPublicAlert
                tone="info"
                title="Window ownership"
                description="DateInput collects dates. The page still owns renewal policy, timezone copy, and eligibility decisions."
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
    components: { ElyPublicAlert, ElyPublicDateInput },
    setup() {
      const blockedDate = ref("2026-10-12")

      return { blockedDate }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Reject date fields that are secretly booking systems</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicDateInput
                v-model="blockedDate"
                label="Recovery deadline"
                description="The primitive can expose a simple inclusive window, not decide business eligibility."
                invalid-message="Choose a recovery deadline from 2026-06-01 through 2026-09-30."
                min="2026-06-01"
                max="2026-09-30"
              />
              <ElyPublicAlert
                tone="warning"
                title="Do not bury policy in native bounds"
                description="Use a dedicated flow for availability search, recurrence, timezone conversion, blackout dates, deposits, or calendar invitations."
              />
              <ElyPublicAlert
                tone="info"
                title="Choose the simpler primitive first"
                description="Use Timeline for read-only chronology, Stepper for process stage, Select for named windows, and Text for policy explanation."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
