import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

import { describe, expect, it } from "bun:test"

interface DrizzleJournal {
  entries: Array<{
    idx: number
    tag: string
  }>
}

const drizzleDir = join(import.meta.dir, "..", "drizzle")
const journalPath = join(drizzleDir, "meta", "_journal.json")

describe("drizzle migration journal", () => {
  it("covers every sql migration file in order", async () => {
    const sqlFiles = (await readdir(drizzleDir))
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => name.replace(/\.sql$/, ""))
    const journal = JSON.parse(
      await readFile(journalPath, "utf8"),
    ) as DrizzleJournal
    const journalTags = journal.entries
      .sort((left, right) => left.idx - right.idx)
      .map((entry) => entry.tag)

    expect(journalTags).toEqual(sqlFiles)
  })
})
