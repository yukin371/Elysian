import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import {
  publicComponentDocs,
  renderPublicComponentDocsIndex,
  renderPublicComponentMarkdown,
} from "@elysian/ui-public-vue"

const componentDocsDir = join(
  import.meta.dir,
  "..",
  "packages",
  "ui-public-vue",
  "docs",
  "components",
)

await mkdir(componentDocsDir, { recursive: true })

const indexPath = join(componentDocsDir, "README.md")
await writeFile(
  indexPath,
  renderPublicComponentDocsIndex(publicComponentDocs),
  "utf8",
)
console.log(`[ui-public-docs] written ${indexPath}`)

for (const [componentName, doc] of Object.entries(publicComponentDocs)) {
  const markdown = renderPublicComponentMarkdown(doc)
  const filePath = join(componentDocsDir, `${componentName}.md`)

  await writeFile(filePath, markdown, "utf8")
  console.log(`[ui-public-docs] written ${filePath}`)
}
