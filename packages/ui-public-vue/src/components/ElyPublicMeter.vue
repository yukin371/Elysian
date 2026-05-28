<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    helper?: string
    label?: string
    max?: number
    showValue?: boolean
    tone?: "accent" | "danger" | "primary" | "success" | "warning"
    value?: number
    valueText?: string
  }>(),
  {
    helper: "",
    label: "",
    max: 100,
    showValue: true,
    tone: "primary",
    value: 0,
    valueText: "",
  },
)

const safeMax = computed(() => (props.max > 0 ? props.max : 100))
const safeValue = computed(() =>
  Math.min(Math.max(props.value, 0), safeMax.value),
)
const percentage = computed(() =>
  Math.round((safeValue.value / safeMax.value) * 100),
)
const readableValue = computed(() => props.valueText || `${percentage.value}%`)
</script>

<template>
  <div class="ely-public-meter" :data-tone="tone">
    <div v-if="label || showValue" class="ely-public-meter__meta">
      <span v-if="label" class="ely-public-meter__label">{{ label }}</span>
      <span v-if="showValue" class="ely-public-meter__value">
        {{ readableValue }}
      </span>
    </div>

    <div
      class="ely-public-meter__track"
      role="meter"
      :aria-label="label || 'Meter'"
      :aria-valuemin="0"
      :aria-valuemax="safeMax"
      :aria-valuenow="safeValue"
      :aria-valuetext="readableValue"
    >
      <span
        class="ely-public-meter__fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>

    <p v-if="helper" class="ely-public-meter__helper">
      {{ helper }}
    </p>
  </div>
</template>
