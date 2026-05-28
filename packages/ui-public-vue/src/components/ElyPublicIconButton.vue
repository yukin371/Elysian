<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel: string
    disabled?: boolean
    loading?: boolean
    pressed?: boolean
    size?: "sm" | "md" | "lg"
    tone?: "danger" | "ghost" | "primary" | "secondary"
    type?: "button" | "reset" | "submit"
  }>(),
  {
    disabled: false,
    loading: false,
    size: "md",
    tone: "ghost",
    type: "button",
  },
)
</script>

<template>
  <button
    :type="type"
    :aria-busy="loading ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-pressed="pressed === undefined ? undefined : String(pressed)"
    class="ely-public-icon-button"
    :data-pressed="pressed === true ? 'true' : 'false'"
    :data-size="size"
    :data-tone="tone"
    :disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="ely-public-icon-button__spinner"
      aria-hidden="true"
    />
    <span v-else class="ely-public-icon-button__icon" aria-hidden="true">
      <slot />
    </span>
  </button>
</template>
