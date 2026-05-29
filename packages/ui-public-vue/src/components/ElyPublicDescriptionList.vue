<script setup lang="ts">
import type { ElyPublicDescriptionItem } from "./contracts"

withDefaults(
  defineProps<{
    ariaLabel?: string
    columns?: "single" | "double"
    density?: "comfortable" | "compact"
    emptyMessage?: string
    items: ElyPublicDescriptionItem[]
  }>(),
  {
    ariaLabel: "Details",
    columns: "double",
    density: "comfortable",
    emptyMessage: "No details to show yet.",
  },
)
</script>

<template>
  <section
    class="ely-public-description-list"
    :aria-label="ariaLabel"
    :data-columns="columns"
    :data-density="density"
  >
    <p v-if="items.length === 0" class="ely-public-description-list__empty">
      {{ emptyMessage }}
    </p>
    <dl v-else class="ely-public-description-list__grid">
      <div
        v-for="item in items"
        :key="item.key"
        class="ely-public-description-list__item"
        :data-tone="item.tone ?? 'primary'"
      >
        <dt class="ely-public-description-list__label">{{ item.label }}</dt>
        <dd class="ely-public-description-list__value">
          <span class="ely-public-description-list__value-text">
            {{ item.value }}
          </span>
          <span
            v-if="item.description"
            class="ely-public-description-list__description"
          >
            {{ item.description }}
          </span>
        </dd>
      </div>
    </dl>
  </section>
</template>
