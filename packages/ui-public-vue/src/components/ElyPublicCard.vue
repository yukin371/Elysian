<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    emphasis?: "default" | "feature" | "muted"
    subtitle?: string
    title?: string
  }>(),
  {
    eyebrow: undefined,
    emphasis: "default",
    subtitle: undefined,
    title: undefined,
  },
)
</script>

<template>
  <article class="ely-public-card" :data-emphasis="emphasis">
    <header
      v-if="eyebrow || title || subtitle || $slots.header"
      class="ely-public-card__header"
    >
      <slot name="header">
        <p v-if="eyebrow" class="ely-public-card__eyebrow">{{ eyebrow }}</p>
        <h3 v-if="title" class="ely-public-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="ely-public-card__subtitle">{{ subtitle }}</p>
      </slot>
    </header>

    <div class="ely-public-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="ely-public-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
