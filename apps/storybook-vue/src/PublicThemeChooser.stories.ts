import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicProgress,
  ElyPublicRadioGroup,
  ElyPublicStat,
  ElyPublicSwitch,
  ElyPublicText,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicRadioGroupItem,
  PublicThemeName,
  PublicThemePack,
  ThemeMode,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"
import { createStoryPath } from "./public-luxe-showcase"

const modeItems: ElyPublicRadioGroupItem[] = [
  {
    key: "system",
    label: "System",
    description: "Follow the operating system while preserving the family.",
    value: "system",
  },
  {
    key: "light",
    label: "Light",
    description: "Review pearl surfaces, action color, and soft ornament.",
    value: "light",
  },
  {
    key: "dark",
    label: "Dark",
    description: "Review dark surfaces, readable text, and controlled glow.",
    value: "dark",
  },
]

const personalityChecks = [
  "One primary action color remains obvious.",
  "Secondary and accent stay decorative, not competitive.",
  "The theme still works after switching to dark mode.",
  "Ornament changes mood without changing component semantics.",
]

const getPreviewByMode = (theme: PublicThemePack, mode: ThemeMode) =>
  mode === "dark" ? theme.preview.dark : theme.preview

const getInitialThemeKey = (): PublicThemeName => {
  const fallbackTheme = publicThemePacks[0]?.key ?? "elysia-default"

  if (typeof document === "undefined") {
    return fallbackTheme
  }

  const activeTheme = document.documentElement.dataset.theme

  return publicThemePacks.some((theme) => theme.key === activeTheme)
    ? (activeTheme as PublicThemeName)
    : fallbackTheme
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "system"
  }

  const activeMode = document.documentElement.dataset.mode

  return activeMode === "light" ||
    activeMode === "dark" ||
    activeMode === "system"
    ? activeMode
    : "system"
}

const getResolvedSystemPreviewMode = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "light"
  }

  return document.documentElement.dataset.resolvedMode === "dark"
    ? "dark"
    : "light"
}

const getPreviewStyle = (theme: PublicThemePack, mode: ThemeMode) => {
  const preview = getPreviewByMode(theme, mode)

  return {
    "--ely-story-theme-chooser-accent": preview.accent,
    "--ely-story-theme-chooser-from": preview.heroFrom,
    "--ely-story-theme-chooser-surface": preview.surface,
    "--ely-story-theme-chooser-to": preview.heroTo,
  }
}

const createThemeGlobalHref = (themeKey: PublicThemeName, mode: ThemeMode) => {
  if (typeof window === "undefined") {
    return "#"
  }

  const url = new URL(window.location.href)
  url.searchParams.set("globals", `theme:${themeKey};mode:${mode}`)

  return `${url.pathname}${url.search}${url.hash}`
}

