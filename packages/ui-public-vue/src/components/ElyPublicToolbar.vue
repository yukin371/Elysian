<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
    density?: "comfortable" | "compact"
    justify?: "between" | "end" | "start"
  }>(),
  {
    ariaLabel: "Toolbar",
    density: "comfortable",
    justify: "between",
  },
)
</script>

<template>
  <div
    class="ely-public-toolbar"
    :aria-label="ariaLabel"
    :data-density="density"
    :data-justify="justify"
    role="group"
  >
    <div v-if="$slots.leading" class="ely-public-toolbar__leading">
      <slot name="leading" />
    </div>
    <div class="ely-public-toolbar__main">
      <slot />
    </div>
    <div v-if="$slots.trailing" class="ely-public-toolbar__trailing">
      <slot name="trailing" />
    </div>
  </div>
</template>
