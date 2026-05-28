import type { UiPresetManifest } from "@elysian/ui-core"

export const PUBLIC_PRESET_KEY = "public-luxe"

export const PUBLIC_THEME_NAMES = [
  "elysia-default",
  "rose-nocturne",
  "azure-aria",
  "enterprise-calm",
] as const

export type PublicThemeName = (typeof PUBLIC_THEME_NAMES)[number]

export const PUBLIC_THEME_MODES = ["light", "dark", "system"] as const
export type ThemeMode = (typeof PUBLIC_THEME_MODES)[number]

export const RESOLVED_THEME_MODES = ["light", "dark"] as const
export type ResolvedThemeMode = (typeof RESOLVED_THEME_MODES)[number]

export interface PublicThemePack {
  key: PublicThemeName
  displayName: string
  description: string
  mood: string
  accentLabel: string
  personality: string
  bestFor: string
  designCue: string
  expressionLevel: string
  preview: {
    dark: {
      accent: string
      heroFrom: string
      heroTo: string
      surface: string
    }
    heroFrom: string
    heroTo: string
    accent: string
    surface: string
  }
}

export type PublicThemeSemanticTokenGroup =
  | "surface"
  | "content"
  | "emphasis"
  | "status"
  | "material"

export interface PublicThemeSemanticTokenDefinition {
  group: PublicThemeSemanticTokenGroup
  label: string
  cssVar: string
  role: string
  pair?: string
}

export const DEFAULT_PUBLIC_THEME: PublicThemeName = "elysia-default"
export const DEFAULT_THEME_MODE: ThemeMode = "system"

export const publicThemePacks: PublicThemePack[] = [
  {
    key: "elysia-default",
    displayName: "Elysia Bloom",
    description:
      "A lively character-inspired theme with petal-rose action, bright iris-blue clarity, pearl stage surfaces, and champagne sparkle.",
    mood: "Lively, luminous, crystalline",
    accentLabel: "Bloom stage",
    personality: "Bloom heroine theme",
    bestFor:
      "Brand entry, creator center, member-facing home, playful onboarding, and anime-leaning C-side flows.",
    designCue:
      "Petal rose leads action, iris blue keeps clarity, champagne glints only at ceremony points.",
    expressionLevel: "Vivid",
    preview: {
      dark: {
        heroFrom: "#25172d",
        heroTo: "#ff91bf",
        accent: "#86c9ff",
        surface: "#302038",
      },
      heroFrom: "#fff0f8",
      heroTo: "#ff9cc2",
      accent: "#79c6ff",
      surface: "#fff9fd",
    },
  },
  {
    key: "rose-nocturne",
    displayName: "Rose Nocturne",
    description:
      "A more ornate banquet theme with rose lacquer, wine-dark depth, satin surfaces, and soft candle-gold accents.",
    mood: "Ornate, romantic, nocturne",
    accentLabel: "Rose banquet",
    personality: "Rose banquet theme",
    bestFor:
      "Seasonal campaigns, editorial moments, reward ceremonies, and intimate content pages.",
    designCue:
      "Rose lacquer and candle gold create drama while neutral surfaces keep reading stable.",
    expressionLevel: "Ornate",
    preview: {
      dark: {
        heroFrom: "#2c1720",
        heroTo: "#d98293",
        accent: "#e6c16f",
        surface: "#3a202b",
      },
      heroFrom: "#f6e3e8",
      heroTo: "#8a4457",
      accent: "#bd7890",
      surface: "#fff6f7",
    },
  },
  {
    key: "azure-aria",
    displayName: "Azure Aria",
    description:
      "A clear and simpler aria theme with sky-blue structure, silver mist surfaces, and a small mint glint.",
    mood: "Clear, light, minimal",
    accentLabel: "Azure clarity",
    personality: "Azure clear theme",
    bestFor:
      "Information-heavy public workspaces, comparison views, settings, and calm creation flows.",
    designCue:
      "Sky blue carries structure, silver mist lowers noise, mint remains a small glint.",
    expressionLevel: "Minimal",
    preview: {
      dark: {
        heroFrom: "#122735",
        heroTo: "#78c8de",
        accent: "#a9e1d3",
        surface: "#1c3442",
      },
      heroFrom: "#e4f5fb",
      heroTo: "#5f97cb",
      accent: "#8bcfc3",
      surface: "#f4fbff",
    },
  },
  {
    key: "enterprise-calm",
    displayName: "Enterprise Calm",
    description:
      "A restrained bridge theme for users who want public components with less ornament and more neutrality.",
    mood: "Balanced, dependable, understated",
    accentLabel: "Slate blue",
    personality: "Quiet bridge theme",
    bestFor:
      "Account-adjacent, billing-adjacent, enterprise-adjacent, or lower-ornament public surfaces.",
    designCue:
      "Slate blue and quiet neutrals reduce ceremony without switching to enterprise components.",
    expressionLevel: "Calm",
    preview: {
      dark: {
        heroFrom: "#202833",
        heroTo: "#92a4bd",
        accent: "#c2aa72",
        surface: "#2a3442",
      },
      heroFrom: "#e4eaf3",
      heroTo: "#6c7f9e",
      accent: "#9aaac2",
      surface: "#f6f8fb",
    },
  },
]

