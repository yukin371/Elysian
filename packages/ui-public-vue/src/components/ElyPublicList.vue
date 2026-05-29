<script setup lang="ts">
import type { ElyPublicListItem } from "./contracts"

withDefaults(
  defineProps<{
    ariaLabel?: string
    density?: "comfortable" | "compact"
    divided?: boolean
    emptyMessage?: string
    items: ElyPublicListItem[]
  }>(),
  {
    ariaLabel: "List",
    density: "comfortable",
    divided: true,
    emptyMessage: "No items to show yet.",
  },
)

const getItemTag = (item: ElyPublicListItem) =>
  item.href && !item.disabled ? "a" : "div"
</script>

<template>
  <section
    class="ely-public-list"
    :aria-label="ariaLabel"
    :data-density="density"
    :data-divided="divided ? 'true' : 'false'"
  >
    <p v-if="items.length === 0" class="ely-public-list__empty">
      {{ emptyMessage }}
    </p>
    <ul v-else class="ely-public-list__items">
      <li
        v-for="item in items"
        :key="item.key"
        class="ely-public-list__item"
        :data-current="item.current ? 'true' : 'false'"
        :data-disabled="item.disabled ? 'true' : 'false'"
        :data-tone="item.tone ?? 'primary'"
      >
        <component
          :is="getItemTag(item)"
          class="ely-public-list__row"
          :aria-current="item.current && item.href ? 'page' : undefined"
          :aria-disabled="item.disabled ? 'true' : undefined"
          :href="item.href && !item.disabled ? item.href : undefined"
        >
          <span class="ely-public-list__mark" aria-hidden="true" />
          <span class="ely-public-list__content">
            <span v-if="item.meta" class="ely-public-list__meta">
              {{ item.meta }}
            </span>
            <span class="ely-public-list__title">{{ item.title }}</span>
            <span v-if="item.description" class="ely-public-list__description">
              {{ item.description }}
            </span>
          </span>
          <span
            v-if="item.href && !item.disabled"
            class="ely-public-list__arrow"
            aria-hidden="true"
          >
            →
          </span>
        </component>
      </li>
    </ul>
  </section>
</template>
