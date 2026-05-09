<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"

import GeneratorPreviewWorkspaceFileList from "./GeneratorPreviewWorkspaceFileList.vue"
import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceResultListSectionProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  showFileTools: boolean
  query: string
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
}

defineProps<GeneratorPreviewWorkspaceResultListSectionProps>()

const emit = defineEmits<{
  (e: "query-input", value: string | number): void
  (e: "select-file", value: string): void
}>()
</script>

<template>
  <section class="generator-block generator-results-panel">
    <div class="generator-panel-head">
      <h3 class="generator-panel-title">
        {{ t("app.generatorPreview.workspaceTitle") }}
      </h3>
    </div>

    <div v-if="showFileTools" class="generator-list-tools">
      <label class="generator-filter-search">
        <TInput
          :model-value="query"
          :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
          clearable
          @update:model-value="emit('query-input', $event)"
        />
      </label>
    </div>

    <GeneratorPreviewWorkspaceFileList
      :t="t"
      :loading="loading"
      :files="files"
      :selected-file-path="selectedFilePath"
      @select-file="emit('select-file', $event)"
    />
  </section>
</template>

<style scoped>
.generator-block {
  display: grid;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
}

.generator-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.generator-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.generator-list-tools {
  display: grid;
  gap: 0.75rem;
}

.generator-filter-search {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .generator-panel-head {
    align-items: stretch;
  }
}
</style>
