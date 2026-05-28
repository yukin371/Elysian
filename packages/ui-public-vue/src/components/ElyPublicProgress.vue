<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    label?: string
    max?: number
    showValue?: boolean
    tone?: "accent" | "primary" | "success" | "warning"
    value?: number
  }>(),
  {
    max: 100,
    showValue: true,
    tone: "primary",
    value: 0,
  },
)

const safeMax = computed(() => (props.max > 0 ? props.max : 100))
const safeValue = computed(() =>
  Math.min(Math.max(props.value, 0), safeMax.value),
)
const percentage = computed(() =>
  Math.round((safeValue.value / safeMax.value) * 100),
)
</script>

<template>
  <div class="ely-public-progress" :data-tone="tone">
    <div
      v-if="label || showValue"
      class="ely-public-progress__meta"
    >
      <span v-if="label" class="ely-public-progress__label">{{ label }}</span>
      <span v-if="showValue" class="ely-public-progress__value">
        {{ percentage }}%
      </span>
    </div>

    <div
      class="ely-public-progress__track"
      role="progressbar"
      :aria-label="label ?? 'Progress'"
      :aria-valuemin="0"
      :aria-valuemax="safeMax"
      :aria-valuenow="safeValue"
    >
      <span
        class="ely-public-progress__fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
