<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { DateRangePicker as TDateRangePicker } from "tdesign-vue-next/es/date-picker"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { reactive, ref } from "vue"

import type {
  ElyQueryBarEmits,
  ElyQueryBarProps,
  ElyQueryValues,
} from "../contracts"

const props = defineProps<ElyQueryBarProps>()
const emit = defineEmits<ElyQueryBarEmits>()
const barRef = ref<HTMLElement | null>(null)

const values = reactive<ElyQueryValues>({})

const focus = () => {
  barRef.value?.querySelector<HTMLElement>("input")?.focus()
}

defineExpose({ focus })

const handleSearch = () => emit("search", { ...values })

const handleReset = () => {
  for (const key of Object.keys(values)) {
    values[key] = undefined
  }
  emit("reset")
}
</script>

<template>
  <div ref="barRef" class="ely-query-bar">
    <div class="ely-query-fields">
      <div v-for="field in fields" :key="field.key" class="ely-query-field">
        <template v-if="field.kind === 'text'">
          <TInput
            v-model="values[field.key]"
            :placeholder="
              field.placeholder ??
              `${copy?.searchPlaceholderPrefix ?? '搜索'} ${field.label}`
            "
            clearable
            style="width: 200px"
            @enter="handleSearch"
          />
        </template>

        <template v-else-if="field.kind === 'select'">
          <TSelect
            v-model="values[field.key]"
            :placeholder="field.placeholder ?? field.label"
            :options="field.options"
            clearable
            style="width: 160px"
          />
        </template>

        <template v-else-if="field.kind === 'date-range'">
          <TDateRangePicker
            v-model="values[field.key]"
            clearable
            style="width: 260px"
          />
        </template>

        <template v-else-if="field.kind === 'status'">
          <TSelect
            v-model="values[field.key]"
            :placeholder="copy?.statusPlaceholder ?? '选择状态'"
            :options="[
              {
                label: copy?.statusActive ?? '启用',
                value: 'active',
              },
              {
                label: copy?.statusInactive ?? '停用',
                value: 'inactive',
              },
            ]"
            clearable
            style="width: 140px"
          />
        </template>
      </div>

      <div class="ely-query-actions">
        <TButton theme="primary" :loading="loading" @click="handleSearch">
          {{ copy?.searchButton ?? "查询" }}
        </TButton>
        <TButton variant="outline" @click="handleReset">
          {{ copy?.resetButton ?? "重置" }}
        </TButton>
      </div>
    </div>

    <div v-if="$slots.actions" class="ely-query-extra-actions">
      <slot name="actions" />
    </div>
    <kbd class="ely-query-shortcut-hint">/</kbd>
  </div>
</template>

<style scoped>
.ely-query-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem 1rem;
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.92);
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.ely-query-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.ely-query-field,
.ely-query-actions {
  flex-shrink: 0;
}

.ely-query-extra-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

.ely-query-shortcut-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
  color: #94a3b8;
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .ely-query-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .ely-query-extra-actions {
    justify-content: flex-start;
  }
}
</style>
