<script setup lang="ts">
import { computed, useId } from "vue"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    density?: "comfortable" | "compact"
    description?: string
    disabled?: boolean
    id?: string
    invalidMessage?: string
    legend?: string
    tone?: "accent" | "danger" | "neutral" | "primary"
  }>(),
  {
    ariaLabel: "Field group",
    density: "comfortable",
    description: undefined,
    disabled: false,
    id: undefined,
    invalidMessage: undefined,
    legend: undefined,
    tone: "neutral",
  },
)

const fallbackId = useId()
const resolvedId = computed(
  () => props.id ?? `ely-public-fieldset-${fallbackId}`,
)
const descriptionId = computed(() =>
  props.description ? `${resolvedId.value}-description` : undefined,
)
const messageId = computed(() =>
  props.invalidMessage ? `${resolvedId.value}-message` : undefined,
)
const describedBy = computed(() =>
  [descriptionId.value, messageId.value].filter(Boolean).join(" "),
)
</script>

<template>
  <fieldset
    :id="resolvedId"
    :aria-describedby="describedBy || undefined"
    :aria-label="props.legend ? undefined : props.ariaLabel"
    class="ely-public-fieldset"
    :data-density="props.density"
    :data-invalid="props.invalidMessage ? 'true' : 'false'"
    :data-tone="props.tone"
    :disabled="props.disabled"
  >
    <legend v-if="props.legend" class="ely-public-fieldset__legend">
      {{ props.legend }}
    </legend>
    <p
      v-if="props.description"
      :id="descriptionId"
      class="ely-public-fieldset__description"
    >
      {{ props.description }}
    </p>
    <div class="ely-public-fieldset__body">
      <slot />
    </div>
    <p
      v-if="props.invalidMessage"
      :id="messageId"
      class="ely-public-fieldset__message"
    >
      {{ props.invalidMessage }}
    </p>
  </fieldset>
</template>
