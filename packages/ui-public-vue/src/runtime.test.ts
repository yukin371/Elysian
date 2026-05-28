import { describe, expect, test } from "bun:test"

import {
  PUBLIC_THEME_ATTRIBUTE_NAMES,
  applyPublicThemeSelection,
  readPublicThemeSelection,
  resolvePublicThemeMode,
} from "./runtime"

class FakeThemeTarget {
  #attributes = new Map<string, string>()

  getAttribute(name: string) {
    return this.#attributes.get(name) ?? null
  }

  setAttribute(name: string, value: string) {
    this.#attributes.set(name, value)
  }
}

describe("resolvePublicThemeMode", () => {
  test("resolves system mode with preferred dark override", () => {
    expect(resolvePublicThemeMode("system", { preferredDark: false })).toBe(
      "light",
    )
    expect(resolvePublicThemeMode("system", { preferredDark: true })).toBe(
      "dark",
    )
  })
})

describe("applyPublicThemeSelection", () => {
  test("applies normalized theme attributes", () => {
    const target = new FakeThemeTarget()
    const selection = applyPublicThemeSelection(
      target,
      {
        theme: "rose-nocturne",
        mode: "system",
      },
      { preferredDark: true },
    )

    expect(selection.resolvedMode).toBe("dark")
    expect(target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.preset)).toBe(
      "public-luxe",
    )
    expect(target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.theme)).toBe(
      "rose-nocturne",
    )
    expect(target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.mode)).toBe(
      "system",
    )
    expect(target.getAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.resolvedMode)).toBe(
      "dark",
    )
  })
})

describe("readPublicThemeSelection", () => {
  test("falls back to defaults when attributes are invalid", () => {
    const target = new FakeThemeTarget()
    target.setAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.theme, "broken-theme")
    target.setAttribute(PUBLIC_THEME_ATTRIBUTE_NAMES.mode, "broken-mode")

    expect(readPublicThemeSelection(target, { preferredDark: false })).toEqual({
      preset: "public-luxe",
      theme: "elysia-default",
      mode: "system",
      resolvedMode: "light",
    })
  })
})
