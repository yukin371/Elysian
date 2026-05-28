<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
    removable?: boolean
    removeLabel?: string
    selected?: boolean
    tone?: "accent" | "neutral" | "primary"
  }>(),
  {
    disabled: false,
    removable: false,
    removeLabel: "Remove chip",
    selected: false,
    tone: "neutral",
  },
)

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <span
    class="ely-public-chip"
    :data-disabled="disabled ? 'true' : 'false'"
    :data-selected="selected ? 'true' : 'false'"
    :data-tone="tone"
  >
    <span class="ely-public-chip__label">
      <slot />
    </span>
    <button
      v-if="removable"
      class="ely-public-chip__remove"
      :aria-label="removeLabel"
      :disabled="disabled"
      type="button"
      @click="emit('remove')"
    >
      <span aria-hidden="true">×</span>
    </button>
  </span>
</template>