const meta = {
  title: "Public Luxe/Foundations/Theme Chooser",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A user-facing theme chooser prototype that consumes public theme pack metadata and routes selection back to the Storybook toolbar globals.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicProgress,
      ElyPublicRadioGroup,
      ElyPublicStat,
      ElyPublicSwitch,
      ElyPublicText,
    },
    setup() {
      const selectedMode = ref<ThemeMode>(getInitialThemeMode())
      const selectedThemeKey = ref(getInitialThemeKey())
      const includeDarkProof = ref(true)

      const selectedTheme = computed(
        () =>
          publicThemePacks.find(
            (theme) => theme.key === selectedThemeKey.value,
          ) ?? publicThemePacks[0],
      )

      const selectedPreviewMode = computed<ThemeMode>(() =>
        selectedMode.value === "system"
          ? getResolvedSystemPreviewMode()
          : selectedMode.value,
      )

      const activePreviewStyle = computed(() => {
        if (!selectedTheme.value) {
          return {}
        }

        return getPreviewStyle(selectedTheme.value, selectedPreviewMode.value)
      })

      const expressionValue = computed(() => {
        const level = selectedTheme.value?.expressionLevel

        if (level === "Ornate") {
          return 92
        }

        if (level === "Vivid") {
          return 84
        }

        if (level === "Minimal") {
          return 48
        }

        return 34
      })

      const chooseTheme = (themeKey: PublicThemeName) => {
        selectedThemeKey.value = themeKey
      }

      return {
        activePreviewStyle,
        chooseTheme,
        createStoryPath,
        createThemeGlobalHref,
        expressionValue,
        getPreviewStyle,
        includeDarkProof,
        modeItems,
        personalityChecks,
        publicThemePacks,
        selectedMode,
        selectedPreviewMode,
        selectedTheme,
        selectedThemeKey,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-theme-chooser-hero">
            <div class="ely-story-theme-chooser-hero__copy">
              <p class="ely-public-eyebrow">Theme chooser</p>
              <h1 class="ely-public-title">
                Let users choose a
                <span class="ely-public-title-accent">personality, not just a color</span>
              </h1>
              <p class="ely-public-copy">
                This is the public-facing theme selection model. Elysia Bloom carries the vivid heroine energy by
                default, while Rose Nocturne, Azure Aria, and Enterprise Calm cover ornate, minimal, and restrained
                personalities without turning personalization into random recoloring.
              </p>
              <div class="ely-public-actions">
                <a
                  class="ely-public-button"
                  :href="createThemeGlobalHref(selectedTheme?.key ?? selectedThemeKey, selectedMode)"
                  target="_top"
                  rel="noreferrer"
                >
                  Apply to Storybook toolbar
                </a>
                <a
                  class="ely-public-button"
                  data-tone="secondary"
                  :href="createStoryPath('public-luxe-foundations-theme-role-matrix--overview')"
                  target="_top"
                  rel="noreferrer"
                >
                  Compare family roles
                </a>
                <a
                  class="ely-public-button"
                  data-tone="ghost"
                  :href="createStoryPath('public-luxe-components-theme-specimen-wall--overview')"
                  target="_top"
                  rel="noreferrer"
                >
                  Open component proof
                </a>
              </div>
            </div>

            <div
              class="ely-story-theme-chooser-stage"
              :style="activePreviewStyle"
              aria-label="Selected theme preview"
            >
              <span class="ely-story-theme-chooser-stage__orb"></span>
              <div>
                <ElyPublicBadge tone="accent">{{ selectedTheme?.expressionLevel }}</ElyPublicBadge>
                <h2>{{ selectedTheme?.displayName }}</h2>
                <p>{{ selectedTheme?.designCue }}</p>
              </div>
              <div class="ely-story-theme-chooser-stage__footer">
                <span>{{ selectedPreviewMode }} preview</span>
                <strong>{{ selectedTheme?.accentLabel }}</strong>
              </div>
            </div>
          </section>

          <section class="ely-story-theme-chooser-layout">
            <aside class="ely-story-theme-chooser-selector" aria-label="Theme family selector">
              <div>
                <p class="ely-public-eyebrow">Families</p>
                <h2 class="ely-public-section-title">Pick the identity first</h2>
              </div>
              <button
                v-for="theme in publicThemePacks"
                :key="theme.key"
                class="ely-story-theme-chooser-option"
                :class="{ 'is-selected': selectedThemeKey === theme.key }"
                :style="getPreviewStyle(theme, selectedPreviewMode)"
                type="button"
                @click="chooseTheme(theme.key)"
              >
                <span class="ely-story-theme-chooser-option__sample"></span>
                <span>
                  <strong>{{ theme.displayName }}</strong>
                  <small>{{ theme.personality }}</small>
                </span>
                <ElyPublicBadge :tone="selectedThemeKey === theme.key ? 'primary' : 'neutral'">
                  {{ theme.expressionLevel }}
                </ElyPublicBadge>
              </button>
            </aside>

            <section class="ely-story-theme-chooser-detail">
              <div class="ely-story-theme-chooser-detail__head">
                <div>
                  <p class="ely-public-eyebrow">Selected family</p>
                  <h2 class="ely-public-section-title">{{ selectedTheme?.displayName }}</h2>
                </div>
                <ElyPublicBadge tone="primary">{{ selectedTheme?.mood }}</ElyPublicBadge>
              </div>

              <div class="ely-story-theme-chooser-proof-grid">
                <ElyPublicStat
                  eyebrow="Expression"
                  :value="String(expressionValue)"
                  tone="accent"
                  trend="flat"
                >
                  Ornament budget score
                </ElyPublicStat>
                <ElyPublicStat
                  eyebrow="Mode proof"
                  :value="includeDarkProof ? '2/2' : '1/2'"
                  :tone="includeDarkProof ? 'success' : 'warning'"
                  trend="flat"
                >
                  Light and dark checked
                </ElyPublicStat>
              </div>

              <ElyPublicProgress
                label="Theme personality strength"
                tone="primary"
                :value="expressionValue"
              />

              <ElyPublicDivider label="How it should feel" tone="accent" />

              <div class="ely-story-theme-chooser-copy-grid">
                <div>
                  <span>Best for</span>
                  <p>{{ selectedTheme?.bestFor }}</p>
                </div>
                <div>
                  <span>Design cue</span>
                  <p>{{ selectedTheme?.designCue }}</p>
                </div>
              </div>

              <ElyPublicRadioGroup
                v-model="selectedMode"
                aria-label="Theme preview mode"
                :items="modeItems"
              />

              <ElyPublicSwitch
                v-model="includeDarkProof"
                label="Require dark mode proof"
                description="A theme can be expressive only if the paired dark mode keeps text and actions readable."
              />

              <ElyPublicAlert tone="info" title="Toolbar switching is deliberate">
                Use the apply link to update Storybook globals. The local selector lets reviewers compare personality
                first without losing the current toolbar context.
              </ElyPublicAlert>
            </section>
          </section>

          <section class="ely-story-theme-chooser-gallery" aria-label="Theme mode comparison">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">Mode pair proof</p>
                <h2 class="ely-public-section-title">The identity must survive light and dark</h2>
              </div>
              <p>
                A theme can be vivid or quiet, but it still needs a paired surface, action, and accent rhythm.
              </p>
            </div>
            <div class="ely-story-theme-chooser-mode-grid">
              <article
                v-for="theme in publicThemePacks"
                :key="theme.key"
                class="ely-story-theme-chooser-mode-pair"
              >
                <div>
                  <h3>{{ theme.displayName }}</h3>
                  <p>{{ theme.personality }}</p>
                  <small>{{ theme.bestFor }}</small>
                  <small>{{ theme.designCue }}</small>
                </div>
                <div class="ely-story-theme-chooser-mode-pair__previews">
                  <span :style="getPreviewStyle(theme, 'light')">light</span>
                  <span :style="getPreviewStyle(theme, 'dark')">dark</span>
                </div>
              </article>
            </div>
          </section>

          <section class="ely-story-theme-chooser-checks">
            <div>
              <p class="ely-public-eyebrow">Approval checks</p>
              <h2 class="ely-public-section-title">Personalization still needs discipline</h2>
            </div>
            <div class="ely-story-theme-chooser-check-list">
              <span v-for="check in personalityChecks" :key="check">{{ check }}</span>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
