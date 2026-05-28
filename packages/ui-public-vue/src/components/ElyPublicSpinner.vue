<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    showLabel?: boolean
    size?: "lg" | "md" | "sm"
    tone?: "accent" | "neutral" | "primary"
  }>(),
  {
    label: "Loading",
    showLabel: false,
    size: "md",
    tone: "primary",
  },
)
</script>

<template>
  <span
    class="ely-public-spinner"
    :data-size="props.size"
    :data-tone="props.tone"
    role="status"
    :aria-label="props.label"
  >
    <span class="ely-public-spinner__mark" aria-hidden="true" />
    <span
      :class="
        props.showLabel
          ? 'ely-public-spinner__label'
          : 'ely-public-spinner__label ely-public-sr-only'
      "
    >
      {{ props.label }}
    </span>
  </span>
</template>
