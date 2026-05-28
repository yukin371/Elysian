<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    keys?: string[]
    separatorLabel?: string
    size?: "md" | "sm"
    tone?: "accent" | "muted" | "neutral" | "primary"
  }>(),
  {
    keys: () => [],
    separatorLabel: "then",
    size: "md",
    tone: "neutral",
  },
)

const hasKeys = () => props.keys.length > 0
</script>

<template>
  <span
    class="ely-public-kbd"
    :data-size="size"
    :data-tone="tone"
    aria-label="Keyboard shortcut"
  >
    <template v-if="hasKeys()">
      <template v-for="(key, index) in keys" :key="`${key}-${index}`">
        <span v-if="index > 0" class="ely-public-kbd__separator" aria-hidden="true">
          +
        </span>
        <span v-if="index > 0" class="ely-public-sr-only">
          {{ separatorLabel }}
        </span>
        <kbd class="ely-public-kbd__key">{{ key }}</kbd>
      </template>
    </template>
    <kbd v-else class="ely-public-kbd__key">
      <slot />
    </kbd>
  </span>
</template>
