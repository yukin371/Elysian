<script setup lang="ts">
import { Avatar as TAvatar } from "tdesign-vue-next/es/avatar"
import { Card as TCard } from "tdesign-vue-next/es/card"
import {
  Aside as TAside,
  Content as TContent,
  Header as THeader,
  Layout as TLayout,
} from "tdesign-vue-next/es/layout"
import { Menu as TMenu } from "tdesign-vue-next/es/menu"
import { Space as TSpace } from "tdesign-vue-next/es/space"
import { computed, ref, watch } from "vue"

import {
  type ElyShellEmits,
  type ElyShellProps,
  resolveElyShellCopy,
} from "../contracts"
import ElyNavNodes from "./ElyNavNodes.vue"
import ElyShellTabs from "./ElyShellTabs.vue"
import {
  isElyShellMenuSelectable,
  toggleElyShellExpandedMenuValue,
} from "./ely-shell-navigation"

const props = withDefaults(defineProps<ElyShellProps>(), {
  navigationLabel: undefined,
  environmentLabel: undefined,
  presetEyebrow: undefined,
  fallbackWorkspace: undefined,
  selectedMenuKey: null,
  selectedTabKey: null,
  user: null,
  copy: () => ({}),
})
const emit = defineEmits<ElyShellEmits>()

const selectedMenuValue = computed(() => props.selectedMenuKey ?? undefined)

const userInitial = computed(
  () => props.user?.displayName.trim().charAt(0).toUpperCase() ?? "E",
)

const selectedTabKey = computed(
  () => props.selectedTabKey ?? props.tabs?.[0]?.key ?? null,
)

const userExpandedMenuValues = ref<string[]>([])

const resolveExpandedAncestorValues = (
  items: ElyShellProps["navigation"],
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
  {
    immediate: true,
  },
)

const resolvedCopy = computed(() =>
  resolveElyShellCopy({
    navigationLabel: props.navigationLabel,
    environmentLabel: props.environmentLabel,
    presetEyebrow: props.presetEyebrow,
    fallbackWorkspace: props.fallbackWorkspace,
    copy: props.copy,
  }),
)

const handleMenuChange = (value: string | number) => {
  const nextValue = String(value)

  if (!isElyShellMenuSelectable(props.navigation, nextValue)) {
    return
  }

  emit("menu-select", nextValue)
}

const handleTabSelect = (key: string) => {
  emit("tab-select", key)
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
</script>

<template>
  <div class="ely-shell">
    <TLayout class="ely-shell-layout">
      <TAside width="272px" class="ely-shell-sider">
        <div class="ely-brand">
          <div class="ely-brand-mark">E</div>
          <div class="ely-brand-copy">
            <p>{{ title }}</p>
            <span>{{ subtitle }}</span>
          </div>
        </div>

        <div class="ely-sidebar-label">
          <span>{{ resolvedCopy.navigationLabel }}</span>
          <small>{{ presetLabel }}</small>
        </div>

        <TMenu
          class="ely-nav"
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

        <div class="ely-sidebar-foot">
          <p>{{ resolvedCopy.environmentLabel }}</p>
          <strong>{{ environment }}</strong>
          <span>{{ status }}</span>
        </div>

        <slot name="sidebar-extra" />
      </TAside>

      <TLayout class="ely-shell-main">
        <THeader height="auto" class="ely-shell-header">
          <div>
            <h2>{{ workspaceTitle }}</h2>
          </div>

          <div class="ely-header-actions">
            <TSpace>
              <slot name="header-actions" />
            </TSpace>

            <div v-if="user" class="ely-user">
              <TAvatar size="42px" class="ely-user-avatar">
                {{ userInitial }}
              </TAvatar>
              <div>
                <strong>{{ user.displayName }}</strong>
                <span>{{ user.username }}</span>
              </div>
            </div>
          </div>
        </THeader>

        <ElyShellTabs
          v-if="tabs && tabs.length > 0"
          :tabs="tabs"
          :selected-key="selectedTabKey"
          @select="handleTabSelect"
        />

        <TContent class="ely-shell-content">
          <div v-if="stats.length > 0" class="ely-stat-grid">
            <TCard
              v-for="stat in stats"
              :key="stat.key"
              class="ely-stat-card"
              :bordered="false"
            >
              <p class="ely-stat-label">{{ stat.label }}</p>
              <h3 class="ely-stat-value">{{ stat.value }}</h3>
              <p v-if="stat.hint" class="ely-stat-hint">
                {{ stat.hint }}
              </p>
            </TCard>
          </div>

          <div
            class="ely-workspace-grid"
            :class="{
              'ely-workspace-single': !$slots.secondary,
            }"
          >
            <section class="ely-workspace-main">
              <slot name="workspace">
                <TCard :bordered="false" class="ely-fallback-card">
                  {{ resolvedCopy.fallbackWorkspace }}
                </TCard>
              </slot>
            </section>

            <aside v-if="$slots.secondary" class="ely-workspace-side">
              <slot name="secondary" />
            </aside>
          </div>
        </TContent>
      </TLayout>
    </TLayout>
  </div>
</template>

<style scoped>
.ely-shell {
  --elysian-ely-ink: #0f172a;
  --elysian-ely-slate: #5b6678;
  --elysian-ely-border: rgba(15, 23, 42, 0.08);
  --elysian-ely-panel: rgba(248, 250, 252, 0.9);
  --elysian-ely-surface: rgba(255, 255, 255, 0.96);
  --elysian-ely-accent: #2457d6;
  --elysian-ely-accent-soft: rgba(36, 87, 214, 0.1);
  height: 100vh;
  min-height: 100vh;
  background: #eef2f7;
  color: var(--elysian-ely-ink);
  overflow: hidden;
}