export const publicThemeSemanticSlots = [
  "--color-bg",
  "--color-bg-subtle",
  "--color-surface",
  "--color-surface-elevated",
  "--color-surface-overlay",
  "--color-text",
  "--color-text-muted",
  "--color-text-soft",
  "--color-line",
  "--color-line-strong",
  "--color-primary",
  "--color-on-primary",
  "--color-primary-container",
  "--color-on-primary-container",
  "--color-secondary",
  "--color-on-secondary",
  "--color-secondary-container",
  "--color-on-secondary-container",
  "--color-accent",
  "--color-on-accent",
  "--color-accent-container",
  "--color-on-accent-container",
  "--color-success",
  "--color-success-container",
  "--color-on-success-container",
  "--color-warning",
  "--color-warning-container",
  "--color-on-warning-container",
  "--color-danger",
  "--color-on-danger",
  "--color-danger-container",
  "--color-on-danger-container",
  "--color-info",
  "--color-info-container",
  "--color-on-info-container",
  "--color-material-sheen",
  "--color-material-sheen-strong",
  "--color-material-line-glint",
] as const

export const publicThemeSemanticTokenDefinitions: readonly PublicThemeSemanticTokenDefinition[] =
  [
    {
      group: "surface",
      label: "Page background",
      cssVar: "--color-bg",
      role: "Outer atmosphere and full-page grounding.",
    },
    {
      group: "surface",
      label: "Subtle background",
      cssVar: "--color-bg-subtle",
      role: "Quiet section background or low-emphasis contrast.",
    },
    {
      group: "surface",
      label: "Surface",
      cssVar: "--color-surface",
      role: "Default card, field, and component plane.",
    },
    {
      group: "surface",
      label: "Elevated surface",
      cssVar: "--color-surface-elevated",
      role: "Focused local panels and higher-emphasis containers.",
    },
    {
      group: "content",
      label: "Text",
      cssVar: "--color-text",
      role: "Primary readable copy and headings.",
    },
    {
      group: "content",
      label: "Muted text",
      cssVar: "--color-text-muted",
      role: "Helper copy, secondary facts, and quieter labels.",
    },
    {
      group: "content",
      label: "Line",
      cssVar: "--color-line",
      role: "Borders, dividers, and low-emphasis structure.",
    },
    {
      group: "emphasis",
      label: "Primary",
      pair: "--color-on-primary",
      cssVar: "--color-primary",
      role: "Main action, focus path, selected state, and key progress.",
    },
    {
      group: "emphasis",
      label: "Primary container",
      pair: "--color-on-primary-container",
      cssVar: "--color-primary-container",
      role: "Low-emphasis primary surface with guaranteed paired text.",
    },
    {
      group: "emphasis",
      label: "Secondary",
      pair: "--color-on-secondary",
      cssVar: "--color-secondary",
      role: "Ceremonial trim and supporting hierarchy.",
    },
    {
      group: "emphasis",
      label: "Accent",
      pair: "--color-on-accent",
      cssVar: "--color-accent",
      role: "Rare memory point, editorial glint, and restrained special emphasis.",
    },
    {
      group: "status",
      label: "Success",
      pair: "--color-on-success-container",
      cssVar: "--color-success-container",
      role: "Positive completion or safe confirmation container.",
    },
    {
      group: "status",
      label: "Warning",
      pair: "--color-on-warning-container",
      cssVar: "--color-warning-container",
      role: "Guarded attention or recoverable risk container.",
    },
    {
      group: "status",
      label: "Danger",
      pair: "--color-on-danger-container",
      cssVar: "--color-danger-container",
      role: "Error, destructive risk, or blocked state container.",
    },
    {
      group: "status",
      label: "Info",
      pair: "--color-on-info-container",
      cssVar: "--color-info-container",
      role: "Neutral status explanation or informational feedback container.",
    },
    {
      group: "material",
      label: "Material sheen",
      cssVar: "--color-material-sheen",
      role: "Controlled crystal or silk overlay for local surfaces.",
    },
  ]

export const vuePublicPresetManifest: UiPresetManifest = {
  key: PUBLIC_PRESET_KEY,
  framework: "vue",
  kind: "custom",
  status: "prototype",
  displayName: "Public Luxe",
  description:
    "Official Elysian public-facing preset for brand-led, themeable Vue experiences.",
}

export const isPublicThemeName = (
  value: string | null | undefined,
): value is PublicThemeName =>
  Boolean(value) && PUBLIC_THEME_NAMES.includes(value as PublicThemeName)

export const isThemeMode = (
  value: string | null | undefined,
): value is ThemeMode =>
  Boolean(value) && PUBLIC_THEME_MODES.includes(value as ThemeMode)
