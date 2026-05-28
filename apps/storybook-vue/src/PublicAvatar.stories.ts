import { ElyPublicAvatar, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

const doc = publicComponentDocs.Avatar

const meta = {
  title: "Public Luxe/Components/Avatar",
  component: ElyPublicAvatar,
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
    alt: {
      control: "text",
      description: "Accessible label for the image or fallback surface.",
    },
    name: {
      control: "text",
      description: "Display name used to derive fallback initials.",
    },
    shape: {
      control: "select",
      options: ["soft", "circle", "square"],
      description: "Avatar silhouette for identity contexts.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Avatar scale for list, default, and profile contexts.",
    },
    src: {
      control: "text",
      description: "Optional image source used before fallback initials.",
    },
    status: {
      control: "select",
      options: [undefined, "online", "away", "busy", "offline"],
      description: "Optional presence indicator.",
    },
  },
  args: {
    name: "Elysia Atelier",
    shape: "soft",
    size: "md",
    status: "online",
  },
} satisfies Meta<typeof ElyPublicAvatar>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicAvatar },
    setup() {
      return { args }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Avatar playground</p>
            <h1 class="ely-public-section-title">Tune an identity surface without turning it into decoration</h1>
            <div class="ely-public-inline ely-story-offset-md">
              <ElyPublicAvatar v-bind="args" />
              <div>
                <strong>{{ args.name }}</strong>
                <p class="ely-public-muted-copy">Creator profile identity anchor</p>
              </div>
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

export const SizesAndShapes: Story = {
  render: () => ({
    components: { ElyPublicAvatar },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Avatar sizes and shapes</p>
            <h1 class="ely-public-section-title">Identity can vary without changing the radius system</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Small Soft" size="sm" shape="soft" />
                <ElyPublicAvatar name="Medium Soft" size="md" shape="soft" />
                <ElyPublicAvatar name="Large Soft" size="lg" shape="soft" />
              </div>
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Circle" shape="circle" status="online" />
                <ElyPublicAvatar name="Square" shape="square" status="away" />
                <ElyPublicAvatar name="Soft" shape="soft" status="busy" />
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
    components: { ElyPublicAvatar },
    setup() {
      return { doc }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Avatar states</p>
            <h1 class="ely-public-section-title">Fallback, size, shape, and presence</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Elysia Atelier" size="sm" status="online" />
                <ElyPublicAvatar name="Rose Nocturne" status="away" />
                <ElyPublicAvatar name="Azure Aria" size="lg" status="busy" />
              </div>
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Soft Shape" shape="soft" status="online" />
                <ElyPublicAvatar name="Circle Shape" shape="circle" status="offline" />
                <ElyPublicAvatar name="Square Shape" shape="square" />
              </div>
              <div class="ely-public-inline">
                <ElyPublicAvatar
                  alt="Broken image fallback example"
                  name="Fallback User"
                  src="/missing-avatar-example.png"
                  status="online"
                />
                <p class="ely-public-muted-copy">
                  Broken images fall back to initials instead of leaving an empty frame.
                </p>
              </div>
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

export const PresenceScenarios: Story = {
  render: () => ({
    components: { ElyPublicAvatar },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Review team</p>
              <h2 class="ely-public-section-title">Presence belongs to identity</h2>
              <div class="ely-public-inline">
                <ElyPublicAvatar name="Mira" status="online" />
                <ElyPublicAvatar name="Luna" status="away" />
                <ElyPublicAvatar name="Noah" status="busy" />
                <ElyPublicAvatar name="Iris" status="offline" />
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Fallback</p>
              <h2 class="ely-public-section-title">Broken media remains useful</h2>
              <div class="ely-public-inline">
                <ElyPublicAvatar
                  alt="Fallback reviewer avatar"
                  name="Fallback Reviewer"
                  src="/missing-reviewer-avatar.png"
                  status="online"
                />
                <p class="ely-public-muted-copy">
                  Initials keep identity visible when a source fails.
                </p>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const IdentityBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicAvatar },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Avatar boundary</p>
            <h1 class="ely-public-section-title">Avatars identify people or teams; they are not ornamental stickers</h1>
            <p class="ely-public-copy">
              Identity surfaces stay useful when media fails, presence changes, or the surrounding card becomes visually rich.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Reviewer row</p>
              <h2 class="ely-public-section-title">Identity anchors a decision</h2>
              <div class="ely-public-stack">
                <div class="ely-public-inline">
                  <ElyPublicAvatar name="Mira Lin" status="online" />
                  <div>
                    <strong>Mira Lin</strong>
                    <p class="ely-public-muted-copy">Approves light and dark token pairing.</p>
                  </div>
                </div>
                <div class="ely-public-inline">
                  <ElyPublicAvatar name="Noah Vale" status="busy" />
                  <div>
                    <strong>Noah Vale</strong>
                    <p class="ely-public-muted-copy">Reviews recovery path copy.</p>
                  </div>
                </div>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Fallback proof</p>
              <h2 class="ely-public-section-title">Broken media still names the person</h2>
              <div class="ely-public-inline">
                <ElyPublicAvatar
                  alt="Fallback reviewer identity"
                  name="Iris Chen"
                  status="away"
                />
                <p class="ely-public-muted-copy">
                  Initials preserve identity; do not replace a missing avatar with a decorative icon.
                </p>
              </div>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected use</p>
              <h2 class="ely-public-section-title">No anonymous sparkle clusters</h2>
              <p class="ely-public-muted-copy">
                If the surface needs atmosphere, use theme material and imagery rules instead of unlabeled avatar shapes.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
