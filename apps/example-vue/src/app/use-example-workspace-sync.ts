import { watch, type ComputedRef, type Ref } from "vue"

import { resolveNotificationSelection } from "../lib/notification-workspace"
import { resolveOperationLogSelection } from "../lib/operation-log-workspace"
import { resolvePostSelection } from "../lib/post-workspace"
import { resolveSettingSelection } from "../lib/setting-workspace"
import { resolveWorkflowDefinitionSelection } from "../lib/workflow-workspace"

type ItemWithId = {
  id: string
}

interface UseExampleWorkspaceSyncOptions {
  customerItems: Ref<ItemWithId[]>
  enterpriseFormMode: Ref<string>
  selectedCustomerId: Ref<string | null>
  canCreateCustomers: ComputedRef<boolean>

  filteredDictionaryTypes: ComputedRef<ItemWithId[]>
  isDictionaryWorkspace: ComputedRef<boolean>
  dictionaryLoading: Ref<boolean>
  dictionaryPanelMode: Ref<string>
  selectedDictionaryTypeId: Ref<string | null>
  canCreateDictionaryTypes: ComputedRef<boolean>
  selectDictionaryType: (item: ItemWithId) => Promise<void>

  filteredNotificationItems: ComputedRef<ItemWithId[]>
  isNotificationWorkspace: ComputedRef<boolean>
  notificationLoading: Ref<boolean>
  notificationPanelMode: Ref<string>
  selectedNotificationId: Ref<string | null>
  notificationDetail: Ref<ItemWithId | null>
  canCreateNotifications: ComputedRef<boolean>
  selectNotification: (item: ItemWithId) => Promise<void>

  filteredDepartmentItems: ComputedRef<ItemWithId[]>
  isDepartmentWorkspace: ComputedRef<boolean>
  departmentLoading: Ref<boolean>
  departmentPanelMode: Ref<string>
  selectedDepartmentId: Ref<string | null>
  departmentDetail: Ref<ItemWithId | null>
  canCreateDepartments: ComputedRef<boolean>
  selectDepartment: (item: ItemWithId) => Promise<void>

  filteredPostItems: ComputedRef<ItemWithId[]>
  isPostWorkspace: ComputedRef<boolean>
  postLoading: Ref<boolean>
  postPanelMode: Ref<string>
  selectedPostId: Ref<string | null>
  postDetail: Ref<ItemWithId | null>
  canCreatePosts: ComputedRef<boolean>
  selectPost: (item: ItemWithId) => Promise<void>

  filteredMenuItems: ComputedRef<ItemWithId[]>
  isMenuWorkspace: ComputedRef<boolean>
  menuLoading: Ref<boolean>
  menuPanelMode: Ref<string>
  selectedMenuId: Ref<string | null>
  menuDetail: Ref<ItemWithId | null>
  canCreateMenus: ComputedRef<boolean>
  selectMenu: (item: ItemWithId) => Promise<void>

  filteredOperationLogItems: ComputedRef<ItemWithId[]>
  isOperationLogWorkspace: ComputedRef<boolean>
  operationLogLoading: Ref<boolean>
  operationLogDetailLoading: Ref<boolean>
  selectedOperationLogId: Ref<string | null>
  operationLogDetail: Ref<ItemWithId | null>
  selectOperationLog: (item: ItemWithId) => Promise<void>

  filteredRoleItems: ComputedRef<ItemWithId[]>
  isRoleWorkspace: ComputedRef<boolean>
  roleLoading: Ref<boolean>
  rolePanelMode: Ref<string>
  selectedRoleId: Ref<string | null>
  roleDetail: Ref<ItemWithId | null>
  canCreateRoles: ComputedRef<boolean>
  selectRole: (item: ItemWithId) => Promise<void>

  filteredSettingItems: ComputedRef<ItemWithId[]>
  isSettingWorkspace: ComputedRef<boolean>
  settingLoading: Ref<boolean>
  settingPanelMode: Ref<string>
  selectedSettingId: Ref<string | null>
  settingDetail: Ref<ItemWithId | null>
  canCreateSettings: ComputedRef<boolean>
  selectSetting: (item: ItemWithId) => Promise<void>

