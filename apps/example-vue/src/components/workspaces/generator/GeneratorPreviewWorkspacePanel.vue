<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"

import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffLine,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewTranslation,
} from "./types"
import {
  copyGeneratorPreviewText,
  copyGeneratorPreviewSuggestedCommands,
  joinGeneratorPreviewSuggestedCommands,
} from "./generator-preview-handoff"

type CopyFeedbackKey =
  | "commands"
  | "sqlDraft"
  | "drizzleImport"
  | "drizzleSchema"
  | "absolutePath"
  | "reportPath"
  | "generatedSource"
  | "currentSource"
  | "sqlPreview"
  | "schemaDir"
  | "drizzleDir"
  | "schemaIndexFile"
  | "persistenceIndexFile"
  | "sessionId"
  | "manifestPath"
  | "requestId"
  | "reviewComment"

interface GeneratorPreviewWorkspacePanelProps {
  t: GeneratorPreviewTranslation
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedFile: GeneratorPreviewFileCard | null
  sqlPreview: GeneratorPreviewSqlPreview | null
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff | null
  session: GeneratorPreviewSessionRecord | null
  diffSummary: GeneratorPreviewDiffSummary | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
}

const props = defineProps<GeneratorPreviewWorkspacePanelProps>()
const copyFeedback = ref<Record<CopyFeedbackKey, "idle" | "copied" | "failed">>({
  absolutePath: "idle",
  commands: "idle",
  currentSource: "idle",
  drizzleImport: "idle",
  drizzleSchema: "idle",
  generatedSource: "idle",
  reportPath: "idle",
  persistenceIndexFile: "idle",
  manifestPath: "idle",
  requestId: "idle",
  reviewComment: "idle",
  schemaDir: "idle",
  schemaIndexFile: "idle",
  sessionId: "idle",
  sqlDraft: "idle",
  sqlPreview: "idle",
  drizzleDir: "idle",
})
const copyFeedbackTimers: Partial<
  Record<CopyFeedbackKey, ReturnType<typeof setTimeout>>
> = {}

const selectedSourceLineCount = computed(
  () => props.selectedFile?.lineCount ?? 0,
)

const selectedActionLabel = computed(() =>
  props.selectedFile
    ? props.t(
        `app.generatorPreview.actionLabel.${props.selectedFile.plannedAction}`,
      )
    : "-",
)

const sessionStatusLabel = computed(() =>
  props.session
    ? props.t(
        props.session.status === "applied"
          ? "app.generatorPreview.status.applied"
          : props.session.status === "ready"
            ? "app.generatorPreview.status.ready"
            : props.session.status === "rejected"
              ? "app.generatorPreview.status.rejected"
              : "app.generatorPreview.status.pendingReview",
      )
    : "-",
)

const sessionActorLabel = computed(() => {
  if (!props.session) {
    return "-"
  }

  return (
    props.session.actorDisplayName ??
    props.session.actorUsername ??
    props.session.actorUserId ??
    "-"
  )
})

const resolveEvidenceActorLabel = (
  evidence:
    | GeneratorPreviewReviewEvidence
    | GeneratorPreviewApplyEvidence
    | null,
) =>
  evidence?.actorDisplayName ??
  evidence?.actorUsername ??
  evidence?.actorUserId ??
  "-"

const sessionSourceTypeLabel = computed(() =>
  props.session?.sourceType === "registered-schema"
    ? props.t("app.generatorPreview.sourceType.registeredSchema")
    : "-",
)

const sessionConflictStrategyLabel = computed(() => {
  if (!props.session) {
    return "-"
  }

  return props.t(
    `app.generatorPreview.conflictStrategy.${props.session.conflictStrategy}`,
  )
})

const selectedChangeLabel = computed(() =>
  props.selectedFile
    ? props.t(
        props.selectedFile.hasChanges
          ? "app.generatorPreview.meta.changedYes"
          : "app.generatorPreview.meta.changedNo",
      )
    : "-",
)

