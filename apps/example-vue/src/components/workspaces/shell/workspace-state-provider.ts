import type { Ref } from "vue"

import type {
  RegisteredWorkspaceKind,
  WorkspaceStateContext,
} from "../../../app/workspace-registry"

interface CustomerWorkspaceProviderState {
  customerErrorMessage: Ref<string>
  customerItems: Ref<unknown[]>
  customerLoading: Ref<boolean>
}

interface DictionaryWorkspaceProviderState {
  dictionaryDetailErrorMessage: Ref<string>
  dictionaryDetailLoading: Ref<boolean>
  dictionaryErrorMessage: Ref<string>
  dictionaryPanelMode: Ref<"detail" | "create" | "edit">
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  selectedDictionaryType: Ref<unknown | null>
  selectedDictionaryTypeItems: Ref<unknown[]>
  tableItems: Ref<unknown[]>
  dictionaryLoading: Ref<boolean>
}

interface RoleWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  roleDetailErrorMessage: Ref<string>
  roleDetailLoading: Ref<boolean>
  roleErrorMessage: Ref<string>
  rolePanelMode: Ref<"detail" | "create" | "edit">
  selectedRole: Ref<unknown | null>
  selectedRoleDetail: Ref<unknown | null>
  tableItems: Ref<unknown[]>
  roleLoading: Ref<boolean>
}

interface PostWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  postDetailErrorMessage: Ref<string>
  postDetailLoading: Ref<boolean>
  postErrorMessage: Ref<string>
  postLoading: Ref<boolean>
  postPanelMode: Ref<"detail" | "create" | "edit">
  selectedPost: Ref<unknown | null>
  tableItems: Ref<unknown[]>
}

interface MenuWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  menuDetailErrorMessage: Ref<string>
  menuDetailLoading: Ref<boolean>
  menuErrorMessage: Ref<string>
  menuLoading: Ref<boolean>
  menuPanelMode: Ref<"detail" | "create" | "edit">
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  parentLookup: Ref<Map<string, unknown>>
  selectedMenu: Ref<unknown | null>
  selectedMenuDetail: Ref<unknown | null>
  tableItems: Ref<unknown[]>
}

interface DepartmentWorkspaceProviderState {
  departmentDetailErrorMessage: Ref<string>
  departmentDetailLoading: Ref<boolean>
  departmentErrorMessage: Ref<string>
  departmentLoading: Ref<boolean>
  departmentPanelMode: Ref<"detail" | "create" | "edit">
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  parentLookup: Ref<Map<string, unknown>>
  selectedDepartment: Ref<unknown | null>
  selectedDepartmentDetail: Ref<unknown | null>
  tableItems: Ref<unknown[]>
}

interface NotificationWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  notificationDetailErrorMessage: Ref<string>
  notificationDetailLoading: Ref<boolean>
  notificationErrorMessage: Ref<string>
  notificationLoading: Ref<boolean>
  notificationPanelMode: Ref<"detail" | "create">
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  selectedNotification: Ref<unknown | null>
  tableItems: Ref<unknown[]>
}

interface SettingWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  selectedSetting: Ref<unknown | null>
  settingDetailErrorMessage: Ref<string>
  settingDetailLoading: Ref<boolean>
  settingErrorMessage: Ref<string>
  settingLoading: Ref<boolean>
  settingPanelMode: Ref<"detail" | "create" | "edit">
  tableItems: Ref<unknown[]>
}

interface TenantWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  selectedTenant: Ref<unknown | null>
  tableItems: Ref<unknown[]>
  tenantDetailErrorMessage: Ref<string>
  tenantDetailLoading: Ref<boolean>
  tenantErrorMessage: Ref<string>
  tenantLoading: Ref<boolean>
  tenantPanelMode: Ref<"detail" | "create" | "edit">
}

interface UserWorkspaceProviderState {
  formFields: Ref<unknown[]>
  formValues: Ref<Record<string, unknown>>
  panelDescription: Ref<string>
  panelTitle: Ref<string>
  selectedUser: Ref<unknown | null>
  tableItems: Ref<unknown[]>
  userErrorMessage: Ref<string>
  userLoading: Ref<boolean>
  userPanelMode: Ref<"detail" | "create" | "edit" | "reset">
}

export const resolveProvidedWorkspaceState = (
  kind: string,
  customerWorkspaceState: CustomerWorkspaceProviderState | null,
  dictionaryWorkspaceState: DictionaryWorkspaceProviderState | null = null,
  roleWorkspaceState: RoleWorkspaceProviderState | null = null,
  postWorkspaceState: PostWorkspaceProviderState | null = null,
  menuWorkspaceState: MenuWorkspaceProviderState | null = null,
  departmentWorkspaceState: DepartmentWorkspaceProviderState | null = null,
  notificationWorkspaceState: NotificationWorkspaceProviderState | null = null,
  settingWorkspaceState: SettingWorkspaceProviderState | null = null,
  tenantWorkspaceState: TenantWorkspaceProviderState | null = null,
  userWorkspaceState: UserWorkspaceProviderState | null = null,
): WorkspaceStateContext | null => {
  if (kind === "customer" && customerWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: customerWorkspaceState.customerLoading,
      errorMessage: customerWorkspaceState.customerErrorMessage,
      state: customerWorkspaceState,
    }
  }

  if (kind === "dictionary" && dictionaryWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: dictionaryWorkspaceState.dictionaryLoading,
      errorMessage: dictionaryWorkspaceState.dictionaryErrorMessage,
      state: dictionaryWorkspaceState,
    }
  }

  if (kind === "role" && roleWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: roleWorkspaceState.roleLoading,
      errorMessage: roleWorkspaceState.roleErrorMessage,
      state: roleWorkspaceState,
    }
  }

  if (kind === "post" && postWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: postWorkspaceState.postLoading,
      errorMessage: postWorkspaceState.postErrorMessage,
      state: postWorkspaceState,
    }
  }

  if (kind === "menu" && menuWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: menuWorkspaceState.menuLoading,
      errorMessage: menuWorkspaceState.menuErrorMessage,
      state: menuWorkspaceState,
    }
  }

  if (kind === "department" && departmentWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: departmentWorkspaceState.departmentLoading,
      errorMessage: departmentWorkspaceState.departmentErrorMessage,
      state: departmentWorkspaceState,
    }
  }

  if (kind === "notification" && notificationWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: notificationWorkspaceState.notificationLoading,
      errorMessage: notificationWorkspaceState.notificationErrorMessage,
      state: notificationWorkspaceState,
    }
  }

  if (kind === "setting" && settingWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: settingWorkspaceState.settingLoading,
      errorMessage: settingWorkspaceState.settingErrorMessage,
      state: settingWorkspaceState,
    }
  }

  if (kind === "tenant" && tenantWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: tenantWorkspaceState.tenantLoading,
      errorMessage: tenantWorkspaceState.tenantErrorMessage,
      state: tenantWorkspaceState,
    }
  }

  if (kind === "user" && userWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: userWorkspaceState.userLoading,
      errorMessage: userWorkspaceState.userErrorMessage,
      state: userWorkspaceState,
    }
  }

  return null
}
