<script setup lang="ts">
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSessionPanelProps {
  t: GeneratorPreviewTranslation
  session: GeneratorPreviewSessionRecord
  diffSummary: GeneratorPreviewDiffSummary | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  sessionActorLabel: string
  sessionSourceTypeLabel: string
  sessionConflictStrategyLabel: string
  sessionConfirmedAtLabel: string
  sessionConfirmedByLabel: string
  sessionConfirmationNote: string | null
  confirmationEvidenceSummary: string | null
}

defineProps<GeneratorPreviewWorkspaceSessionPanelProps>()
</script>

<template>
  <section class="panel-section">
    <code class="generator-path">{{ session.reportPath }}</code>
    <div class="generator-facts">
      <span>{{ session.id }}</span>
      <span>{{ sessionActorLabel }}</span>
      <span>{{ session.createdAt }}</span>
      <span>{{ sessionSourceTypeLabel }}</span>
      <span>{{ sessionConflictStrategyLabel }}</span>
      <span v-if="session.confirmedAt">{{ sessionConfirmedAtLabel }}</span>
      <span v-if="session.confirmedAt">{{ sessionConfirmedByLabel }}</span>
    </div>
    <div v-if="diffSummary" class="generator-facts">
      <span>
        {{ t("app.generatorPreview.summary.changed") }}
        {{ diffSummary.changedFileCount }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.create") }}
        {{ diffSummary.actionCounts.create }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.overwrite") }}
        {{ diffSummary.actionCounts.overwrite }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.skip") }}
        {{ diffSummary.actionCounts.skip }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.block") }}
        {{ diffSummary.actionCounts.block }}
      </span>
    </div>
    <div v-if="reviewEvidence" class="generator-facts">
      <span>{{ reviewEvidence.reviewedAt ?? "-" }}</span>
      <span>{{ reviewEvidence.actorDisplayName ?? reviewEvidence.actorUsername ?? reviewEvidence.actorUserId ?? "-" }}</span>
      <span>{{ reviewEvidence.decision === "approve" ? t("app.generatorPreview.action.approve") : t("app.generatorPreview.action.reject") }}</span>
    </div>
    <p v-if="reviewEvidence?.comment" class="generator-note">
      {{ reviewEvidence.comment }}
    </p>
    <div v-if="applyEvidence" class="generator-facts">
      <span>{{ applyEvidence.appliedAt ?? "-" }}</span>
      <span>{{ applyEvidence.actorDisplayName ?? applyEvidence.actorUsername ?? applyEvidence.actorUserId ?? "-" }}</span>
      <span>{{ applyEvidence.requestId ?? "-" }}</span>
    </div>
    <p
      v-if="sessionConfirmationNote"
      class="enterprise-message enterprise-message-info"
    >
      {{ sessionConfirmationNote }}
    </p>
    <p
      v-if="confirmationEvidenceSummary"
      class="enterprise-message enterprise-message-info"
    >
      {{ confirmationEvidenceSummary }}
    </p>
    <p class="generator-source-value">{{ session.sourceValue }}</p>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}

.generator-path {
  overflow-x: auto;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}

.generator-source-value {
  margin: 0;
  color: #0f172a;
  word-break: break-word;
  white-space: pre-wrap;
}

.generator-note {
  margin: 0;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
