<script setup lang="ts">
import { computed } from "vue"

import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspacePanelProps {
  t: GeneratorPreviewTranslation
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedFile: GeneratorPreviewFileCard | null
  sqlPreview: GeneratorPreviewSqlPreview | null
  session: GeneratorPreviewSessionRecord | null
  diffSummary: GeneratorPreviewDiffSummary | null
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
          : "app.generatorPreview.status.ready",
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

    <div v-if="session" class="panel-stack">
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
    </div>

    <div v-if="selectedFile" class="panel-stack">
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
.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-metadata span {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.75rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.56);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.panel-stack {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
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
</style>
