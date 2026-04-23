import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export type GenerationTargetPreset = "staging"
export type MergeStrategy = "replace-whole-file"

export const DEFAULT_GENERATION_TARGET: GenerationTargetPreset = "staging"
export const DEFAULT_OUTPUT_DIR = "generated"
export const DEFAULT_MERGE_STRATEGY: MergeStrategy = "replace-whole-file"

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export const resolveRepositoryRoot = () =>
  resolve(currentDirectory, "..", "..", "..")

export const resolveTargetPresetOutputDir = (
  target: GenerationTargetPreset,
): string => {
  if (target === "staging") {
    return resolve(resolveRepositoryRoot(), DEFAULT_OUTPUT_DIR)
  }

  return resolve(resolveRepositoryRoot(), DEFAULT_OUTPUT_DIR)
}

export const listTargetPresets = (): GenerationTargetPreset[] => ["staging"]
