import type { Meta, StoryObj } from "@storybook/vue3-vite"

const eleganceRules = [
  {
    body: "A view should have one primary visual focus. Decorative cards, trims, and color chips stay quieter than the content they frame.",
    title: "One focal point",
  },
  {
    body: "Moonlit, crystalline, and silk-like cues should appear through borders, local sheen, and measured highlights, not through heavy glass or bokeh.",
    title: "Ornament stays precise",
  },
  {
    body: "Text contrast, form boundaries, and focus states remain more important than atmosphere in both light and dark mode.",
    title: "Reading wins",
  },
] as const

const colorRoles = [
  {
    role: "Primary",
    cssVar: "--color-primary",
    usage: "Main actions, selected states, focus paths, and key progress.",
  },
  {
    role: "Secondary",
    cssVar: "--color-secondary",
    usage: "Brand warmth, supporting hierarchy, and subtle ceremonial trim.",
  },
  {
    role: "Accent",
    cssVar: "--color-accent",
    usage:
      "Memory point only: rare labels, rose or champagne glints, and local emphasis.",
  },
  {
    role: "Status",
    cssVar: "success / warning / danger / info",
    usage:
      "State meaning only. Status colors do not participate in free brand composition.",
  },
] as const

const radiusScale = [
  {
    label: "Small",
    cssVar: "--ely-public-radius-sm",
    usage: "Checkbox controls, compact chips, tiny labels.",
  },
  {
    label: "Medium",
    cssVar: "--ely-public-radius-md",
    usage: "Buttons, inputs, badges, preview cards, local containers.",
  },
  {
    label: "Large",
    cssVar: "--ely-public-radius-lg",
    usage: "Cards, tab panels, dialogs, and larger content surfaces.",
  },
  {
    label: "Circle / track",
    cssVar: "999px",
    usage:
      "Avatar circles, switch tracks, progress tracks, and true pill semantics.",
  },
] as const

const reviewQuestions = [
  "Can the main visual focus be named in one sentence?",
  "Does every decorative effect serve hierarchy, state, or brand memory?",
  "Are primary, secondary, accent, and status colors doing different jobs?",
  "Are all radii from the governed scale rather than local px guesses?",
  "Would the page still read clearly if the decorative layer was reduced?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Design Principles",
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
        colorRoles,
        eleganceRules,
        radiusScale,
        reviewQuestions,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-principle-hero">
            <p class="ely-public-eyebrow">Design governance</p>
            <h1 class="ely-public-section-title">Elegant, luminous, governed</h1>
            <p class="ely-public-copy">
              Public Luxe should feel personal, ornate, and memorable without becoming noisy.
              The system uses restrained color roles, a fixed radius scale, and a single-focal-point
              composition rule so every C-side experience still feels intentional.
            </p>
            <div class="ely-story-principle-grid ely-story-offset-md">
              <article
                v-for="rule in eleganceRules"
                :key="rule.title"
                class="ely-story-principle-card"
              >
                <strong>{{ rule.title }}</strong>
                <span>{{ rule.body }}</span>
              </article>
            </div>
          </section>

          <section class="ely-story-principle-layout">
            <article class="ely-story-principle-role-panel">
              <p class="ely-public-eyebrow">Theme color roles</p>
              <h2 class="ely-public-section-title">No free-color composition</h2>
              <p class="ely-public-copy">
                Theme families may change atmosphere, but token roles do not drift.
                This keeps Elysian expressive without turning each page into a separate palette.
              </p>
              <div class="ely-story-role-list ely-story-offset-md">
                <div
                  v-for="role in colorRoles"
                  :key="role.role"
                  class="ely-story-role-item"
                >
                  <strong>{{ role.role }}</strong>
                  <code>{{ role.cssVar }}</code>
                  <span>{{ role.usage }}</span>
                </div>
              </div>
            </article>

            <article class="ely-story-principle-radius-panel">
              <p class="ely-public-eyebrow">Radius scale</p>
              <h2 class="ely-public-section-title">Soft, not toy-like</h2>
              <p class="ely-public-copy">
                Public Luxe uses a compact radius scale to preserve elegance.
                Components can feel polished without becoming overly round or playful.
              </p>
              <div class="ely-story-radius-list ely-story-offset-md">
                <div
                  v-for="item in radiusScale"
                  :key="item.cssVar"
                  class="ely-story-radius-item"
                >
                  <span class="ely-story-radius-mark"></span>
                  <div>
                    <strong>{{ item.label }}</strong>
                    <code>{{ item.cssVar }}</code>
                    <p>{{ item.usage }}</p>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="ely-story-principle-checklist-panel">
            <p class="ely-public-eyebrow">Review checklist</p>
            <h2 class="ely-public-section-title">Before a page or component lands</h2>
            <div class="ely-story-review-checklist ely-story-offset-md">
              <div
                v-for="question in reviewQuestions"
                :key="question"
                class="ely-story-review-question"
              >
                <span aria-hidden="true">✓</span>
                <strong>{{ question }}</strong>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
