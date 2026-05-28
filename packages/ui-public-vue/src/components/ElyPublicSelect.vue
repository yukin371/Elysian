<script setup lang="ts">
import type { UiSelectOption } from "@elysian/ui-core"
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
    options: UiSelectOption[]
    placeholder?: string
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    modelValue: "",
    name: undefined,
    placeholder: "Select an option",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-select-${fallbackId}`,
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

const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit("update:modelValue", target.value)
}
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

    <select
      :id="resolvedInputId"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-select"
      :disabled="disabled"
      :name="name"
      :value="modelValue"
      @change="updateValue"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </label>
</template>
