<script setup lang="ts">
import type { UiNavigationNode } from "@elysian/ui-core"
import { ElyContextPanel, ElyWorkbenchShell } from "@elysian/ui-enterprise-vue"
import { computed, defineAsyncComponent, ref, watch } from "vue"

import type { AppTranslate } from "../../app/app-shell-helpers"
import { useWorkbenchShortcuts } from "../../composables/use-workbench-shortcuts"

const ShellWorkspaceMainSwitch = defineAsyncComponent(
  () => import("../workspaces/shell/ShellWorkspaceMainSwitch.vue"),
)
const ShellWorkspaceSecondarySwitch = defineAsyncComponent(
  () => import("../workspaces/shell/ShellWorkspaceSecondarySwitch.vue"),
)

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
const contextPanelOpen = ref(false)

const shouldRenderSecondary = computed(
  () =>
    props.workspaceMainProps.currentWorkspaceKind !== "workflow-definitions",
)

const contextPanelWidthByWorkspaceKind: Record<string, number> = {
  customer: 900,
  file: 980,
  "generator-preview": 1280,
}

const contextPanelWidth = computed(() => {
  const workspaceKind = String(
    props.workspaceMainProps.currentWorkspaceKind ?? "",
  )

  return contextPanelWidthByWorkspaceKind[workspaceKind] ?? 860
})

const emit = defineEmits<{
  (event: "menu-select", menuKey: string): void
  (event: "tab-select", tabKey: string): void
  (event: "user-click"): void
}>()

const openContextPanel = () => {
  if (shouldRenderSecondary.value) {
    contextPanelOpen.value = true
  }
}

const closeContextPanel = () => {
  contextPanelOpen.value = false
}

const isGeneratorPreviewWorkspace = computed(
  () => props.workspaceMainProps.currentWorkspaceKind === "generator-preview",
)

const getGeneratorPreviewFilePaths = () => {
  const files = props.workspaceMainProps.generatorPreviewFiles

  if (!Array.isArray(files)) {
    return []
  }

  return files
    .map((file) =>
      file && typeof file === "object" && "path" in file
        ? String(file.path ?? "")
        : "",
    )
    .filter((path) => path.length > 0)
}

const navigateGeneratorPreviewFileSelection = (delta: -1 | 1) => {
  if (!isGeneratorPreviewWorkspace.value) {
    return
  }

  const filePaths = getGeneratorPreviewFilePaths()

  if (filePaths.length === 0) {
    return
  }

  const selectedFilePath =
    typeof props.workspaceMainProps.selectedGeneratorPreviewFilePath ===
    "string"
      ? props.workspaceMainProps.selectedGeneratorPreviewFilePath
      : null
  const currentIndex = selectedFilePath
    ? filePaths.indexOf(selectedFilePath)
    : -1
  const fallbackIndex = delta > 0 ? 0 : filePaths.length - 1
  const nextIndex =
    currentIndex === -1
      ? fallbackIndex
      : Math.min(Math.max(currentIndex + delta, 0), filePaths.length - 1)
  const nextFilePath = filePaths[nextIndex]

  if (!nextFilePath || nextFilePath === selectedFilePath) {
    return
  }

  props.workspaceMainListeners["select-generator-file"]?.(nextFilePath)
}

/**
 * Determines whether a workspace event should open the context panel.
 *
 * Convention: workspace events follow "{entity}-{verb}" naming.
 * - *-row-click: table row selection (e.g. "dictionary-row-click")
 * - *-action:    action button click  (e.g. "customer-action")
 * - open-*:      create flows        (e.g. "open-dictionary-create")
 * - start-*:     edit flows          (e.g. "start-role-edit")
 * - select-*:    detail selection     (e.g. "select-workflow-definition")
 */
const shouldOpenContextPanelForEvent = (eventName: string) =>
  eventName.endsWith("-row-click") ||
  eventName.endsWith("-action") ||
  eventName.startsWith("open-") ||
  eventName.startsWith("start-") ||
  eventName.startsWith("select-")

/**
 * Determines whether a workspace event should close the context panel.
 * - cancel-*: panel dismissals (e.g. "cancel-role-panel")
 * - close-*:  detail dismissals  (e.g. "close-workflow-definition-detail")
 */
const shouldCloseContextPanelForEvent = (eventName: string) =>
  eventName.startsWith("cancel-") || eventName.startsWith("close-")

const wrapListeners = (listeners: ListenerMap) =>
  Object.fromEntries(
    Object.entries(listeners).map(([eventName, listener]) => [
      eventName,
      async (...args: unknown[]) => {
        await Promise.resolve(listener(...args))

        if (shouldCloseContextPanelForEvent(eventName)) {
          closeContextPanel()
          return
        }

        if (shouldOpenContextPanelForEvent(eventName)) {
          openContextPanel()
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
    closeContextPanel()
  },
)

useWorkbenchShortcuts({
  onSearch: () => {
    // Focus the global search input in the workbench header
    const searchInput = document.querySelector<HTMLInputElement>(
      ".ely-workbench__search input",
    )
    searchInput?.focus()
  },
  onClosePanel: closeContextPanel,
  onNavigateUp: () => {
    navigateGeneratorPreviewFileSelection(-1)
  },
  onNavigateDown: () => {
    navigateGeneratorPreviewFileSelection(1)
  },
  onCreate: openContextPanel,
})
</script>

<template>
  <ElyWorkbenchShell
    :key="locale"
    :navigation="navigation"
    :selected-menu-key="selectedMenuKey"
    :tabs="tabs"
    :selected-tab-key="selectedTabKey"
    :user="user"
    :context-panel-visible="contextPanelOpen && shouldRenderSecondary"
    :context-panel-title="workspaceTitle"
    context-panel-mode="detail"
    @menu-select="$emit('menu-select', $event)"
    @tab-select="$emit('tab-select', $event)"
    @user-click="$emit('user-click')"
    @panel-close="closeContextPanel"
  >
    <template #workspace>
      <ShellWorkspaceMainSwitch
        v-bind="workspaceMainProps"
        v-on="wrappedWorkspaceMainListeners"
      />
    </template>

    <template #context>
      <ElyContextPanel
        :visible="contextPanelOpen && shouldRenderSecondary"
        :title="workspaceTitle"
        :width="contextPanelWidth"
        mode="detail"
        @close="closeContextPanel"
      >
        <ShellWorkspaceSecondarySwitch
          v-bind="workspaceSecondaryProps"
          hide-session-card
          v-on="wrappedWorkspaceSecondaryListeners"
        />
      </ElyContextPanel>
    </template>
  </ElyWorkbenchShell>
</template>
