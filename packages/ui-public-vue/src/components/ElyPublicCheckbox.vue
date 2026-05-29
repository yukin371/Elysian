<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    modelValue?: boolean
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    modelValue: false,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const toggleValue = () => {
  if (props.disabled) {
    return
  }

  emit("update:modelValue", !props.modelValue)
}

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-checkbox-${fallbackId}`,
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
  <div
    class="ely-public-field"
    :data-invalid="invalidMessage ? 'true' : 'false'"
  >
    <button
      :id="resolvedInputId"
      :aria-checked="props.modelValue ? 'true' : 'false'"
      :aria-describedby="describedBy || undefined"
      :aria-invalid="invalidMessage ? 'true' : 'false'"
      class="ely-public-checkbox"
      :data-state="props.modelValue ? 'checked' : 'unchecked'"
      :disabled="props.disabled"
      role="checkbox"
      type="button"
      @click="toggleValue"
    >
      <span class="ely-public-checkbox__control" aria-hidden="true">
        <span class="ely-public-checkbox__icon">✓</span>
      </span>
      <span class="ely-public-checkbox__content">
        <span v-if="props.label" class="ely-public-checkbox__label">
          {{ props.label }}
        </span>
        <span
          v-if="props.description"
          :id="resolvedDescriptionId"
          class="ely-public-checkbox__description"
        >
          {{ props.description }}
        </span>
      </span>
    </button>
    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </div>
</template>