  filteredTenantItems: ComputedRef<ItemWithId[]>
  isTenantWorkspace: ComputedRef<boolean>
  tenantLoading: Ref<boolean>
  tenantPanelMode: Ref<string>
  selectedTenantId: Ref<string | null>
  tenantDetail: Ref<ItemWithId | null>
  canCreateTenants: ComputedRef<boolean>
  selectTenant: (item: ItemWithId) => Promise<void>

  filteredUserItems: ComputedRef<ItemWithId[]>
  selectedUserId: Ref<string | null>
  userPanelMode: Ref<string>
  canCreateUsers: ComputedRef<boolean>

  workflowDefinitionCards: ComputedRef<ItemWithId[]>
  isWorkflowDefinitionsWorkspace: ComputedRef<boolean>
  workflowLoading: Ref<boolean>
  selectedWorkflowDefinitionId: Ref<string | null>
  workflowDefinitionDetail: Ref<ItemWithId | null>
  selectWorkflowDefinition: (item: ItemWithId) => Promise<void>
}

export const useExampleWorkspaceSync = (
  options: UseExampleWorkspaceSyncOptions,
) => {
  watch(
    options.customerItems,
    (items) => {
      if (
        options.enterpriseFormMode.value === "create" ||
        options.enterpriseFormMode.value === "edit"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedCustomerId.value = null
        if (options.canCreateCustomers.value) {
          options.enterpriseFormMode.value = "create"
        }
        return
      }

      if (
        !options.selectedCustomerId.value ||
        !items.some((item) => item.id === options.selectedCustomerId.value)
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        options.selectedCustomerId.value = firstItem.id
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredDictionaryTypes,
    async (items) => {
      if (
        !options.isDictionaryWorkspace.value ||
        options.dictionaryLoading.value ||
        options.dictionaryPanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedDictionaryTypeId.value = null

        if (options.canCreateDictionaryTypes.value) {
          options.dictionaryPanelMode.value = "create"
        }

        return
      }

      if (
        !options.selectedDictionaryTypeId.value ||
        !items.some(
          (item) => item.id === options.selectedDictionaryTypeId.value,
        )
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        await options.selectDictionaryType(firstItem)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredNotificationItems,
    async (items) => {
      if (
        !options.isNotificationWorkspace.value ||
        options.notificationLoading.value ||
        options.notificationPanelMode.value !== "detail"
      ) {
        return
      }

      const nextNotificationId = resolveNotificationSelection(
        items,
        options.selectedNotificationId.value,
      )

      if (!nextNotificationId) {
        options.selectedNotificationId.value = null
        options.notificationDetail.value = null

        if (options.canCreateNotifications.value) {
          options.notificationPanelMode.value = "create"
        }

        return
      }

      const nextNotification = items.find(
        (notification) => notification.id === nextNotificationId,
      )

      if (!nextNotification) {
        options.selectedNotificationId.value = null
        options.notificationDetail.value = null
        return
      }

      if (nextNotificationId === options.selectedNotificationId.value) {
        if (
          !options.notificationDetail.value ||
          options.notificationDetail.value.id !== nextNotificationId
        ) {
          options.notificationDetail.value = nextNotification
        }
        return
      }

      await options.selectNotification(nextNotification)
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredDepartmentItems,
    async (items) => {
      if (
        !options.isDepartmentWorkspace.value ||
        options.departmentLoading.value ||
        options.departmentPanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedDepartmentId.value = null
        options.departmentDetail.value = null

        if (options.canCreateDepartments.value) {
          options.departmentPanelMode.value = "create"
        }

        return
      }

      if (
        !options.selectedDepartmentId.value ||
        !items.some((item) => item.id === options.selectedDepartmentId.value)
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        await options.selectDepartment(firstItem)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredPostItems,
    async (items) => {
      if (
        !options.isPostWorkspace.value ||
        options.postLoading.value ||
        options.postPanelMode.value !== "detail"
      ) {
        return
      }

      const nextPostId = resolvePostSelection(items, options.selectedPostId.value)

      if (!nextPostId) {
        options.selectedPostId.value = null
        options.postDetail.value = null

        if (options.canCreatePosts.value) {
          options.postPanelMode.value = "create"
        }

        return
      }

      const nextPost = items.find((item) => item.id === nextPostId)

      if (nextPost && nextPostId !== options.selectedPostId.value) {
        await options.selectPost(nextPost)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredMenuItems,
    async (items) => {
      if (
        !options.isMenuWorkspace.value ||
        options.menuLoading.value ||
        options.menuPanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedMenuId.value = null
        options.menuDetail.value = null

        if (options.canCreateMenus.value) {
          options.menuPanelMode.value = "create"
        }

        return
      }

      if (
        !options.selectedMenuId.value ||
        !items.some((item) => item.id === options.selectedMenuId.value)
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        await options.selectMenu(firstItem)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredOperationLogItems,
    async (items) => {
      if (
        !options.isOperationLogWorkspace.value ||
        options.operationLogLoading.value ||
        options.operationLogDetailLoading.value
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedOperationLogId.value = null
        options.operationLogDetail.value = null
        return
      }

      const nextOperationLogId = resolveOperationLogSelection(
        items,
        options.selectedOperationLogId.value,
      )
      const nextOperationLog = items.find(
        (item) => item.id === nextOperationLogId,
      )

      if (
        nextOperationLog &&
        nextOperationLogId !== options.selectedOperationLogId.value
      ) {
        await options.selectOperationLog(nextOperationLog)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredRoleItems,
    async (items) => {
      if (
        !options.isRoleWorkspace.value ||
        options.roleLoading.value ||
        options.rolePanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedRoleId.value = null
        options.roleDetail.value = null

        if (options.canCreateRoles.value) {
          options.rolePanelMode.value = "create"
        }

        return
      }

      if (
        !options.selectedRoleId.value ||
        !items.some((item) => item.id === options.selectedRoleId.value)
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        await options.selectRole(firstItem)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredSettingItems,
    async (items) => {
      if (
        !options.isSettingWorkspace.value ||
        options.settingLoading.value ||
        options.settingPanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedSettingId.value = null
        options.settingDetail.value = null

        if (options.canCreateSettings.value) {
          options.settingPanelMode.value = "create"
        }

        return
      }

      const nextSettingId = resolveSettingSelection(
        items,
        options.selectedSettingId.value,
      )
      const nextSetting = items.find((item) => item.id === nextSettingId)

      if (nextSetting && nextSettingId !== options.selectedSettingId.value) {
        await options.selectSetting(nextSetting)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredTenantItems,
    async (items) => {
      if (
        !options.isTenantWorkspace.value ||
        options.tenantLoading.value ||
        options.tenantPanelMode.value !== "detail"
      ) {
        return
      }

      if (items.length === 0) {
        options.selectedTenantId.value = null
        options.tenantDetail.value = null

        if (options.canCreateTenants.value) {
          options.tenantPanelMode.value = "create"
        }

        return
      }

      if (
        !options.selectedTenantId.value ||
        !items.some((item) => item.id === options.selectedTenantId.value)
      ) {
        const firstItem = items[0]

        if (!firstItem) {
          return
        }

        await options.selectTenant(firstItem)
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.filteredUserItems,
    (items) => {
      if (items.length === 0) {
        options.selectedUserId.value = null
        if (
          options.userPanelMode.value === "detail" &&
          options.canCreateUsers.value
        ) {
          options.userPanelMode.value = "create"
        }
        return
      }

      if (
        !options.selectedUserId.value ||
        !items.some((item) => item.id === options.selectedUserId.value)
      ) {
        options.selectedUserId.value = items[0]?.id ?? null
        if (options.userPanelMode.value === "detail") {
          options.userPanelMode.value = "detail"
        }
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    options.workflowDefinitionCards,
    async (items) => {
      if (
        !options.isWorkflowDefinitionsWorkspace.value ||
        options.workflowLoading.value
      ) {
        return
      }

      const nextDefinitionId = resolveWorkflowDefinitionSelection(
        items,
        options.selectedWorkflowDefinitionId.value,
      )

      if (!nextDefinitionId) {
        options.selectedWorkflowDefinitionId.value = null
        options.workflowDefinitionDetail.value = null
        return
      }

      const nextDefinition = items.find(
        (definition) => definition.id === nextDefinitionId,
      )

      if (!nextDefinition) {
        options.selectedWorkflowDefinitionId.value = null
        options.workflowDefinitionDetail.value = null
        return
      }

      if (nextDefinitionId === options.selectedWorkflowDefinitionId.value) {
        options.workflowDefinitionDetail.value = nextDefinition
        return
      }

      await options.selectWorkflowDefinition(nextDefinition)
    },
    {
      immediate: true,
    },
  )
}
