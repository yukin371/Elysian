<script setup lang="ts">
import { computed } from "vue"

import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

const props = defineProps<{
  t: GeneratorPreviewTranslation
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
}>()

const emit = defineEmits<(event: "select-file", filePath: string) => void>()

const blockedFiles = computed(() =>
  props.files.filter((file) => file.plannedAction === "block"),
)
</script>

<template>
  <section
    v-if="blockedFiles.length > 0"
    class="generator-blocked-section"
  >
    <div class="generator-blocked-header">
      <strong>{{ t("app.generatorPreview.blockedTitle") }}</strong>
      <span>
        {{
          t("app.generatorPreview.blockedCount", {
            count: blockedFiles.length,
          })
        }}
      </span>
    </div>
    <div class="generator-blocked-list">
      <button
        v-for="file in blockedFiles"
        :key="file.path"
        type="button"
        class="generator-blocked-card"
        :class="
          selectedFilePath === file.path ? 'generator-blocked-card-active' : ''
        "
        @click="emit('select-file', file.path)"
      >
        <strong>{{ file.path }}</strong>
        <p>{{ file.plannedReason }}</p>
        <span class="generator-blocked-card-hint">
          {{ t("app.generatorPreview.blockedAction") }}
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.generator-blocked-section,
.generator-blocked-list {
  display: grid;
  gap: 0.75rem;
}

.generator-blocked-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  color: #9a3412;
}

.generator-blocked-card {
  display: grid;
  gap: 0.35rem;
  width: 100%;
  border-radius: 6px;
  border: 1px solid rgba(154, 52, 18, 0.18);
  background: rgba(255, 247, 237, 0.9);
  padding: 0.85rem 0.95rem;
  text-align: left;
  color: #7c2d12;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.generator-blocked-card:hover {
  transform: translateY(-1px);
  border-color: rgba(154, 52, 18, 0.38);
  box-shadow: 0 10px 18px rgba(124, 45, 18, 0.08);
}

.generator-blocked-card p {
  margin: 0;
  color: #7c2d12;
}

.generator-blocked-card-active {
  border-color: rgba(194, 65, 12, 0.56);
  box-shadow: 0 12px 22px rgba(194, 65, 12, 0.12);
}

.generator-blocked-card-hint {
  color: #9a3412;
  font-size: 0.78rem;
}
</style>
