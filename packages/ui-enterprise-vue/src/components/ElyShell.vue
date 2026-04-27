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
import { computed } from "vue"

import {
  type ElyShellEmits,
  type ElyShellProps,
  resolveElyShellCopy,
} from "../contracts"
import ElyNavNodes from "./ElyNavNodes.vue"

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

const expandedMenuValues = computed(() => {
  const values: string[] = []
  const visit = (items: ElyShellProps["navigation"]) => {
    for (const item of items) {
      if (item.children.length > 0 || item.type === "directory") {
        values.push(item.id)
        visit(item.children)
      }
    }
  }

  visit(props.navigation)
  return values
})

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
  emit("menu-select", String(value))
}

const handleTabSelect = (key: string) => {
  emit("tab-select", key)
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
          @change="handleMenuChange"
        >
          <ElyNavNodes :items="navigation" />
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
            <p class="ely-overline">{{ resolvedCopy.presetEyebrow }}</p>
            <h2>{{ workspaceTitle }}</h2>
            <p>{{ workspaceDescription }}</p>
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

        <div v-if="tabs && tabs.length > 0" class="ely-shell-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="ely-shell-tab"
            :class="{ 'ely-shell-tab-active': tab.key === selectedTabKey }"
            @click="handleTabSelect(tab.key)"
          >
            <strong>{{ tab.label }}</strong>
            <span v-if="tab.hint">{{ tab.hint }}</span>
          </button>
        </div>

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
  background:
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.46), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  color: var(--elysian-ely-ink);
  overflow: hidden;
}

.ely-shell-layout {
  min-height: 820px;
  background: transparent;
}

.ely-shell-sider {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem 1rem;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(242, 246, 251, 0.98));
  border-right: 1px solid var(--elysian-ely-border);
}

.ely-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.45rem 0.35rem 1rem;
}

.ely-brand-mark {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #173ea6, #2457d6);
  color: white;
  font-size: 1.15rem;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(36, 87, 214, 0.18);
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
.ely-overline,
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
  background: transparent;
  border: 0;
}

.ely-nav :deep(.t-default-menu),
.ely-nav :deep(.t-default-menu__inner) {
  background: transparent;
}

.ely-nav :deep(.t-menu__item),
.ely-nav :deep(.t-submenu__title) {
  border-radius: 12px;
  min-height: 58px;
  height: auto;
  align-items: stretch;
  box-sizing: border-box;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.ely-nav :deep(.t-menu__item:hover),
.ely-nav :deep(.t-submenu__title:hover),
.ely-nav :deep(.t-is-opened > .t-submenu__title),
.ely-nav :deep(.t-is-active) {
  background: rgba(36, 87, 214, 0.07);
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
  background: transparent;
}

.ely-shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: auto;
  padding: 2rem 2rem 1.4rem;
  background: transparent;
}

.ely-shell-header > div:first-child {
  flex: 1;
  min-width: 0;
}

.ely-shell-header h2 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.8rem, 2vw, 2.45rem);
  line-height: 1.05;
  word-break: keep-all;
  color: var(--elysian-ely-ink);
}

.ely-shell-header p {
  max-width: 52rem;
  margin: 0.7rem 0 0;
  font-size: 0.96rem;
  line-height: 1.7;
  color: var(--elysian-ely-slate);
}

.ely-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
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
  padding: 0 2rem 2rem;
  background: transparent;
}

.ely-shell-tabs {
  display: flex;
  gap: 0.85rem;
  padding: 0 2rem 0.6rem;
  overflow-x: auto;
}

.ely-shell-tab {
  appearance: none;
  min-width: 180px;
  padding: 0.95rem 1rem;
  border: 1px solid var(--elysian-ely-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  cursor: pointer;
  text-align: left;
}

.ely-shell-tab strong,
.ely-shell-tab span {
  display: block;
}

.ely-shell-tab strong {
  color: var(--elysian-ely-ink);
}

.ely-shell-tab span {
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: var(--elysian-ely-slate);
}

.ely-shell-tab-active {
  background: rgba(36, 87, 214, 0.1);
  border-color: rgba(36, 87, 214, 0.2);
}

.ely-stat-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.ely-stat-card,
.ely-fallback-card {
  border: 1px solid var(--elysian-ely-border);
  border-radius: 16px;
  background: var(--elysian-ely-surface);
}

.ely-stat-value {
  margin: 0.85rem 0 0;
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
  gap: 1rem;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.85fr);
  margin-top: 1rem;
}

.ely-workspace-single {
  grid-template-columns: 1fr;
}

.ely-workspace-main,
.ely-workspace-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 1100px) {
  .ely-shell-layout {
    min-height: auto;
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
  .ely-shell-layout {
    display: block;
  }

  .ely-shell-sider {
    width: 100% !important;
    border-right: 0;
    border-bottom: 1px solid var(--elysian-ely-border);
  }
}
</style>
