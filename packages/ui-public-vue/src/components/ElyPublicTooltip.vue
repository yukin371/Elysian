<script lang="ts">
// biome-ignore lint/style/useConst: Vue SFC setup increments this module-scoped seed.
let tooltipSeed = 0
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id?: string
    open?: boolean
    placement?: "bottom" | "inline" | "top"
    text?: string
    tone?: "accent" | "neutral"
    triggerLabel?: string
  }>(),
  {
    open: false,
    placement: "top",
    text: "",
    tone: "neutral",
    triggerLabel: "Show context",
  },
)

tooltipSeed += 1
const generatedId = `ely-public-tooltip-${tooltipSeed}`
</script>

<template>
  <span
    class="ely-public-tooltip"
    :data-open="open ? 'true' : 'false'"
    :data-placement="placement"
    :data-tone="tone"
  >
    <span
      class="ely-public-tooltip__trigger"
      :aria-describedby="props.id ?? generatedId"
      :aria-label="triggerLabel"
      tabindex="0"
    >
      <slot name="trigger">i</slot>
    </span>
    <span
      :id="props.id ?? generatedId"
      class="ely-public-tooltip__bubble"
      role="tooltip"
    >
      <slot>{{ text }}</slot>
    </span>
  </span>
</template>
