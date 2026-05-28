import { describe, expect, test } from "bun:test"

import { PUBLIC_THEME_NAMES, publicThemePacks } from "./themes"

const previewSlots = ["heroFrom", "heroTo", "accent", "surface"] as const

describe("public theme packs", () => {
  test("documents every launch theme exactly once", () => {
    expect(publicThemePacks.map((themePack) => themePack.key)).toEqual([
      ...PUBLIC_THEME_NAMES,
    ])
  })

  test("keeps light and dark preview metadata paired", () => {
    for (const themePack of publicThemePacks) {
      expect(themePack.personality).toBeTruthy()
      expect(themePack.bestFor).toBeTruthy()
      expect(themePack.designCue).toBeTruthy()
      expect(themePack.expressionLevel).toBeTruthy()

      for (const slot of previewSlots) {
        expect(themePack.preview[slot], `${themePack.key}.${slot}`).toMatch(
          /^#[0-9a-fA-F]{6}$/,
        )
        expect(
          themePack.preview.dark[slot],
          `${themePack.key}.dark.${slot}`,
        ).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(themePack.preview.dark[slot]).not.toBe(themePack.preview[slot])
      }
    }
  })
})
