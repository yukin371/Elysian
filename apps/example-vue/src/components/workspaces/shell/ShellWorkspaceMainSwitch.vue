<script setup lang="ts">
import { computed, provide } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"

import {
  type ShellWorkspaceMainSwitchEmitFn,
  type ShellWorkspaceMainSwitchProps,
  resolveShellWorkspaceMainDescriptor,
} from "./shell-workspace-main-descriptor"
import { resolveProvidedWorkspaceState } from "./workspace-state-provider"

const props = defineProps<ShellWorkspaceMainSwitchProps>()
const emit = defineEmits<ShellWorkspaceMainSwitchEmitFn>()

const activeWorkspace = computed(() =>
  resolveShellWorkspaceMainDescriptor(props, emit),
)
const activeWorkspaceListeners = computed(
  () => activeWorkspace.value.listeners ?? {},
)

const providedWorkspaceState = computed(() =>
  resolveProvidedWorkspaceState(
    props.currentWorkspaceKind,
    (props.customerWorkspaceState ?? null) as {
      customerErrorMessage: { value: string }
      customerItems: { value: unknown[] }
      customerLoading: { value: boolean }
    } | null,
    (props.dictionaryWorkspaceState ?? null) as {
      dictionaryErrorMessage: { value: string }
      tableItems: { value: unknown[] }
      dictionaryLoading: { value: boolean }
    } | null,
  ),
)

provide(WORKSPACE_STATE_KEY, providedWorkspaceState)
</script>

<template>
  <component
    :is="activeWorkspace.component"
    v-bind="activeWorkspace.props"
    v-on="activeWorkspaceListeners"
  />
</template>
