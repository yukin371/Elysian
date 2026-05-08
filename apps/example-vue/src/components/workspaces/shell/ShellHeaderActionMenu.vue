<script setup lang="ts">
import { ref } from "vue"

defineProps<{
  label: string
}>()

const detailsRef = ref<HTMLDetailsElement | null>(null)

const closeMenu = () => {
  detailsRef.value?.removeAttribute("open")
}
</script>

<template>
  <details ref="detailsRef" class="shell-action-menu">
    <summary class="shell-action-menu-trigger">{{ label }}</summary>

    <div class="shell-action-menu-list" @click="closeMenu">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.shell-action-menu {
  position: relative;
}

.shell-action-menu-trigger {
  list-style: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  min-height: 32px;
  padding: 0.35rem 0.8rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 4px;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.82rem;
  cursor: pointer;
  user-select: none;
}

.shell-action-menu-trigger::-webkit-details-marker {
  display: none;
}

.shell-action-menu[open] .shell-action-menu-trigger {
  border-color: rgba(36, 87, 214, 0.24);
  background: rgba(36, 87, 214, 0.05);
}

.shell-action-menu-list {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 12;
  display: grid;
  gap: 0.35rem;
  min-width: 180px;
  padding: 0.45rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.shell-action-menu-list :deep(.t-button) {
  justify-content: flex-start;
  width: 100%;
}
</style>
