<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    max?: number
    min?: number
    modelValue?: number | null
    name?: string
    placeholder?: string
    readOnly?: boolean
    step?: number
    unit?: string
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    max: undefined,
    min: undefined,
    modelValue: null,
    name: undefined,
    placeholder: "",
    readOnly: false,
    step: 1,
    unit: undefined,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: number | null]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-number-input-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedInputId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedInputId.value}-message` : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)
const displayedValue = computed(() => props.modelValue ?? "")
const canStep = computed(() => !props.disabled && !props.readOnly)

const parseInputValue = (value: string) => {
  if (value.trim() === "") {
    return null
  }

  const nextValue = Number(value)

  return Number.isNaN(nextValue) ? null : nextValue
}

const clampValue = (value: number) =>
  Math.min(
    props.max ?? Number.POSITIVE_INFINITY,
    Math.max(props.min ?? Number.NEGATIVE_INFINITY, value),
  )

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", parseInputValue(target.value))
}

const stepValue = (direction: -1 | 1) => {
  if (!canStep.value) {
    return
  }

  const baseValue = props.modelValue ?? props.min ?? 0
  const nextValue = clampValue(baseValue + props.step * direction)

  emit("update:modelValue", nextValue)
}
</script>

<template>
  <div
    class="ely-public-field ely-public-number-field"
    :data-invalid="invalidMessage ? 'true' : 'false'"
  >
    <label
      v-if="label"
      class="ely-public-field__label"
      :for="resolvedInputId"
    >
      {{ label }}
    </label>
    <span
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </span>

    <span class="ely-public-number-input">
      <input
        :id="resolvedInputId"
        :aria-describedby="describedBy || undefined"
        :aria-invalid="invalidMessage ? 'true' : 'false'"
        class="ely-public-number-input__control"
        :disabled="disabled"
        inputmode="decimal"
        :max="max"
        :min="min"
        :name="name"
        :placeholder="placeholder"
        :readonly="readOnly"
        :step="step"
        type="number"
        :value="displayedValue"
        @input="updateValue"
      />
      <span v-if="unit" class="ely-public-number-input__unit">{{ unit }}</span>
      <span class="ely-public-number-input__steppers">
        <button
          :aria-label="`Increase ${label || 'value'}`"
          class="ely-public-number-input__stepper"
          :disabled="!canStep"
          type="button"
          @click.prevent="stepValue(1)"
        >
          +
        </button>
        <button
          :aria-label="`Decrease ${label || 'value'}`"
          class="ely-public-number-input__stepper"
          :disabled="!canStep"
          type="button"
          @click.prevent="stepValue(-1)"
        >
          -
        </button>
      </span>
    </span>

    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </div>
</template>
