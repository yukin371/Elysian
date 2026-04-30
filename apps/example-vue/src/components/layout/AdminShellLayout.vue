<script setup lang="ts">
import type { UiNavigationNode } from "@elysian/ui-core"
import { ElyShell } from "@elysian/ui-enterprise-vue"

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

defineProps<AdminShellLayoutProps>()

defineEmits<{
  (event: "menu-select", menuKey: string): void
  (event: "tab-select", tabKey: string): void
}>()
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
    >
      <template #header-actions>
        <ShellWorkspaceHeaderActions
          v-bind="headerActionProps"
          v-on="headerActionListeners"
        />
      </template>

      <template #workspace>
        <ShellWorkspaceMainSwitch
          v-bind="workspaceMainProps"
          v-on="workspaceMainListeners"
        />
      </template>

      <template #secondary>
        <ShellWorkspaceSecondarySwitch
          v-bind="workspaceSecondaryProps"
          v-on="workspaceSecondaryListeners"
        />
      </template>
    </ElyShell>
  </section>
</template>
