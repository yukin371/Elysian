import {
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicCard,
  ElyPublicLink,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Card

const meta = {
  title: "Public Luxe/Components/Card",
  component: ElyPublicCard,
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
    eyebrow: { control: "text", description: "Small category label." },
    title: { control: "text", description: "Default h3 title." },
    subtitle: { control: "text", description: "Supporting copy." },
    emphasis: {
      control: "select",
      options: ["default", "feature", "muted"],
      description: "Surface intensity within the public theme language.",
    },
  },
  args: {
    emphasis: "default",
    eyebrow: "Feature",
    subtitle: "A refined public card surface for themed product moments.",
    title: "Luminous content block",
  },
} satisfies Meta<typeof ElyPublicCard>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicCard },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <ElyPublicCard v-bind="args">
            <p class="ely-public-muted-copy">
              Cards carry atmosphere through tokenized surface, border, and subtle overlay rather than oversized radius.
            </p>
          </ElyPublicCard>
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

export const Variants: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicCard },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <ElyPublicCard
              eyebrow="Default"
              title="Everyday review block"
              subtitle="Use for common content and summary surfaces."
            >
              <p class="ely-public-muted-copy">
                Default cards carry theme atmosphere without becoming the focal point.
              </p>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="feature"
              eyebrow="Feature"
              title="One lead surface"
              subtitle="Reserve for the main story or current decision."
            >
              <p class="ely-public-muted-copy">
                Feature emphasis should be rare enough that reviewers immediately know what matters.
              </p>
              <template #footer>
                <ElyPublicButton size="sm">Review feature</ElyPublicButton>
              </template>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="muted"
              eyebrow="Muted"
              title="Support evidence"
              subtitle="Use when content is useful but secondary."
            >
              <p class="ely-public-muted-copy">
                Muted cards keep dense supporting facts inside the same surface family.
              </p>
            </ElyPublicCard>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicCard },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <ElyPublicCard
              eyebrow="Default"
              title="Everyday public surface"
              subtitle="Use for previews, summaries, and short editorial blocks."
            >
              <p class="ely-public-muted-copy">
                The default card balances theme character and content readability.
              </p>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="feature"
              eyebrow="Feature"
              title="Lead moment"
              subtitle="Reserve feature emphasis for one card per section."
            >
              <p class="ely-public-muted-copy">
                Stronger overlay and glow should create hierarchy, not decorative noise.
              </p>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="muted"
              eyebrow="Muted"
              title="Dense support block"
              subtitle="Use when the surrounding layout already carries atmosphere."
            >
              <p class="ely-public-muted-copy">
                Muted keeps visual rhythm calm for secondary information.
              </p>

              <template #footer>
                <div class="ely-public-inline">
                  <ElyPublicButton size="sm">Open</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">Archive</ElyPublicButton>
                </div>
              </template>
            </ElyPublicCard>
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

export const CompositionScenarios: Story = {
  render: () => ({
    components: { ElyPublicButton, ElyPublicCard },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Card composition</p>
            <h1 class="ely-public-section-title">Cards should organize a decision, not decorate every fact</h1>
            <p class="ely-public-copy">
              This story shows header, body, footer, nested support facts, and action hierarchy without introducing a new page palette.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <ElyPublicCard
              eyebrow="Theme review"
              title="Rose Nocturne dark mode"
              subtitle="Ready for content-heavy editorial surfaces."
            >
              <div class="ely-public-stack">
                <p class="ely-public-muted-copy">
                  Surface contrast, status containers, and primary action color have been checked in the current theme.
                </p>
                <div class="ely-story-doc-matrix">
                  <div class="ely-story-doc-state">
                    <strong>Primary path</strong>
                    <span>Approve family</span>
                  </div>
                  <div class="ely-story-doc-state">
                    <strong>Recovery path</strong>
                    <span>Restore previous pack</span>
                  </div>
                </div>
              </div>
              <template #footer>
                <div class="ely-public-inline">
                  <ElyPublicButton size="sm">Approve</ElyPublicButton>
                  <ElyPublicButton size="sm" tone="ghost">Restore</ElyPublicButton>
                </div>
              </template>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="muted"
              eyebrow="Support"
              title="Why not more glow?"
              subtitle="Ornament remains subordinate to readable structure."
            >
              <p class="ely-public-muted-copy">
                If a glow does not clarify hierarchy, status, or focus, keep the surface quieter.
              </p>
            </ElyPublicCard>
          </section>
        </div>
      </section>
    `,
  }),
}

export const SurfaceHierarchyScenarios: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicCard,
      ElyPublicLink,
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Card hierarchy</p>
            <h1 class="ely-public-section-title">One lead surface, then quieter supporting cards</h1>
            <p class="ely-public-copy">
              Public-luxe cards should feel ornate through tokenized material, not by nesting every fact inside another framed surface.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <ElyPublicCard
              emphasis="feature"
              eyebrow="Lead decision"
              title="Approve the launch family"
              subtitle="This card owns the primary decision for the section."
            >
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicBadge tone="primary">current surface</ElyPublicBadge>
                  <ElyPublicBadge tone="accent">mode paired</ElyPublicBadge>
                </div>
                <p class="ely-public-muted-copy">
                  The feature card may carry the strongest atmosphere because it names the decision and offers one visible primary path.
                </p>
              </div>
              <template #footer>
                <div class="ely-public-inline">
                  <ElyPublicButton size="sm">Approve family</ElyPublicButton>
                  <ElyPublicLink href="https://example.com/evidence" tone="muted">
                    Review evidence
                  </ElyPublicLink>
                </div>
              </template>
            </ElyPublicCard>

            <ElyPublicCard
              emphasis="muted"
              eyebrow="Support"
              title="Why the surface stays quiet"
              subtitle="Secondary facts should not fight the lead card."
            >
              <p class="ely-public-muted-copy">
                Use muted emphasis for constraints, notes, and proof that help the decision but do not ask for a second commitment.
              </p>
            </ElyPublicCard>

            <ElyPublicCard
              eyebrow="Rejected pattern"
              title="No card inside card stack"
              subtitle="Nested ornamental frames blur owner, spacing, and action hierarchy."
            >
              <p class="ely-public-muted-copy">
                If content needs another framed unit, split the section into sibling cards instead of adding a local surface grammar.
              </p>
            </ElyPublicCard>
          </section>
        </div>
      </section>
    `,
  }),
}
