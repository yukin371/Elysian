import type { Meta, StoryObj } from "@storybook/vue3-vite"

const meta = {
  title: "Public Luxe/Showcase/Brand Showcase",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Landing: Story = {
  render: () => ({
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-hero">
            <div>
              <p class="ely-public-eyebrow">Preset · public-luxe</p>
              <h1 class="ely-public-title">
                Build surfaces with
                <span class="ely-public-title-accent">luminous control</span>
              </h1>
              <p class="ely-public-copy">
                Elysian public themes are meant to feel expressive and polished:
                brand-led enough to be memorable, structured enough to stay
                governable as a product system.
              </p>
              <div class="ely-public-actions">
                <button class="ely-public-button" type="button">
                  Preview theme packs
                </button>
                <button class="ely-public-button ely-public-button--ghost" type="button">
                  Compare dark mode
                </button>
              </div>
              <div class="ely-public-chip-row">
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Preset Model</span>
                  <span class="ely-public-chip-value">preset + theme + mode</span>
                </div>
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Visual Bias</span>
                  <span class="ely-public-chip-value">Gorgeous, refined, luminous</span>
                </div>
                <div class="ely-public-chip">
                  <span class="ely-public-chip-label">Radius Rule</span>
                  <span class="ely-public-chip-value">Moderate corners, not oversized</span>
                </div>
              </div>
            </div>
            <div class="ely-public-preview-stat-row">
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">4</span>
                <span class="ely-public-preview-stat-label">Launch theme families</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">2</span>
                <span class="ely-public-preview-stat-label">Mode sets per family</span>
              </div>
              <div class="ely-public-preview-stat">
                <span class="ely-public-preview-stat-value">0</span>
                <span class="ely-public-preview-stat-label">Enterprise owner drift</span>
              </div>
            </div>
          </section>

          <section class="ely-public-shell">
            <h2 class="ely-public-section-title">What the first phase locks down</h2>
            <div class="ely-public-card-grid">
              <article class="ely-public-card">
                <h3>Stable theme contract</h3>
                <p>
                  data-preset, data-theme, data-mode, and data-resolved-mode
                  are the only runtime switches the preview layer needs to
                  honor.
                </p>
              </article>
              <article class="ely-public-card">
                <h3>Controlled color families</h3>
                <p>
                  The system starts with a small number of high-fidelity theme
                  families so color usage stays cohesive before any open-ended
                  customization is offered.
                </p>
              </article>
              <article class="ely-public-card">
                <h3>Preset separation</h3>
                <p>
                  ui-public-vue owns brand expression. ui-enterprise-vue remains
                  the TDesign enterprise preset without visual leakage.
                </p>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
