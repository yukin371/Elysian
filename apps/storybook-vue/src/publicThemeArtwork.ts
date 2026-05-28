import {
  DEFAULT_PUBLIC_THEME,
  type PublicThemeName,
  type PublicThemePack,
  type ResolvedThemeMode,
  publicThemePacks,
} from "@elysian/ui-public-vue"
import { computed, onMounted, onUnmounted, ref } from "vue"

type PublicArtworkVariant = "gallery" | "landscape" | "portrait"
type PublicThemePreview = PublicThemePack["preview"]["dark"]

const DEFAULT_RESOLVED_MODE: ResolvedThemeMode = "light"

const getActiveTheme = () => {
  if (typeof document === "undefined") {
    return DEFAULT_PUBLIC_THEME
  }

  const theme = document.documentElement.getAttribute("data-theme")
  return publicThemePacks.some((pack) => pack.key === theme)
    ? (theme as PublicThemeName)
    : DEFAULT_PUBLIC_THEME
}

const getActiveResolvedMode = () => {
  if (typeof document === "undefined") {
    return DEFAULT_RESOLVED_MODE
  }

  return document.documentElement.getAttribute("data-resolved-mode") === "dark"
    ? "dark"
    : "light"
}

const getThemePreview = (
  themeName: PublicThemeName,
  mode: ResolvedThemeMode,
) => {
  const pack =
    publicThemePacks.find((themePack) => themePack.key === themeName) ??
    publicThemePacks[0]

  if (!pack) {
    throw new Error("publicThemePacks must include at least one theme pack")
  }

  return mode === "dark" ? pack.preview.dark : pack.preview
}

type PublicThemePreviewPack = Omit<PublicThemePack, "preview"> & {
  preview: PublicThemePreview
  previewMode: ResolvedThemeMode
}

const getResolvedThemePacks = (
  mode: ResolvedThemeMode,
): PublicThemePreviewPack[] =>
  publicThemePacks.map((pack) => ({
    ...pack,
    preview: mode === "dark" ? { ...pack.preview.dark } : { ...pack.preview },
    previewMode: mode,
  }))

const svgDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const buildLandscapeArtwork = (
  themeName: PublicThemeName,
  mode: ResolvedThemeMode,
) => {
  const preview = getThemePreview(themeName, mode)
  const veilOpacity = mode === "dark" ? "0.28" : "0.68"
  const moonOpacity = mode === "dark" ? "0.92" : "0.82"
  const fieldOpacity = mode === "dark" ? "0.2" : "0.58"

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${themeName} ${mode} artwork">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${preview.heroFrom}" />
          <stop offset="58%" stop-color="${preview.surface}" />
          <stop offset="100%" stop-color="${preview.heroTo}" />
        </linearGradient>
        <linearGradient id="veil" x1="8%" x2="92%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${preview.surface}" stop-opacity="${veilOpacity}" />
          <stop offset="100%" stop-color="${preview.accent}" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="30" fill="url(#bg)" />
      <path d="M0 720C151 640 272 628 405 670C535 711 646 800 812 760C962 724 1065 612 1200 638V900H0Z" fill="${preview.surface}" fill-opacity="${fieldOpacity}" />
      <circle cx="910" cy="210" r="112" fill="${preview.accent}" fill-opacity="${moonOpacity}" />
      <rect x="126" y="150" width="948" height="578" rx="30" fill="url(#veil)" stroke="${preview.surface}" stroke-opacity="0.72" stroke-width="8" />
      <path d="M214 594L440 386L604 530L760 332L986 594" fill="none" stroke="${preview.heroTo}" stroke-opacity="0.74" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M182 258H416M784 650H1010" fill="none" stroke="${preview.accent}" stroke-opacity="0.64" stroke-width="10" stroke-linecap="round" />
    </svg>
  `)
}

const buildPortraitArtwork = (
  themeName: PublicThemeName,
  mode: ResolvedThemeMode,
) => {
  const preview = getThemePreview(themeName, mode)
  const fabricOpacity = mode === "dark" ? "0.32" : "0.74"
  const figureOpacity = mode === "dark" ? "0.86" : "0.92"

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" role="img" aria-label="${themeName} ${mode} portrait artwork">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${preview.surface}" />
          <stop offset="52%" stop-color="${preview.heroFrom}" />
          <stop offset="100%" stop-color="${preview.heroTo}" />
        </linearGradient>
        <linearGradient id="silk" x1="20%" x2="80%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${preview.accent}" stop-opacity="0.72" />
          <stop offset="100%" stop-color="${preview.heroTo}" stop-opacity="0.28" />
        </linearGradient>
      </defs>
      <rect width="900" height="1200" rx="28" fill="url(#bg)" />
      <ellipse cx="450" cy="1056" rx="312" ry="84" fill="${preview.surface}" fill-opacity="${fabricOpacity}" />
      <path d="M192 906C258 716 340 606 450 562C560 606 642 716 708 906" fill="${preview.surface}" fill-opacity="${figureOpacity}" />
      <circle cx="450" cy="420" r="164" fill="${preview.accent}" fill-opacity="0.82" />
      <path d="M300 414C346 308 410 262 506 254C600 276 654 340 674 430C620 398 568 382 510 374C424 390 358 420 300 414Z" fill="url(#silk)" />
      <path d="M298 914C350 812 406 756 450 740C494 756 550 812 602 914" fill="${preview.heroTo}" fill-opacity="0.38" />
      <path d="M358 538C392 574 422 590 450 590C482 590 514 574 550 538" fill="none" stroke="${preview.heroTo}" stroke-opacity="0.78" stroke-width="18" stroke-linecap="round" />
      <path d="M202 222C306 166 438 150 570 178C640 193 700 218 752 252" fill="none" stroke="${preview.accent}" stroke-opacity="0.58" stroke-width="9" stroke-linecap="round" />
    </svg>
  `)
}

export const createPublicThemeArtwork = (
  variant: PublicArtworkVariant,
  themeName: PublicThemeName = DEFAULT_PUBLIC_THEME,
  mode: ResolvedThemeMode = DEFAULT_RESOLVED_MODE,
) => {
  if (variant === "portrait") {
    return buildPortraitArtwork(themeName, mode)
  }

  return buildLandscapeArtwork(themeName, mode)
}

export const usePublicThemeArtwork = (variant: PublicArtworkVariant) => {
  const themeName = ref<PublicThemeName>(getActiveTheme())
  const mode = ref<ResolvedThemeMode>(getActiveResolvedMode())
  let observer: MutationObserver | undefined

  const syncTheme = () => {
    themeName.value = getActiveTheme()
    mode.value = getActiveResolvedMode()
  }

  onMounted(() => {
    syncTheme()

    observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme", "data-resolved-mode"],
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return computed(() =>
    createPublicThemeArtwork(variant, themeName.value, mode.value),
  )
}

export const useResolvedPublicThemePacks = () => {
  const mode = ref<ResolvedThemeMode>(getActiveResolvedMode())
  let observer: MutationObserver | undefined

  const syncMode = () => {
    mode.value = getActiveResolvedMode()
  }

  onMounted(() => {
    syncMode()

    observer = new MutationObserver(syncMode)
    observer.observe(document.documentElement, {
      attributeFilter: ["data-resolved-mode"],
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return computed(() => getResolvedThemePacks(mode.value))
}
