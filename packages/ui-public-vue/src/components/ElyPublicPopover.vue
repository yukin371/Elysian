<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue"

const props = withDefaults(
  defineProps<{
    align?: "end" | "start"
    closeLabel?: string
    description?: string
    open?: boolean
    placement?: "bottom" | "top"
    title?: string
    tone?: "accent" | "neutral"
    triggerLabel?: string
  }>(),
  {
    align: "start",
    closeLabel: "Close context panel",
    description: "",
    open: undefined,
    placement: "bottom",
    title: "",
    tone: "neutral",
    triggerLabel: "Open context panel",
  },
)

const emit = defineEmits<{
  "update:open": [open: boolean]
}>()

const componentId = useId()
const triggerId = `ely-public-popover-trigger-${componentId}`
const panelId = `ely-public-popover-${componentId}`
const titleId = `ely-public-popover-title-${componentId}`
const descriptionId = `ely-public-popover-description-${componentId}`
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const internalOpen = ref(false)

const isOpen = computed(() => props.open ?? internalOpen.value)
const labelledBy = computed(() => (props.title ? titleId : undefined))
const describedBy = computed(() =>
  props.description ? descriptionId : undefined,
)

const setOpen = (open: boolean) => {
  if (props.open === undefined) {
    internalOpen.value = open
  }

  emit("update:open", open)
}

const closePopover = () => {
  setOpen(false)
}

const togglePopover = async () => {
  setOpen(!isOpen.value)

  if (!isOpen.value) {
    return
  }

  await nextTick()
  panelRef.value?.focus()
}

const handleTriggerKeydown = async (event: KeyboardEvent) => {
  if (["Enter", " "].includes(event.key)) {
    event.preventDefault()
    await togglePopover()
    return
  }

  if (event.key === "Escape" && isOpen.value) {
    event.preventDefault()
    closePopover()
  }
}

const handlePanelKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") {
    return
  }

  event.preventDefault()
  closePopover()
  triggerRef.value?.focus()
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (rootRef.value?.contains(target)) {
    return
  }

  closePopover()
}

const attachOutsideListener = () => {
  if (typeof document === "undefined") {
    return
  }

  document.addEventListener("pointerdown", handleDocumentPointerDown)
}

const detachOutsideListener = () => {
  if (typeof document === "undefined") {
    return
  }

  document.removeEventListener("pointerdown", handleDocumentPointerDown)
}

watch(
  isOpen,
  (open) => {
    if (open) {
      attachOutsideListener()
      return
    }

    detachOutsideListener()
  },
  { immediate: true },
)

onUnmounted(() => {
  detachOutsideListener()
})
</script>

<template>
  <span
    ref="rootRef"
    class="ely-public-popover"
    :data-align="align"
    :data-open="isOpen ? 'true' : 'false'"
    :data-placement="placement"
    :data-tone="tone"
  >
    <button
      :id="triggerId"
      ref="triggerRef"
      class="ely-public-popover__trigger"
      type="button"
      :aria-controls="panelId"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="togglePopover"
      @keydown="handleTriggerKeydown"
    >
      <slot name="trigger">{{ triggerLabel }}</slot>
      <span class="ely-public-popover__chevron" aria-hidden="true">⌄</span>
    </button>

    <section
      v-if="isOpen"
      :id="panelId"
      ref="panelRef"
      class="ely-public-popover__panel"
      role="dialog"
      aria-modal="false"
      :aria-labelledby="labelledBy"
      :aria-label="labelledBy ? undefined : triggerLabel"
      :aria-describedby="describedBy"
      tabindex="-1"
      @keydown="handlePanelKeydown"
    >
      <div v-if="title || description" class="ely-public-popover__header">
        <h2 v-if="title" :id="titleId" class="ely-public-popover__title">
          {{ title }}
        </h2>
        <p
          v-if="description"
          :id="descriptionId"
          class="ely-public-popover__description"
        >
          {{ description }}
        </p>
      </div>

      <div class="ely-public-popover__body">
        <slot />
      </div>

      <div v-if="$slots.actions" class="ely-public-popover__actions">
        <slot name="actions" />
      </div>

      <button
        class="ely-public-popover__close"
        type="button"
        :aria-label="closeLabel"
        @click="closePopover"
      >
        ×
      </button>
    </section>
  </span>
</template>
