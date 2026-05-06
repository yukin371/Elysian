<script setup lang="ts">
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"
import { Space as TSpace } from "tdesign-vue-next/es/space"

import { computed } from "vue"
import type { ElyCrudWorkspaceEmits, ElyCrudWorkspaceProps } from "../contracts"
import ElyQueryBar from "./ElyQueryBar.vue"
import ElyTable from "./ElyTable.vue"

const props = defineProps<ElyCrudWorkspaceProps>()
const emit = defineEmits<ElyCrudWorkspaceEmits>()
const hasDescription = computed(() => props.description.trim().length > 0)

const handleAction = (key: string, row: Record<string, unknown>) => {
  emit("action", key, row)
}
</script>

<template>
  <div class="ely-crud-workspace">
    <div class="ely-crud-head">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="hasDescription" class="ely-crud-copy">{{ description }}</p>
      </div>

      <div class="ely-crud-toolbar">
        <TSpace>
          <slot name="toolbar" />
        </TSpace>
      </div>
    </div>

    <ElyQueryBar
      :fields="queryFields"
      :loading="queryLoading"
      :copy="copy?.queryBarCopy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
    />

    <section class="ely-crud-card">
      <div class="ely-crud-card-head">
        <div>
          <span>
            {{
              itemCountLabel ??
              `${props.items.length} ${copy?.rowsInScopeSuffix ?? "条记录"}`
            }}
          </span>
        </div>

      </div>

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

.ely-crud-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.ely-crud-head h3 {
  margin: 0;
  font-size: clamp(1.12rem, 1.1vw, 1.32rem);
  line-height: 1.25;
  color: #0f172a;
}

.ely-crud-copy {
  max-width: 48rem;
  margin: 0.7rem 0 0;
  color: #5f6b7a;
  line-height: 1.7;
}

.ely-crud-toolbar {
  flex-shrink: 0;
}

.ely-crud-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem 1rem 0.85rem;
}

.ely-crud-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.ely-crud-card-head span {
  display: block;
  font-size: 0.84rem;
  color: #94a3b8;
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

@media (max-width: 960px) {
  .ely-crud-head,
  .ely-crud-card-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .ely-crud-toolbar {
    width: 100%;
  }
}
</style>
