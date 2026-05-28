<script setup lang="ts">
import { computed } from "vue"
import type { ElyPublicStepItem, ElyPublicStepStatus } from "./contracts"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    interactive?: boolean
    items: ElyPublicStepItem[]
    modelValue?: string
    orientation?: "horizontal" | "vertical"
  }>(),
  {
    ariaLabel: "Steps",
    interactive: false,
    modelValue: undefined,
    orientation: "horizontal",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const activeKey = computed(() => props.modelValue ?? props.items[0]?.key ?? "")
const activeIndex = computed(() =>
  Math.max(
    0,
    props.items.findIndex((item) => item.key === activeKey.value),
  ),
)

const getStepState = (
  item: ElyPublicStepItem,
  index: number,
): ElyPublicStepStatus => {
  if (item.status) {
    return item.status
  }

  if (item.key === activeKey.value) {
    return "current"
  }

  return index < activeIndex.value ? "complete" : "upcoming"
}

const selectStep = (item: ElyPublicStepItem, index: number) => {
  const state = getStepState(item, index)

  if (!props.interactive || state === "disabled") {
    return
  }

  emit("update:modelValue", item.key)
}
</script>

<template>
  <nav
    class="ely-public-stepper"
    :aria-label="ariaLabel"
    :data-interactive="interactive ? 'true' : 'false'"
    :data-orientation="orientation"
  >
    <ol class="ely-public-stepper__list">
      <li
        v-for="(item, index) in items"
        :key="item.key"
        class="ely-public-stepper__item"
        :data-state="getStepState(item, index)"
      >
        <button
          v-if="interactive"
          class="ely-public-stepper__step"
          :aria-current="getStepState(item, index) === 'current' ? 'step' : undefined"
          :disabled="getStepState(item, index) === 'disabled'"
          type="button"
          @click="selectStep(item, index)"
        >
          <span class="ely-public-stepper__marker" aria-hidden="true">
            {{ getStepState(item, index) === "complete" ? "✓" : index + 1 }}
          </span>
          <span class="ely-public-stepper__content">
            <span class="ely-public-stepper__label">{{ item.label }}</span>
            <span v-if="item.description" class="ely-public-stepper__description">
              {{ item.description }}
            </span>
          </span>
        </button>

        <div
          v-else
          class="ely-public-stepper__step"
          :aria-current="getStepState(item, index) === 'current' ? 'step' : undefined"
        >
          <span class="ely-public-stepper__marker" aria-hidden="true">
            {{ getStepState(item, index) === "complete" ? "✓" : index + 1 }}
          </span>
          <span class="ely-public-stepper__content">
            <span class="ely-public-stepper__label">{{ item.label }}</span>
            <span v-if="item.description" class="ely-public-stepper__description">
              {{ item.description }}
            </span>
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>
