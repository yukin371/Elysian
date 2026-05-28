import { describe, expect, test } from "bun:test"

import {
  getDirectionalSelectionIndex,
  getDirectionalTabIndex,
  getLoopedIndex,
  shouldCloseDialogForKey,
} from "./interaction"

describe("getLoopedIndex", () => {
  test("loops within the tab range", () => {
    expect(getLoopedIndex(0, 3, 1)).toBe(1)
    expect(getLoopedIndex(2, 3, 1)).toBe(0)
    expect(getLoopedIndex(0, 3, -1)).toBe(2)
  })
})

describe("getDirectionalSelectionIndex", () => {
  test("maps directional keys to the next tab index", () => {
    expect(getDirectionalSelectionIndex(0, 3, "ArrowRight")).toBe(1)
    expect(getDirectionalSelectionIndex(0, 3, "ArrowLeft")).toBe(2)
    expect(getDirectionalSelectionIndex(1, 3, "Home")).toBe(0)
    expect(getDirectionalSelectionIndex(1, 3, "End")).toBe(2)
    expect(getDirectionalSelectionIndex(1, 3, "Enter")).toBeNull()
  })
})

describe("getDirectionalTabIndex", () => {
  test("keeps the tabs helper aligned with selection controls", () => {
    expect(getDirectionalTabIndex(0, 3, "ArrowRight")).toBe(1)
    expect(getDirectionalTabIndex(1, 3, "Home")).toBe(0)
  })
})

describe("shouldCloseDialogForKey", () => {
  test("only treats escape as a close trigger", () => {
    expect(shouldCloseDialogForKey("Escape")).toBe(true)
    expect(shouldCloseDialogForKey("Enter")).toBe(false)
  })
})
