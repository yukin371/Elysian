<script setup lang="ts">
import { computed } from "vue"

import type { ModuleSqlPreview } from "../../../lib/generator-preview-browser"

import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspacePanelProps {
  t: GeneratorPreviewTranslation
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedFile: GeneratorPreviewFileCard | null
  sqlPreview: ModuleSqlPreview | null
}

const props = defineProps<GeneratorPreviewWorkspacePanelProps>()

const selectedSourceLineCount = computed(
  () => props.selectedFile?.lineCount ?? 0,
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
        <span>{{ t("app.generatorPreview.meta.lines") }}</span>
        <strong>{{ selectedSourceLineCount }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.mergeStrategy") }}</span>
        <strong>{{ selectedFile?.mergeStrategy ?? "-" }}</strong>
      </div>
    </div>

    <div v-if="selectedFile" class="panel-stack">
      <div>
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sourceTitle") }}</p>
        <pre class="generator-code-block"><code>{{ selectedFile.contents }}</code></pre>
      </div>

      <div>
        <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlTitle") }}</p>
        <pre class="generator-code-block"><code>{{ sqlPreview?.contents ?? "" }}</code></pre>
      </div>
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
  border-radius: 14px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
}

.enterprise-metadata div {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.92);
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

.generator-code-block {
  overflow: auto;
  margin: 0.75rem 0 0;
  border-radius: 16px;
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
