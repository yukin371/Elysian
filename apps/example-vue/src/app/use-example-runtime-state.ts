import { computed, ref } from "vue"

import type {
  AuthIdentityResponse,
  PlatformResponse,
} from "../lib/platform-api"
import { useExampleAppLayout } from "../router/example-router"
import { createWorkspaceModuleReadyMap } from "./workspace-registry"

export const useExampleRuntimeState = () => {
  const platform = ref<PlatformResponse | null>(null)
  const authIdentity = ref<AuthIdentityResponse | null>(null)
  const registeredModuleCodes = ref<string[]>([])
  const loading = ref(true)
  const authLoading = ref(false)
  const errorMessage = ref("")
  const authErrorMessage = ref("")
  const authModuleReady = ref(false)
  const customerModuleReady = ref(false)
  const departmentModuleReady = ref(false)
  const postModuleReady = ref(false)
  const fileModuleReady = ref(false)
  const menuModuleReady = ref(false)
  const notificationModuleReady = ref(false)
  const operationLogModuleReady = ref(false)
  const roleModuleReady = ref(false)
  const settingModuleReady = ref(false)
  const tenantModuleReady = ref(false)
  const userModuleReady = ref(false)
  const dictionaryModuleReady = ref(false)
  const workflowModuleReady = ref(false)
  const departmentExportLoading = ref(false)
  const dictionaryTypeExportLoading = ref(false)
  const dictionaryItemsExportLoading = ref(false)
  const fileExportLoading = ref(false)
  const menuExportLoading = ref(false)
  const notificationExportLoading = ref(false)
  const operationLogExportLoading = ref(false)
  const postExportLoading = ref(false)
  const roleExportLoading = ref(false)
  const userExportLoading = ref(false)
  const settingExportLoading = ref(false)
  const tenantExportLoading = ref(false)
  const envName = ref("unknown")
  const demoAdminPassword = ["admin", "123"].join("")

  const loginForm = ref({
    username: "admin",
    password: demoAdminPassword,
  })

  const isAuthenticated = computed(() => authIdentity.value !== null)
  const exampleAppLayout = useExampleAppLayout({
    isAuthenticated,
  })
  const permissionCodes = computed(
    () => authIdentity.value?.permissionCodes ?? [],
  )
  const workspaceModuleReady = createWorkspaceModuleReadyMap({
    authModuleReady,
    customerModuleReady,
    departmentModuleReady,
    dictionaryModuleReady,
    fileModuleReady,
    menuModuleReady,
    notificationModuleReady,
    operationLogModuleReady,
    postModuleReady,
    roleModuleReady,
    settingModuleReady,
    tenantModuleReady,
    userModuleReady,
    workflowModuleReady,
  })

  return {
    authErrorMessage,
    authIdentity,
    authLoading,
    authModuleReady,
    customerModuleReady,
    departmentExportLoading,
    departmentModuleReady,
    dictionaryItemsExportLoading,
    dictionaryModuleReady,
    dictionaryTypeExportLoading,
    envName,
    errorMessage,
    exampleAppLayout,
    fileExportLoading,
    fileModuleReady,
    isAuthenticated,
    loading,
    loginForm,
    menuExportLoading,
    menuModuleReady,
    notificationExportLoading,
    notificationModuleReady,
    operationLogExportLoading,
    operationLogModuleReady,
    permissionCodes,
    platform,
    postExportLoading,
    postModuleReady,
    registeredModuleCodes,
    roleExportLoading,
    roleModuleReady,
    settingExportLoading,
    settingModuleReady,
    tenantExportLoading,
    tenantModuleReady,
    userExportLoading,
    userModuleReady,
    workflowModuleReady,
    workspaceModuleReady,
  }
}
