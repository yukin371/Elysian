<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue"
import type { ElyPublicMenuItem } from "./contracts"

const props = withDefaults(
  defineProps<{
    align?: "end" | "start"
    ariaLabel?: string
    disabled?: boolean
    items: ElyPublicMenuItem[]
    open?: boolean
    placement?: "bottom" | "top"
    triggerLabel?: string
  }>(),
  {
    align: "start",
    ariaLabel: "Action menu",
    disabled: false,
    open: undefined,
    placement: "bottom",
    triggerLabel: "More actions",
  },
)

const emit = defineEmits<{
  select: [key: string, item: ElyPublicMenuItem]
  "update:open": [open: boolean]
}>()

const componentId = useId()
const triggerId = `ely-public-menu-trigger-${componentId}`
const menuId = `ely-public-menu-${componentId}`
const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const internalOpen = ref(false)

const isOpen = computed(() => props.open ?? internalOpen.value)
const enabledItems = computed(() =>
  props.items.filter((item) => !item.disabled),
)

const setOpen = (open: boolean) => {
  if (props.open === undefined) {
    internalOpen.value = open
  }

  emit("update:open", open)
}

const closeMenu = () => {
  setOpen(false)
}

const openMenu = async (focus: "first" | "last" = "first") => {
  if (props.disabled || enabledItems.value.length === 0) {
    return
  }

  setOpen(true)
  await nextTick()
  focusItem(focus === "first" ? 0 : enabledItems.value.length - 1)
}

const toggleMenu = async () => {
  if (isOpen.value) {
    closeMenu()
    return
  }

  await openMenu("first")
}

const getFocusableItems = () =>
  Array.from(
    menuRef.value?.querySelectorAll<HTMLElement>(
      '[data-menu-focusable="true"]',
    ) ?? [],
  )

const focusItem = (index: number) => {
  const focusableItems = getFocusableItems()
  const item = focusableItems[index]

  item?.focus()
}

const focusNextItem = (direction: 1 | -1) => {
  const focusableItems = getFocusableItems()

  if (focusableItems.length === 0) {
    return
  }

  const activeIndex = focusableItems.findIndex(
    (item) => item === document.activeElement,
  )
  const nextIndex =
    activeIndex < 0
      ? direction > 0
        ? 0
        : focusableItems.length - 1
      : (activeIndex + direction + focusableItems.length) %
        focusableItems.length

  focusableItems[nextIndex]?.focus()
}

const handleTriggerKeydown = async (event: KeyboardEvent) => {
  if (["ArrowDown", "Enter", " "].includes(event.key)) {
    event.preventDefault()
    await openMenu("first")
    return
  }

  if (event.key === "ArrowUp") {
    event.preventDefault()
    await openMenu("last")
  }
}

const handleMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault()
    closeMenu()
    triggerRef.value?.focus()
    return
  }

  if (event.key === "ArrowDown") {
    event.preventDefault()
    focusNextItem(1)
    return
  }

  if (event.key === "ArrowUp") {
    event.preventDefault()
    focusNextItem(-1)
    return
  }

  if (event.key === "Home") {
    event.preventDefault()
    focusItem(0)
    return
  }

  if (event.key === "End") {
    event.preventDefault()
    focusItem(enabledItems.value.length - 1)
  }
}

const selectItem = (item: ElyPublicMenuItem) => {
  if (item.disabled) {
    return
  }

  emit("select", item.key, item)
  closeMenu()
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (rootRef.value?.contains(target)) {
    return
  }

  closeMenu()
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
    class="ely-public-menu"
    :data-align="align"
    :data-open="isOpen ? 'true' : 'false'"
    :data-placement="placement"
  >
    <button
      :id="triggerId"
      ref="triggerRef"
      class="ely-public-menu__trigger"
      type="button"
      :aria-controls="menuId"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :disabled="disabled"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <slot name="trigger">{{ triggerLabel }}</slot>
      <span class="ely-public-menu__chevron" aria-hidden="true">⌄</span>
    </button>

    <div
      v-if="isOpen"
      :id="menuId"
      ref="menuRef"
      class="ely-public-menu__panel"
      :aria-label="ariaLabel"
      role="menu"
      @keydown="handleMenuKeydown"
    >
      <template v-for="item in items" :key="item.key">
        <a
          v-if="item.href && !item.disabled"
          class="ely-public-menu__item"
          :data-current="item.current ? 'true' : 'false'"
          data-menu-focusable="true"
          :data-tone="item.tone ?? 'neutral'"
          :href="item.href"
          role="menuitem"
          :aria-current="item.current ? 'page' : undefined"
          @click="selectItem(item)"
        >
          <span class="ely-public-menu__item-main">
            <span class="ely-public-menu__label">{{ item.label }}</span>
            <span v-if="item.description" class="ely-public-menu__description">
              {{ item.description }}
            </span>
          </span>
          <span v-if="item.meta" class="ely-public-menu__meta">
            {{ item.meta }}
          </span>
        </a>
        <button
          v-else
          class="ely-public-menu__item"
          :data-current="item.current ? 'true' : 'false'"
          :data-menu-focusable="item.disabled ? 'false' : 'true'"
          :data-tone="item.tone ?? 'neutral'"
          type="button"
          role="menuitem"
          :disabled="item.disabled"
          @click="selectItem(item)"
        >
          <span class="ely-public-menu__item-main">
            <span class="ely-public-menu__label">{{ item.label }}</span>
            <span v-if="item.description" class="ely-public-menu__description">
              {{ item.description }}
            </span>
          </span>
          <span v-if="item.meta" class="ely-public-menu__meta">
            {{ item.meta }}
          </span>
        </button>
      </template>
    </div>
  </span>
</template>
