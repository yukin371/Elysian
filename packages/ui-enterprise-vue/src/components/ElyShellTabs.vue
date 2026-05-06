<script setup lang="ts">
import type { ElyShellTab } from "../contracts"

defineProps<{
  tabs: ElyShellTab[]
  selectedKey: string | null
}>()

defineEmits<(event: "select", key: string) => void>()
</script>

<template>
  <nav class="ely-shell-tabs" aria-label="workspace tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="ely-shell-tab"
      :class="{ 'ely-shell-tab-active': tab.key === selectedKey }"
      @click="$emit('select', tab.key)"
    >
      <strong>{{ tab.label }}</strong>
      <span v-if="tab.hint">{{ tab.hint }}</span>
    </button>
  </nav>
</template>

<style scoped>
.ely-shell-tabs {
  display: flex;
  flex-shrink: 0;
  gap: 0;
  min-height: 34px;
  padding: 0 1rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  overflow-x: auto;
}

.ely-shell-tab {
  appearance: none;
  min-width: 104px;
  padding: 0.35rem 0.7rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.ely-shell-tab strong,
.ely-shell-tab span {
  display: block;
}

.ely-shell-tab strong {
  font-size: 0.86rem;
  color: #0f172a;
}

.ely-shell-tab span {
  margin-top: 0.1rem;
  font-size: 0.7rem;
  color: #5b6678;
}

.ely-shell-tab-active {
  background: rgba(36, 87, 214, 0.05);
  border-bottom-color: #2457d6;
}
</style>
