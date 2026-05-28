<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "accent" | "danger" | "neutral" | "primary"
  }>(),
  {
    tone: "neutral",
  },
)
</script>

<template>
  <span class="ely-public-badge" :data-tone="tone">
    <slot />
  </span>
</template>
