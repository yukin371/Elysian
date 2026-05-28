<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "p" | "span" | "strong"
    size?: "lg" | "md" | "sm"
    tone?: "muted" | "primary" | "subtle"
    weight?: "medium" | "regular" | "semibold"
  }>(),
  {
    as: "p",
    size: "md",
    tone: "primary",
    weight: "regular",
  },
)
</script>

<template>
  <component
    :is="as"
    class="ely-public-text"
    :data-size="size"
    :data-tone="tone"
    :data-weight="weight"
  >
    <slot />
  </component>
</template>
