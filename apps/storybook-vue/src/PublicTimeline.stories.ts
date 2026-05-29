import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicLink,
  ElyPublicText,
  ElyPublicTimeline,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Timeline

const releaseItems = [
  {
    key: "spark",
    meta: "08:20",
    title: "Petal palette approved",
    description:
      "Primary, secondary, and accent roles were reviewed together so the Elysia theme stays lively without color drift.",
    tone: "accent",
  },
  {
    key: "proof",
    meta: "10:10",
    title: "Dark mode proof captured",
    description:
      "The same sequence remains readable against the nocturne surface and does not reuse bright light-mode containers.",
    tone: "primary",
  },
  {
    key: "repair",
    meta: "11:40",
    title: "One warning remains visible",
    description:
      "The timeline can name the moment, but the required repair still belongs in Alert near the affected action.",
    tone: "warning",
  },
  {
    key: "ship",
    meta: "14:30",
    title: "Component ready for handoff",
    description:
      "Owner docs, scenario proof, and compact density were reviewed before the component entered the component index.",
    tone: "success",
  },
]

const meta = {
  title: "Public Luxe/Components/Timeline",
  component: ElyPublicTimeline,
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
      description: "Accessible label for the chronological section.",
    },
    density: {
      control: "select",
      options: ["comfortable", "compact"],
      description: "Visual rhythm for editorial or dense history timelines.",
    },
    emptyMessage: {
      control: "text",
      description: "Visible lightweight copy when there are no timeline items.",
    },
    items: {
      control: "object",
      description: "Ordered timeline items.",
    },
  },
  args: {
    ariaLabel: "Theme release history",
    density: "comfortable",
    emptyMessage: "No timeline events have been recorded yet.",
    items: releaseItems,
  },
} satisfies Meta<typeof ElyPublicTimeline>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicTimeline },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Timeline playground</p>
            <h1 class="ely-public-section-title">Show chronology without stacking more cards</h1>
            <div class="ely-story-offset-md">
              <ElyPublicTimeline v-bind="args" />
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
    components: { ElyPublicTimeline },
    setup() {
      return { doc, releaseItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Timeline states</p>
            <h1 class="ely-public-section-title">Primary, accent, warning, success, and compact density</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTimeline :items="releaseItems" aria-label="Comfortable timeline states" />
              <ElyPublicTimeline :items="releaseItems" density="compact" aria-label="Compact timeline states" />
              <ElyPublicTimeline
                :items="[]"
                aria-label="Empty timeline"
                empty-message="No milestones yet. Let the surface explain absence without a second card."
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

export const ChronologyScenarios: Story = {
  render: () => ({
    components: { ElyPublicBadge, ElyPublicTimeline },
    setup() {
      const historyItems = [
        {
          key: "origin",
          meta: "Spring release",
          title: "Elysia default becomes the launch personality",
          description:
            "The role-inspired pink, blue, pearl, and champagne axis is treated as a product theme rather than a copied asset.",
          tone: "accent",
        },
        {
          key: "docs",
          meta: "Design review",
          title: "Radius and color discipline moves into owner docs",
          description:
            "Timeline records the decision while the rule itself stays in DESIGN.md and component metadata.",
          tone: "primary",
        },
        {
          key: "proof",
          meta: "Handoff",
          title: "Component scenarios are linked from the review index",
          description:
            "The item names the historical evidence; Storybook coverage remains the route into detailed proof.",
          tone: "success",
        },
      ]

      return { historyItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Timeline chronology</p>
            <h1 class="ely-public-section-title">History reads as a line, not a tower of nested panels</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-actions">
                <ElyPublicBadge tone="accent">Characterful theme</ElyPublicBadge>
                <ElyPublicBadge tone="primary">Owner docs</ElyPublicBadge>
              </div>
              <ElyPublicTimeline :items="historyItems" aria-label="Public luxe design history" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const ScheduleScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicButton,
      ElyPublicLink,
      ElyPublicText,
      ElyPublicTimeline,
    },
    setup() {
      const agendaItems = [
        {
          key: "open",
          meta: "09:00",
          title: "Theme gallery opens",
          description:
            "Visitors compare Elysia default, Rose Nocturne, Azure Aria, and Enterprise Calm before choosing a mood.",
          tone: "primary",
        },
        {
          key: "atelier",
          meta: "10:30",
          title: "Atelier review",
          description:
            "The team checks whether ornamental intensity supports the page job instead of fighting the primary action.",
          tone: "accent",
        },
        {
          key: "gate",
          meta: "13:20",
          title: "Release gate checkpoint",
          description:
            "Warnings remain explicit and repair actions stay outside the timeline so the chronology does not hide blockers.",
          tone: "warning",
        },
      ]

      return { agendaItems }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Timeline schedule</p>
            <h1 class="ely-public-section-title">Agenda rhythm can feel ceremonial without becoming a card stack</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTimeline :items="agendaItems" aria-label="Theme atelier agenda" />
              <ElyPublicText tone="muted">
                Timeline names what happens when; actions remain in the surrounding surface.
              </ElyPublicText>
              <div class="ely-public-actions">
                <ElyPublicButton>Reserve review slot</ElyPublicButton>
                <ElyPublicLink href="#" tone="muted">Open event policy</ElyPublicLink>
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
    components: { ElyPublicAlert, ElyPublicTimeline },
    setup() {
      const boundaryItems = [
        {
          key: "timeline",
          meta: "Use",
          title: "Timeline explains when something happened",
          description:
            "Good for release notes, member activity, agenda milestones, and editorial sequences.",
          tone: "primary",
        },
        {
          key: "not-stepper",
          meta: "Reject",
          title: "Do not make each timeline item a workflow step",
          description:
            "If the user must complete the current item before moving on, use Stepper and keep disabled state honest.",
          tone: "warning",
        },
        {
          key: "not-progress",
          meta: "Reject",
          title: "Do not use Timeline for completion amount",
          description:
            "Use Progress when the important information is percentage, capacity, or bounded readiness.",
          tone: "accent",
        },
      ]

      return { boundaryItems, doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Timeline boundary</p>
            <h1 class="ely-public-section-title">Timeline is chronology, not navigation, progress, or hidden repair</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicTimeline :items="boundaryItems" density="compact" aria-label="Timeline boundary review" />
              <ElyPublicAlert tone="danger" title="Required repair stays outside chronology">
                If a warning blocks the next action, keep it visible near the action instead of burying it as another historical event.
              </ElyPublicAlert>
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
