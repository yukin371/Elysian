<script setup lang="ts">
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"

import { useSlots } from "vue"
import type { ElyCrudWorkspaceEmits, ElyCrudWorkspaceProps } from "../contracts"
import ElyQueryBar from "./ElyQueryBar.vue"
import ElyTable from "./ElyTable.vue"

const props = defineProps<ElyCrudWorkspaceProps>()
const emit = defineEmits<ElyCrudWorkspaceEmits>()
const slots = useSlots()

const handleAction = (key: string, row: Record<string, unknown>) => {
  emit("action", key, row)
}
</script>

<template>
  <div class="ely-crud-workspace">
    <ElyQueryBar
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
      <div v-if="props.items.length === 0 && !tableLoading" class="ely-crud-empty">
        <TEmpty
          :title="emptyTitle ?? copy?.emptyTitle ?? '当前工作区为空'"
          :description="
            emptyDescription ??
            copy?.emptyDescription ??
            '当前筛选条件下没有匹配数据。'
          "
        >
          <template #image>
            <div class="ely-empty-orbit">∿</div>
          </template>
        </TEmpty>
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
