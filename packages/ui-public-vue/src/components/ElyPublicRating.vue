<script setup lang="ts">
import { computed, ref, useId } from "vue"
import { getDirectionalSelectionIndex } from "./interaction"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    max?: number
    modelValue?: number
    name?: string
    readOnly?: boolean
    showValue?: boolean
  }>(),
  {
    ariaLabel: undefined,
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    max: 5,
    modelValue: 0,
    name: undefined,
    readOnly: false,
    showValue: true,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: number]
}>()

const fallbackId = useId()
const resolvedRatingId = computed(
  () => props.id ?? `ely-public-rating-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedRatingId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedRatingId.value}-message` : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)
const resolvedMax = computed(() =>
  Math.max(1, Math.min(10, Math.floor(props.max))),
)
const resolvedValue = computed(() =>
  Math.max(0, Math.min(resolvedMax.value, Math.round(props.modelValue))),
)
const ratingValues = computed(() =>
  Array.from({ length: resolvedMax.value }, (_, index) => index + 1),
)
const focusableValue = computed(() => resolvedValue.value || 1)
const displayValue = computed(
  () => `${resolvedValue.value}/${resolvedMax.value}`,
)
const optionElements = ref<(HTMLButtonElement | null)[]>([])

const setOptionElement = (element: HTMLButtonElement | null, index: number) => {
  optionElements.value[index] = element
}

const updateValue = (value: number) => {
  if (props.disabled || props.readOnly) {
    return
  }

  emit("update:modelValue", value)
}

const handleOptionKeydown = (event: KeyboardEvent, index: number) => {
  if (props.disabled || props.readOnly) {
    return
  }

  const nextIndex = getDirectionalSelectionIndex(
    index,
    ratingValues.value.length,
    event.key,
  )

  if (nextIndex === null || nextIndex < 0) {
    return
  }

  event.preventDefault()
  const nextValue = ratingValues.value[nextIndex]

  if (nextValue === undefined) {
    return
  }

  updateValue(nextValue)
  optionElements.value[nextIndex]?.focus()
}
</script>

<template>
  <div
    class="ely-public-field ely-public-rating-field"
    :data-invalid="invalidMessage ? 'true' : 'false'"
  >
    <div class="ely-public-rating-field__header">
      <label
        v-if="label"
        class="ely-public-field__label"
        :id="`${resolvedRatingId}-label`"
      >
        {{ label }}
      </label>
      <output
        v-if="showValue"
        class="ely-public-rating-field__value"
        :for="resolvedRatingId"
      >
        {{ displayValue }}
      </output>
    </div>
    <p
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </p>
    <div
      :id="resolvedRatingId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      :aria-label="ariaLabel ?? (label || 'Rating')"
      :aria-labelledby="label ? `${resolvedRatingId}-label` : undefined"
      :aria-readonly="readOnly ? 'true' : undefined"
      class="ely-public-rating"
      :data-disabled="disabled ? 'true' : 'false'"
      :data-readonly="readOnly ? 'true' : 'false'"
      role="radiogroup"
    >
      <button
        v-for="(value, index) in ratingValues"
        :key="value"
        :ref="
          (element) =>
            setOptionElement(element as HTMLButtonElement | null, index)
        "
        :aria-checked="resolvedValue === value ? 'true' : 'false'"
        :aria-label="`${value} of ${resolvedMax}`"
        class="ely-public-rating__item"
        :data-active="value <= resolvedValue ? 'true' : 'false'"
        :data-state="resolvedValue === value ? 'checked' : 'unchecked'"
        :disabled="disabled"
        role="radio"
        :tabindex="value === focusableValue && !disabled ? 0 : -1"
        type="button"
        @click="updateValue(value)"
        @keydown="handleOptionKeydown($event, index)"
      >
        <span class="ely-public-rating__mark" aria-hidden="true" />
        <span class="ely-public-sr-only">{{ value }}</span>
      </button>
    </div>
    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
    <input v-if="name" type="hidden" :name="name" :value="resolvedValue" />
  </div>
</template>
