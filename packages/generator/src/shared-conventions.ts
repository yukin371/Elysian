export type GenerationTargetPreset = "staging" | "module"
export type MergeStrategy = "replace-whole-file" | "preserve-existing"

export const DEFAULT_GENERATION_TARGET: GenerationTargetPreset = "staging"
export const DEFAULT_OUTPUT_DIR = "generated"
export const DEFAULT_MERGE_STRATEGY: MergeStrategy = "replace-whole-file"

export const listTargetPresets = (): GenerationTargetPreset[] => [
  "staging",
  "module",
]
