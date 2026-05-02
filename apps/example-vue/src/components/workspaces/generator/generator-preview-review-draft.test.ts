import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  clearGeneratorPreviewReviewDraft,
  loadGeneratorPreviewReviewDraft,
  persistGeneratorPreviewReviewDraft,
} from "./generator-preview-review-draft"

const originalLocalStorage = globalThis.localStorage

const createLocalStorage = () => {
  const entries = new Map<string, string>()

  return {
    clear: () => {
      entries.clear()
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
    get length() {
      return entries.size
    },
  } satisfies Storage
}

describe("generator preview review draft storage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createLocalStorage(),
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
      writable: true,
    })
  })

  test("persists and restores review draft by session id", () => {
    persistGeneratorPreviewReviewDraft("preview-session-1", "ready for staging")

    expect(loadGeneratorPreviewReviewDraft("preview-session-1")).toBe(
      "ready for staging",
    )
  })

  test("clears stored draft when value becomes empty", () => {
    persistGeneratorPreviewReviewDraft("preview-session-1", "ready for staging")
    persistGeneratorPreviewReviewDraft("preview-session-1", "   ")

    expect(loadGeneratorPreviewReviewDraft("preview-session-1")).toBeNull()
  })

  test("clears stored draft explicitly", () => {
    persistGeneratorPreviewReviewDraft("preview-session-1", "ready for staging")
    clearGeneratorPreviewReviewDraft("preview-session-1")

    expect(loadGeneratorPreviewReviewDraft("preview-session-1")).toBeNull()
  })

  test("does not throw when draft storage write fails", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        ...createLocalStorage(),
        setItem: () => {
          throw new Error("quota exceeded")
        },
      },
      writable: true,
    })

    expect(() => {
      persistGeneratorPreviewReviewDraft(
        "preview-session-1",
        "ready for staging",
      )
    }).not.toThrow()
  })

  test("does not throw when draft storage is blocked", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("storage blocked")
      },
    })

    expect(loadGeneratorPreviewReviewDraft("preview-session-1")).toBeNull()
    expect(() => {
      persistGeneratorPreviewReviewDraft(
        "preview-session-1",
        "ready for staging",
      )
    }).not.toThrow()
    expect(() => clearGeneratorPreviewReviewDraft("preview-session-1")).not.toThrow()
  })
})
