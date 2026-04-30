<script setup lang="ts">
import { computed, provide } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import ShellWorkspaceSessionCard from "./ShellWorkspaceSessionCard.vue"
import {
  type ShellWorkspaceSecondarySwitchEmitFn,
  type ShellWorkspaceSecondarySwitchProps,
  resolveShellWorkspaceSecondaryDescriptor,
} from "./shell-workspace-secondary-descriptor"
import { resolveProvidedWorkspaceState } from "./workspace-state-provider"

const props = defineProps<ShellWorkspaceSecondarySwitchProps>()
const emit = defineEmits<ShellWorkspaceSecondarySwitchEmitFn>()

const activeWorkspace = computed(() =>
  resolveShellWorkspaceSecondaryDescriptor(props, emit),
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
      customerFormMode: { value: "create" | "detail" | "edit" }
      deleteConfirmId: { value: string | null }
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedCustomer: { value: unknown | null }
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

  <ShellWorkspaceSessionCard
    :t="t"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :platform-display-name="platformDisplayName"
    :platform-version="platformVersion"
    :platform-status-label="platformStatusLabel"
    :auth-display-name="authDisplayName"
    :auth-username="authUsername"
    :auth-roles-label="authRolesLabel"
    :env-name="envName"
    :permission-count="permissionCount"
    :auth-loading="authLoading"
    :login-username="loginUsername"
    v-bind="{ loginPassword }"
    :auth-error-message="authErrorMessage"
    @submit-logout="$emit('submit-logout')"
    @update:login-username="$emit('update:login-username', $event)"
    @update:login-password="$emit('update:login-password', $event)"
    @submit-login="$emit('submit-login')"
  />
</template>
