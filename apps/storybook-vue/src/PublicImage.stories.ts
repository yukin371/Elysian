import { ElyPublicImage, publicComponentDocs } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed } from "vue"
import { usePublicThemeArtwork } from "./publicThemeArtwork"

const doc = publicComponentDocs.Image

const meta = {
  title: "Public Luxe/Components/Image",
  component: ElyPublicImage,
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
      description:
        "Accessible text for meaningful imagery and fallback labeling.",
    },
    aspect: {
      control: "select",
      options: ["landscape", "portrait", "square", "wide"],
      description: "Preset aspect ratio used to stabilize composition.",
    },
    fit: {
      control: "select",
      options: ["cover", "contain"],
      description: "Media fitting strategy inside the framed surface.",
    },
    shape: {
      control: "select",
      options: ["soft", "square"],
      description: "Corner treatment within the public preset.",
    },
    showSkeleton: {
      control: "boolean",
      description: "Shows the loading placeholder before the media resolves.",
    },
    src: {
      control: "text",
      description: "Optional image source for the media surface.",
    },
  },
  args: {
    alt: "Luminous preview artwork",
    aspect: "landscape",
    fit: "cover",
    shape: "soft",
    showSkeleton: true,
    src: "",
  },
} satisfies Meta<typeof ElyPublicImage>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { ElyPublicImage },
    setup() {
      const imagePreview = usePublicThemeArtwork("landscape")
      const previewArgs = computed(() => ({
        ...args,
        src: args.src || imagePreview.value,
      }))

      return { previewArgs }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Image playground</p>
            <h1 class="ely-public-section-title">Tune media rhythm without losing layout control</h1>
            <div class="ely-public-stack ely-story-offset-md">
              <ElyPublicImage v-bind="previewArgs" />
              <p class="ely-public-muted-copy">
                Use controls to inspect aspect presets, fit behavior, fallback handling, and skeleton visibility.
              </p>
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

export const AspectRatios: Story = {
  render: () => ({
    components: { ElyPublicImage },
    setup() {
      const gallery = usePublicThemeArtwork("gallery")
      const landscape = usePublicThemeArtwork("landscape")
      const portrait = usePublicThemeArtwork("portrait")

      return {
        gallery,
        landscape,
        portrait,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Image aspect ratios</p>
            <h1 class="ely-public-section-title">Media shape controls rhythm before ornament</h1>
            <div class="ely-public-component-grid ely-story-offset-md">
              <ElyPublicImage :src="landscape" alt="Landscape artwork" aspect="landscape" />
              <ElyPublicImage :src="portrait" alt="Portrait artwork" aspect="portrait" />
              <ElyPublicImage :src="gallery" alt="Square gallery artwork" aspect="square" />
              <ElyPublicImage :src="landscape" alt="Wide artwork" aspect="wide" />
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { ElyPublicImage },
    setup() {
      const imagePreview = usePublicThemeArtwork("landscape")
      const portraitPreview = usePublicThemeArtwork("portrait")

      return { doc, imagePreview, portraitPreview }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card">
            <p class="ely-public-eyebrow">Image states</p>
            <h1 class="ely-public-section-title">Loaded, portrait, contain, and fallback surfaces</h1>
            <div class="ely-public-component-grid ely-story-offset-md">
              <div class="ely-public-stack">
                <ElyPublicImage
                  :src="imagePreview"
                  alt="Landscape composition preview"
                  aspect="landscape"
                />
                <p class="ely-public-muted-copy">Landscape cover is the default public card rhythm.</p>
              </div>
              <div class="ely-public-stack">
                <ElyPublicImage
                  :src="portraitPreview"
                  alt="Portrait composition preview"
                  aspect="portrait"
                  fit="contain"
                />
                <p class="ely-public-muted-copy">Portrait contain keeps full artwork visible inside the governed frame.</p>
              </div>
              <div class="ely-public-stack">
                <ElyPublicImage
                  alt="Fallback media example"
                  aspect="square"
                  shape="square"
                  src="/missing-public-image.png"
                />
                <p class="ely-public-muted-copy">Broken sources fall back to a branded placeholder instead of collapsing the slot.</p>
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

export const MediaScenarios: Story = {
  render: () => ({
    components: { ElyPublicImage },
    setup() {
      const gallery = usePublicThemeArtwork("gallery")
      const landscape = usePublicThemeArtwork("landscape")

      return {
        gallery,
        landscape,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Editorial hero</p>
              <h2 class="ely-public-section-title">Use landscape for lead media</h2>
              <ElyPublicImage :src="landscape" alt="Editorial hero artwork" aspect="landscape" />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Gallery tile</p>
              <h2 class="ely-public-section-title">Use square for collections</h2>
              <ElyPublicImage :src="gallery" alt="Gallery artwork" aspect="square" />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Fallback</p>
              <h2 class="ely-public-section-title">Failures keep the frame</h2>
              <ElyPublicImage alt="Missing media fallback" aspect="wide" src="/missing-media-scenario.png" />
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}

export const MediaBoundaryScenarios: Story = {
  render: () => ({
    components: { ElyPublicImage },
    setup() {
      const gallery = usePublicThemeArtwork("gallery")
      const landscape = usePublicThemeArtwork("landscape")
      const portrait = usePublicThemeArtwork("portrait")

      return {
        gallery,
        landscape,
        portrait,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-public-card" data-emphasis="feature">
            <p class="ely-public-eyebrow">Image boundary</p>
            <h1 class="ely-public-section-title">Images carry content; decoration belongs to theme material</h1>
            <p class="ely-public-copy">
              Public media should keep a stable aspect, meaningful alt text, and an explicit fallback path before anyone approves the polish.
            </p>
          </section>

          <section class="ely-public-card-grid">
            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Meaningful hero</p>
              <h2 class="ely-public-section-title">Lead media explains the surface</h2>
              <ElyPublicImage
                :src="landscape"
                alt="Theme family hero artwork showing a luminous review surface"
                aspect="landscape"
              />
              <p class="ely-public-muted-copy">
                The image has a content role, so the alt text names what the user gains from it.
              </p>
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Different crop, same grammar</p>
              <h2 class="ely-public-section-title">Portrait media stays governed</h2>
              <ElyPublicImage
                :src="portrait"
                alt="Portrait preview of an editorial theme card"
                aspect="portrait"
                fit="contain"
              />
            </article>

            <article class="ely-public-card">
              <p class="ely-public-eyebrow">Rejected background</p>
              <h2 class="ely-public-section-title">Do not use Image as a texture bucket</h2>
              <ElyPublicImage
                :src="gallery"
                alt="Gallery preview used as meaningful content, not a background texture"
                aspect="square"
              />
              <p class="ely-public-muted-copy">
                If the media is only shimmer or atmosphere, use tokenized material instead of hiding content semantics.
              </p>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
