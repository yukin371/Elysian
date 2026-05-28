import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import {
  PUBLIC_THEME_NAMES,
  RESOLVED_THEME_MODES,
  publicThemeSemanticSlots,
  publicThemeSemanticTokenDefinitions,
} from "../themes"

const themeCss = readFileSync(join(import.meta.dir, "theme.css"), "utf8")
const styleFiles = [
  "theme.css",
  "components-core.css",
  "components-interaction.css",
  "components-feedback.css",
  "preview-layout.css",
] as const
const styleCssByFile = Object.fromEntries(
  styleFiles.map((file) => [
    file,
    readFileSync(join(import.meta.dir, file), "utf8"),
  ]),
) as Record<(typeof styleFiles)[number], string>
const componentStyleFiles = styleFiles.filter((file) => file !== "theme.css")

const pairedContainerRoles = [
  "primary",
  "secondary",
  "accent",
  "tertiary",
  "info",
  "success",
  "warning",
  "danger",
] as const
const requiredThemeOverrideTokens = [
  "--color-bg",
  "--color-surface",
  "--color-surface-elevated",
  "--color-text",
  "--color-text-muted",
  "--color-line",
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--color-shadow",
] as const

const staticColorPattern =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bwhite\b(?!-)|\bblack\b/g
const radiusDeclarationPattern = /border-radius:\s*([^;]+);/g
const radiusPxPattern = /(-?\d*\.?\d+)px/g
const allowedRadiusValues = new Set([
  "var(--ely-public-radius-sm)",
  "var(--ely-public-radius-md)",
  "var(--ely-public-radius-lg)",
  "999px",
  "inherit",
])

function collectStaticColorUsages(css: string) {
  return [...css.matchAll(staticColorPattern)].map((match) => match[0])
}

function collectOversizedRadiusDeclarations(css: string) {
  const oversized: string[] = []

  for (const declaration of css.matchAll(radiusDeclarationPattern)) {
    const value = declaration[1] ?? ""
    const pxValues = [...value.matchAll(radiusPxPattern)].map((match) =>
      Number(match[1] ?? 0),
    )
    const hasOversizedRadius = pxValues.some((px) => px > 14 && px !== 999)

    if (hasOversizedRadius) {
      oversized.push(`border-radius: ${value};`)
    }
  }

  return oversized
}

function collectOffScaleRadiusDeclarations(css: string) {
  return [...css.matchAll(radiusDeclarationPattern)]
    .map((declaration) => (declaration[1] ?? "").trim())
    .filter((value) => !allowedRadiusValues.has(value))
}

function readThemeModeBlock(themeName: string, mode: string) {
  const selector = `html[data-preset="public-luxe"][data-theme="${themeName}"][data-resolved-mode="${mode}"]`
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const blockPattern = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`)
  const block = themeCss.match(blockPattern)?.[1]

  expect(block, `${selector} should exist`).toBeDefined()

  return block ?? ""
}

describe("public luxe theme CSS contract", () => {
  test("published theme semantic slots keep brand and status roles explicit", () => {
    for (const token of publicThemeSemanticSlots) {
      expect(themeCss).toContain(token)
    }
  })

  test("published semantic token definitions only reference exported theme slots", () => {
    const exportedSlots = new Set<string>(publicThemeSemanticSlots)

    for (const definition of publicThemeSemanticTokenDefinitions) {
      expect(exportedSlots.has(definition.cssVar)).toBe(true)

      if (definition.pair) {
        expect(exportedSlots.has(definition.pair)).toBe(true)
      }
    }
  })

  test.each([...PUBLIC_THEME_NAMES])(
    "%s defines explicit light and dark semantic overrides",
    (themeName) => {
      for (const mode of RESOLVED_THEME_MODES) {
        const block = readThemeModeBlock(themeName, mode)

        for (const token of requiredThemeOverrideTokens) {
          expect(
            block,
            `${themeName}.${mode} should define ${token}`,
          ).toContain(token)
        }
      }
    },
  )

  test.each([...pairedContainerRoles])(
    "%s container token has a paired on-container token",
    (role) => {
      expect(themeCss).toContain(`--color-${role}-container`)
      expect(themeCss).toContain(`--color-on-${role}-container`)
    },
  )

  test("components consume container-paired text tokens for accent and alert surfaces", () => {
    const coreCss = readFileSync(
      join(import.meta.dir, "components-core.css"),
      "utf8",
    )
    const feedbackCss = readFileSync(
      join(import.meta.dir, "components-feedback.css"),
      "utf8",
    )

    expect(coreCss).toContain("var(--color-on-accent-container)")
    expect(feedbackCss).toContain("var(--ely-public-alert-on-container)")
  })

  test("component and preview styles do not define static color values", () => {
    for (const file of componentStyleFiles) {
      expect(collectStaticColorUsages(styleCssByFile[file])).toEqual([])
    }
  })

  test("border radius stays within the public-luxe scale", () => {
    for (const file of styleFiles) {
      expect(collectOversizedRadiusDeclarations(styleCssByFile[file])).toEqual(
        [],
      )
      expect(collectOffScaleRadiusDeclarations(styleCssByFile[file])).toEqual(
        [],
      )
    }
  })

  test("foundation radius tokens stay restrained", () => {
    expect(themeCss).toContain("--ely-public-radius-sm: 6px;")
    expect(themeCss).toContain("--ely-public-radius-md: 10px;")
    expect(themeCss).toContain("--ely-public-radius-lg: 14px;")
  })
})
