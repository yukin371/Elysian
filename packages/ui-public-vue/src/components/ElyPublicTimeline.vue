<script setup lang="ts">
import type { ElyPublicTimelineItem } from "./contracts"

withDefaults(
  defineProps<{
    ariaLabel?: string
    density?: "comfortable" | "compact"
    emptyMessage?: string
    items: ElyPublicTimelineItem[]
  }>(),
  {
    ariaLabel: "Timeline",
    density: "comfortable",
    emptyMessage: "No timeline events to show yet.",
  },
)
</script>

<template>
  <section
    class="ely-public-timeline"
    :aria-label="ariaLabel"
    :data-density="density"
  >
    <p v-if="items.length === 0" class="ely-public-timeline__empty">
      {{ emptyMessage }}
    </p>
    <ol v-else class="ely-public-timeline__list">
      <li
        v-for="item in items"
        :key="item.key"
        class="ely-public-timeline__item"
        :data-tone="item.tone ?? 'primary'"
      >
        <span class="ely-public-timeline__marker" aria-hidden="true" />
        <div class="ely-public-timeline__content">
          <p v-if="item.meta" class="ely-public-timeline__meta">
            {{ item.meta }}
          </p>
          <h3 class="ely-public-timeline__title">{{ item.title }}</h3>
          <p v-if="item.description" class="ely-public-timeline__description">
            {{ item.description }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
