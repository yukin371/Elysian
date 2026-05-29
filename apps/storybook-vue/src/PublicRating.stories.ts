import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicRating,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

const doc = publicComponentDocs.Rating

const meta = {
  title: "Public Luxe/Components/Rating",
  component: ElyPublicRating,
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
      description: "Helper copy linked to the radiogroup.",
    },
    disabled: { control: "boolean", description: "Disables rating changes." },
    invalidMessage: {
      control: "text",
      description: "Actionable repair copy linked through aria-describedby.",
    },
    id: {
      control: "text",
      description: "Optional id for the rating group.",
    },
    label: { control: "text", description: "Visible rating label." },
    max: { control: "number", description: "Maximum item count." },
    modelValue: {
      control: "number",
      description: "Controlled selected rating value.",
    },
    readOnly: {
      control: "boolean",
      description: "Displays a score without allowing edits.",
    },
    showValue: {
      control: "boolean",
      description: "Shows value/max beside the label.",
    },
  },
  args: {
    description: "Rate how well this public surface matches your expectation.",
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: "Surface delight",
    max: 5,
    modelValue: 4,
    readOnly: false,
    showValue: true,
  },
} satisfies Meta<typeof ElyPublicRating>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicRating },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Rating playground</p>
            <h1 class="ely-public-section-title">Capture a compact ordered score</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRating v-bind="args" />
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
    components: { ElyPublicRating },
    setup() {
      const empty = ref(0)
      const selected = ref(4)

      return {
        doc,
        empty,
        selected,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Rating states</p>
            <h1 class="ely-public-section-title">Empty, selected, read-only, and disabled</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRating
                v-model="empty"
                label="First impression"
                description="No score is selected yet, but keyboard users can start at one."
              />
              <ElyPublicRating
                v-model="selected"
                label="Surface delight"
                description="Selected scores fill the ordered marks up to the current value."
              />
              <ElyPublicRating
                :model-value="4"
                read-only
                label="Published average"
                description="Read-only scores summarize existing feedback without inviting edits."
              />
              <ElyPublicRating
                :model-value="2"
                disabled
                label="Closed feedback"
                description="Disabled ratings explain that the feedback window is unavailable."
              />
              <ElyPublicRating
                :model-value="0"
                label="Required fit score"
                description="A score is required before this handoff can be submitted."
                invalid-message="Choose a fit score before continuing."
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

export const FeedbackScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicRating,
      ElyPublicText,
    },
    setup() {
      const score = ref(4)
      const tone = computed(() => (score.value >= 4 ? "Loved" : "Needs care"))

      return {
        score,
        tone,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <div class="ely-public-card__header">
              <div>
                <p class="ely-public-eyebrow">Feedback scenarios</p>
                <h1 class="ely-public-section-title">Ask for a small score after the experience is clear</h1>
              </div>
              <ElyPublicBadge tone="accent">{{ tone }}</ElyPublicBadge>
            </div>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicText>
                Rating works best after the user has enough evidence to judge the surface, reward, article, or support answer.
              </ElyPublicText>
              <ElyPublicRating
                v-model="score"
                label="How did this creator surface feel?"
                description="One compact score, not a full review system."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ReadOnlyScenarios: Story = {
  render: () => ({
    components: { ElyPublicRating, ElyPublicStat, ElyPublicText },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Read-only scenarios</p>
            <h1 class="ely-public-section-title">Display existing scores without pretending they are editable</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicStat
                label="Member delight"
                value="4.6"
                suffix="/5"
                tone="accent"
                helper="Average from completed public feedback."
              />
              <ElyPublicRating
                :model-value="5"
                read-only
                label="Reward clarity"
                description="A read-only rating can sit beside summary evidence."
              />
              <ElyPublicRating
                :model-value="4"
                read-only
                label="Editorial fit"
                description="Use Text nearby when the score needs interpretation."
              />
              <ElyPublicText>
                Read-only scores stay quiet: they support trust, but they do not replace Stat, Table, or review copy.
              </ElyPublicText>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const BoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAlert, ElyPublicRating },
    setup() {
      const fit = ref(3)

      return { fit }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Boundary scenarios</p>
            <h1 class="ely-public-section-title">Rating is not analytics, progress, or a review platform</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicRating
                v-model="fit"
                label="Theme fit"
                description="Safe because the score is a local preference signal with a named scale."
              />
              <ElyPublicAlert
                tone="warning"
                title="Reject overloaded scoring"
                description="If the product needs written reviews, popularity charts, moderation, fraud signals, or analytics aggregation, Rating is only the small input primitive, not the system."
              />
              <ElyPublicAlert
                tone="info"
                title="Use the right primitive"
                description="Use Progress for completion, Slider for continuous tuning, Radio Group for named choices, and Table for comparison."
              />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
