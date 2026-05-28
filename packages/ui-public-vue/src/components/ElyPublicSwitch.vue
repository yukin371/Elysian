<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    description?: string
    disabled?: boolean
    label?: string
    modelValue?: boolean
  }>(),
  {
    description: undefined,
    disabled: false,
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
</script>

<template>
  <button
    :aria-checked="props.modelValue ? 'true' : 'false'"
    class="ely-public-switch"
    :data-state="props.modelValue ? 'checked' : 'unchecked'"
    :disabled="props.disabled"
    role="switch"
    type="button"
    @click="toggleValue"
  >
    <span class="ely-public-switch__control" aria-hidden="true">
      <span class="ely-public-switch__thumb" />
    </span>
    <span class="ely-public-switch__content">
      <span v-if="props.label" class="ely-public-switch__label">
        {{ props.label }}
      </span>
      <span v-if="props.description" class="ely-public-switch__description">
        {{ props.description }}
      </span>
    </span>
  </button>
</template>
