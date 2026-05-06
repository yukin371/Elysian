<script setup lang="ts">
import type { UiNavigationNode } from "@elysian/ui-core"
import { ElyShell } from "@elysian/ui-enterprise-vue"
import { Dialog as TDialog } from "tdesign-vue-next/es/dialog"
import { computed, ref, watch } from "vue"

import type { AppTranslate } from "../../app/app-shell-helpers"
import ShellWorkspaceHeaderActions from "../workspaces/shell/ShellWorkspaceHeaderActions.vue"
import ShellWorkspaceMainSwitch from "../workspaces/shell/ShellWorkspaceMainSwitch.vue"
import ShellWorkspaceSecondarySwitch from "../workspaces/shell/ShellWorkspaceSecondarySwitch.vue"

type ListenerMap = Record<string, (...args: unknown[]) => void>

interface AdminShellLayoutProps {
  t: AppTranslate
  locale: string
  title: string
  subtitle: string
  workspaceTitle: string
  workspaceDescription: string
  presetLabel: string
  environment: string
  status: string
  copy: Record<string, unknown>
  navigation: ReadonlyArray<UiNavigationNode>
  selectedMenuKey: string | null
  tabs: ReadonlyArray<unknown>
  selectedTabKey: string
  user: Record<string, unknown> | null
  headerActionProps: Record<string, unknown>
  headerActionListeners: ListenerMap
  workspaceMainProps: Record<string, unknown>
  workspaceMainListeners: ListenerMap
  workspaceSecondaryProps: Record<string, unknown>
  workspaceSecondaryListeners: ListenerMap
}

const props = defineProps<AdminShellLayoutProps>()
const secondaryDialogOpen = ref(false)

const shouldRenderSecondary = computed(
  () =>
    props.workspaceMainProps.currentWorkspaceKind !== "workflow-definitions",
)

const emit = defineEmits<{
  (event: "menu-select", menuKey: string): void
  (event: "tab-select", tabKey: string): void
  (event: "user-click"): void
}>()

const openSecondaryDialog = () => {
  if (shouldRenderSecondary.value) {
    secondaryDialogOpen.value = true
  }
}

const closeSecondaryDialog = () => {
  secondaryDialogOpen.value = false
}

const shouldOpenSecondaryForEvent = (eventName: string) =>
  eventName.endsWith("row-click") ||
  eventName.startsWith("open-") ||
  eventName.startsWith("start-") ||
  eventName.startsWith("select-") ||
  eventName === "customer-action"

const shouldCloseSecondaryForEvent = (eventName: string) =>
  eventName.startsWith("cancel-") || eventName.startsWith("close-")

const wrapListeners = (listeners: ListenerMap) =>
  Object.fromEntries(
    Object.entries(listeners).map(([eventName, listener]) => [
      eventName,
      async (...args: unknown[]) => {
        await Promise.resolve(listener(...args))

        if (shouldCloseSecondaryForEvent(eventName)) {
          closeSecondaryDialog()
          return
        }

        if (shouldOpenSecondaryForEvent(eventName)) {
          openSecondaryDialog()
        }
      },
    ]),
  )

const wrappedHeaderActionListeners = computed(() =>
  wrapListeners(props.headerActionListeners),
)
const wrappedWorkspaceMainListeners = computed(() =>
  wrapListeners(props.workspaceMainListeners),
)
const wrappedWorkspaceSecondaryListeners = computed(() =>
  wrapListeners(props.workspaceSecondaryListeners),
)

watch(
  () => [
    props.selectedMenuKey,
    props.selectedTabKey,
    props.workspaceMainProps.currentWorkspaceKind,
  ],
  () => {
    closeSecondaryDialog()
  },
)
</script>

<template>
  <section class="content-panel">
    <ElyShell
      :key="locale"
      :title="title"
      :subtitle="subtitle"
      :workspace-title="workspaceTitle"
      :workspace-description="workspaceDescription"
      :preset-label="presetLabel"
      :environment="environment"
      :status="status"
      :copy="copy"
      :navigation="navigation"
      :stats="[]"
      :selected-menu-key="selectedMenuKey"
      :tabs="tabs"
      :selected-tab-key="selectedTabKey"
      :user="user"
      @menu-select="$emit('menu-select', $event)"
      @tab-select="$emit('tab-select', $event)"
      @user-click="$emit('user-click')"
    >
      <template #header-actions>
        <ShellWorkspaceHeaderActions
          v-bind="headerActionProps"
          v-on="wrappedHeaderActionListeners"
        />
      </template>

      <template #workspace>
        <ShellWorkspaceMainSwitch
          v-bind="workspaceMainProps"
          v-on="wrappedWorkspaceMainListeners"
        />
      </template>
    </ElyShell>

    <TDialog
      v-if="shouldRenderSecondary"
      :visible="secondaryDialogOpen"
      :header="workspaceTitle"
      width="760px"
      placement="center"
      dialog-class-name="admin-secondary-dialog"
      :close-on-esc-keydown="true"
      :footer="false"
      destroy-on-close
      @close="closeSecondaryDialog"
      @update:visible="
        (visible) => {
          if (!visible) closeSecondaryDialog()
        }
      "
    >
      <div class="admin-secondary-dialog-content">
        <ShellWorkspaceSecondarySwitch
          v-bind="workspaceSecondaryProps"
          hide-session-card
          v-on="wrappedWorkspaceSecondaryListeners"
        />
      </div>
    </TDialog>
  </section>
</template>

<style scoped>
:global(.admin-secondary-dialog .t-form) {
  max-width: 100%;
}

:global(.admin-secondary-dialog .t-dialog__body) {
  max-height: calc(82vh - 96px);
  overflow: auto;
}

:global(.admin-secondary-dialog) {
  max-height: 82vh;
  overflow: hidden;
}

.admin-secondary-dialog-content :deep(.enterprise-card > .enterprise-eyebrow),
.admin-secondary-dialog-content :deep(.enterprise-card > .enterprise-copy) {
  display: none;
}
</style>
