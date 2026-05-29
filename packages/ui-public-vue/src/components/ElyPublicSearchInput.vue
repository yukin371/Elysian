<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    buttonLabel?: string
    clearLabel?: string
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    modelValue?: string
    name?: string
    placeholder?: string
  }>(),
  {
    buttonLabel: "Search",
    clearLabel: "Clear search",
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: "Search",
    modelValue: "",
    name: undefined,
    placeholder: "Search",
  },
)

const emit = defineEmits<{
  clear: []
  search: [value: string]
  "update:modelValue": [value: string]
}>()

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-search-${fallbackId}`,
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
const hasValue = computed(() => props.modelValue.trim().length > 0)

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}

const submitSearch = () => {
  if (props.disabled) {
    return
  }

  emit("search", props.modelValue.trim())
}

const clearSearch = () => {
  if (props.disabled) {
    return
  }

  emit("update:modelValue", "")
  emit("clear")
}
</script>

<template>
  <form
    class="ely-public-search"
    :data-has-value="hasValue ? 'true' : 'false'"
    :data-invalid="invalidMessage ? 'true' : 'false'"
    role="search"
    @submit.prevent="submitSearch"
  >
    <label class="ely-public-search__field" :for="resolvedInputId">
      <span class="ely-public-search__label">{{ label }}</span>
      <span
        v-if="description"
        :id="resolvedDescriptionId"
        class="ely-public-search__description"
      >
        {{ description }}
      </span>
      <span class="ely-public-search__control">
        <span class="ely-public-search__icon" aria-hidden="true">⌕</span>
        <input
          :id="resolvedInputId"
          :aria-describedby="describedBy || undefined"
          :aria-invalid="invalidMessage ? 'true' : 'false'"
          class="ely-public-search__input"
          :disabled="disabled"
          :name="name"
          :placeholder="placeholder"
          type="search"
          :value="modelValue"
          @input="updateValue"
        />
        <button
          v-if="hasValue"
          class="ely-public-search__clear"
          type="button"
          :aria-label="clearLabel"
          :disabled="disabled"
          @click="clearSearch"
        >
          ×
        </button>
      </span>
      <span
        v-if="invalidMessage"
        :id="resolvedMessageId"
        class="ely-public-field__message"
      >
        {{ invalidMessage }}
      </span>
    </label>
    <button
      class="ely-public-search__submit"
      type="submit"
      :disabled="disabled"
    >
      {{ buttonLabel }}
    </button>
  </form>
</template>
