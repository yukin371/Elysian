<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    modelValue?: string
    name?: string
    multiline?: boolean
    placeholder?: string
    rows?: number
    type?: "email" | "number" | "password" | "search" | "text" | "url"
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    modelValue: "",
    name: undefined,
    multiline: false,
    placeholder: "",
    rows: 4,
    type: "text",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit("update:modelValue", target.value)
}

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-input-${fallbackId}`,
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
</script>

<template>
  <label class="ely-public-field" :data-invalid="invalidMessage ? 'true' : 'false'">
    <span v-if="label" class="ely-public-field__label">{{ label }}</span>
    <span
      v-if="description"
      :id="resolvedDescriptionId"
      class="ely-public-field__description"
    >
      {{ description }}
    </span>

    <textarea
      v-if="multiline"
      :id="resolvedInputId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-input"
      :disabled="disabled"
      :name="name"
      :placeholder="placeholder"
      :rows="rows"
      :value="modelValue"
      @input="updateValue"
    />

    <input
      v-else
      :id="resolvedInputId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-input"
      :disabled="disabled"
      :name="name"
      :placeholder="placeholder"
      :type="type"
      :value="modelValue"
      @input="updateValue"
    />

    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </label>
</template>
