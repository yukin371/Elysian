<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    external?: boolean
    href?: string
    tone?: "accent" | "muted" | "primary"
    underline?: "always" | "auto" | "none"
  }>(),
  {
    external: false,
    href: "#",
    tone: "primary",
    underline: "auto",
  },
)

const relValue = computed(() =>
  props.external ? "noreferrer noopener" : undefined,
)

const targetValue = computed(() => (props.external ? "_blank" : undefined))
</script>

<template>
  <a
    class="ely-public-link"
    :data-external="external ? 'true' : 'false'"
    :data-tone="tone"
    :data-underline="underline"
    :href="href"
    :rel="relValue"
    :target="targetValue"
  >
    <span class="ely-public-link__label">
      <slot>Open detail</slot>
    </span>
    <span
      v-if="external"
      aria-hidden="true"
      class="ely-public-link__mark"
    >
      ↗
    </span>
  </a>
</template>
