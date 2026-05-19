<script setup lang="ts">
import { computed } from "vue"

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
  confirmationEvidenceFacts: Array<{ label: string; value: string }>
}

const props = defineProps<GeneratorPreviewWorkspaceSessionPanelProps>()

const translateOrFallback = (key: string, fallback: string) => {
  const translated = props.t(key)

  return translated === key ? fallback : translated
}

const blockerReasonMessages = computed(() =>
  props.session.blockerReasons.map((reason) =>
    translateOrFallback(
      `app.generatorPreview.blockerReason.${reason.code}.${reason.stage}`,
      reason.message,
    ),
  ),
)

const recoveryStatusLabel = computed(() => {
  if (props.session.recoveryStatus === "rebuilt-from-corrupt") {
    return translateOrFallback(
      "app.generatorPreview.recoveryStatus.rebuiltFromCorrupt",
      props.session.recoveryStatus,
    )
  }

  if (props.session.recoveryStatus === "rebuilt-from-missing") {
    return translateOrFallback(
      "app.generatorPreview.recoveryStatus.rebuiltFromMissing",
      props.session.recoveryStatus,
    )
  }

  return translateOrFallback(
    "app.generatorPreview.recoveryStatus.none",
    props.session.recoveryStatus,
  )
})

const applyEvidenceFacts = computed(() => {
  if (!props.applyEvidence) {
    return []
  }

  return [
    {
      label: props.t("app.generatorPreview.meta.appliedAt"),
      value: props.applyEvidence.appliedAt ?? "-",
    },
    {
      label: props.t("app.generatorPreview.meta.actor"),
      value:
        props.applyEvidence.actorDisplayName ??
        props.applyEvidence.actorUsername ??
        props.applyEvidence.actorUserId ??
        "-",
    },
    {
      label: props.t("app.generatorPreview.meta.requestId"),
      value: props.applyEvidence.requestId ?? "-",
    },
    {
      label: props.t("app.generatorPreview.meta.reportPath"),
      value: props.applyEvidence.reportPath || "-",
    },
    {
      label: props.t("app.generatorPreview.meta.manifestPath"),
      value: props.applyEvidence.manifestPath ?? "-",
    },
  ]
})
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
    <div
      v-if="applyEvidenceFacts.length > 0"
      class="generator-facts generator-facts-stacked"
    >
      <span
        v-for="fact in applyEvidenceFacts"
        :key="fact.label"
      >
        {{ fact.label }} · {{ fact.value }}
      </span>
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
    <div
      v-if="confirmationEvidenceFacts.length > 0"
      class="generator-facts generator-facts-stacked"
    >
      <span
        v-for="fact in confirmationEvidenceFacts"
        :key="fact.label"
      >
        {{ fact.label }} · {{ fact.value }}
      </span>
    </div>
    <p
      v-if="session.recoveryStatus !== 'none'"
      class="enterprise-message enterprise-message-info"
    >
      {{
        t("app.generatorPreview.message.recoveryStatusInline", {
          value: recoveryStatusLabel,
        })
      }}
    </p>
    <div
      v-if="blockerReasonMessages.length > 0"
      class="generator-facts"
    >
      <span
        v-for="reason in blockerReasonMessages"
        :key="reason"
      >
        {{ reason }}
      </span>
    </div>
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

.generator-facts-stacked {
  display: grid;
  gap: 0.35rem;
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
