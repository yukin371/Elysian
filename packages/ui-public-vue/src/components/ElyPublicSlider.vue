<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    label?: string
    max?: number
    min?: number
    modelValue?: number
    name?: string
    showValue?: boolean
    step?: number
    unit?: string
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    label: undefined,
    max: 100,
    min: 0,
    modelValue: 0,
    name: undefined,
    showValue: true,
    step: 1,
    unit: "",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: number]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-slider-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedInputId.value}-description` : undefined,
)
const percentage = computed(() => {
  const range = props.max - props.min

  if (range <= 0) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, ((props.modelValue - props.min) / range) * 100),
  )
})
const displayValue = computed(() => `${props.modelValue}${props.unit}`)
const sliderStyle = computed(() => ({
  "--ely-public-slider-value": `${percentage.value}%`,
}))

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", Number(target.value))
}
</script>

<template>
  <label class="ely-public-field ely-public-slider-field">
    <span class="ely-public-slider-field__header">
      <span v-if="label" class="ely-public-field__label">{{ label }}</span>
      <output
        v-if="showValue"
        class="ely-public-slider-field__value"
        :for="resolvedInputId"
      >
        {{ displayValue }}
      </output>
    </span>
    <span
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </span>
    <input
      :id="resolvedInputId"
      :aria-describedby="resolvedDescriptionId"
      class="ely-public-slider"
      :disabled="disabled"
      :max="max"
      :min="min"
      :name="name"
      :step="step"
      :style="sliderStyle"
      type="range"
      :value="modelValue"
      @input="updateValue"
    />
    <span class="ely-public-slider-field__scale" aria-hidden="true">
      <span>{{ min }}{{ unit }}</span>
      <span>{{ max }}{{ unit }}</span>
    </span>
  </label>
</template>
