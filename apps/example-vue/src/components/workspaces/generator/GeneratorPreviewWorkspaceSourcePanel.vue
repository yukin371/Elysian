<script setup lang="ts">
import type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewFileCard,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSourcePanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard
  sqlPreview: GeneratorPreviewSqlPreview | null
  generatedSourceCopyLabel: string
  currentSourceCopyLabel: string
  sqlPreviewCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSourcePanelProps>()

const emit = defineEmits<{
  (event: "copy-generated-source"): void
  (event: "copy-current-source"): void
  (event: "copy-sql-preview"): void
}>()

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
  <div class="enterprise-panel-stack">
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
          @click="emit('copy-generated-source')"
        >
          {{ generatedSourceCopyLabel }}
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
          @click="emit('copy-current-source')"
        >
          {{ currentSourceCopyLabel }}
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
          @click="emit('copy-sql-preview')"
        >
          {{ sqlPreviewCopyLabel }}
        </button>
      </div>
      <pre class="generator-code-block"><code>{{ sqlPreview?.contents ?? "" }}</code></pre>
    </section>
  </div>
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

.generator-code-toolbar {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
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
