<script setup lang="ts">
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"

import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue"
import type { ElyCrudWorkspaceEmits, ElyCrudWorkspaceProps } from "../contracts"
import { resolveElyCrudWorkspaceEmptyCopy } from "../contracts"
import type ElyQueryBar from "./ElyQueryBar.vue"
import ElyTable from "./ElyTable.vue"

const props = withDefaults(defineProps<ElyCrudWorkspaceProps>(), {
  status: "ready",
})
const emit = defineEmits<ElyCrudWorkspaceEmits>()
const slots = useSlots()

const isReady = computed(() => props.status === "ready")

const statusClass = computed(() => {
  switch (props.status) {
    case "module-offline":
      return "ely-status ely-status--warning"
    case "not-authenticated":
      return "ely-status ely-status--info"
    case "no-permission":
      return "ely-status ely-status--warning"
    case "error":
      return "ely-status ely-status--danger"
    default:
      return ""
  }
})

const statusText = computed(() => {
  if (props.status === "error") {
    return props.statusMessage ?? ""
  }

  return props.statusMessage ?? ""
})

const resolvedEmpty = computed(() =>
  resolveElyCrudWorkspaceEmptyCopy({
    hasActiveQuery: props.hasActiveQuery ?? false,
    canCreate: props.canCreate ?? false,
    emptyTitle: props.emptyTitle,
    emptyDescription: props.emptyDescription,
    copy: props.copy,
  }),
)

const handleAction = (key: string, row: Record<string, unknown>) => {
  emit("action", key, row)
}

const queryBarRef = ref<InstanceType<typeof ElyQueryBar> | null>(null)

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(
      (event.target as HTMLElement)?.tagName ?? "",
    )
  ) {
    event.preventDefault()
    queryBarRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleGlobalKeydown)
})
</script>

<template>
  <div v-if="!isReady" :class="statusClass">
    {{ statusText }}
  </div>

  <div v-else class="ely-crud-workspace">
    <ElyQueryBar
      ref="queryBarRef"
      :fields="queryFields"
      :loading="queryLoading"
      :copy="copy?.queryBarCopy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
    >
      <template v-if="slots.toolbar" #actions>
        <slot name="toolbar" />
      </template>
    </ElyQueryBar>

    <section class="ely-crud-card">
      <div v-if="itemCountLabel" class="ely-crud-card__summary">
        {{ itemCountLabel }}
      </div>

      <div
        v-if="props.items.length === 0 && !tableLoading"
        class="ely-crud-empty"
      >
        <slot name="empty">
          <TEmpty
            :title="resolvedEmpty.emptyTitle"
            :description="resolvedEmpty.emptyDescription"
          >
            <template #image>
              <div class="ely-empty-orbit">∿</div>
            </template>
          </TEmpty>
        </slot>
      </div>

      <ElyTable
        v-else
        :columns="tableColumns"
        :items="props.items"
        :row-key="rowKey"
        :loading="tableLoading"
        :actions="tableActions"
        :copy="copy?.tableCopy"
        @action="handleAction"
        @row-click="emit('row-click', $event)"
      />
    </section>

    <slot name="footer" />
  </div>
</template>

<style scoped>
.ely-status {
  padding: 1rem 1.25rem;
  border-radius: 6px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.ely-status--warning {
  background: #fef3cd;
  color: #856404;
  border: 1px solid #f5e0a0;
}

.ely-status--info {
  background: #e8f4fd;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.ely-status--danger {
  background: #fdf2f2;
  color: #9b1c1c;
  border: 1px solid #f5c6c6;
}

.ely-crud-workspace {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ely-crud-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem 1rem 0.85rem;
}

.ely-crud-card__summary {
  margin-bottom: 0.85rem;
  color: #64748b;
  font-size: 0.82rem;
}

.ely-crud-empty {
  display: grid;
  place-items: center;
  min-height: 320px;
}

.ely-empty-orbit {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.1);
  color: #2457d6;
  font-size: 1.8rem;
  font-weight: 700;
}

.ely-empty-copy strong {
  color: #0f172a;
}
</style>
