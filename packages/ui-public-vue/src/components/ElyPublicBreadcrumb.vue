<script setup lang="ts">
import { computed } from "vue"

export interface ElyPublicBreadcrumbItem {
  current?: boolean
  href?: string
  label: string
}

type ElyPublicRenderedBreadcrumbItem =
  | (ElyPublicBreadcrumbItem & {
      current: boolean
      type: "item"
    })
  | {
      current: false
      hiddenCount: number
      label: string
      type: "overflow"
    }

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    items: ElyPublicBreadcrumbItem[]
    maxItems?: number
    overflowLabel?: string
    separatorLabel?: string
  }>(),
  {
    ariaLabel: "Breadcrumb",
    maxItems: undefined,
    overflowLabel: "Collapsed route levels",
    separatorLabel: "Next level",
  },
)

const normalizedItems = computed(() =>
  props.items.map((item, index) => ({
    ...item,
    current: item.current ?? index === props.items.length - 1,
  })),
)

const renderedItems = computed<ElyPublicRenderedBreadcrumbItem[]>(() => {
  const maxItems = props.maxItems
  const firstItem = normalizedItems.value[0]

  if (!firstItem) {
    return []
  }

  if (!maxItems || maxItems < 3 || normalizedItems.value.length <= maxItems) {
    return normalizedItems.value.map((item) => ({ ...item, type: "item" }))
  }

  const tailCount = maxItems - 2
  const hiddenCount = normalizedItems.value.length - tailCount - 1
  const tailItems = normalizedItems.value.slice(-tailCount)

  return [
    { ...firstItem, type: "item" },
    {
      current: false,
      hiddenCount,
      label: props.overflowLabel,
      type: "overflow",
    },
    ...tailItems.map((item) => ({ ...item, type: "item" as const })),
  ]
})
</script>

<template>
  <nav class="ely-public-breadcrumb" :aria-label="ariaLabel">
    <ol class="ely-public-breadcrumb__list">
      <li
        v-for="(item, index) in renderedItems"
        :key="`${item.label}-${index}`"
        class="ely-public-breadcrumb__item"
      >
        <a
          v-if="item.type === 'item' && item.href && !item.current"
          class="ely-public-breadcrumb__link"
          :href="item.href"
        >
          {{ item.label }}
        </a>
        <span
          v-else-if="item.type === 'overflow'"
          class="ely-public-breadcrumb__overflow"
        >
          <span aria-hidden="true">…</span>
          <span class="ely-public-sr-only">
            {{ item.label }}: {{ item.hiddenCount }}
          </span>
        </span>
        <span
          v-else
          class="ely-public-breadcrumb__current"
          :aria-current="item.type === 'item' && item.current ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < renderedItems.length - 1"
          aria-hidden="true"
          class="ely-public-breadcrumb__separator"
        >
          /
        </span>
        <span
          v-if="index < renderedItems.length - 1"
          class="ely-public-sr-only"
        >
          {{ separatorLabel }}
        </span>
      </li>
    </ol>
  </nav>
</template>
