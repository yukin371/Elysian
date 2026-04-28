import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

type AppTranslate = (key: string, params?: Record<string, unknown>) => string

interface UseExampleQuerySummaryOptions {
  t: AppTranslate
  customerQuerySummary: ComputedRef<string>
  isDictionaryWorkspace: ComputedRef<boolean>
  isDepartmentWorkspace: ComputedRef<boolean>
  isSessionWorkspace: ComputedRef<boolean>
  isPostWorkspace: ComputedRef<boolean>
  isRoleWorkspace: ComputedRef<boolean>
  isMenuWorkspace: ComputedRef<boolean>
  isNotificationWorkspace: ComputedRef<boolean>
  isOperationLogWorkspace: ComputedRef<boolean>
  isUserWorkspace: ComputedRef<boolean>
  isSettingWorkspace: ComputedRef<boolean>
  isTenantWorkspace: ComputedRef<boolean>
  dictionaryQueryValues: Ref<ElyQueryValues>
  departmentQueryValues: Ref<ElyQueryValues>
  sessionQuerySummary: ComputedRef<string>
  postQueryValues: Ref<ElyQueryValues>
  roleQueryValues: Ref<ElyQueryValues>
  menuQueryValues: Ref<ElyQueryValues>
  notificationQueryValues: Ref<ElyQueryValues>
  operationLogQueryValues: Ref<ElyQueryValues>
  userQueryValues: Ref<ElyQueryValues>
  settingQueryValues: Ref<ElyQueryValues>
  tenantQueryValues: Ref<ElyQueryValues>
  localizeDictionaryStatus: (status: string) => string
  localizeDepartmentStatus: (status: string) => string
  localizePostStatus: (status: string) => string
  localizeRoleStatus: (status: string) => string
  localizeMenuType: (type: string) => string
  localizeMenuStatus: (status: string) => string
  localizeNotificationLevel: (level: string) => string
  localizeNotificationStatus: (status: string) => string
  localizeOperationLogResult: (result: string) => string
  localizeUserStatus: (status: string) => string
  localizeSettingStatus: (status: string) => string
  localizeTenantStatus: (status: string) => string
}

