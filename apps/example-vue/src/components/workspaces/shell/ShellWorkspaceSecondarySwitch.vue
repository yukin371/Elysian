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

const props = withDefaults(defineProps<ShellWorkspaceSecondarySwitchProps>(), {
  hideSessionCard: false,
})
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
    (props.dictionaryWorkspaceState ?? null) as {
      dictionaryDetailErrorMessage: { value: string }
      dictionaryDetailLoading: { value: boolean }
      dictionaryErrorMessage: { value: string }
      dictionaryLoading: { value: boolean }
      dictionaryPanelMode: { value: "create" | "detail" | "edit" }
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedDictionaryType: { value: unknown | null }
      selectedDictionaryTypeItems: { value: unknown[] }
      tableItems: { value: unknown[] }
    } | null,
    (props.roleWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      roleDetailErrorMessage: { value: string }
      roleDetailLoading: { value: boolean }
      roleErrorMessage: { value: string }
      roleLoading: { value: boolean }
      rolePanelMode: { value: "create" | "detail" | "edit" }
      selectedRole: { value: unknown | null }
      selectedRoleDetail: { value: unknown | null }
      tableItems: { value: unknown[] }
    } | null,
    (props.postWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      postDetailErrorMessage: { value: string }
      postDetailLoading: { value: boolean }
      postErrorMessage: { value: string }
      postLoading: { value: boolean }
      postPanelMode: { value: "create" | "detail" | "edit" }
      selectedPost: { value: unknown | null }
      tableItems: { value: unknown[] }
    } | null,
    (props.menuWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      menuDetailErrorMessage: { value: string }
      menuDetailLoading: { value: boolean }
      menuErrorMessage: { value: string }
      menuLoading: { value: boolean }
      menuPanelMode: { value: "create" | "detail" | "edit" }
      panelDescription: { value: string }
      panelTitle: { value: string }
      parentLookup: { value: Map<string, unknown> }
      selectedMenu: { value: unknown | null }
      selectedMenuDetail: { value: unknown | null }
      tableItems: { value: unknown[] }
    } | null,
    (props.departmentWorkspaceState ?? null) as {
      departmentDetailErrorMessage: { value: string }
      departmentDetailLoading: { value: boolean }
      departmentErrorMessage: { value: string }
      departmentLoading: { value: boolean }
      departmentPanelMode: { value: "create" | "detail" | "edit" }
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      parentLookup: { value: Map<string, unknown> }
      selectedDepartment: { value: unknown | null }
      selectedDepartmentDetail: { value: unknown | null }
      tableItems: { value: unknown[] }
    } | null,
    (props.notificationWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      notificationDetailErrorMessage: { value: string }
      notificationDetailLoading: { value: boolean }
      notificationErrorMessage: { value: string }
      notificationLoading: { value: boolean }
      notificationPanelMode: { value: "create" | "detail" }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedNotification: { value: unknown | null }
      tableItems: { value: unknown[] }
    } | null,
    (props.settingWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedSetting: { value: unknown | null }
      settingDetailErrorMessage: { value: string }
      settingDetailLoading: { value: boolean }
      settingErrorMessage: { value: string }
      settingLoading: { value: boolean }
      settingPanelMode: { value: "create" | "detail" | "edit" }
      tableItems: { value: unknown[] }
    } | null,
    (props.tenantWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedTenant: { value: unknown | null }
      tableItems: { value: unknown[] }
      tenantDetailErrorMessage: { value: string }
      tenantDetailLoading: { value: boolean }
      tenantErrorMessage: { value: string }
      tenantLoading: { value: boolean }
      tenantPanelMode: { value: "create" | "detail" | "edit" }
    } | null,
    (props.userWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      selectedUser: { value: unknown | null }
      tableItems: { value: unknown[] }
      userErrorMessage: { value: string }
      userLoading: { value: boolean }
      userPanelMode: { value: "create" | "detail" | "edit" | "reset" }
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
    v-if="!hideSessionCard"
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
