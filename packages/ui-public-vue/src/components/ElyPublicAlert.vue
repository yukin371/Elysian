<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    dismissLabel?: string
    dismissible?: boolean
    eyebrow?: string
    title?: string
    tone?: "danger" | "info" | "success" | "warning"
  }>(),
  {
    dismissLabel: "Dismiss alert",
    dismissible: false,
    eyebrow: undefined,
    title: "System notice",
    tone: "info",
  },
)

const emit = defineEmits<{
  dismiss: []
}>()

const announcementRole = computed(() =>
  props.tone === "danger" || props.tone === "warning" ? "alert" : "status",
)
</script>

<template>
  <section
    class="ely-public-alert"
    :data-dismissible="dismissible || undefined"
    :data-tone="tone"
    :role="announcementRole"
  >
    <span class="ely-public-alert__signal" aria-hidden="true" />

    <div class="ely-public-alert__body">
      <p v-if="eyebrow" class="ely-public-alert__eyebrow">{{ eyebrow }}</p>
      <h3 class="ely-public-alert__title">{{ title }}</h3>
      <p class="ely-public-alert__copy">
        <slot>
          Keep users oriented with a concise message and a clear next step.
        </slot>
      </p>
    </div>

    <div v-if="$slots.actions" class="ely-public-alert__actions">
      <slot name="actions" />
    </div>

    <button
      v-if="dismissible"
      class="ely-public-alert__dismiss"
      type="button"
      :aria-label="dismissLabel"
      @click="emit('dismiss')"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </section>
</template>
