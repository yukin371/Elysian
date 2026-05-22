<script setup lang="ts">
import { Select as TSelect } from "tdesign-vue-next/es/select"

import { computed } from "vue"
import type { ElyPaginationEmits, ElyPaginationProps } from "../contracts"

const props = withDefaults(defineProps<ElyPaginationProps>(), {
  previousLabel: "app.pagination.previous",
  nextLabel: "app.pagination.next",
  pageSizeLabel: "app.pagination.pageSize",
})

const emit = defineEmits<ElyPaginationEmits>()

const pageSizeOptions = computed(() =>
  props.pageSizeOptions.map((size) => ({ label: String(size), value: size })),
)
</script>

<template>
  <div class="ely-pagination">
    <span>{{ summary }}</span>
    <label>
      <small>{{ pageSizeLabel }}</small>
      <TSelect
        :value="pageSize"
        :options="pageSizeOptions"
        size="small"
        style="width: 80px"
        @change="emit('update-page-size', $event)"
      />
    </label>
    <button
      type="button"
      class="ely-pagination__button"
      :disabled="currentPage <= 1"
      @click="emit('previous')"
    >
      {{ previousLabel }}
    </button>
    <button
      type="button"
      class="ely-pagination__button"
      :disabled="currentPage >= totalPages"
      @click="emit('next')"
    >
      {{ nextLabel }}
    </button>
  </div>
</template>

<style scoped>
.ely-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  color: #475569;
  font-size: 0.82rem;
}

.ely-pagination label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.ely-pagination small {
  color: #64748b;
}

.ely-pagination__button {
  background: none;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 4px;
  padding: 0.25rem 0.65rem;
  color: #0f172a;
  cursor: pointer;
  font-size: 0.82rem;
}

.ely-pagination__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
