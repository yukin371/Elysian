import { publicComponentDocs, publicThemePacks } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const reviewGates = [
  {
    title: "Theme family first",
    signal: "Choose one complete family before tuning any surface.",
    checks: [
      "The page names one theme family and one resolved mode.",
      "Primary, secondary, accent, and status roles do not swap jobs.",
      "Light and dark previews keep the same hierarchy, not a simple inversion.",
    ],
  },
  {
    title: "Radius and material discipline",
    signal: "Elegant surfaces stay crisp, not over-rounded or glassy.",
    checks: [
      "Every ordinary radius comes from sm, md, or lg tokens.",
      "Circle and pill geometry only appears on avatar, track, or true pill semantics.",
      "Glow, sheen, and overlay serve hierarchy or state instead of decorating everything.",
    ],
  },
  {
    title: "One decision path",
    signal: "A local surface should make the next step obvious.",
    checks: [
      "There is only one primary action in the decision area.",
      "Secondary, ghost, and link actions have clearly lower priority.",
      "Recovery paths remain visible without competing with the main action.",
    ],
  },
  {
    title: "Usability before ornament",
    signal:
      "Public Luxe can be luminous only after it is readable and operable.",
    checks: [
      "Focus, invalid, disabled, loading, and selected states are visible.",
      "Errors explain the next repair action, not just the mood.",
      "Keyboard and reduced-motion paths preserve the same information order.",
    ],
  },
] as const

const componentGateRows = Object.values(publicComponentDocs).map(
  (component) => ({
    category: component.category,
    name: component.name,
    questions: [
      component.decision[0],
      component.composition[0],
      component.antiPatterns[0],
    ].filter(Boolean),
  }),
)

const themeGateRows = publicThemePacks.map((theme) => ({
  displayName: theme.displayName,
  key: theme.key,
  description: theme.description,
  mood: theme.mood,
}))

const meta = {
  title: "Public Luxe/Foundations/Design Review Checklist",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    setup() {
      return {
        componentGateRows,
        reviewGates,
        themeGateRows,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-review-gate-hero">
            <p class="ely-public-eyebrow">Design review gate</p>
            <h1 class="ely-public-section-title">Approve coherence before adding polish</h1>
            <p class="ely-public-copy">
              Use this checkpoint when a component, pattern, or page feels almost right but not yet
              coordinated. It keeps Public Luxe expressive while preventing free-color drift, oversized
              radii, competing actions, and ornament that weakens usability.
            </p>
            <div class="ely-story-review-gate-grid ely-story-offset-md">
              <article
                v-for="gate in reviewGates"
                :key="gate.title"
                class="ely-story-review-gate-card"
              >
                <span class="ely-story-review-gate-status">Gate</span>
                <h2>{{ gate.title }}</h2>
                <p>{{ gate.signal }}</p>
                <ul class="ely-story-review-gate-list">
                  <li v-for="check in gate.checks" :key="check">{{ check }}</li>
                </ul>
              </article>
            </div>
          </section>

          <section class="ely-story-review-gate-layout">
            <article class="ely-story-review-theme-panel">
              <p class="ely-public-eyebrow">Theme family checks</p>
              <h2 class="ely-public-section-title">Reject local palette improvisation</h2>
              <div class="ely-story-review-theme-list ely-story-offset-md">
                <div
                  v-for="theme in themeGateRows"
                  :key="theme.key"
                  class="ely-story-review-theme-row"
                >
                  <div>
                    <strong>{{ theme.displayName }}</strong>
                    <span>{{ theme.mood }}</span>
                  </div>
                  <p>{{ theme.description }}</p>
                </div>
              </div>
            </article>

            <article class="ely-story-review-component-panel">
              <p class="ely-public-eyebrow">Component checks</p>
              <h2 class="ely-public-section-title">Ask the owner docs first</h2>
              <div class="ely-story-review-component-list ely-story-offset-md">
                <div
                  v-for="component in componentGateRows.slice(0, 8)"
                  :key="component.name"
                  class="ely-story-review-component-row"
                >
                  <div>
                    <strong>{{ component.name }}</strong>
                    <span>{{ component.category }}</span>
                  </div>
                  <ul>
                    <li v-for="question in component.questions" :key="question">
                      {{ question }}
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-review-approval-panel">
            <p class="ely-public-eyebrow">Approval sentence</p>
            <h2 class="ely-public-section-title">A coherent Public Luxe surface should be easy to defend</h2>
            <div class="ely-story-review-approval ely-story-offset-md">
              <span>Pass</span>
              <p>
                This surface uses one governed theme family, one dominant action path,
                the public radius scale, owner component docs, and accessible states.
              </p>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
