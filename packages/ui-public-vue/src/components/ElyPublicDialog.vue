<script setup lang="ts">
import { nextTick, onUnmounted, ref, useId, watch } from "vue"
import { shouldCloseDialogForKey } from "./interaction"

const props = withDefaults(
  defineProps<{
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    description?: string
    open?: boolean
    size?: "lg" | "md" | "sm"
    title?: string
  }>(),
  {
    closeOnBackdrop: true,
    closeOnEscape: true,
    description: undefined,
    open: false,
    size: "md",
    title: undefined,
  },
)

const emit = defineEmits<{
  close: []
}>()

const componentId = useId()
const panelId = `ely-public-dialog-${componentId}`
const titleId = `${panelId}-title`
const descriptionId = `${panelId}-description`
const closeButtonRef = ref<HTMLButtonElement | null>(null)
let previousActiveElement: HTMLElement | null = null

const closeDialog = () => {
  emit("close")
}

const closeFromBackdrop = () => {
  if (!props.closeOnBackdrop) {
    return
  }

  closeDialog()
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (!props.open || !props.closeOnEscape) {
    return
  }

  if (!shouldCloseDialogForKey(event.key)) {
    return
  }

  event.preventDefault()
  closeDialog()
}

const attachEscapeListener = () => {
  if (typeof document === "undefined") {
    return
  }

  document.addEventListener("keydown", handleDocumentKeydown)
}

const detachEscapeListener = () => {
  if (typeof document === "undefined") {
    return
  }

  document.removeEventListener("keydown", handleDocumentKeydown)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousActiveElement =
        typeof document !== "undefined"
          ? (document.activeElement as HTMLElement | null)
          : null
      attachEscapeListener()
      await nextTick()
      closeButtonRef.value?.focus()
      return
    }

    detachEscapeListener()
    previousActiveElement?.focus?.()
  },
  { immediate: true },
)

onUnmounted(() => {
  detachEscapeListener()
})
</script>

<template>
  <div
    v-if="open"
    class="ely-public-dialog"
    role="presentation"
    @click.self="closeDialog"
  >
    <button
      class="ely-public-dialog__backdrop"
      type="button"
      aria-label="Close dialog backdrop"
      @click="closeFromBackdrop"
    />
    <section
      :id="panelId"
      :aria-describedby="description ? descriptionId : undefined"
      :aria-labelledby="title ? titleId : undefined"
      class="ely-public-dialog__panel"
      :data-size="size"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <button
        ref="closeButtonRef"
        class="ely-public-dialog__close"
        type="button"
        aria-label="Close dialog"
        @click="closeDialog"
      >
        ×
      </button>

      <header
        v-if="title || description || $slots.header"
        class="ely-public-dialog__header"
      >
        <slot name="header">
          <h3 v-if="title" :id="titleId" class="ely-public-dialog__title">
            {{ title }}
          </h3>
          <p
            v-if="description"
            :id="descriptionId"
            class="ely-public-dialog__description"
          >
            {{ description }}
          </p>
        </slot>
      </header>

      <div class="ely-public-dialog__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="ely-public-dialog__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>
