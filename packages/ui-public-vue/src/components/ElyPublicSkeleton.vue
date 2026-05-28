<script setup lang="ts">
withDefaults(
  defineProps<{
    lines?: number
    tone?: "default" | "soft"
  }>(),
  {
    lines: 3,
    tone: "default",
  },
)
</script>

<template>
  <div class="ely-public-skeleton" :data-tone="tone" aria-hidden="true">
    <div class="ely-public-skeleton__avatar" />
    <div class="ely-public-skeleton__body">
      <div class="ely-public-skeleton__line ely-public-skeleton__line--title" />
      <div
        v-for="line in lines"
        :key="line"
        class="ely-public-skeleton__line"
      />
    </div>
  </div>
</template>
