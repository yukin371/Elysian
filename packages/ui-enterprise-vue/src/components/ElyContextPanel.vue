<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Loading as TLoading } from "tdesign-vue-next/es/loading"
import { computed } from "vue"

import type { ElyContextPanelEmits, ElyContextPanelProps } from "../contracts"

const props = withDefaults(defineProps<ElyContextPanelProps>(), {
  width: undefined,
  loading: false,
  copy: () => ({}),
})

const emit = defineEmits<ElyContextPanelEmits>()

const copy = computed(() => ({
  closeLabel: props.copy.closeLabel ?? "关闭",
  editLabel: props.copy.editLabel ?? "编辑",
  deleteLabel: props.copy.deleteLabel ?? "删除",
  saveLabel: props.copy.saveLabel ?? "保存",
  cancelLabel: props.copy.cancelLabel ?? "取消",
  confirmDeleteLabel: props.copy.confirmDeleteLabel ?? "确认删除",
  cancelDeleteLabel: props.copy.cancelDeleteLabel ?? "取消",
  deleteWarning: props.copy.deleteWarning ?? "此操作不可撤销，请确认是否删除。",
}))

const resolvedWidth = computed(() => {
  if (props.width !== undefined) return props.width
  if (props.mode === "delete-confirm") {
    return 560
  }

  if (props.mode === "detail") {
    return 860
  }

  return 760
})
</script>

<template>
  <div
    class="ely-context-panel"
    :class="{ 'ely-context-panel--visible': visible }"
    :style="{ width: resolvedWidth + 'px' }"
    role="dialog"
    aria-modal="true"
  >
    <div class="ely-context-panel__header">
      <h3 class="ely-context-panel__title">{{ title }}</h3>
      <div class="ely-context-panel__header-actions">
        <template v-if="mode === 'edit' || mode === 'create'">
          <TButton theme="primary" size="small" @click="emit('save')">{{
            copy.saveLabel
          }}</TButton>
          <TButton size="small" @click="emit('cancel')">{{ copy.cancelLabel }}</TButton>
        </template>
        <button
          class="ely-context-panel__close"
          :aria-label="copy.closeLabel"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>
    </div>

    <div class="ely-context-panel__body" v-if="!loading">
      <slot />
    </div>
    <div class="ely-context-panel__body ely-context-panel__body--loading" v-else>
      <TLoading />
    </div>

    <div
      class="ely-context-panel__footer ely-context-panel__danger-zone"
      v-if="mode === 'delete-confirm'"
    >
      <p class="ely-context-panel__danger-text">{{ copy.deleteWarning }}</p>
      <div class="ely-context-panel__danger-actions">
        <TButton theme="danger" @click="emit('delete')">{{ copy.confirmDeleteLabel }}</TButton>
        <TButton @click="emit('cancel')">{{ copy.cancelDeleteLabel }}</TButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ely-context-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(100%, 100%);
  max-width: calc(100vw - 3rem);
  max-height: min(calc(100vh - 3rem), 960px);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 8px 20px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.ely-context-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  flex-shrink: 0;
}

.ely-context-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  line-height: 24px;
}

.ely-context-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ely-context-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
  border-radius: 4px;
  transition: background 0.15s;
}

.ely-context-panel__close:hover {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.ely-context-panel__body {
  overflow-y: auto;
  padding: 20px;
}

.ely-context-panel__body :deep(.enterprise-card) {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.ely-context-panel__body--loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ely-context-panel__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  flex-shrink: 0;
}

.ely-context-panel__danger-zone {
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  background: #fff1f0;
  border-top: 1px solid #ffa39e;
}

.ely-context-panel__danger-text {
  margin: 0;
  width: 100%;
  font-size: 13px;
  color: #cf1322;
  line-height: 20px;
}

.ely-context-panel__danger-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 860px) {
  .ely-context-panel {
    max-width: calc(100vw - 1.5rem);
    max-height: calc(100vh - 1.5rem);
    border-radius: 8px;
  }

  .ely-context-panel__header,
  .ely-context-panel__body,
  .ely-context-panel__footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
