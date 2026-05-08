<script setup lang="ts">
import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

defineProps<{
  t: GeneratorPreviewTranslation
  loading: boolean
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
}>()

const emit = defineEmits<(event: "select-file", filePath: string) => void>()
</script>

<template>
  <div
    v-if="loading"
    class="enterprise-message enterprise-message-info"
  >
    {{ t("app.generatorPreview.loading") }}
  </div>

  <div
    v-else-if="files.length === 0"
    class="enterprise-message enterprise-message-warning"
  >
    {{ t("app.generatorPreview.emptyFiltered") }}
  </div>

  <div v-else class="generator-file-list">
    <button
      v-for="file in files"
      :key="file.path"
      type="button"
      class="generator-file-row"
      :class="[
        selectedFilePath === file.path ? 'generator-file-row-active' : '',
        `generator-file-row-${file.plannedAction}`,
      ]"
      @click="emit('select-file', file.path)"
    >
      <div class="generator-file-row-main">
        <strong class="generator-file-row-path">{{ file.path }}</strong>
        <span class="generator-file-row-action">
          {{ t(`app.generatorPreview.actionLabel.${file.plannedAction}`) }}
        </span>
      </div>
      <div class="generator-file-row-meta">
        <span>{{ file.lineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
        <span v-if="file.mergeStrategy">{{ file.mergeStrategy }}</span>
        <span class="generator-file-row-diff generator-file-row-diff-added">
          +{{ file.diffStats.addedLineCount }}
        </span>
        <span class="generator-file-row-diff generator-file-row-diff-removed">
          -{{ file.diffStats.removedLineCount }}
        </span>
        <span>{{ file.charCount }}c</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.generator-file-list {
  display: grid;
}

.generator-file-row {
  display: grid;
  gap: 0.3rem;
  width: 100%;
  padding: 0.8rem 0;
  text-align: left;
  color: #0f172a;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-file-row:hover,
.generator-file-row-active {
  color: #173ea6;
}

.generator-file-row-block {
  color: #9a3412;
}

.generator-file-row-main,
.generator-file-row-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.generator-file-row-main {
  justify-content: space-between;
}

.generator-file-row-path {
  min-width: 0;
  line-height: 1.45;
  word-break: break-all;
}

.generator-file-row-meta {
  color: #64748b;
  font-size: 0.78rem;
}

.generator-file-row-active .generator-file-row-meta {
  color: #173ea6;
}

.generator-file-row-block .generator-file-row-meta {
  color: #9a3412;
}

.generator-file-row-action {
  font-size: 0.78rem;
  font-weight: 600;
}

.generator-file-row-diff {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.generator-file-row-diff-added {
  color: #15803d;
}

.generator-file-row-diff-removed {
  color: #b91c1c;
}
</style>
