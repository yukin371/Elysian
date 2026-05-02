import { describe, expect, test } from "bun:test"

import { createCsvExportFilename } from "./use-example-csv-exports"

describe("createCsvExportFilename", () => {
  test("formats filenames with local calendar date parts", () => {
    const filename = createCsvExportFilename("system-roles", {
      getDate: () => 3,
      getFullYear: () => 2026,
      getMonth: () => 4,
    })

    expect(filename).toBe("system-roles-2026-05-03.csv")
  })

  test("pads single-digit month and day parts", () => {
    const filename = createCsvExportFilename("system-files", {
      getDate: () => 7,
      getFullYear: () => 2026,
      getMonth: () => 0,
    })

    expect(filename).toBe("system-files-2026-01-07.csv")
  })
})
