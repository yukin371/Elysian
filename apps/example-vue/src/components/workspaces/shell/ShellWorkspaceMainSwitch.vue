<script setup lang="ts">
import { computed, provide } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"

import {
  type ShellWorkspaceMainSwitchEmitFn,
  type ShellWorkspaceMainSwitchProps,
  resolveShellWorkspaceMainDescriptor,
} from "./shell-workspace-main-descriptor"
import { resolveProvidedWorkspaceState } from "./workspace-state-provider"

defineOptions({ inheritAttrs: false })

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
      tableItems: { value: unknown[] }
    } | null,
    (props.dictionaryWorkspaceState ?? null) as {
      dictionaryErrorMessage: { value: string }
      tableItems: { value: unknown[] }
      dictionaryLoading: { value: boolean }
    } | null,
    (props.roleWorkspaceState ?? null) as {
      formFields: { value: unknown[] }
      formValues: { value: Record<string, unknown> }
      panelDescription: { value: string }
      panelTitle: { value: string }
      roleDetailErrorMessage: { value: string }
      roleDetailLoading: { value: boolean }
      roleErrorMessage: { value: string }
      rolePanelMode: { value: "create" | "detail" | "edit" }
      selectedRole: { value: unknown | null }
      selectedRoleDetail: { value: unknown | null }
      tableItems: { value: unknown[] }
      roleLoading: { value: boolean }
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
</template>
