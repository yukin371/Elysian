import {
  DEFAULT_PUBLIC_THEME,
  DEFAULT_THEME_MODE,
  PUBLIC_PRESET_KEY,
  type PublicThemeName,
  type ResolvedThemeMode,
  type ThemeMode,
  isPublicThemeName,
  isThemeMode,
} from "./themes"

export const PUBLIC_THEME_ATTRIBUTE_NAMES = {
  preset: "data-preset",
  theme: "data-theme",
  mode: "data-mode",
  resolvedMode: "data-resolved-mode",
} as const

export interface PublicThemeSelectionInput {
  mode?: string | null
  preset?: string | null
  theme?: string | null
}

export interface PublicThemeSelection {
  mode: ThemeMode
  preset: typeof PUBLIC_PRESET_KEY
  resolvedMode: ResolvedThemeMode
  theme: PublicThemeName
}

export interface PublicThemeRuntimeOptions {
  preferredDark?: boolean
}

type ThemeAttributeTarget = Pick<Element, "getAttribute" | "setAttribute">

const resolvePreset = (preset?: string | null): typeof PUBLIC_PRESET_KEY =>
  preset === PUBLIC_PRESET_KEY ? PUBLIC_PRESET_KEY : PUBLIC_PRESET_KEY

const resolveTheme = (theme?: string | null): PublicThemeName =>
  isPublicThemeName(theme) ? theme : DEFAULT_PUBLIC_THEME

const resolveMode = (mode?: string | null): ThemeMode =>
  isThemeMode(mode) ? mode : DEFAULT_THEME_MODE

export const getSystemPreferredDark = () => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const resolvePublicThemeMode = (
  mode: ThemeMode,
  options: PublicThemeRuntimeOptions = {},
): ResolvedThemeMode => {
  if (mode === "light" || mode === "dark") {
    return mode
  }

  return (options.preferredDark ?? getSystemPreferredDark()) ? "dark" : "light"
}

export const resolvePublicThemeSelection = (
  input: PublicThemeSelectionInput = {},
  options: PublicThemeRuntimeOptions = {},
): PublicThemeSelection => {
  const mode = resolveMode(input.mode)

  return {
    preset: resolvePreset(input.preset),
    theme: resolveTheme(input.theme),
    mode,
    resolvedMode: resolvePublicThemeMode(mode, options),
  }
}

export const applyPublicThemeSelection = (
  target: ThemeAttributeTarget,
  input: PublicThemeSelectionInput = {},
  options: PublicThemeRuntimeOptions = {},
) => {
  const selection = resolvePublicThemeSelection(input, options)

  target.setAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.preset, selection.preset)
  target.setAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.theme, selection.theme)
  target.setAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.mode, selection.mode)
  target.setAttribute(
    PUBLIC_THEME_ATTRIBUTE_NAMES.resolvedMode,
    selection.resolvedMode,
  )

  return selection
}

export const readPublicThemeSelection = (
  target: ThemeAttributeTarget,
  options: PublicThemeRuntimeOptions = {},
) =>
  resolvePublicThemeSelection(
    {
      preset: target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.preset),
      theme: target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.theme),
      mode: target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.mode),
    },
    options,
  )
