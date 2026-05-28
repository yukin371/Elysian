<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    maxLength?: number
    modelValue?: string
    name?: string
    placeholder?: string
    readOnly?: boolean
    resize?: "block" | "both" | "inline" | "none"
    rows?: number
    showCount?: boolean
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    maxLength: undefined,
    modelValue: "",
    name: undefined,
    placeholder: "",
    readOnly: false,
    resize: "block",
    rows: 5,
    showCount: false,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-textarea-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedInputId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedInputId.value}-message` : undefined,
)
const resolvedCountId = computed(() =>
  props.showCount || props.maxLength
    ? `${resolvedInputId.value}-count`
    : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, resolvedCountId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)
const countText = computed(() => {
  const current = props.modelValue.length

  return props.maxLength
    ? `${current}/${props.maxLength}`
    : `${current} characters`
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit("update:modelValue", target.value)
}
</script>

<template>
  <div
    class="ely-public-field ely-public-textarea-field"
    :data-invalid="invalidMessage ? 'true' : 'false'"
  >
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

    <textarea
      :id="resolvedInputId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-textarea"
      :data-resize="resize"
      :disabled="disabled"
      :maxlength="maxLength"
      :name="name"
      :placeholder="placeholder"
      :readonly="readOnly"
      :rows="rows"
      :value="modelValue"
      @input="updateValue"
    />

    <span
      v-if="showCount || maxLength"
      :id="resolvedCountId"
      class="ely-public-textarea__count"
    >
      {{ countText }}
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
