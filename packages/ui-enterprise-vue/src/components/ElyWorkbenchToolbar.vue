<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Dropdown as TDropdown } from "tdesign-vue-next/es/dropdown"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { computed, ref, watch } from "vue"

import type {
  ElyWorkbenchToolbarEmits,
  ElyWorkbenchToolbarProps,
} from "../contracts"

const props = withDefaults(defineProps<ElyWorkbenchToolbarProps>(), {
  searchPlaceholder: "搜索...",
  searchValue: "",
  loading: false,
})
const emit = defineEmits<ElyWorkbenchToolbarEmits>()

// ── Debounced search ──────────────────────────────────────────────────────────

let timer: ReturnType<typeof setTimeout> | undefined
const localSearch = ref(props.searchValue)

watch(
  () => props.searchValue,
  (v) => {
    localSearch.value = v ?? ""
  },
)

const handleSearchChange = (value: string) => {
  localSearch.value = value
  clearTimeout(timer)
  timer = setTimeout(() => {
    emit("search", value)
  }, 300)
}

// ── More-actions dropdown options ─────────────────────────────────────────────

const moreActionOptions = computed(() =>
  (props.moreActions ?? []).map((a) => ({
    value: a.key,
    label: a.label,
    disabled: a.disabled,
  })),
)

const handleMoreAction = (data: { value: string }) => {
  emit("more-action", data.value)
}
</script>

<template>
  <div class="ely-workbench-toolbar">
    <div class="ely-workbench-toolbar__left">
      <TButton
        v-for="action in actions"
        :key="action.key"
        :theme="action.tone === 'primary' ? 'primary' : 'default'"
        :disabled="action.disabled || loading"
        @click="emit('action', action.key)"
      >
        {{ action.label }}
      </TButton>
    </div>

    <div class="ely-workbench-toolbar__center">
      <TInput
        :placeholder="searchPlaceholder"
        :value="localSearch"
        clearable
        @change="handleSearchChange"
      />
    </div>

    <div class="ely-workbench-toolbar__right">
      <TDropdown
        v-if="moreActions?.length"
        :options="moreActionOptions"
        @click="handleMoreAction"
      >
        <TButton variant="text" :disabled="loading">更多</TButton>
      </TDropdown>
    </div>
  </div>
</template>

<style scoped>
.ely-workbench-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.ely-workbench-toolbar__left {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ely-workbench-toolbar__center {
  flex: 1;
  max-width: 400px;
}

.ely-workbench-toolbar__right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}
</style>