const selectedExistsLabel = computed(() =>
  props.selectedFile
    ? props.t(
        props.selectedFile.exists
          ? "app.generatorPreview.meta.changedYes"
          : "app.generatorPreview.meta.changedNo",
      )
    : "-",
)

const selectedManagedLabel = computed(() => {
  if (
    !props.selectedFile ||
    props.selectedFile.isManaged === undefined ||
    props.selectedFile.isManaged === null
  ) {
    return "-"
  }

  return props.t(
    props.selectedFile.isManaged
      ? "app.generatorPreview.meta.changedYes"
      : "app.generatorPreview.meta.changedNo",
  )
})

const selectedDiffStats = computed(
  () =>
    props.selectedFile?.diffStats ?? {
      addedLineCount: 0,
      changedLineCount: 0,
      removedLineCount: 0,
      unchangedLineCount: 0,
    },
)

const suggestedCommandsText = computed(() =>
  props.sqlProposalHandoff
    ? joinGeneratorPreviewSuggestedCommands(
        props.sqlProposalHandoff.suggestedCommands,
      )
    : "",
)

const resolveCopyLabel = (
  key: CopyFeedbackKey,
  idleLabelKey:
    | "app.generatorPreview.action.copyCommands"
    | "app.generatorPreview.action.copySnippet",
) => {
  if (copyFeedback.value[key] === "copied") {
    return props.t(
      idleLabelKey === "app.generatorPreview.action.copyCommands"
        ? "app.generatorPreview.action.copyCommandsDone"
        : "app.generatorPreview.action.copySnippetDone",
    )
  }

  if (copyFeedback.value[key] === "failed") {
    return props.t(
      idleLabelKey === "app.generatorPreview.action.copyCommands"
        ? "app.generatorPreview.action.copyCommandsFailed"
        : "app.generatorPreview.action.copySnippetFailed",
    )
  }

  return props.t(idleLabelKey)
}

const scheduleCopyFeedbackReset = (key: CopyFeedbackKey) => {
  const currentTimer = copyFeedbackTimers[key]

  if (currentTimer !== undefined) {
    globalThis.clearTimeout(currentTimer)
  }

  copyFeedbackTimers[key] = globalThis.setTimeout(() => {
    copyFeedback.value[key] = "idle"
    delete copyFeedbackTimers[key]
  }, 2000)
}

const copySuggestedCommands = async () => {
  const commands = props.sqlProposalHandoff?.suggestedCommands ?? []
  const copied = await copyGeneratorPreviewSuggestedCommands(commands)
  copyFeedback.value.commands = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("commands")
}

const copySqlDraft = async () => {
  const copied = await copyGeneratorPreviewText(props.sqlProposal?.sqlDraft ?? "")
  copyFeedback.value.sqlDraft = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("sqlDraft")
}

const copyDrizzleImportSnippet = async () => {
  const copied = await copyGeneratorPreviewText(
    props.sqlProposal?.drizzleImportSnippet ?? "",
  )
  copyFeedback.value.drizzleImport = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("drizzleImport")
}

const copyDrizzleSchemaSnippet = async () => {
  const copied = await copyGeneratorPreviewText(
    props.sqlProposal?.drizzleSchemaSnippet ?? "",
  )
  copyFeedback.value.drizzleSchema = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("drizzleSchema")
}

const copySelectedAbsolutePath = async () => {
  const copied = await copyGeneratorPreviewText(props.selectedFile?.absolutePath ?? "")
  copyFeedback.value.absolutePath = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("absolutePath")
}

const copySessionReportPath = async () => {
  const copied = await copyGeneratorPreviewText(props.session?.reportPath ?? "")
  copyFeedback.value.reportPath = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("reportPath")
}

