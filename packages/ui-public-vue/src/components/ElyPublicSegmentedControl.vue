<script setup lang="ts">
import { computed, ref } from "vue"
import type { ElyPublicSegmentedItem } from "./contracts"
import { getDirectionalSelectionIndex } from "./interaction"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    items: ElyPublicSegmentedItem[]
    modelValue?: string
  }>(),
  {
    ariaLabel: "Segmented options",
    modelValue: "",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const focusableValue = computed(
  () => props.modelValue || props.items[0]?.value || "",
)
const optionElements = ref<(HTMLButtonElement | null)[]>([])

const selectItem = (value: string) => {
  emit("update:modelValue", value)
}

const setOptionElement = (element: HTMLButtonElement | null, index: number) => {
  optionElements.value[index] = element
}

const handleOptionKeydown = (event: KeyboardEvent, index: number) => {
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

  selectItem(nextItem.value)
  optionElements.value[nextIndex]?.focus()
}
</script>

<template>
  <div
    class="ely-public-segmented"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <button
      v-for="(item, index) in props.items"
      :key="item.key"
      :ref="
        (element) => setOptionElement(element as HTMLButtonElement | null, index)
      "
      :aria-checked="props.modelValue === item.value ? 'true' : 'false'"
      :aria-description="item.description"
      class="ely-public-segmented__item"
      :data-state="props.modelValue === item.value ? 'checked' : 'unchecked'"
      :tabindex="item.value === focusableValue ? 0 : -1"
      role="radio"
      type="button"
      @click="selectItem(item.value)"
      @keydown="handleOptionKeydown($event, index)"
    >
      <span class="ely-public-segmented__label">{{ item.label }}</span>
    </button>
  </div>
</template>
