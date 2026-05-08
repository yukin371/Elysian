<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"
import { Menu as TMenu } from "tdesign-vue-next/es/menu"
import { computed, ref, watch } from "vue"

import {
  type ElyWorkbenchShellEmits,
  type ElyWorkbenchShellProps,
  resolveElyWorkbenchShellCopy,
} from "../contracts"
import ElyNavNodes from "./ElyNavNodes.vue"
import ElyShellTabs from "./ElyShellTabs.vue"
import {
  isElyShellMenuSelectable,
  toggleElyShellExpandedMenuValue,
} from "./ely-shell-navigation"

const props = withDefaults(defineProps<ElyWorkbenchShellProps>(), {
  selectedMenuKey: null,
  selectedTabKey: null,
  user: null,
  searchPlaceholder: undefined,
  contextPanelVisible: false,
  contextPanelTitle: undefined,
  contextPanelMode: "detail",
  statusBar: undefined,
  copy: () => ({}),
})
const emit = defineEmits<ElyWorkbenchShellEmits>()

const selectedMenuValue = computed(() => props.selectedMenuKey ?? undefined)

const userInitial = computed(
  () => props.user?.displayName.trim().charAt(0).toUpperCase() ?? "E",
)

const resolvedCopy = computed(() =>
  resolveElyWorkbenchShellCopy({
    navigationLabel: props.copy?.navigationLabel,
    searchPlaceholder: props.searchPlaceholder ?? props.copy?.searchPlaceholder,
    closePanelLabel: props.copy?.closePanelLabel,
    copy: props.copy,
  }),
)

const userExpandedMenuValues = ref<string[]>([])

const resolveExpandedAncestorValues = (
  items: ElyWorkbenchShellProps["navigation"],
  targetMenuKey: string | null | undefined,
  trail: string[] = [],
): string[] => {
  if (!targetMenuKey) {
    return []
  }

  for (const item of items) {
    const nextTrail =
      item.children.length > 0 || item.type === "directory"
        ? [...trail, item.id]
        : trail

    if (item.id === targetMenuKey) {
      return trail
    }

    if (item.children.length > 0) {
      const nested = resolveExpandedAncestorValues(
        item.children,
        targetMenuKey,
        nextTrail,
      )

      if (nested.length > 0) {
        return nested
      }
    }
  }

  return []
}

const selectedMenuAncestors = computed(() =>
  resolveExpandedAncestorValues(props.navigation, props.selectedMenuKey),
)

const expandedMenuValues = computed(() => userExpandedMenuValues.value)

watch(
  selectedMenuAncestors,
  (ancestors) => {
    userExpandedMenuValues.value = Array.from(
      new Set([...userExpandedMenuValues.value, ...ancestors]),
    )
  },
  { immediate: true },
)

const handleMenuChange = (value: string | number) => {
  const nextValue = String(value)

  if (!isElyShellMenuSelectable(props.navigation, nextValue)) {
    return
  }

  emit("menu-select", nextValue)
}

const handleMenuExpand = (value: Array<string | number>) => {
  userExpandedMenuValues.value = value.map((item) => String(item))
}

const handleDirectoryToggle = (menuKey: string) => {
  userExpandedMenuValues.value = toggleElyShellExpandedMenuValue(
    userExpandedMenuValues.value,
    menuKey,
  )
}

const handleTabSelect = (key: string) => {
  emit("tab-select", key)
}

const handleGlobalSearch = (value: string | number) => {
  emit("global-search", String(value))
}
</script>

<template>
  <div
    class="ely-workbench"
    :class="{ 'ely-workbench--with-panel': contextPanelVisible }"
  >
    <!-- Header -->
    <header class="ely-workbench__header">
      <div class="ely-workbench__brand">
        <span class="ely-workbench__logo">Elysian</span>
      </div>
      <div class="ely-workbench__search">
        <TInput
          :placeholder="resolvedCopy.searchPlaceholder"
          clearable
          size="small"
          @change="handleGlobalSearch"
        >
          <template #prefix-icon>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM0 7a7 7 0 1 1 14 0A7 7 0 0 1 0 7Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              />
              <path
                d="M11.5 11.5 15 15"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </TInput>
      </div>
      <div class="ely-workbench__header-right">
        <div
          v-if="user"
          class="ely-workbench__user"
          @click="emit('user-click')"
        >
          <span class="ely-workbench__user-avatar">{{ userInitial }}</span>
          <span class="ely-workbench__user-name">{{ user.displayName }}</span>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="ely-workbench__sidebar">
      <TMenu
        class="ely-workbench__nav"
        theme="light"
        expand-type="normal"
        :value="selectedMenuValue"
        :expanded="expandedMenuValues"
        @expand="handleMenuExpand"
        @change="handleMenuChange"
      >
        <ElyNavNodes
          :items="navigation"
          @directory-toggle="handleDirectoryToggle"
        />
      </TMenu>
    </aside>

    <!-- Main workspace -->
    <main class="ely-workbench__workspace">
      <div
        v-if="tabs && tabs.length > 0"
        class="ely-workbench__workspace-header"
      >
        <ElyShellTabs
          :tabs="tabs"
          :selected-key="selectedTabKey ?? tabs[0]?.key ?? null"
          @select="handleTabSelect"
        />
      </div>
      <div class="ely-workbench__workspace-body">
        <slot name="workspace" />
      </div>
    </main>

    <!-- Context panel (conditional) -->
    <aside v-if="contextPanelVisible" class="ely-workbench__context">
      <slot name="context" />
    </aside>

    <!-- Status bar -->
    <footer class="ely-workbench__status">
      <span class="ely-workbench__status-left">
        <span
          v-if="statusBar?.moduleStatus"
          class="ely-workbench__status-dot"
          :class="'ely-workbench__status-dot--' + statusBar.moduleStatus.tone"
        />
        <span v-if="statusBar?.moduleStatus">{{
          statusBar.moduleStatus.label
        }}</span>
      </span>
      <span class="ely-workbench__status-center">
        <span v-if="statusBar?.recordCount !== undefined"
          >共 {{ statusBar.recordCount }} 条</span
        >
      </span>
      <span class="ely-workbench__status-right">
        <span v-if="statusBar?.selectedInfo">{{
          statusBar.selectedInfo
        }}</span>
      </span>
    </footer>
  </div>
