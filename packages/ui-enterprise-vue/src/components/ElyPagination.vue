<script setup lang="ts">
import type { ElyPaginationEmits, ElyPaginationProps } from "../contracts"

const props = withDefaults(defineProps<ElyPaginationProps>(), {
  previousLabel: "app.pagination.previous",
  nextLabel: "app.pagination.next",
  pageSizeLabel: "app.pagination.pageSize",
})

const emit = defineEmits<ElyPaginationEmits>()
</script>

<template>
  <div class="ely-pagination">
    <span>{{ summary }}</span>
    <label>
      <small>{{ pageSizeLabel }}</small>
      <select
        :value="pageSize"
        @change="emit('update-page-size', $event)"
      >
        <option
          v-for="option in pageSizeOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
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

.ely-pagination select {
  height: 2rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 4px;
  background: white;
  color: #0f172a;
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