export const useExampleQuerySummary = (
  options: UseExampleQuerySummaryOptions,
) => {
  const currentQuerySummary = computed(() => {
    if (options.isDictionaryWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.dictionaryQueryValues.value.code === "string" &&
        options.dictionaryQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.dictionary.field.code")}: ${options.dictionaryQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.dictionaryQueryValues.value.name === "string" &&
        options.dictionaryQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.dictionary.field.name")}: ${options.dictionaryQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.dictionaryQueryValues.value.description === "string" &&
        options.dictionaryQueryValues.value.description.trim()
      ) {
        fragments.push(
          `${options.t("app.dictionary.field.description")}: ${options.dictionaryQueryValues.value.description.trim()}`,
        )
      }

      if (
        typeof options.dictionaryQueryValues.value.status === "string" &&
        options.dictionaryQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.dictionary.field.status")}: ${options.localizeDictionaryStatus(
            options.dictionaryQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isDepartmentWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.departmentQueryValues.value.code === "string" &&
        options.departmentQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.department.field.code")}: ${options.departmentQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.departmentQueryValues.value.name === "string" &&
        options.departmentQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.department.field.name")}: ${options.departmentQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.departmentQueryValues.value.status === "string" &&
        options.departmentQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.department.field.status")}: ${options.localizeDepartmentStatus(
            options.departmentQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isSessionWorkspace.value) {
      return options.sessionQuerySummary.value
    }

    if (options.isPostWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.postQueryValues.value.code === "string" &&
        options.postQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.post.field.code")}: ${options.postQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.postQueryValues.value.name === "string" &&
        options.postQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.post.field.name")}: ${options.postQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.postQueryValues.value.remark === "string" &&
        options.postQueryValues.value.remark.trim()
      ) {
        fragments.push(
          `${options.t("app.post.field.remark")}: ${options.postQueryValues.value.remark.trim()}`,
        )
      }

      if (
        typeof options.postQueryValues.value.status === "string" &&
        options.postQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.post.field.status")}: ${options.localizePostStatus(
            options.postQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isRoleWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.roleQueryValues.value.code === "string" &&
        options.roleQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.role.field.code")}: ${options.roleQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.roleQueryValues.value.name === "string" &&
        options.roleQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.role.field.name")}: ${options.roleQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.roleQueryValues.value.description === "string" &&
        options.roleQueryValues.value.description.trim()
      ) {
        fragments.push(
          `${options.t("app.role.field.description")}: ${options.roleQueryValues.value.description.trim()}`,
        )
      }

      if (
        typeof options.roleQueryValues.value.status === "string" &&
        options.roleQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.role.field.status")}: ${options.localizeRoleStatus(
            options.roleQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isMenuWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.menuQueryValues.value.type === "string" &&
        options.menuQueryValues.value.type
      ) {
        fragments.push(
          `${options.t("app.menu.field.type")}: ${options.localizeMenuType(
            options.menuQueryValues.value.type,
          )}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.code === "string" &&
        options.menuQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.code")}: ${options.menuQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.name === "string" &&
        options.menuQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.name")}: ${options.menuQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.path === "string" &&
        options.menuQueryValues.value.path.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.path")}: ${options.menuQueryValues.value.path.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.component === "string" &&
        options.menuQueryValues.value.component.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.component")}: ${options.menuQueryValues.value.component.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.icon === "string" &&
        options.menuQueryValues.value.icon.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.icon")}: ${options.menuQueryValues.value.icon.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.permissionCode === "string" &&
        options.menuQueryValues.value.permissionCode.trim()
      ) {
        fragments.push(
          `${options.t("app.menu.field.permissionCode")}: ${options.menuQueryValues.value.permissionCode.trim()}`,
        )
      }

      if (
        typeof options.menuQueryValues.value.status === "string" &&
        options.menuQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.menu.field.status")}: ${options.localizeMenuStatus(
            options.menuQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isNotificationWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.notificationQueryValues.value.recipientUserId ===
          "string" &&
        options.notificationQueryValues.value.recipientUserId.trim()
      ) {
        fragments.push(
          `${options.t("app.notification.field.recipientUserId")}: ${options.notificationQueryValues.value.recipientUserId.trim()}`,
        )
      }

      if (
        typeof options.notificationQueryValues.value.title === "string" &&
        options.notificationQueryValues.value.title.trim()
      ) {
        fragments.push(
          `${options.t("app.notification.field.title")}: ${options.notificationQueryValues.value.title.trim()}`,
        )
      }

      if (
        typeof options.notificationQueryValues.value.content === "string" &&
        options.notificationQueryValues.value.content.trim()
      ) {
        fragments.push(
          `${options.t("app.notification.field.content")}: ${options.notificationQueryValues.value.content.trim()}`,
        )
      }

      if (
        typeof options.notificationQueryValues.value.level === "string" &&
        options.notificationQueryValues.value.level
      ) {
        fragments.push(
          `${options.t("app.notification.field.level")}: ${options.localizeNotificationLevel(
            options.notificationQueryValues.value.level,
          )}`,
        )
      }

      if (
        typeof options.notificationQueryValues.value.status === "string" &&
        options.notificationQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.notification.field.status")}: ${options.localizeNotificationStatus(
            options.notificationQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isOperationLogWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.operationLogQueryValues.value.category === "string" &&
        options.operationLogQueryValues.value.category.trim()
      ) {
        fragments.push(
          `${options.t("app.operationLog.field.category")}: ${options.operationLogQueryValues.value.category.trim()}`,
        )
      }

      if (
        typeof options.operationLogQueryValues.value.action === "string" &&
        options.operationLogQueryValues.value.action.trim()
      ) {
        fragments.push(
          `${options.t("app.operationLog.field.action")}: ${options.operationLogQueryValues.value.action.trim()}`,
        )
      }

      if (
        typeof options.operationLogQueryValues.value.actorUserId === "string" &&
        options.operationLogQueryValues.value.actorUserId.trim()
      ) {
        fragments.push(
          `${options.t("app.operationLog.field.actorUserId")}: ${options.operationLogQueryValues.value.actorUserId.trim()}`,
        )
      }

      if (
        typeof options.operationLogQueryValues.value.result === "string" &&
        options.operationLogQueryValues.value.result
      ) {
        fragments.push(
          `${options.t("app.operationLog.field.result")}: ${options.localizeOperationLogResult(
            options.operationLogQueryValues.value.result,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isUserWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.userQueryValues.value.username === "string" &&
        options.userQueryValues.value.username.trim()
      ) {
        fragments.push(
          `${options.t("app.user.field.username")}: ${options.userQueryValues.value.username.trim()}`,
        )
      }

      if (
        typeof options.userQueryValues.value.displayName === "string" &&
        options.userQueryValues.value.displayName.trim()
      ) {
        fragments.push(
          `${options.t("app.user.field.displayName")}: ${options.userQueryValues.value.displayName.trim()}`,
        )
      }

      if (
        typeof options.userQueryValues.value.email === "string" &&
        options.userQueryValues.value.email.trim()
      ) {
        fragments.push(
          `${options.t("app.user.field.email")}: ${options.userQueryValues.value.email.trim()}`,
        )
      }

      if (
        typeof options.userQueryValues.value.phone === "string" &&
        options.userQueryValues.value.phone.trim()
      ) {
        fragments.push(
          `${options.t("app.user.field.phone")}: ${options.userQueryValues.value.phone.trim()}`,
        )
      }

      if (
        typeof options.userQueryValues.value.status === "string" &&
        options.userQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.user.field.status")}: ${options.localizeUserStatus(
            options.userQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isSettingWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.settingQueryValues.value.key === "string" &&
        options.settingQueryValues.value.key.trim()
      ) {
        fragments.push(
          `${options.t("app.setting.field.key")}: ${options.settingQueryValues.value.key.trim()}`,
        )
      }

      if (
        typeof options.settingQueryValues.value.value === "string" &&
        options.settingQueryValues.value.value.trim()
      ) {
        fragments.push(
          `${options.t("app.setting.field.value")}: ${options.settingQueryValues.value.value.trim()}`,
        )
      }

      if (
        typeof options.settingQueryValues.value.description === "string" &&
        options.settingQueryValues.value.description.trim()
      ) {
        fragments.push(
          `${options.t("app.setting.field.description")}: ${options.settingQueryValues.value.description.trim()}`,
        )
      }

      if (
        typeof options.settingQueryValues.value.status === "string" &&
        options.settingQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.setting.field.status")}: ${options.localizeSettingStatus(
            options.settingQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    if (options.isTenantWorkspace.value) {
      const fragments: string[] = []

      if (
        typeof options.tenantQueryValues.value.code === "string" &&
        options.tenantQueryValues.value.code.trim()
      ) {
        fragments.push(
          `${options.t("app.tenant.field.code")}: ${options.tenantQueryValues.value.code.trim()}`,
        )
      }

      if (
        typeof options.tenantQueryValues.value.name === "string" &&
        options.tenantQueryValues.value.name.trim()
      ) {
        fragments.push(
          `${options.t("app.tenant.field.name")}: ${options.tenantQueryValues.value.name.trim()}`,
        )
      }

      if (
        typeof options.tenantQueryValues.value.status === "string" &&
        options.tenantQueryValues.value.status
      ) {
        fragments.push(
          `${options.t("app.tenant.field.status")}: ${options.localizeTenantStatus(
            options.tenantQueryValues.value.status,
          )}`,
        )
      }

      return fragments.length > 0
        ? fragments.join(" / ")
        : options.t("app.filter.none")
    }

    return options.customerQuerySummary.value
  })

  return {
    currentQuerySummary,
  }
}
