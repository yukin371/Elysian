<script setup lang="ts">
import { computed, ref, useId } from "vue"
import type { ElyPublicTabItem } from "./contracts"
import { getDirectionalSelectionIndex } from "./interaction"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    emptyMessage?: string
    idBase?: string
    items: ElyPublicTabItem[]
    modelValue?: string
  }>(),
  {
    ariaLabel: "Tabs",
    emptyMessage: "No sections to show yet.",
    idBase: undefined,
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const activeKey = computed(() => props.modelValue ?? props.items[0]?.key ?? "")
const activeItem = computed(
  () =>
    props.items.find((item) => item.key === activeKey.value) ?? props.items[0],
)
const componentId = useId()
const resolvedIdBase = computed(
  () => props.idBase ?? `ely-public-tabs-${componentId}`,
)
const triggerElements = ref<(HTMLButtonElement | null)[]>([])

const selectItem = (key: string) => {
  emit("update:modelValue", key)
}

const getTabId = (key: string) => `${resolvedIdBase.value}-tab-${key}`
const getPanelId = (key: string) => `${resolvedIdBase.value}-panel-${key}`

const setTriggerElement = (
  element: HTMLButtonElement | null,
  index: number,
) => {
  triggerElements.value[index] = element
}

const handleTriggerKeydown = (event: KeyboardEvent, index: number) => {
  const nextIndex = getDirectionalSelectionIndex(
    index,
    props.items.length,
    event.key,
  )

  if (nextIndex === null || nextIndex < 0) {
    return
  }

  event.preventDefault()
  const nextItem = props.items[nextIndex]

  if (!nextItem) {
    return
  }

  selectItem(nextItem.key)
  triggerElements.value[nextIndex]?.focus()
}
</script>

<template>
  <div class="ely-public-tabs">
    <p v-if="items.length === 0" class="ely-public-tabs__empty">
      {{ emptyMessage }}
    </p>

    <template v-else>
      <div class="ely-public-tabs__list" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(item, index) in items"
        :key="item.key"
        :id="getTabId(item.key)"
        :ref="
          (element) =>
            setTriggerElement(element as HTMLButtonElement | null, index)
        "
        :aria-controls="getPanelId(item.key)"
        class="ely-public-tabs__trigger"
        :data-active="item.key === activeKey ? 'true' : 'false'"
        :aria-selected="item.key === activeKey"
        :tabindex="item.key === activeKey ? 0 : -1"
        role="tab"
        type="button"
        @click="selectItem(item.key)"
        @keydown="handleTriggerKeydown($event, index)"
      >
        <span class="ely-public-tabs__label">{{ item.label }}</span>
        <span v-if="item.description" class="ely-public-tabs__description">
          {{ item.description }}
        </span>
      </button>
      </div>

      <div
        :id="getPanelId(activeItem?.key ?? 'panel')"
        :aria-labelledby="getTabId(activeItem?.key ?? 'panel')"
        class="ely-public-tabs__panel"
        role="tabpanel"
        tabindex="0"
      >
        <slot :active-item="activeItem" :active-key="activeKey" />
      </div>
    </template>
  </div>
</template>
