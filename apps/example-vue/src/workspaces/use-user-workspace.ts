import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type UserRecord,
  createUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from "../lib/platform-api"
import {
  createDefaultUserDraft,
  createUserTableItems,
  filterUsers,
  normalizeOptionalUserText,
  normalizeUserBoolean,
  normalizeUserStatus,
  normalizeUserText,
  resolveUserSelection,
} from "../lib/user-workspace"

export type UserPanelMode = "detail" | "create" | "edit" | "reset"
type UserFormValues = Record<string, unknown>

type UserPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

interface UserPageContract {
  tableColumns: ComputedRef<UserPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseUserWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: UserPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: UserRecord["status"]) => string
  localizeBoolean: (value: boolean) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  canResetPassword: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useUserWorkspace = (options: UseUserWorkspaceOptions) => {
  const userItems = ref<UserRecord[]>([])
  const userLoading = ref(false)
  const userErrorMessage = ref("")
  const selectedUserId = ref<string | null>(null)
  const userPanelMode = ref<UserPanelMode>("detail")
  const userQueryValues = ref<ElyQueryValues>({})
  const userCreateForm = ref(createDefaultUserDraft())
  const userEditForm = ref(createDefaultUserDraft())
  const userPasswordInput = ref("")

  const filteredUserItems = computed(() =>
    filterUsers(userItems.value, {
      username:
        typeof userQueryValues.value.username === "string"
          ? userQueryValues.value.username
          : undefined,
      displayName:
        typeof userQueryValues.value.displayName === "string"
          ? userQueryValues.value.displayName
          : undefined,
      email:
        typeof userQueryValues.value.email === "string"
          ? userQueryValues.value.email
          : undefined,
      phone:
        typeof userQueryValues.value.phone === "string"
          ? userQueryValues.value.phone
          : undefined,
      status:
        userQueryValues.value.status === "active" ||
        userQueryValues.value.status === "disabled"
          ? userQueryValues.value.status
          : "",
    }),
  )

  const selectedUser = computed(
    () =>
      userItems.value.find(
        (user: UserRecord) => user.id === selectedUserId.value,
      ) ?? null,
  )

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      label: options.localizeFieldLabel(column.key),
      width:
        column.key === "id"
          ? "240"
          : column.key === "status"
            ? "120"
            : column.key === "isSuperAdmin"
              ? "140"
              : column.key.endsWith("At")
                ? "200"
                : undefined,
    })),
  )

  const queryFields = computed(() =>
    options.page.queryFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      options:
        field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeStatus(
                option.value === "disabled" ? "disabled" : "active",
              ),
            }))
          : field.options,
      placeholder:
        field.key === "username"
          ? options.t("app.user.query.usernamePlaceholder")
          : field.key === "displayName"
            ? options.t("app.user.query.displayNamePlaceholder")
            : field.key === "email"
              ? options.t("app.user.query.emailPlaceholder")
              : field.key === "phone"
                ? options.t("app.user.query.phonePlaceholder")
                : field.key === "status"
                  ? options.t("copy.query.statusPlaceholder")
                  : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createUserTableItems(filteredUserItems.value, {
      localizeStatus: options.localizeStatus,
      localizeBoolean: options.localizeBoolean,
      lastLoginEmptyLabel: options.t("app.user.lastLoginEmpty"),
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.user.countLabel", {
      visible: filteredUserItems.value.length,
      total: userItems.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value
      .filter((field) =>
        userPanelMode.value === "detail" ? true : field.key !== "lastLoginAt",
      )
      .map((field) => ({
        ...field,
        label: options.localizeFieldLabel(field.key),
        options:
          field.key === "status" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: options.localizeStatus(
                  option.value === "disabled" ? "disabled" : "active",
                ),
              }))
            : field.options,
        placeholder:
          field.key === "username"
            ? options.t("app.user.query.usernamePlaceholder")
            : field.key === "displayName"
              ? options.t("app.user.query.displayNamePlaceholder")
              : field.key === "email"
                ? options.t("app.user.query.emailPlaceholder")
                : field.key === "phone"
                  ? options.t("app.user.query.phonePlaceholder")
                  : field.key === "status"
                    ? options.t("copy.query.statusPlaceholder")
                    : field.placeholder,
      }))

    if (userPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.user.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.user.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<UserFormValues>(() => {
    if (userPanelMode.value === "edit") {
      return { ...userEditForm.value }
    }

    if (userPanelMode.value === "detail" && selectedUser.value) {
      return {
        username: selectedUser.value.username,
        displayName: selectedUser.value.displayName,
        email: selectedUser.value.email ?? "",
        phone: selectedUser.value.phone ?? "",
        status: selectedUser.value.status,
        isSuperAdmin: selectedUser.value.isSuperAdmin,
        lastLoginAt: selectedUser.value.lastLoginAt ?? "",
        createdAt: selectedUser.value.createdAt,
        updatedAt: selectedUser.value.updatedAt,
      }
    }

    return { ...userCreateForm.value }
  })

  const panelTitle = computed(() => {
    if (userPanelMode.value === "edit") {
      return options.t("app.user.panelTitle.edit")
    }

    if (userPanelMode.value === "create") {
      return options.t("app.user.panelTitle.create")
    }

    if (userPanelMode.value === "reset") {
      return selectedUser.value
        ? options.t("app.user.panelTitle.reset", {
            name: selectedUser.value.displayName || selectedUser.value.username,
          })
        : options.t("app.user.panelTitle.resetFallback")
    }

    return (
      selectedUser.value?.displayName ??
      selectedUser.value?.username ??
      options.t("app.user.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (userPanelMode.value === "edit") {
      return options.t("app.user.panelDesc.edit")
    }

    if (userPanelMode.value === "create") {
      return options.t("app.user.panelDesc.create")
    }

    if (userPanelMode.value === "reset") {
      return options.t("app.user.panelDesc.reset")
    }

    return selectedUser.value
      ? options.t("app.user.panelDesc.detail")
      : options.t("app.user.detailEmptyDescription")
  })

  const resetPanelInputs = () => {
    userCreateForm.value = createDefaultUserDraft()
    userEditForm.value = createDefaultUserDraft()
    userPasswordInput.value = ""
  }

  const clearWorkspace = () => {
    userItems.value = []
    selectedUserId.value = null
    userErrorMessage.value = ""
    userPanelMode.value = "detail"
    resetPanelInputs()
  }

  const reloadUsers = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    userLoading.value = true
    userErrorMessage.value = ""

    try {
      const payload = await fetchUsers()
      userItems.value = payload.items
      selectedUserId.value = resolveUserSelection(
        payload.items,
        selectedUserId.value,
      )
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      userErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadUsers")
    } finally {
      userLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    userQueryValues.value = values
  }

  const handleReset = () => {
    userQueryValues.value = {}
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedUserId.value = null
    userErrorMessage.value = ""
    resetPanelInputs()
    userPanelMode.value = "create"
  }

  const startEdit = (user: UserRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedUserId.value = user.id
    userErrorMessage.value = ""
    userEditForm.value = {
      username: user.username,
      displayName: user.displayName,
      email: user.email ?? "",
      phone: user.phone ?? "",
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
    }
    userPasswordInput.value = ""
    userPanelMode.value = "edit"
  }

  const startPasswordReset = (user: UserRecord) => {
    if (!options.canResetPassword.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedUserId.value = user.id
    userErrorMessage.value = ""
    userPasswordInput.value = ""
    userPanelMode.value = "reset"
  }

  const cancelPanel = () => {
    userErrorMessage.value = ""
    userPasswordInput.value = ""

    if (selectedUser.value) {
      userPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      userPanelMode.value = "create"
      return
    }

    userPanelMode.value = "detail"
  }

  const submitForm = async (values: UserFormValues) => {
    if (userLoading.value) {
      return
    }

    const payload = {
      username: normalizeUserText(values.username),
      displayName: normalizeUserText(values.displayName),
      email: normalizeOptionalUserText(values.email),
      phone: normalizeOptionalUserText(values.phone),
      status: normalizeUserStatus(values.status),
      isSuperAdmin: normalizeUserBoolean(values.isSuperAdmin),
    }

    if (payload.username.length === 0) {
      userErrorMessage.value = options.t("app.error.userUsernameRequired")
      return
    }

    if (payload.displayName.length === 0) {
      userErrorMessage.value = options.t("app.error.userDisplayNameRequired")
      return
    }

    userLoading.value = true
    userErrorMessage.value = ""

    try {
      if (userPanelMode.value === "edit" && selectedUser.value) {
        const updated = await updateUser(selectedUser.value.id, payload)
        selectedUserId.value = updated.id
        userPanelMode.value = "detail"
        await reloadUsers()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const password = normalizeUserText(userPasswordInput.value)

      if (password.length === 0) {
        userErrorMessage.value = options.t("app.error.userPasswordRequired")
        return
      }

      const created = await createUser({
        ...payload,
        password,
      })
      selectedUserId.value = created.id
      userPanelMode.value = "detail"
      resetPanelInputs()
      await reloadUsers()
    } catch (error) {
      userErrorMessage.value =
        error instanceof Error
          ? error.message
          : userPanelMode.value === "edit"
            ? options.t("app.error.updateUser")
            : options.t("app.error.createUser")
    } finally {
      userLoading.value = false
    }
  }

  const submitPasswordReset = async () => {
    if (
      !selectedUser.value ||
      userLoading.value ||
      !options.canResetPassword.value
    ) {
      return
    }

    const password = normalizeUserText(userPasswordInput.value)

    if (password.length === 0) {
      userErrorMessage.value = options.t("app.error.userPasswordRequired")
      return
    }

    userLoading.value = true
    userErrorMessage.value = ""

    try {
      await resetUserPassword(selectedUser.value.id, password)
      userPasswordInput.value = ""
      userPanelMode.value = "detail"
      await reloadUsers()
    } catch (error) {
      userErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.resetUserPassword")
    } finally {
      userLoading.value = false
    }
  }

  const handleRowClick = (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const user = filteredUserItems.value.find((item) => item.id === rowId)

    if (!user) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedUserId.value = user.id
    userErrorMessage.value = ""
    userPanelMode.value = "detail"
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredUserItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadUsers,
    selectedUser,
    selectedUserId,
    startEdit,
    startPasswordReset,
    submitForm,
    submitPasswordReset,
    tableColumns,
    tableItems,
    userErrorMessage,
    userItems,
    userLoading,
    userPanelMode,
    userPasswordInput,
    userQueryValues,
  }
}
