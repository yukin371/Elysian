<script setup lang="ts">
import { computed } from "vue"

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

const selectedChangeLabel = computed(() =>
  props.selectedFile
    ? props.t(
        props.selectedFile.hasChanges
          ? "app.generatorPreview.meta.changedYes"
          : "app.generatorPreview.meta.changedNo",
      )
    : "-",
)

const selectedDiffStats = computed(
  () =>
    props.selectedFile?.diffStats ?? {
      addedLineCount: 0,
      changedLineCount: 0,
      removedLineCount: 0,
      unchangedLineCount: 0,
    },
)

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

    <div v-if="session" class="enterprise-panel-stack">
      <section class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sessionTitle") }}</p>
        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.generatorPreview.meta.sessionId") }}</span>
            <strong>{{ session.id }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.reportPath") }}</span>
            <strong>{{ session.reportPath }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.outputDir") }}</span>
            <strong>{{ session.outputDir }}</strong>
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
            <span>{{ t("app.generatorPreview.meta.reviewComment") }}</span>
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
            <span>{{ t("app.generatorPreview.meta.manifestPath") }}</span>
            <strong>{{ applyEvidence.manifestPath ?? "-" }}</strong>
          </div>
          <div>
            <span>{{ t("app.generatorPreview.meta.requestId") }}</span>
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
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlDraftTitle") }}</p>
            <pre class="generator-code-block"><code>{{ sqlProposal.sqlDraft }}</code></pre>
          </section>
          <section class="panel-section">
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleImportTitle") }}</p>
            <pre class="generator-code-block"><code>{{ sqlProposal.drizzleImportSnippet }}</code></pre>
          </section>
          <section class="panel-section">
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleSchemaTitle") }}</p>
            <pre class="generator-code-block"><code>{{ sqlProposal.drizzleSchemaSnippet }}</code></pre>
          </section>
        </div>
      </section>

      <section v-if="sqlProposalHandoff" class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlHandoffTitle") }}</p>
        <div class="generator-handoff-grid">
          <article>
            <strong>{{ t("app.generatorPreview.meta.schemaDir") }}</strong>
            <span>{{ sqlProposalHandoff.targetPaths.schemaDir }}</span>
          </article>
          <article>
            <strong>{{ t("app.generatorPreview.meta.drizzleDir") }}</strong>
            <span>{{ sqlProposalHandoff.targetPaths.drizzleDir }}</span>
          </article>
          <article>
            <strong>{{ t("app.generatorPreview.meta.schemaIndexFile") }}</strong>
            <span>{{ sqlProposalHandoff.targetPaths.schemaIndexFile }}</span>
          </article>
          <article>
            <strong>{{ t("app.generatorPreview.meta.persistenceIndexFile") }}</strong>
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
        <pre class="generator-code-block"><code>{{ sqlProposalHandoff.suggestedCommands.join("\n") }}</code></pre>
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
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sourceTitle") }}</p>
        <pre class="generator-code-block"><code>{{ selectedFile.contents }}</code></pre>
      </section>

      <section
        v-if="selectedFile.currentContents !== null"
        class="panel-section"
      >
        <p class="enterprise-subheading">{{ t("app.generatorPreview.currentSourceTitle") }}</p>
        <pre class="generator-code-block"><code>{{ selectedFile.currentContents }}</code></pre>
      </section>

      <section class="panel-section">
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlTitle") }}</p>
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

.generator-risk-card,
.generator-handoff-grid article {
  display: grid;
  gap: 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 0.95rem;
}

.generator-risk-card p,
.generator-handoff-steps {
  margin: 0;
}

.generator-risk-card strong {
  color: #9a3412;
}

.generator-risk-card p,
.generator-handoff-grid span,
.generator-handoff-steps {
  color: #475569;
}

.generator-handoff-steps {
  display: grid;
  gap: 0.5rem;
  padding-left: 1.2rem;
}
</style>