</template>

<style scoped>
.ely-workbench {
  --ely-ink: #0f172a;
  --ely-slate: #5b6678;
  --ely-border: rgba(15, 23, 42, 0.08);
  --ely-surface: #ffffff;
  --ely-accent: #2457d6;
  --ely-accent-soft: rgba(36, 87, 214, 0.1);

  display: grid;
  grid-template-rows: 48px 1fr 28px;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar workspace"
    "status status";
  height: 100vh;
  overflow: hidden;
  background: #eef2f7;
  color: var(--ely-ink);
}

.ely-workbench--with-panel {
  grid-template-columns: 200px 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar workspace context"
    "status status status";
}

/* ── Header ── */

.ely-workbench__header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem;
  background: var(--ely-surface);
  border-bottom: 1px solid var(--ely-border);
}

.ely-workbench__brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ely-workbench__logo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ely-accent);
}

.ely-workbench__search {
  flex: 1;
  max-width: 360px;
  min-width: 120px;
}

.ely-workbench__search :deep(.t-input) {
  border-radius: 6px;
}

.ely-workbench__header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.ely-workbench__user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--ely-border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.ely-workbench__user:hover {
  border-color: rgba(36, 87, 214, 0.22);
  background: rgba(239, 246, 255, 0.72);
}

.ely-workbench__user:focus-visible {
  outline: 2px solid rgba(36, 87, 214, 0.35);
  outline-offset: 2px;
}

.ely-workbench__user-avatar {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ely-accent-soft);
  color: var(--ely-accent);
  font-size: 0.72rem;
  font-weight: 700;
}

.ely-workbench__user-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ely-ink);
}

/* ── Sidebar ── */

.ely-workbench__sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  background: var(--ely-surface);
  border-right: 1px solid var(--ely-border);
  overflow-y: auto;
}

.ely-workbench__nav {
  flex: 1;
  min-height: 0;
  background: transparent;
  border: 0;
  overflow-y: auto;
}

.ely-workbench__nav :deep(.t-default-menu),
.ely-workbench__nav :deep(.t-default-menu__inner) {
  background: transparent;
}

.ely-workbench__nav :deep(.t-menu__item),
.ely-workbench__nav :deep(.t-submenu__title) {
  border-radius: 6px;
  min-height: 36px;
  height: auto;
  align-items: stretch;
  box-sizing: border-box;
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

.ely-workbench__nav :deep(.t-menu__item:hover),
.ely-workbench__nav :deep(.t-submenu__title:hover) {
  background: rgba(36, 87, 214, 0.05);
}

.ely-workbench__nav
  :deep(.t-menu__item.t-is-active.t-menu__item--plain),
.ely-workbench__nav :deep(.t-submenu__item.t-is-active) {
  background: rgba(36, 87, 214, 0.12);
  box-shadow: inset 3px 0 0 var(--ely-accent);
}

/* ── Workspace ── */

.ely-workbench__workspace {
  grid-area: workspace;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.ely-workbench__workspace-header {
  display: flex;
  flex-shrink: 0;
  background: var(--ely-surface);
  border-bottom: 1px solid var(--ely-border);
}

.ely-workbench__workspace-header :deep(.ely-shell-tabs) {
  flex: 1;
  min-width: 0;
  padding: 0;
  border-bottom: 0;
}

.ely-workbench__workspace-body {
  flex: 1;
  min-height: 0;
  padding: 0.75rem;
  overflow: auto;
}

/* ── Context panel ── */

.ely-workbench__context {
  grid-area: context;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 380px;
  background: var(--ely-surface);
  border-left: 1px solid var(--ely-border);
  overflow-y: auto;
}

/* ── Status bar ── */

.ely-workbench__status {
  grid-area: status;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background: var(--ely-surface);
  border-top: 1px solid var(--ely-border);
  font-size: 0.72rem;
  color: var(--ely-slate);
}

.ely-workbench__status-left,
.ely-workbench__status-center,
.ely-workbench__status-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ely-workbench__status-left {
  flex: 1;
}

.ely-workbench__status-center {
  flex: 0;
}

.ely-workbench__status-right {
  flex: 1;
  justify-content: flex-end;
}

.ely-workbench__status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.ely-workbench__status-dot--success {
  background: #10b981;
}

.ely-workbench__status-dot--warning {
  background: #f59e0b;
}

.ely-workbench__status-dot--error {
  background: #ef4444;
}

.ely-workbench__status-dot--default {
  background: #94a3b8;
}
</style>
