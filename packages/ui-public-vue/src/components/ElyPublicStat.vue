<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: "center" | "start"
    eyebrow?: string
    helper?: string
    tone?: "accent" | "muted" | "primary"
    trend?: "down" | "flat" | "up"
    value: string
  }>(),
  {
    align: "start",
    eyebrow: undefined,
    helper: undefined,
    tone: "primary",
    trend: "flat",
  },
)
</script>

<template>
  <section
    class="ely-public-stat"
    :data-align="align"
    :data-tone="tone"
    :data-trend="trend"
  >
    <p
      v-if="eyebrow"
      class="ely-public-stat__eyebrow"
    >
      {{ eyebrow }}
    </p>
    <p class="ely-public-stat__value">
      {{ value }}
    </p>
    <div class="ely-public-stat__body">
      <p class="ely-public-stat__label">
        <slot />
      </p>
      <p
        v-if="helper"
        class="ely-public-stat__helper"
      >
        {{ helper }}
      </p>
    </div>
  </section>
</template>
