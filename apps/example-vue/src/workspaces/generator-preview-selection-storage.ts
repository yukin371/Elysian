import type { FrontendTarget } from "../lib/generator-preview-browser"
import type { GeneratorPreviewConflictStrategy } from "../lib/platform-api"

const GENERATOR_PREVIEW_SELECTION_STORAGE_KEY =
  "elysian.example-vue.generator-preview.selection"

export type GeneratorPreviewStoredSelection = {
  conflictStrategy: GeneratorPreviewConflictStrategy
  frontendTarget: FrontendTarget
  inputMode: "registered-schema" | "manual-schema-json"
  schemaName: string
  sessionId: string | null
}

const resolveGeneratorPreviewSelectionStorage = () => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const createGeneratorPreviewSelectionCacheKey = (
  schemaName: string,
  frontendTarget: FrontendTarget,
  conflictStrategy: GeneratorPreviewConflictStrategy,
  inputMode: GeneratorPreviewStoredSelection["inputMode"],
) => `${schemaName}::${frontendTarget}::${conflictStrategy}::${inputMode}`

const isGeneratorPreviewConflictStrategy = (
  value: unknown,
): value is GeneratorPreviewConflictStrategy =>
  value === "skip" ||
  value === "overwrite" ||
  value === "overwrite-generated-only" ||
  value === "fail"

const isFrontendTarget = (value: unknown): value is FrontendTarget =>
  value === "vue" || value === "react"

export const loadStoredGeneratorPreviewSelection = (
  availableSchemaNames: readonly string[],
): GeneratorPreviewStoredSelection | null => {
  const storage = resolveGeneratorPreviewSelectionStorage()

  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(GENERATOR_PREVIEW_SELECTION_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<GeneratorPreviewStoredSelection>

    if (
      typeof parsed.schemaName !== "string" ||
      !availableSchemaNames.includes(parsed.schemaName) ||
      !isFrontendTarget(parsed.frontendTarget) ||
      !isGeneratorPreviewConflictStrategy(parsed.conflictStrategy) ||
      ((parsed.inputMode ?? "registered-schema") !== "registered-schema" &&
        parsed.inputMode !== "manual-schema-json")
    ) {
      return null
    }

    return {
      conflictStrategy: parsed.conflictStrategy,
      inputMode: parsed.inputMode ?? "registered-schema",
      frontendTarget: parsed.frontendTarget,
      schemaName: parsed.schemaName,
      sessionId: typeof parsed.sessionId === "string" ? parsed.sessionId : null,
    }
  } catch {
    return null
  }
}

export const persistGeneratorPreviewSelection = (
  selection: GeneratorPreviewStoredSelection,
) => {
  const storage = resolveGeneratorPreviewSelectionStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(
      GENERATOR_PREVIEW_SELECTION_STORAGE_KEY,
      JSON.stringify(selection),
    )
  } catch {
    // Selection persistence is best-effort; workspace state remains in memory.
  }
}
