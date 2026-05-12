import { describe, expect, test } from "bun:test"

import {
  type WorkbenchShortcutOptions,
  createWorkbenchShortcutKeydownHandler,
} from "./use-workbench-shortcuts"

const createOptions = (
  overrides: Partial<WorkbenchShortcutOptions> = {},
): WorkbenchShortcutOptions => ({
  onSearch: () => {},
  onClosePanel: () => {},
  onNavigateUp: () => {},
  onNavigateDown: () => {},
  onCreate: () => {},
  ...overrides,
})

const createKeyboardEvent = (
  key: string,
  options: Partial<Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey">> = {},
) => {
  let prevented = false
  const event = {
    key,
    altKey: options.altKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    preventDefault: () => {
      prevented = true
    },
  } as KeyboardEvent

  return {
    event,
    isPrevented: () => prevented,
  }
}

describe("createWorkbenchShortcutKeydownHandler", () => {
  test("does not intercept edit and delete shortcuts without handlers", () => {
    const handleKeydown = createWorkbenchShortcutKeydownHandler(createOptions())

    const editEvent = createKeyboardEvent("Enter", { altKey: true })
    handleKeydown(editEvent.event)

    const deleteEvent = createKeyboardEvent("Delete")
    handleKeydown(deleteEvent.event)

    expect(editEvent.isPrevented()).toBe(false)
    expect(deleteEvent.isPrevented()).toBe(false)
  })

  test("intercepts edit and delete shortcuts when handlers are provided", () => {
    let editCalls = 0
    let deleteCalls = 0
    const handleKeydown = createWorkbenchShortcutKeydownHandler(
      createOptions({
        onEdit: () => {
          editCalls += 1
        },
        onDelete: () => {
          deleteCalls += 1
        },
      }),
    )

    const editEvent = createKeyboardEvent("Enter", { altKey: true })
    handleKeydown(editEvent.event)

    const deleteEvent = createKeyboardEvent("Delete")
    handleKeydown(deleteEvent.event)

    expect(editCalls).toBe(1)
    expect(deleteCalls).toBe(1)
    expect(editEvent.isPrevented()).toBe(true)
    expect(deleteEvent.isPrevented()).toBe(true)
  })
})
