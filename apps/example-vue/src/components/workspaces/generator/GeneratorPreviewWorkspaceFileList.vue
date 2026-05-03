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
      class="generator-file-card"
      :class="selectedFilePath === file.path ? 'generator-file-card-active' : ''"
      @click="emit('select-file', file.path)"
    >
      <div class="generator-file-card-header">
        <strong>{{ file.path }}</strong>
        <span>{{ file.lineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
      </div>
      <p>{{ file.reason }}</p>
      <div class="generator-file-card-meta">
        <span class="generator-file-card-action">
          {{ t(`app.generatorPreview.actionLabel.${file.plannedAction}`) }}
        </span>
        <span>{{ file.mergeStrategy }}</span>
        <span class="generator-file-card-diff generator-file-card-diff-added">
          +{{ file.diffStats.addedLineCount }}
        </span>
        <span class="generator-file-card-diff generator-file-card-diff-removed">
          -{{ file.diffStats.removedLineCount }}
        </span>
        <span>{{ file.charCount }} chars</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.generator-file-card p,
.generator-file-card-meta {
  margin: 0;
}

.generator-file-list {
  display: grid;
  gap: 0.85rem;
}

.generator-file-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
  padding: 1rem;
  text-align: left;
  color: #0f172a;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.generator-file-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 87, 214, 0.2);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.generator-file-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 12px 22px rgba(36, 87, 214, 0.1);
}

.generator-file-card-header,
.generator-file-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: space-between;
  align-items: center;
}

.generator-file-card p {
  margin-top: 0.7rem;
  color: #475569;
  line-height: 1.65;
}

.generator-file-card-meta {
  margin-top: 0.8rem;
  font-size: 0.78rem;
  color: #64748b;
}

.generator-file-card-action {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.8);
  padding: 0.2rem 0.55rem;
  color: #334155;
}

.generator-file-card-diff {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.generator-file-card-diff-added {
  color: #15803d;
}

.generator-file-card-diff-removed {
  color: #b91c1c;
}
</style>
