import { ref } from "vue"

import type { GeneratorPreviewTranslation } from "./types"
import {
  copyGeneratorPreviewText,
  copyGeneratorPreviewSuggestedCommands,
} from "./generator-preview-handoff"

export type GeneratorPreviewCopyFeedbackKey =
  | "absolutePath"
  | "actor"
  | "appliedAt"
  | "applyActor"
  | "commands"
  | "createdAt"
  | "currentSource"
  | "changed"
  | "exists"
  | "frontendTarget"
  | "drizzleDir"
  | "drizzleImport"
  | "drizzleSchema"
  | "generatedSource"
  | "lineCount"
  | "manifestPath"
  | "managed"
  | "mergeStrategy"
  | "outputDir"
  | "persistenceIndexFile"
  | "reportPath"
  | "requestId"
  | "reviewComment"
  | "reviewDecision"
  | "reviewActor"
  | "reviewedAt"
  | "schemaName"
  | "schemaDir"
  | "schemaIndexFile"
  | "sessionId"
  | "sourceValue"
  | "sourceType"
  | "status"
  | "templateReason"
  | "fileAction"
  | "sqlDraft"
  | "plannedReason"
  | "conflictStrategy"
  | "diffBlockCount"
  | "diffChangedCount"
  | "diffCreateCount"
  | "diffAddedLines"
  | "diffOverwriteCount"
  | "diffRemovedLines"
  | "diffSkipCount"
  | "diffUnchangedLines"
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
  actor: "idle",
  appliedAt: "idle",
  applyActor: "idle",
  commands: "idle",
  createdAt: "idle",
  currentSource: "idle",
  changed: "idle",
  exists: "idle",
  frontendTarget: "idle",
  drizzleDir: "idle",
  drizzleImport: "idle",
  drizzleSchema: "idle",
  generatedSource: "idle",
  lineCount: "idle",
  manifestPath: "idle",
  managed: "idle",
  mergeStrategy: "idle",
  outputDir: "idle",
  persistenceIndexFile: "idle",
  reportPath: "idle",
  requestId: "idle",
  reviewComment: "idle",
  reviewDecision: "idle",
  reviewActor: "idle",
  reviewedAt: "idle",
  schemaName: "idle",
  schemaDir: "idle",
  schemaIndexFile: "idle",
  sessionId: "idle",
  sourceValue: "idle",
  sourceType: "idle",
  status: "idle",
  templateReason: "idle",
  fileAction: "idle",
  sqlDraft: "idle",
  plannedReason: "idle",
  conflictStrategy: "idle",
  diffBlockCount: "idle",
  diffChangedCount: "idle",
  diffCreateCount: "idle",
  diffAddedLines: "idle",
  diffOverwriteCount: "idle",
  diffRemovedLines: "idle",
  diffSkipCount: "idle",
  diffUnchangedLines: "idle",
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
