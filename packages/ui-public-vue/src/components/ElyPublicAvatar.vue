<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    alt?: string
    name?: string
    shape?: "circle" | "soft" | "square"
    size?: "sm" | "md" | "lg"
    src?: string
    status?: "away" | "busy" | "offline" | "online"
  }>(),
  {
    shape: "soft",
    size: "md",
  },
)

const imageFailed = ref(false)

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)

const accessibleLabel = computed(() => props.alt ?? props.name ?? "Avatar")

const initials = computed(() => {
  const source = props.name?.trim() ?? ""

  if (!source) {
    return "E"
  }

  const parts = source.split(/\s+/).filter(Boolean)
  const compact =
    parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : source.slice(0, 2)

  return compact.toUpperCase()
})
</script>

<template>
  <span
    class="ely-public-avatar"
    :data-shape="shape"
    :data-size="size"
    :data-status="status"
  >
    <img
      v-if="src && !imageFailed"
      class="ely-public-avatar__image"
      :src="src"
      :alt="accessibleLabel"
      @error="imageFailed = true"
    />
    <span
      v-else
      class="ely-public-avatar__fallback"
      role="img"
      :aria-label="accessibleLabel"
    >
      {{ initials }}
    </span>
    <span
      v-if="status"
      class="ely-public-avatar__status"
      role="img"
      :aria-label="`Status: ${status}`"
    />
  </span>
</template>
