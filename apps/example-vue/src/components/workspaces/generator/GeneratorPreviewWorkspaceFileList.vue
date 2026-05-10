<script setup lang="ts">
import { nextTick, ref } from "vue"

import type { GeneratorPreviewFileCard, GeneratorPreviewTranslation } from "./types"

const props = defineProps<{
  t: GeneratorPreviewTranslation
  loading: boolean
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
}>()

const emit = defineEmits<(event: "select-file", filePath: string) => void>()

const listRef = ref<HTMLElement | null>(null)

const focusRow = async (path: string) => {
  await nextTick()
  const button = Array.from(
    listRef.value?.querySelectorAll<HTMLButtonElement>(
      "[data-generator-file-path]",
    ) ?? [],
  ).find((candidate) => candidate.dataset.generatorFilePath === path)
  button?.focus()
}

const handleRowKeydown = async (
  event: KeyboardEvent,
  currentIndex: number,
  currentPath: string,
) => {
  if (event.key === "Enter") {
    emit("select-file", currentPath)
    return
  }

  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
    return
  }

  event.preventDefault()

  const delta = event.key === "ArrowDown" ? 1 : -1
  const nextFile = props.files[currentIndex + delta]

  if (!nextFile) {
    return
  }

  emit("select-file", nextFile.path)
  await focusRow(nextFile.path)
}
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
    class="generator-file-empty"
  >
    <strong>{{ t("app.generatorPreview.emptyFiltered") }}</strong>
    <span>{{ t("app.generatorPreview.emptyFilteredHint") }}</span>
  </div>

  <div
    v-else
    ref="listRef"
    class="generator-file-list"
  >
    <button
      v-for="(file, index) in files"
      :key="file.path"
      :data-generator-file-path="file.path"
      type="button"
      class="generator-file-row"
      :class="[
        selectedFilePath === file.path ? 'generator-file-row-active' : '',
        `generator-file-row-${file.plannedAction}`,
      ]"
      @click="emit('select-file', file.path)"
      @keydown="handleRowKeydown($event, index, file.path)"
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

.generator-file-empty {
  display: grid;
  gap: 0.24rem;
  padding: 0.8rem 0.9rem;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.72);
}

.generator-file-empty strong {
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 700;
}

.generator-file-empty span {
  color: #64748b;
  font-size: 0.77rem;
  line-height: 1.45;
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