.ely-shell-layout {
  height: 100%;
  min-height: 0;
  background: transparent;
}

.ely-shell-sider {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
  height: 100vh;
  min-height: 0;
  padding: 1rem 0.75rem;
  background: #ffffff;
  border-right: 1px solid var(--elysian-ely-border);
  overflow: hidden;
}

.ely-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.25rem 0.25rem 0.75rem;
}

.ely-brand-mark {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #173ea6, #2457d6);
  color: white;
  font-size: 1.15rem;
  font-weight: 700;
}

.ely-brand-copy p {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--elysian-ely-ink);
}

.ely-brand-copy span {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--elysian-ely-slate);
}

.ely-sidebar-label,
.ely-sidebar-foot {
  padding: 0 0.45rem;
}

.ely-sidebar-label span,
.ely-stat-label,
.ely-sidebar-foot p {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.ely-sidebar-label small,
.ely-sidebar-foot span {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.ely-sidebar-foot strong {
  display: block;
  margin-top: 0.4rem;
  font-size: 1rem;
  color: var(--elysian-ely-ink);
}

.ely-nav {
  flex: 1;
  min-height: 0;
  background: transparent;
  border: 0;
  overflow-y: auto;
}

.ely-nav :deep(.t-default-menu),
.ely-nav :deep(.t-default-menu__inner) {
  background: transparent;
}

.ely-nav :deep(.t-menu__item),
.ely-nav :deep(.t-submenu__title) {
  border-radius: 6px;
  min-height: 44px;
  height: auto;
  align-items: stretch;
  box-sizing: border-box;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.ely-nav :deep(.t-menu__item:hover),
.ely-nav :deep(.t-submenu__title:hover) {
  background: rgba(36, 87, 214, 0.05);
}

.ely-nav :deep(.t-menu__item.t-is-opened:not(.t-menu__item--plain)),
.ely-nav :deep(.t-menu__item.t-is-active:not(.t-menu__item--plain)),
.ely-nav :deep(.t-is-opened > .t-submenu__title),
.ely-nav :deep(.t-submenu__title.t-is-active) {
  background: rgba(36, 87, 214, 0.06);
}

.ely-nav :deep(.t-menu__item.t-is-active.t-menu__item--plain),
.ely-nav :deep(.t-submenu__item.t-is-active) {
  background: rgba(36, 87, 214, 0.12);
  box-shadow: inset 3px 0 0 var(--elysian-ely-accent);
}

.ely-nav :deep(.t-menu__content) {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  white-space: normal;
  line-height: 1.4;
}

.ely-nav :deep(.t-fake-arrow) {
  flex-shrink: 0;
  margin-top: 0.45rem;
}

.ely-shell-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  min-height: 0;
  background: transparent;
  overflow: hidden;
}

.ely-shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-shrink: 0;
  min-height: auto;
  padding: 0.9rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid var(--elysian-ely-border);
}

.ely-shell-header > div:first-child {
  flex: 1;
  min-width: 0;
}

.ely-shell-header h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.25;
  word-break: keep-all;
  color: var(--elysian-ely-ink);
}

.ely-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ely-header-actions :deep(.t-space) {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ely-header-actions :deep(.t-button) {
  min-width: 84px;
  white-space: nowrap;
}

.ely-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--elysian-ely-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.ely-user strong {
  display: block;
  color: var(--elysian-ely-ink);
}

.ely-user span {
  display: block;
  margin-top: 0.18rem;
  font-size: 0.8rem;
  color: var(--elysian-ely-slate);
}

.ely-user-avatar {
  background: var(--elysian-ely-accent-soft);
  color: var(--elysian-ely-accent);
  font-weight: 700;
}

.ely-shell-content {
  flex: 1;
  min-height: 0;
  padding: 0.75rem;
  background: transparent;
  overflow: auto;
}

.ely-stat-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.ely-stat-card,
.ely-fallback-card {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.62);
  box-shadow: none;
}

.ely-stat-value {
  margin: 0.65rem 0 0;
  font-size: clamp(1.5rem, 1.2rem + 0.7vw, 1.8rem);
  line-height: 1.15;
  overflow-wrap: anywhere;
  color: var(--elysian-ely-ink);
}

.ely-stat-hint {
  margin: 0.65rem 0 0;
  line-height: 1.45;
  color: var(--elysian-ely-slate);
}

.ely-workspace-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.85fr);
  margin-top: 0;
}

.ely-workspace-single {
  grid-template-columns: 1fr;
}

.ely-workspace-main,
.ely-workspace-side {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 1100px) {
  .ely-shell-layout {
    min-height: 0;
  }

  .ely-stat-grid,
  .ely-workspace-grid {
    grid-template-columns: 1fr;
  }

  .ely-shell-header {
    flex-direction: column;
  }

  .ely-header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 860px) {
  .ely-shell {
    height: auto;
    overflow: visible;
  }

  .ely-shell-layout {
    display: block;
    height: auto;
  }

  .ely-shell-sider {
    width: 100% !important;
    height: auto;
    overflow: visible;
    border-right: 0;
    border-bottom: 1px solid var(--elysian-ely-border);
  }

  .ely-shell-main {
    height: auto;
    overflow: visible;
  }

  .ely-shell-content {
    overflow: visible;
  }
}
</style>
