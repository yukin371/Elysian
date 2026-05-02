import { ref } from "vue"

import type { GeneratorPreviewTranslation } from "./types"
import {
  copyGeneratorPreviewText,
  copyGeneratorPreviewSuggestedCommands,
} from "./generator-preview-handoff"

export type GeneratorPreviewCopyFeedbackKey =
  | "absolutePath"
  | "commands"
  | "currentSource"
  | "drizzleDir"
  | "drizzleImport"
  | "drizzleSchema"
  | "generatedSource"
  | "manifestPath"
  | "outputDir"
  | "persistenceIndexFile"
  | "reportPath"
  | "requestId"
  | "reviewComment"
  | "schemaDir"
  | "schemaIndexFile"
  | "sessionId"
  | "sourceValue"
  | "sqlDraft"
  | "sqlPreview"

type GeneratorPreviewCopyFeedbackStatus = "idle" | "copied" | "failed"

type GeneratorPreviewCopyIdleLabelKey =
  | "app.generatorPreview.action.copyCommands"
  | "app.generatorPreview.action.copySnippet"

const createInitialCopyFeedback = (): Record<
  GeneratorPreviewCopyFeedbackKey,
  GeneratorPreviewCopyFeedbackStatus
> => ({
  absolutePath: "idle",
  commands: "idle",
  currentSource: "idle",
  drizzleDir: "idle",
  drizzleImport: "idle",
  drizzleSchema: "idle",
  generatedSource: "idle",
  manifestPath: "idle",
  outputDir: "idle",
  persistenceIndexFile: "idle",
  reportPath: "idle",
  requestId: "idle",
  reviewComment: "idle",
  schemaDir: "idle",
  schemaIndexFile: "idle",
  sessionId: "idle",
  sourceValue: "idle",
  sqlDraft: "idle",
  sqlPreview: "idle",
})

export const useGeneratorPreviewCopyFeedback = (
  t: GeneratorPreviewTranslation,
) => {
  const copyFeedback = ref(createInitialCopyFeedback())
  const copyFeedbackTimers: Partial<
    Record<GeneratorPreviewCopyFeedbackKey, ReturnType<typeof setTimeout>>
  > = {}

  const resolveCopyLabel = (
    key: GeneratorPreviewCopyFeedbackKey,
    idleLabelKey: GeneratorPreviewCopyIdleLabelKey,
  ) => {
    if (copyFeedback.value[key] === "copied") {
      return t(
        idleLabelKey === "app.generatorPreview.action.copyCommands"
          ? "app.generatorPreview.action.copyCommandsDone"
          : "app.generatorPreview.action.copySnippetDone",
      )
    }

    if (copyFeedback.value[key] === "failed") {
      return t(
        idleLabelKey === "app.generatorPreview.action.copyCommands"
          ? "app.generatorPreview.action.copyCommandsFailed"
          : "app.generatorPreview.action.copySnippetFailed",
      )
    }

    return t(idleLabelKey)
  }

  const scheduleCopyFeedbackReset = (key: GeneratorPreviewCopyFeedbackKey) => {
    const currentTimer = copyFeedbackTimers[key]

    if (currentTimer !== undefined) {
      globalThis.clearTimeout(currentTimer)
    }

    copyFeedbackTimers[key] = globalThis.setTimeout(() => {
      copyFeedback.value[key] = "idle"
      delete copyFeedbackTimers[key]
    }, 2000)
  }

  const copyTextByKey = async (
    key: GeneratorPreviewCopyFeedbackKey,
    value: string,
  ) => {
    const copied = await copyGeneratorPreviewText(value)
    copyFeedback.value[key] = copied ? "copied" : "failed"
    scheduleCopyFeedbackReset(key)
  }

  const copySuggestedCommandsByKey = async (commands: string[]) => {
    const copied = await copyGeneratorPreviewSuggestedCommands(commands)
    copyFeedback.value.commands = copied ? "copied" : "failed"
    scheduleCopyFeedbackReset("commands")
  }

  const disposeCopyFeedbackTimers = () => {
    for (const timer of Object.values(copyFeedbackTimers)) {
      if (timer !== undefined) {
        globalThis.clearTimeout(timer)
      }
    }
  }

  return {
    copySuggestedCommandsByKey,
    copyTextByKey,
    disposeCopyFeedbackTimers,
    resolveCopyLabel,
  }
}
