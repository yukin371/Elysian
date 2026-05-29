<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    max?: string
    min?: string
    modelValue?: string
    name?: string
    placeholder?: string
    rangeText?: string
    readOnly?: boolean
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    max: undefined,
    min: undefined,
    modelValue: "",
    name: undefined,
    placeholder: "",
    rangeText: undefined,
    readOnly: false,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-date-input-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedInputId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedInputId.value}-message` : undefined,
)
const displayedRangeText = computed(() => {
  if (props.rangeText) {
    return props.rangeText
  }

  if (props.min && props.max) {
    return `Allowed dates: ${props.min} to ${props.max}.`
  }

  if (props.min) {
    return `Earliest date: ${props.min}.`
  }

  if (props.max) {
    return `Latest date: ${props.max}.`
  }

  return undefined
})
const resolvedRangeId = computed(() =>
  displayedRangeText.value ? `${resolvedInputId.value}-range` : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, resolvedRangeId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}
</script>

<template>
  <div class="ely-public-field" :data-invalid="invalidMessage ? 'true' : 'false'">
    <label v-if="label" class="ely-public-field__label" :for="resolvedInputId">
      {{ label }}
    </label>
    <span
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </span>

    <input
      :id="resolvedInputId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-input"
      :disabled="disabled"
      :max="max"
      :min="min"
      :name="name"
      :placeholder="placeholder"
      :readonly="readOnly"
      type="date"
      :value="modelValue"
      @input="updateValue"
    />

    <span
      v-if="displayedRangeText"
      :id="resolvedRangeId"
      class="ely-public-field__meta"
    >
      {{ displayedRangeText }}
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
