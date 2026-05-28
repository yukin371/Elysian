<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    description?: string
    actionAriaLabel?: string
    actionLabel?: string
    dismissLabel?: string
    dismissible?: boolean
    title?: string
    tone?: "danger" | "info" | "success" | "warning"
  }>(),
  {
    actionAriaLabel: undefined,
    actionLabel: undefined,
    description: undefined,
    dismissLabel: "Dismiss notification",
    dismissible: false,
    title: "Notification",
    tone: "info",
  },
)

const emit = defineEmits<{
  action: []
  dismiss: []
}>()

const announcementRole = computed(() =>
  props.tone === "danger" || props.tone === "warning" ? "alert" : "status",
)
</script>

<template>
  <section
    class="ely-public-toast"
    :data-dismissible="dismissible ? 'true' : 'false'"
    :data-tone="tone"
    :role="announcementRole"
  >
    <span class="ely-public-toast__signal" aria-hidden="true" />
    <div class="ely-public-toast__body">
      <strong class="ely-public-toast__title">{{ title }}</strong>
      <p v-if="description || $slots.default" class="ely-public-toast__copy">
        <slot>{{ description }}</slot>
      </p>
    </div>
    <div
      v-if="actionLabel || $slots.action || dismissible"
      class="ely-public-toast__controls"
    >
      <slot name="action">
        <button
          v-if="actionLabel"
          class="ely-public-toast__action"
          :aria-label="actionAriaLabel"
          type="button"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </button>
      </slot>
      <button
        v-if="dismissible"
        class="ely-public-toast__dismiss"
        :aria-label="dismissLabel"
        type="button"
        @click="emit('dismiss')"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  </section>
</template>