const copyGeneratedSource = async () => {
  const copied = await copyGeneratorPreviewText(props.selectedFile?.contents ?? "")
  copyFeedback.value.generatedSource = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("generatedSource")
}

const copyCurrentSource = async () => {
  const copied = await copyGeneratorPreviewText(
    props.selectedFile?.currentContents ?? "",
  )
  copyFeedback.value.currentSource = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("currentSource")
}

const copySqlPreview = async () => {
  const copied = await copyGeneratorPreviewText(props.sqlPreview?.contents ?? "")
  copyFeedback.value.sqlPreview = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("sqlPreview")
}

const copyHandoffTargetPath = async (
  key:
    | "schemaDir"
    | "drizzleDir"
    | "schemaIndexFile"
    | "persistenceIndexFile",
  path: string,
) => {
  const copied = await copyGeneratorPreviewText(path)
  copyFeedback.value[key] = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset(key)
}

const copySessionId = async () => {
  const copied = await copyGeneratorPreviewText(props.session?.id ?? "")
  copyFeedback.value.sessionId = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("sessionId")
}

const copyManifestPath = async () => {
  const copied = await copyGeneratorPreviewText(props.applyEvidence?.manifestPath ?? "")
  copyFeedback.value.manifestPath = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("manifestPath")
}

const copyRequestId = async () => {
  const copied = await copyGeneratorPreviewText(
    props.applyEvidence?.requestId ?? "",
  )
  copyFeedback.value.requestId = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("requestId")
}

const copyReviewComment = async () => {
  const copied = await copyGeneratorPreviewText(props.reviewEvidence?.comment ?? "")
  copyFeedback.value.reviewComment = copied ? "copied" : "failed"
  scheduleCopyFeedbackReset("reviewComment")
}

const resolveDiffLineClass = (line: GeneratorPreviewDiffLine) =>
  `generator-diff-line generator-diff-line-${line.kind}`

const resolveDiffLinePrefix = (line: GeneratorPreviewDiffLine) => {
  if (line.kind === "added") {
    return "+"
  }

  if (line.kind === "removed") {
    return "-"
  }

  return " "
}

onBeforeUnmount(() => {
  for (const timer of Object.values(copyFeedbackTimers)) {
    if (timer !== undefined) {
      globalThis.clearTimeout(timer)
    }
  }
})

