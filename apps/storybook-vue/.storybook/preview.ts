import {
  DEFAULT_PUBLIC_THEME,
  DEFAULT_THEME_MODE,
  PUBLIC_PRESET_KEY,
  applyPublicThemeSelection,
  publicThemePacks,
  resolvePublicThemeSelection,
} from "@elysian/ui-public-vue"
import type { Decorator, Preview } from "@storybook/vue3-vite"
import { publicShowcaseEntries } from "../src/public-luxe-showcase"

import "../src/storybook-foundations-action.css"
import "../src/storybook-foundations-accessibility.css"
import "../src/storybook-foundations.css"
import "../src/storybook-foundations-components.css"
import "../src/storybook-foundations-data.css"
import "../src/storybook-foundations-layout.css"
import "../src/storybook-foundations-material.css"
import "../src/storybook-foundations-media.css"
import "../src/storybook-foundations-navigation.css"
import "../src/storybook-foundations-pattern.css"
import "../src/storybook-foundations-radius-color.css"
import "../src/storybook-foundations-review.css"
import "../src/storybook-foundations-theme-chooser.css"
import "../src/storybook-foundations-theme-customization.css"
import "../src/storybook-foundations-theme-family-dossier.css"
import "../src/storybook-foundations-theme-role-matrix.css"
import "../src/storybook-foundations-theme-selection-playbook.css"
import "../src/storybook-foundations-theme-system.css"
import "../src/storybook-foundations-token-pairing-ledger.css"
import "../src/storybook-foundations-typography.css"
import "../src/storybook-component-acceptance-board.css"
import "../src/storybook-component-api-reference.css"
import "../src/storybook-component-composition-matrix.css"
import "../src/storybook-component-decision-workshop.css"
import "../src/storybook-component-failure-gallery.css"
import "../src/storybook-component-handoff-dossier.css"
import "../src/storybook-component-index.css"
import "../src/storybook-component-mobile-density-review.css"
import "../src/storybook-component-operability-board.css"
import "../src/storybook-component-scenario-atlas.css"
import "../src/storybook-component-state-matrix.css"
import "../src/storybook-component-theme-specimen-wall.css"
import "../src/storybook-component-variant-matrix.css"
import "../src/storybook-pattern-evidence-atlas.css"
import "../src/storybook-pattern-flat-pages.css"
import "../src/storybook-pattern-index.css"
import "../src/storybook-patterns.css"
import "../src/storybook-showcase.css"
import "../src/storybook-showcase-hub.css"

