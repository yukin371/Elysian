<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    tone?: "accent" | "default"
  }>(),
  {
    eyebrow: undefined,
    title: "Nothing here yet",
    tone: "default",
  },
)
</script>

<template>
  <section class="ely-public-empty-state" :data-tone="tone">
    <p v-if="eyebrow" class="ely-public-empty-state__eyebrow">{{ eyebrow }}</p>
    <h3 class="ely-public-empty-state__title">{{ title }}</h3>
    <p class="ely-public-empty-state__copy">
      <slot>
        This surface is ready for a next action, but the collection is still
        empty right now.
      </slot>
    </p>
    <div v-if="$slots.actions" class="ely-public-empty-state__actions">
      <slot name="actions" />
    </div>
  </section>
</template>
