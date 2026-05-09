import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  DEFAULT_OUTPUT_DIR,
  type GenerationTargetPreset,
  listTargetPresets,
} from "./shared-conventions"

export {
  DEFAULT_GENERATION_TARGET,
  DEFAULT_MERGE_STRATEGY,
  DEFAULT_OUTPUT_DIR,
  listTargetPresets,
  type GenerationTargetPreset,
  type MergeStrategy,
} from "./shared-conventions"

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export const resolveRepositoryRoot = () =>
  resolve(currentDirectory, "..", "..", "..")

export const resolveTargetPresetOutputDir = (
  target: GenerationTargetPreset,
): string => {
  if (target === "module") {
    return resolve(resolveRepositoryRoot(), "apps", "server", "src", "modules")
  }

  return resolve(resolveRepositoryRoot(), DEFAULT_OUTPUT_DIR)
}
