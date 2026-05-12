<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"

import type { Input as TInput } from "tdesign-vue-next/es/input"

import GeneratorPreviewWorkspaceBlockedFiles from "./GeneratorPreviewWorkspaceBlockedFiles.vue"
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

const props = defineProps<GeneratorPreviewWorkspaceResultListSectionProps>()

const emit = defineEmits<{
  (e: "query-input", value: string | number): void
  (e: "select-file", value: string): void
}>()

const searchInputRef = ref<InstanceType<typeof TInput> | null>(null)

const showEmptySearchRecovery = computed(
  () => props.files.length === 0 && props.query.trim().length > 0,
)
const hasBlockedFiles = computed(() =>
  props.files.some((file) => file.plannedAction === "block"),
)

const isInputFocused = () => {
  const activeElement = document.activeElement as HTMLElement | null

  if (!activeElement) {
    return false
  }

  const tagName = activeElement.tagName
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  )
}

const focusSearchInput = () => {
  const root = searchInputRef.value?.$el as HTMLElement | undefined
  const input = root?.querySelector("input")

  input?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (
    event.key !== "/" ||
    isInputFocused() ||
    !props.showFileTools ||
    props.loading
  ) {
    return
  }

  event.preventDefault()
  focusSearchInput()
}

onMounted(() => document.addEventListener("keydown", handleKeydown))
onUnmounted(() => document.removeEventListener("keydown", handleKeydown))
</script>

<template>
  <section class="generator-block generator-results-panel">
    <div class="generator-panel-head">
      <div class="generator-panel-copy">
        <p class="generator-panel-eyebrow">
          {{ t("app.generatorPreview.workspaceTitle") }}
        </p>
        <h3 class="generator-panel-title">
          {{ t("app.generatorPreview.resultListHeadline") }}
        </h3>
        <p class="generator-panel-description">
          {{ t("app.generatorPreview.resultListSummary", { count: files.length }) }}
        </p>
      </div>
    </div>

    <div v-if="showFileTools" class="generator-list-tools">
      <div class="generator-list-hint">
        {{ t("app.generatorPreview.resultListHint") }}
      </div>
      <div class="generator-list-shortcuts">
        {{ t("app.generatorPreview.resultListKeyboardHint") }}
      </div>
      <label class="generator-filter-search">
        <TInput
          ref="searchInputRef"
          :model-value="query"
          :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
          clearable
          @update:model-value="emit('query-input', $event)"
        />
      </label>

      <div
        v-if="showEmptySearchRecovery"
        class="generator-list-recovery"
      >
        <span>{{ t("app.generatorPreview.emptyFilteredHint") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('query-input', '')"
        >
          {{ t("app.generatorPreview.action.clearFileSearch") }}
        </button>
      </div>
    </div>

    <section
      v-if="hasBlockedFiles"
      class="generator-blocked-entry"
    >
      <p class="generator-blocked-entry-copy">
        {{ t("app.generatorPreview.blockedDescription") }}
      </p>
      <GeneratorPreviewWorkspaceBlockedFiles
        :t="t"
        :files="files"
        :selected-file-path="selectedFilePath"
        @select-file="emit('select-file', $event)"
      />
    </section>

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
  font-size: 1rem;
  font-weight: 700;
}

.generator-panel-copy {
  display: grid;
  gap: 0.28rem;
}

.generator-panel-eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.generator-panel-description,
.generator-list-hint {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.45;
}

.generator-list-shortcuts {
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.45;
}

.generator-list-tools {
  display: grid;
  gap: 0.75rem;
}

.generator-list-recovery {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 0.9rem;
  padding: 0.7rem 0.8rem;
  border: 1px dashed rgba(15, 23, 42, 0.12);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.72);
  color: #64748b;
  font-size: 0.77rem;
  line-height: 1.45;
}

.generator-blocked-entry {
  display: grid;
  gap: 0.65rem;
}

.generator-blocked-entry-copy {
  margin: 0;
  color: #9a3412;
  font-size: 0.78rem;
  line-height: 1.45;
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
