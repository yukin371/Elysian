<script setup lang="ts">
import { computed, ref, useId } from "vue"
import type { ElyPublicRadioItem } from "./contracts"
import { getDirectionalSelectionIndex } from "./interaction"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    items: ElyPublicRadioItem[]
    label?: string
    modelValue?: string
  }>(),
  {
    ariaLabel: "Options",
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
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
const fallbackId = useId()
const resolvedGroupId = computed(
  () => props.id ?? `ely-public-radio-group-${fallbackId}`,
)
const resolvedLabelId = computed(() =>
  props.label ? `${resolvedGroupId.value}-label` : undefined,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedGroupId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedGroupId.value}-message` : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)

const selectItem = (value: string) => {
  if (props.disabled) {
    return
  }

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

  if (props.disabled || nextIndex === null || nextIndex < 0) {
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
    class="ely-public-field"
    :data-invalid="invalidMessage ? 'true' : 'false'"
  >
    <span
      v-if="label"
      :id="resolvedLabelId"
      class="ely-public-field__label"
    >
      {{ label }}
    </span>
    <span
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </span>
    <div
      :id="resolvedGroupId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      :aria-label="label ? undefined : ariaLabel"
      :aria-labelledby="resolvedLabelId"
      class="ely-public-radio-group"
      :data-disabled="disabled ? 'true' : 'false'"
      role="radiogroup"
    >
      <button
        v-for="(item, index) in props.items"
        :key="item.key"
        :ref="
          (element) =>
            setOptionElement(element as HTMLButtonElement | null, index)
        "
        :aria-checked="props.modelValue === item.value ? 'true' : 'false'"
        class="ely-public-radio"
        :data-state="props.modelValue === item.value ? 'checked' : 'unchecked'"
        :disabled="disabled"
        :tabindex="!disabled && item.value === focusableValue ? 0 : -1"
        role="radio"
        type="button"
        @click="selectItem(item.value)"
        @keydown="handleOptionKeydown($event, index)"
      >
        <span class="ely-public-radio__control" aria-hidden="true">
          <span class="ely-public-radio__dot" />
        </span>
        <span class="ely-public-radio__content">
          <span class="ely-public-radio__label">{{ item.label }}</span>
          <span v-if="item.description" class="ely-public-radio__description">
            {{ item.description }}
          </span>
        </span>
      </button>
    </div>
    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </div>
</template>
