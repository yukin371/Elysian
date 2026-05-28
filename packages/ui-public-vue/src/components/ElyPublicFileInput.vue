<script setup lang="ts">
import { computed, ref, useId } from "vue"

const props = withDefaults(
  defineProps<{
    accept?: string
    clearLabel?: string
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    label?: string
    multiple?: boolean
    name?: string
    noFileLabel?: string
  }>(),
  {
    accept: undefined,
    clearLabel: "Clear selected files",
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    label: undefined,
    multiple: false,
    name: undefined,
    noFileLabel: "No file selected",
  },
)

const emit = defineEmits<{
  change: [files: File[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<{ name: string; size: number }[]>([])

const fallbackId = useId()
const resolvedInputId = computed(
  () => props.id ?? `ely-public-file-input-${fallbackId}`,
)
const resolvedDescriptionId = computed(() =>
  props.description ? `${resolvedInputId.value}-description` : undefined,
)
const resolvedMessageId = computed(() =>
  props.invalidMessage ? `${resolvedInputId.value}-message` : undefined,
)
const selectedFilesId = computed(() =>
  selectedFiles.value.length > 0 ? `${resolvedInputId.value}-files` : undefined,
)
const describedBy = computed(() =>
  [resolvedDescriptionId.value, selectedFilesId.value, resolvedMessageId.value]
    .filter(Boolean)
    .join(" "),
)
const selectedSummary = computed(() => {
  if (selectedFiles.value.length === 0) {
    return props.noFileLabel
  }

  return props.multiple
    ? `${selectedFiles.value.length} files selected`
    : (selectedFiles.value[0]?.name ?? props.noFileLabel)
})

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const updateFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])

  selectedFiles.value = files.map((file) => ({
    name: file.name,
    size: file.size,
  }))
  emit("change", files)
}

const clearFiles = () => {
  if (props.disabled) {
    return
  }

  selectedFiles.value = []
  if (inputRef.value) {
    inputRef.value.value = ""
  }
  emit("change", [])
}
</script>

<template>
  <div
    class="ely-public-field ely-public-file-field"
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

    <div class="ely-public-file-input__row">
      <input
        :id="resolvedInputId"
        ref="inputRef"
        :accept="accept"
        :aria-describedby="describedBy || undefined"
        :aria-invalid="invalidMessage ? 'true' : 'false'"
        class="ely-public-file-input"
        :disabled="disabled"
        :multiple="multiple"
        :name="name"
        type="file"
        @change="updateFiles"
      />
      <button
        v-if="selectedFiles.length > 0"
        class="ely-public-file-input__clear"
        :disabled="disabled"
        type="button"
        @click="clearFiles"
      >
        {{ clearLabel }}
      </button>
    </div>

    <span class="ely-public-file-input__summary">
      {{ selectedSummary }}
    </span>

    <ul
      v-if="selectedFiles.length > 0"
      :id="selectedFilesId"
      class="ely-public-file-input__list"
    >
      <li
        v-for="file in selectedFiles"
        :key="`${file.name}-${file.size}`"
        class="ely-public-file-input__item"
      >
        <span>{{ file.name }}</span>
        <span>{{ formatFileSize(file.size) }}</span>
      </li>
    </ul>

    <span
      v-if="invalidMessage"
      :id="resolvedMessageId"
      class="ely-public-field__message"
    >
      {{ invalidMessage }}
    </span>
  </div>
</template>
