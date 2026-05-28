import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { publicComponentDocs } from "./docs"
import {
  renderPublicComponentDocsIndex,
  renderPublicComponentMarkdown,
} from "./markdown"

const componentDocsDir = join(import.meta.dir, "..", "..", "docs", "components")

describe("public component markdown docs", () => {
  test("generated component index stays in sync with component metadata", () => {
    const indexPath = join(componentDocsDir, "README.md")
    const markdown = readFileSync(indexPath, "utf8")

    expect(markdown).toBe(renderPublicComponentDocsIndex(publicComponentDocs))
  })

  test.each(
    Object.entries(publicComponentDocs).map(([componentName, doc]) => [
      componentName,
      doc,
    ]),
  )(
    "%s generated markdown stays in sync with component metadata",
    (componentName, doc) => {
      const generatedPath = join(componentDocsDir, `${componentName}.md`)
      const markdown = readFileSync(generatedPath, "utf8")

      expect(markdown).toBe(renderPublicComponentMarkdown(doc))
    },
  )
})
