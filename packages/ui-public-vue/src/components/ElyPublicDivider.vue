<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: "center" | "end" | "start"
    label?: string
    tone?: "accent" | "default"
  }>(),
  {
    align: "center",
    label: undefined,
    tone: "default",
  },
)
</script>

<template>
  <div
    class="ely-public-divider"
    :data-align="align"
    :data-tone="tone"
    role="separator"
  >
    <span class="ely-public-divider__line" aria-hidden="true" />
    <span v-if="label" class="ely-public-divider__label">{{ label }}</span>
    <span v-if="label" class="ely-public-divider__line" aria-hidden="true" />
  </div>
</template>
