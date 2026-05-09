import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { basename, join, resolve } from "node:path"

interface CommandResult {
  code: number
  stderr: string
  stdout: string
}

const REPO_ROOT = resolve(import.meta.dir, "..")

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const runGeneratorCli = async (args: string[]): Promise<CommandResult> => {
  const process = Bun.spawn(
    ["bun", "--filter", "@elysian/generator", "generate", ...args],
    {
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const code = await process.exited
  const stdout = await new Response(process.stdout).text()
  const stderr = await new Response(process.stderr).text()

  return {
    code,
    stdout,
    stderr,
  }
}

const run = async () => {
  const moduleName = `smoke-product-${Date.now()}`
  const schemaFilePath = join(REPO_ROOT, `${moduleName}.module-schema.json`)
  const outputDir = await mkdtemp(
    join(tmpdir(), "elysian-generator-simplified-"),
  )

  try {
    const initResult = await runGeneratorCli(["--init", moduleName])
    assert(initResult.code === 0, `--init failed:\n${initResult.stderr}`)

    const scaffold = JSON.parse(await readFile(schemaFilePath, "utf8")) as {
      fields: Array<Record<string, unknown>>
      name: string
    }
    assert(
      scaffold.name === moduleName,
      `Expected scaffold name ${moduleName}, got ${scaffold.name}`,
    )

    scaffold.fields.push({
      key: "ownerName",
      kind: "string",
      required: true,
      searchable: true,
    })
    await writeFile(schemaFilePath, JSON.stringify(scaffold, null, 2), "utf8")

    const schemaFileArg = `./${basename(schemaFilePath)}`
    const previewResult = await runGeneratorCli([
      "--schema-file",
      schemaFileArg,
      "--out",
      outputDir,
      "--frontend",
      "vue",
      "--preview",
    ])
    assert(
      previewResult.code === 0,
      `preview failed:\n${previewResult.stdout}\n${previewResult.stderr}`,
    )
    assert(
      previewResult.stdout.includes("[generator] preview create"),
      "Expected preview output to contain create actions.",
    )

    const generateResult = await runGeneratorCli([
      "--schema-file",
      schemaFileArg,
      "--out",
      outputDir,
      "--frontend",
      "vue",
    ])
    assert(
      generateResult.code === 0,
      `generate failed:\n${generateResult.stdout}\n${generateResult.stderr}`,
    )

    const expectedFiles = [
      `${moduleName}.schema.ts`,
      `${moduleName}.repository.ts`,
      `${moduleName}.service.ts`,
      `${moduleName}.routes.ts`,
      `${moduleName}.frontend.ts`,
      `${moduleName}.page.vue`,
      `${moduleName}-panel.vue`,
      `${moduleName}-workspace.ts`,
    ]
    const moduleDir = join(outputDir, "modules", moduleName)

    for (const fileName of expectedFiles) {
      await stat(join(moduleDir, fileName))
    }

    const generatedSchema = await readFile(
      join(moduleDir, `${moduleName}.schema.ts`),
      "utf8",
    )
    assert(
      generatedSchema.includes("ownerName"),
      "Expected generated schema artifact to include the edited ownerName field.",
    )

    console.log("[e2e-generator-simplified-smoke] passed")
  } finally {
    await rm(schemaFilePath, { force: true })
    await rm(outputDir, { force: true, recursive: true })
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-simplified-smoke] failed: ${message}`)
  process.exitCode = 1
})