const withPublicTheme: Decorator = (story, context) => {
  let activeSelection = resolvePublicThemeSelection({
    preset: PUBLIC_PRESET_KEY,
    theme: String(context.globals.theme ?? DEFAULT_PUBLIC_THEME),
    mode: String(context.globals.mode ?? DEFAULT_THEME_MODE),
  })

  if (typeof document !== "undefined") {
    activeSelection = applyPublicThemeSelection(document.documentElement, {
      preset: PUBLIC_PRESET_KEY,
      theme: String(context.globals.theme ?? DEFAULT_PUBLIC_THEME),
      mode: String(context.globals.mode ?? DEFAULT_THEME_MODE),
    })
  }

  const renderedStory = story()
  const activeTheme =
    publicThemePacks.find((theme) => theme.key === activeSelection.theme) ??
    publicThemePacks[0]
  const createGlobalHref = (input: {
    mode?: string
    theme?: string
  }) => {
    if (typeof window === "undefined") {
      return "#"
    }

    const url = new URL(window.location.href)
    url.searchParams.set(
      "globals",
      `theme:${input.theme ?? activeSelection.theme};mode:${input.mode ?? activeSelection.mode}`,
    )

    return `${url.pathname}${url.search}${url.hash}`
  }
  const createStoryHref = (storyId: string) => {
    if (typeof window === "undefined") {
      return "#"
    }

    const url = new URL(window.location.href)
    url.searchParams.set("id", storyId)
    url.searchParams.set("viewMode", "story")
    url.searchParams.set(
      "globals",
      `theme:${activeSelection.theme};mode:${activeSelection.mode}`,
    )

    return `${url.pathname}${url.search}${url.hash}`
  }
  const themeOptions = publicThemePacks.map((theme) => ({
    current: theme.key === activeSelection.theme,
    href: createGlobalHref({ theme: theme.key }),
    key: theme.key,
    label: theme.displayName,
  }))
  const modeOptions = ["system", "light", "dark"].map((mode) => ({
    current: mode === activeSelection.mode,
    href: createGlobalHref({ mode }),
    key: mode,
    label: mode,
  }))
  const reviewEntryKeys = [
    "showcase-hub",
    "foundations-index",
    "theme-chooser",
    "component-index",
    "component-theme-specimen-wall",
    "component-operability-board",
    "component-failure-gallery",
    "pattern-index",
  ]
  const reviewEntries = reviewEntryKeys
    .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
    .filter((entry) => entry !== undefined)
    .map((entry) => ({
      current: entry.storyId === context.id,
      href: createStoryHref(entry.storyId),
      key: entry.key,
      label: entry.title,
      stat: entry.stat,
    }))

  return {
    components: {
      RenderedStory: renderedStory,
    },
    setup() {
      return {
        activeMode: activeSelection.mode,
        activeResolvedMode: activeSelection.resolvedMode,
        activeTheme,
        modeOptions,
        reviewEntries,
        themeOptions,
      }
    },
    template: `
      <div class="ely-public-preview-root">
        <aside class="ely-story-active-theme-strip" aria-label="Active public theme">
          <div class="ely-story-active-theme-strip__summary">
            <span class="ely-story-active-theme-strip__label">Active theme</span>
            <strong>{{ activeTheme.displayName }}</strong>
            <span>{{ activeMode }} -> {{ activeResolvedMode }}</span>
            <em>{{ activeTheme.accentLabel }}</em>
          </div>
          <nav class="ely-story-active-theme-strip__switches" aria-label="Theme quick switch">
            <a
              v-for="theme in themeOptions"
              :key="theme.key"
              :aria-current="theme.current ? 'true' : undefined"
              :href="theme.href"
            >
              {{ theme.label }}
            </a>
          </nav>
          <nav class="ely-story-active-theme-strip__switches" aria-label="Mode quick switch">
            <a
              v-for="mode in modeOptions"
              :key="mode.key"
              :aria-current="mode.current ? 'true' : undefined"
              :href="mode.href"
            >
              {{ mode.label }}
            </a>
          </nav>
          <details class="ely-story-active-theme-strip__map">
            <summary>Review map</summary>
            <nav aria-label="Story review map">
              <a
                v-for="entry in reviewEntries"
                :key="entry.key"
                :aria-current="entry.current ? 'page' : undefined"
                :href="entry.href"
              >
                <span>{{ entry.label }}</span>
                <em>{{ entry.stat }}</em>
              </a>
            </nav>
          </details>
        </aside>
        <RenderedStory />
      </div>
    `,
  }
}

const preview: Preview = {
  decorators: [withPublicTheme],
  globalTypes: {
    preset: {
      description: "Component preset",
      toolbar: {
        icon: "component",
        items: [PUBLIC_PRESET_KEY],
        dynamicTitle: true,
      },
    },
    theme: {
      description: "Theme family",
      toolbar: {
        icon: "paintbrush",
        items: publicThemePacks.map((theme) => ({
          title: theme.displayName,
          value: theme.key,
        })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Theme mode",
      toolbar: {
        icon: "mirror",
        items: [
          { title: "System", value: "system" },
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    preset: PUBLIC_PRESET_KEY,
    theme: DEFAULT_PUBLIC_THEME,
    mode: DEFAULT_THEME_MODE,
  },
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: true,
    },
    options: {
      storySort: {
        order: [
          "Public Luxe",
          ["Foundations", "Components", "Patterns", "Showcase"],
        ],
      },
    },
  },
}

export default preview
