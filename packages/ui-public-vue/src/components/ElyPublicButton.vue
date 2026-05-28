<script setup lang="ts">
withDefaults(
  defineProps<{
    block?: boolean
    disabled?: boolean
    loading?: boolean
    size?: "sm" | "md" | "lg"
    tone?: "primary" | "secondary" | "ghost"
    type?: "button" | "submit" | "reset"
  }>(),
  {
    block: false,
    disabled: false,
    loading: false,
    size: "md",
    tone: "primary",
    type: "button",
  },
)
</script>

<template>
  <button
    :type="type"
    :aria-busy="loading ? 'true' : 'false'"
    class="ely-public-button"
    :data-block="block ? 'true' : 'false'"
    :data-size="size"
    :data-tone="tone"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="ely-public-button__spinner" aria-hidden="true" />
    <span class="ely-public-button__content">
      <slot />
    </span>
  </button>
</template>
