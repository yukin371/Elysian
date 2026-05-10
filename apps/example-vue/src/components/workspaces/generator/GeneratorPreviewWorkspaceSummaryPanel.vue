<script setup lang="ts">
import type {
  GeneratorPreviewFrontendImpact,
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSummaryPanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard | null
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  sessionStatusLabel: string
  previewArtifactCount: number
  selectedSourceLineCount: number
  selectedActionLabel: string
  selectedChangeLabel: string
  frontendImpact: GeneratorPreviewFrontendImpact | null
  recoveryNoteText: string | null
  recoveryNoteTone: "info" | "warning" | null
}

defineProps<GeneratorPreviewWorkspaceSummaryPanelProps>()
</script>

<template>
  <h3 class="enterprise-heading">
    {{ selectedFile?.path ?? t("app.generatorPreview.detailEmptyTitle") }}
  </h3>

  <p
    v-if="recoveryNoteText"
    :class="[
      'enterprise-message',
      recoveryNoteTone === 'warning'
        ? 'enterprise-message-warning'
        : 'enterprise-message-info',
      'mt-5',
    ]"
  >
    {{ recoveryNoteText }}
  </p>

  <div
    v-if="selectedFile"
    class="generator-facts mt-5"
  >
    <span>{{ selectedSchemaName }}</span>
    <span>{{ selectedFrontendTarget }}</span>
    <span>{{ sessionStatusLabel }}</span>
    <span>{{ selectedActionLabel }}</span>
    <span>{{ selectedSourceLineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
    <span>{{ t("app.generatorPreview.meta.changed") }} {{ selectedChangeLabel }}</span>
    <span v-if="selectedFile?.mergeStrategy">{{ selectedFile.mergeStrategy }}</span>
  </div>

  <section
    v-else
    class="generator-empty-detail mt-5"
  >
    <p class="generator-empty-detail-description">
      {{ t("app.generatorPreview.detailEmptyDescription") }}
    </p>
    <div class="generator-empty-detail-facts">
      <span>{{ selectedSchemaName }}</span>
      <span>{{ selectedFrontendTarget }}</span>
      <span>{{ sessionStatusLabel }}</span>
      <span>
        {{
          t("app.generatorPreview.emptyDetailArtifactCount", {
            count: previewArtifactCount,
          })
        }}
      </span>
      <span>{{ t("app.generatorPreview.emptyDetailNextStep") }}</span>
    </div>
  </section>

  <section v-if="frontendImpact" class="generator-impact mt-5">
    <h4>{{ t("app.generatorPreview.frontendImpactTitle") }}</h4>
    <div class="generator-impact-grid">
      <span>{{ t("app.generatorPreview.meta.moduleCode") }}</span>
      <strong>{{ frontendImpact.moduleCode ?? "-" }}</strong>
      <span>{{ t("app.generatorPreview.meta.routePath") }}</span>
      <strong>{{ frontendImpact.routePath ?? "-" }}</strong>
      <span>{{ t("app.generatorPreview.meta.permissionPrefix") }}</span>
      <strong>{{ frontendImpact.permissionPrefix ?? "-" }}</strong>
      <span>{{ t("app.generatorPreview.meta.surfaceKind") }}</span>
      <strong>{{ frontendImpact.surfaceKind ?? "-" }}</strong>
    </div>
    <div
      v-if="frontendImpact.permissionCodes.length > 0"
      class="generator-permission-list"
    >
      <span
        v-for="permissionCode in frontendImpact.permissionCodes"
        :key="permissionCode"
      >
        {{ permissionCode }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}

.generator-impact {
  display: grid;
  gap: 0.65rem;
  padding: 0.8rem;
  border: 1px solid rgba(36, 87, 214, 0.14);
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.05);
}

.generator-empty-detail {
  display: grid;
  gap: 0.65rem;
  padding: 0.8rem;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.72);
}

.generator-empty-detail-description {
  margin: 0;
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.55;
}

.generator-empty-detail-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.78rem;
}

.generator-impact h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-impact-grid {
  display: grid;
  grid-template-columns: minmax(7rem, auto) minmax(0, 1fr);
  gap: 0.35rem 0.8rem;
  color: #64748b;
  font-size: 0.76rem;
}

.generator-impact-grid strong {
  min-width: 0;
  color: #0f172a;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.generator-permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.generator-permission-list span {
  padding: 0.2rem 0.42rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.72);
  color: #475569;
  font-size: 0.72rem;
}
</style>
