<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"
import { Space as TSpace } from "tdesign-vue-next/es/space"

import type { ElyCrudWorkspaceEmits, ElyCrudWorkspaceProps } from "../contracts"
import ElyQueryBar from "./ElyQueryBar.vue"
import ElyTable from "./ElyTable.vue"

const props = defineProps<ElyCrudWorkspaceProps>()
const emit = defineEmits<ElyCrudWorkspaceEmits>()

const handleAction = (key: string, row: Record<string, unknown>) => {
  emit("action", key, row)
}
</script>

<template>
  <div class="ely-crud-workspace">
    <div class="ely-crud-head">
      <div>
        <p class="ely-crud-eyebrow">{{ eyebrow }}</p>
        <h3>{{ title }}</h3>
        <p class="ely-crud-copy">{{ description }}</p>
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
          <p class="ely-crud-card-title">{{ copy?.gridTitle ?? "数据列表" }}</p>
          <span>
            {{
              itemCountLabel ??
              `${props.items.length} ${copy?.rowsInScopeSuffix ?? "条记录"}`
            }}
          </span>
        </div>

        <TButton
          theme="primary"
          variant="text"
          class="ely-crud-card-button"
        >
          {{ copy?.liveContractLabel ?? "实时契约" }}
        </TButton>
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
  gap: 1rem;
}

.ely-crud-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.ely-crud-eyebrow,
.ely-crud-card-title {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.ely-crud-head h3 {
  margin: 0.55rem 0 0;
  font-size: clamp(1.4rem, 1.8vw, 2rem);
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
  border-radius: 16px;
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
  margin-top: 0.4rem;
  font-size: 0.84rem;
  color: #94a3b8;
}

.ely-crud-card-button {
  color: #1d4ed8;
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
  border-radius: 14px;
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