</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.generatorPreview.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">
      {{
        selectedFile?.path ?? t("app.generatorPreview.detailEmptyTitle")
      }}
    </h3>
    <p class="enterprise-copy">
      {{
        selectedFile
          ? t("app.generatorPreview.detailDescription")
          : t("app.generatorPreview.detailEmptyDescription")
      }}
    </p>

    <div class="enterprise-metadata mt-5">
      <div>
        <span>{{ t("app.generatorPreview.meta.schemaName") }}</span>
        <strong>{{ selectedSchemaName }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.frontendTarget") }}</span>
        <strong>{{ selectedFrontendTarget }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.status") }}</span>
        <strong>{{ sessionStatusLabel }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.lines") }}</span>
        <strong>{{ selectedSourceLineCount }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.mergeStrategy") }}</span>
        <strong>{{ selectedFile?.mergeStrategy ?? "-" }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.fileAction") }}</span>
        <strong>{{ selectedActionLabel }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.changed") }}</span>
        <strong>{{ selectedChangeLabel }}</strong>
      </div>
    </div>

    <section v-if="selectedFile" class="panel-section mt-5">
      <div class="generator-code-toolbar">
        <p class="enterprise-subheading">
          {{ t("app.generatorPreview.fileDecisionTitle") }}
        </p>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="selectedFile.absolutePath.trim().length === 0"
          @click="copySelectedAbsolutePath"
        >
          {{
            resolveCopyLabel(
              "absolutePath",
              "app.generatorPreview.action.copySnippet",
            )
          }}
        </button>
      </div>
      <div class="enterprise-metadata">
        <div>
          <span>{{ t("app.generatorPreview.meta.absolutePath") }}</span>
          <strong>{{ selectedFile.absolutePath }}</strong>
        </div>
        <div>
          <span>{{ t("app.generatorPreview.meta.exists") }}</span>
          <strong>{{ selectedExistsLabel }}</strong>
        </div>
        <div>
          <span>{{ t("app.generatorPreview.meta.managed") }}</span>
          <strong>{{ selectedManagedLabel }}</strong>
        </div>
      </div>
      <div class="generator-explanation-grid">
        <article>
          <strong>{{ t("app.generatorPreview.meta.templateReason") }}</strong>
          <p>{{ selectedFile.reason }}</p>
        </article>
        <article>
          <strong>{{ t("app.generatorPreview.meta.plannedReason") }}</strong>
          <p>{{ selectedFile.plannedReason }}</p>
        </article>
      </div>
    </section>

    <div v-if="session" class="enterprise-panel-stack">
      <section class="panel-section">
        <div class="generator-code-toolbar">
          <p class="enterprise-subheading">{{ t("app.generatorPreview.sessionTitle") }}</p>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="session.reportPath.trim().length === 0"
            @click="copySessionReportPath"
          >
            {{
              resolveCopyLabel(
                "reportPath",
                "app.generatorPreview.action.copySnippet",
              )
            }}
          </button>
        </div>
        <div class="enterprise-metadata">
          <div>
            <div class="generator-metadata-label">
              <span>{{ t("app.generatorPreview.meta.sessionId") }}</span>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="session.id.trim().length === 0"
                @click="copySessionId"
              >
                {{
                  resolveCopyLabel(
                    "sessionId",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <strong>{{ session.id }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.createdAt") }}</span>
            <strong>{{ session.createdAt }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.actor") }}</span>
            <strong>{{ sessionActorLabel }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.reportPath") }}</span>
            <strong>{{ session.reportPath }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.outputDir") }}</span>
            <strong>{{ session.outputDir }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.sourceType") }}</span>
            <strong>{{ sessionSourceTypeLabel }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.sourceValue") }}</span>
            <strong>{{ session.sourceValue }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.conflictStrategy") }}</span>
            <strong>{{ sessionConflictStrategyLabel }}</strong>
          </div>
        </div>
      </section>

      <section v-if="diffSummary" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.diffTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.summary.changed") }}</span>
            <strong>{{ diffSummary.changedFileCount }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.summary.create") }}</span>
            <strong>{{ diffSummary.actionCounts.create }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.summary.overwrite") }}</span>
            <strong>{{ diffSummary.actionCounts.overwrite }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.summary.skip") }}</span>
            <strong>{{ diffSummary.actionCounts.skip }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.summary.block") }}</span>
            <strong>{{ diffSummary.actionCounts.block }}</strong>
          </div>
        </div>
      </section>

      <section v-if="selectedFile" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.fileDiffTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.meta.addedLines") }}</span>
            <strong>{{ selectedDiffStats.addedLineCount }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.removedLines") }}</span>
            <strong>{{ selectedDiffStats.removedLineCount }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.unchangedLines") }}</span>
            <strong>{{ selectedDiffStats.unchangedLineCount }}</strong>
          </div>
        </div>
      </section>

      <section v-if="reviewEvidence" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.reviewTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.meta.reviewedAt") }}</span>
            <strong>{{ reviewEvidence.reviewedAt ?? "-" }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.actor") }}</span>
            <strong>{{ resolveEvidenceActorLabel(reviewEvidence) }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.reviewDecision") }}</span>
            <strong>
              {{
                t(
                  reviewEvidence.decision === "approve"
                    ? "app.generatorPreview.action.approve"
                    : "app.generatorPreview.action.reject",
                )
              }}
            </strong>
          </div>
          <div>
            <div class="generator-metadata-label">
              <span>{{ t("app.generatorPreview.meta.reviewComment") }}</span>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="(reviewEvidence.comment ?? '').trim().length === 0"
                @click="copyReviewComment"
              >
                {{
                  resolveCopyLabel(
                    "reviewComment",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <strong>{{ reviewEvidence.comment ?? "-" }}</strong>
          </div>
        </div>
      </section>

      <section v-if="applyEvidence" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.applyTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.meta.appliedAt") }}</span>
            <strong>{{ applyEvidence.appliedAt ?? "-" }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.actor") }}</span>
            <strong>{{ resolveEvidenceActorLabel(applyEvidence) }}</strong>
          </div>
          <div>
            <div class="generator-metadata-label">
              <span>{{ t("app.generatorPreview.meta.manifestPath") }}</span>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="(applyEvidence.manifestPath ?? '').trim().length === 0"
                @click="copyManifestPath"
              >
                {{
                  resolveCopyLabel(
                    "manifestPath",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <strong>{{ applyEvidence.manifestPath ?? "-" }}</strong>
          </div>
          <div>
            <div class="generator-metadata-label">
              <span>{{ t("app.generatorPreview.meta.requestId") }}</span>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="(applyEvidence.requestId ?? '').trim().length === 0"
                @click="copyRequestId"
              >
                {{
                  resolveCopyLabel(
                    "requestId",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <strong>{{ applyEvidence.requestId ?? "-" }}</strong>
          </div>
        </div>
      </section>

      <section v-if="sqlProposalHandoff" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.meta.proposalStatus") }}</span>
            <strong>
              {{
                t(
                  sqlProposalHandoff.proposalStatus === "ready"
                    ? "app.generatorPreview.sqlProposal.status.ready"
                    : "app.generatorPreview.sqlProposal.status.unsupported",
                )
              }}
            </strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.canonicalOwner") }}</span>
            <strong>{{ sqlProposalHandoff.canonicalMigrationOwner }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.reviewMode") }}</span>
            <strong>{{ sqlProposalHandoff.reviewMode }}</strong>
          </div>
        </div>
        <div
          v-if="sqlProposalHandoff.unsupportedReason"
          class="enterprise-message enterprise-message-warning"
        >
          {{ sqlProposalHandoff.unsupportedReason }}
        </div>
        <div v-else-if="sqlProposal" class="enterprise-panel-stack">
          <div v-if="sqlProposal.risks.length > 0" class="generator-risk-list">
            <div
              v-for="risk in sqlProposal.risks"
              :key="risk.code"
              class="generator-risk-card"
            >
              <strong>{{ risk.code }}</strong>
              <p>{{ risk.message }}</p>
            </div>
          </div>
          <section class="panel-section">
            <div class="generator-code-toolbar">
              <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlDraftTitle") }}</p>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="sqlProposal.sqlDraft.trim().length === 0"
                @click="copySqlDraft"
              >
                {{
                  resolveCopyLabel(
                    "sqlDraft",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <pre class="generator-code-block"><code>{{ sqlProposal.sqlDraft }}</code></pre>
          </section>
          <section class="panel-section">
            <div class="generator-code-toolbar">
              <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleImportTitle") }}</p>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="sqlProposal.drizzleImportSnippet.trim().length === 0"
                @click="copyDrizzleImportSnippet"
              >
                {{
                  resolveCopyLabel(
                    "drizzleImport",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <pre class="generator-code-block"><code>{{ sqlProposal.drizzleImportSnippet }}</code></pre>
          </section>
          <section class="panel-section">
            <div class="generator-code-toolbar">
              <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleSchemaTitle") }}</p>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="sqlProposal.drizzleSchemaSnippet.trim().length === 0"
                @click="copyDrizzleSchemaSnippet"
              >
                {{
                  resolveCopyLabel(
                    "drizzleSchema",
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <pre class="generator-code-block"><code>{{ sqlProposal.drizzleSchemaSnippet }}</code></pre>
          </section>
        </div>
      </section>

      <section v-if="sqlProposalHandoff" class="panel-section">
        <div class="generator-handoff-toolbar">
          <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlHandoffTitle") }}</p>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="sqlProposalHandoff.suggestedCommands.length === 0"
            @click="copySuggestedCommands"
          >
            {{
              resolveCopyLabel(
                "commands",
                "app.generatorPreview.action.copyCommands",
              )
            }}
          </button>
        </div>
        <div class="generator-handoff-grid">
          <article>
            <div class="generator-handoff-card-header">
              <strong>{{ t("app.generatorPreview.meta.schemaDir") }}</strong>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="sqlProposalHandoff.targetPaths.schemaDir.trim().length === 0"
                @click="
                  copyHandoffTargetPath(
                    'schemaDir',
                    sqlProposalHandoff.targetPaths.schemaDir,
                  )
                "
              >
                {{
                  resolveCopyLabel(
                    'schemaDir',
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <span>{{ sqlProposalHandoff.targetPaths.schemaDir }}</span>
          </article>
          <article>
            <div class="generator-handoff-card-header">
              <strong>{{ t("app.generatorPreview.meta.drizzleDir") }}</strong>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="sqlProposalHandoff.targetPaths.drizzleDir.trim().length === 0"
                @click="
                  copyHandoffTargetPath(
                    'drizzleDir',
                    sqlProposalHandoff.targetPaths.drizzleDir,
                  )
                "
              >
                {{
                  resolveCopyLabel(
                    'drizzleDir',
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <span>{{ sqlProposalHandoff.targetPaths.drizzleDir }}</span>
          </article>
          <article>
            <div class="generator-handoff-card-header">
              <strong>{{ t("app.generatorPreview.meta.schemaIndexFile") }}</strong>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="
                  sqlProposalHandoff.targetPaths.schemaIndexFile.trim().length === 0
                "
                @click="
                  copyHandoffTargetPath(
                    'schemaIndexFile',
                    sqlProposalHandoff.targetPaths.schemaIndexFile,
                  )
                "
              >
                {{
                  resolveCopyLabel(
                    'schemaIndexFile',
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <span>{{ sqlProposalHandoff.targetPaths.schemaIndexFile }}</span>
          </article>
          <article>
            <div class="generator-handoff-card-header">
              <strong>{{ t("app.generatorPreview.meta.persistenceIndexFile") }}</strong>
              <button
                type="button"
                class="enterprise-button enterprise-button-ghost"
                :disabled="
                  sqlProposalHandoff.targetPaths.persistenceIndexFile.trim().length === 0
                "
                @click="
                  copyHandoffTargetPath(
                    'persistenceIndexFile',
                    sqlProposalHandoff.targetPaths.persistenceIndexFile,
                  )
                "
              >
                {{
                  resolveCopyLabel(
                    'persistenceIndexFile',
                    "app.generatorPreview.action.copySnippet",
                  )
                }}
              </button>
            </div>
            <span>{{ sqlProposalHandoff.targetPaths.persistenceIndexFile }}</span>
          </article>
        </div>
        <ol class="generator-handoff-steps">
          <li
            v-for="step in sqlProposalHandoff.steps"
            :key="step"
          >
            {{ step }}
          </li>
        </ol>
        <pre class="generator-code-block"><code>{{ suggestedCommandsText }}</code></pre>
      </section>
    </div>

    <div v-if="selectedFile" class="enterprise-panel-stack">
      <section class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.lineDiffTitle") }}</p>
        <div class="generator-diff-block">
          <div
            v-for="(line, index) in selectedFile.diffLines"
            :key="`${selectedFile.path}:${index}:${line.kind}`"
            :class="resolveDiffLineClass(line)"
          >
            <span class="generator-diff-line-number">
              {{ line.oldLineNumber ?? "" }}
            </span>
            <span class="generator-diff-line-number">
              {{ line.newLineNumber ?? "" }}
            </span>
            <span class="generator-diff-line-prefix">
              {{ resolveDiffLinePrefix(line) }}
            </span>
            <code class="generator-diff-line-value">{{ line.value }}</code>
          </div>
        </div>
      </section>

      <section class="panel-section">
        <div class="generator-code-toolbar">
          <p class="enterprise-subheading">{{ t("app.generatorPreview.sourceTitle") }}</p>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="selectedFile.contents.trim().length === 0"
            @click="copyGeneratedSource"
          >
            {{
              resolveCopyLabel(
                "generatedSource",
                "app.generatorPreview.action.copySnippet",
              )
            }}
          </button>
        </div>
        <pre class="generator-code-block"><code>{{ selectedFile.contents }}</code></pre>
      </section>

      <section
        v-if="selectedFile.currentContents !== null"
        class="panel-section"
      >
        <div class="generator-code-toolbar">
          <p class="enterprise-subheading">{{ t("app.generatorPreview.currentSourceTitle") }}</p>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="selectedFile.currentContents.trim().length === 0"
            @click="copyCurrentSource"
          >
            {{
              resolveCopyLabel(
                "currentSource",
                "app.generatorPreview.action.copySnippet",
              )
            }}
          </button>
        </div>
        <pre class="generator-code-block"><code>{{ selectedFile.currentContents }}</code></pre>
      </section>

      <section class="panel-section">
        <div class="generator-code-toolbar">
          <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlTitle") }}</p>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(sqlPreview?.contents ?? '').trim().length === 0"
            @click="copySqlPreview"
          >
            {{
              resolveCopyLabel(
                "sqlPreview",
                "app.generatorPreview.action.copySnippet",
              )
            }}
          </button>
        </div>
        <pre class="generator-code-block"><code>{{ sqlPreview?.contents ?? "" }}</code></pre>
      </section>
    </div>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.generatorPreview.detailEmptyDescription") }}
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-diff-block {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0b1120;
}

.generator-diff-line {
  display: grid;
  grid-template-columns: 56px 56px 20px minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
  padding: 0.35rem 0.75rem;
  font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.78rem;
  line-height: 1.7;
}

.generator-diff-line-added {
  background: rgba(21, 128, 61, 0.16);
}

.generator-diff-line-removed {
  background: rgba(185, 28, 28, 0.14);
}

.generator-diff-line-unchanged {
  color: rgba(226, 232, 240, 0.72);
}

.generator-diff-line-number,
.generator-diff-line-prefix {
  color: rgba(148, 163, 184, 0.9);
  font-variant-numeric: tabular-nums;
}

.generator-diff-line-value {
  color: #dbeafe;
  white-space: pre-wrap;
  word-break: break-word;
}

.generator-code-block {
  overflow: auto;
  margin: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0f172a;
  padding: 1rem;
  color: #dbeafe;
  font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  white-space: pre;
}

.generator-risk-list,
.generator-handoff-grid {
  display: grid;
  gap: 0.75rem;
}

.generator-code-toolbar,
.generator-handoff-toolbar,
.generator-handoff-card-header,
.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.generator-risk-card,
.generator-handoff-grid article,
.generator-explanation-grid article {
  display: grid;
  gap: 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 0.95rem;
}

.generator-risk-card p,
.generator-handoff-steps,
.generator-explanation-grid p {
  margin: 0;
}

.generator-risk-card strong {
  color: #9a3412;
}

.generator-risk-card p,
.generator-handoff-grid span,
.generator-handoff-steps,
.generator-explanation-grid p {
  color: #475569;
}

.generator-explanation-grid {
  display: grid;
  gap: 0.75rem;
}

.generator-handoff-steps {
  display: grid;
  gap: 0.5rem;
  padding-left: 1.2rem;
}
</style>
