import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserRecord,
  createUser,
  fetchUserById,
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
import { createCrudWorkspace } from "./create-crud-workspace"

export type UserPanelMode = "detail" | "create" | "edit" | "reset"
type UserFormValues = Record<string, unknown>
type UserUpsertPayload = UpdateUserRequest & {
  password?: CreateUserRequest["password"]
}

type UserPageColumn = {
  key: string
  label?: string
  width?: string
}

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
  const userPasswordInput = ref("")
  const resetPanelActive = ref(false)

  const userWorkspace = createCrudWorkspace<
    UserRecord,
    ReturnType<typeof createDefaultUserDraft>,
    UserUpsertPayload
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultUserDraft,
    createRecord: async (payload) => {
      const password = normalizeUserText(payload.password)

      if (password.length === 0) {
        throw new Error(options.t("app.error.userPasswordRequired"))
      }

      return createUser({
        username: normalizeUserText(payload.username),
        displayName: normalizeUserText(payload.displayName),
        email: payload.email,
        phone: payload.phone,
        status: payload.status,
        isSuperAdmin: payload.isSuperAdmin,
        password,
      })
    },
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchUserById,
    fetchList: fetchUsers,
    getCreateErrorMessage: () => options.t("app.error.createUser"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadUserDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadUsers"),
    getUpdateErrorMessage: () => options.t("app.error.updateUser"),
    normalizePayload: (values) => {
      const payload = {
        username: normalizeUserText(values.username),
        displayName: normalizeUserText(values.displayName),
        email: normalizeOptionalUserText(values.email),
        phone: normalizeOptionalUserText(values.phone),
        status: normalizeUserStatus(values.status),
        isSuperAdmin: normalizeUserBoolean(values.isSuperAdmin),
      }

      if (payload.username.length === 0) {
        return {
          message: options.t("app.error.userUsernameRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.displayName.length === 0) {
        return {
          message: options.t("app.error.userDisplayNameRequired"),
          status: "invalid" as const,
        }
      }

      if (userWorkspace.panelMode.value === "create") {
        const password = normalizeUserText(userPasswordInput.value)

        if (password.length === 0) {
          return {
            message: options.t("app.error.userPasswordRequired"),
            status: "invalid" as const,
          }
        }

        return {
          payload: {
            ...payload,
            password,
          },
          status: "valid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveUserSelection,
    toEditDraft: (user) => ({
      username: user.username,
      displayName: user.displayName,
      email: user.email ?? "",
      phone: user.phone ?? "",
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
    }),
    updateRecord: async (id, payload) => {
      const { password: _password, ...updatePayload } = payload
      return updateUser(id, updatePayload)
    },
  })

  const userItems = userWorkspace.items
  const userLoading = userWorkspace.loading
  const userErrorMessage = userWorkspace.errorMessage
  const selectedUserId = userWorkspace.selectedId
  const userQueryValues = userWorkspace.queryValues
  const userCreateForm = userWorkspace.createForm
  const userEditForm = userWorkspace.editForm
  const basePanelMode = userWorkspace.panelMode

  const userPanelMode = computed<UserPanelMode>({
    get: () => (resetPanelActive.value ? "reset" : basePanelMode.value),
    set: (value) => {
      if (value === "reset") {
        resetPanelActive.value = true
        return
      }

      resetPanelActive.value = false
      basePanelMode.value = value
    },
  })

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

  const selectedUser = userWorkspace.selectedRecord

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
        readonlyTrueLabel:
          field.key === "isSuperAdmin"
            ? options.localizeBoolean(true)
            : field.readonlyTrueLabel,
        readonlyFalseLabel:
          field.key === "isSuperAdmin"
            ? options.localizeBoolean(false)
            : field.readonlyFalseLabel,
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

  const clearWorkspace = () => {
    resetPanelActive.value = false
    userPasswordInput.value = ""
    userWorkspace.clearWorkspace()
  }

  const reloadUsers = userWorkspace.reloadRecords
  const handleSearch = userWorkspace.handleSearch
  const handleReset = userWorkspace.handleReset
  const openCreatePanel = () => {
    resetPanelActive.value = false
    userPasswordInput.value = ""
    userWorkspace.openCreatePanel()
  }

  const startEdit = (user: UserRecord) => {
    resetPanelActive.value = false
    userPasswordInput.value = ""
    userWorkspace.startEdit(user)
  }

  const startPasswordReset = (user: UserRecord) => {
    if (!options.canResetPassword.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedUserId.value = user.id
    userErrorMessage.value = ""
    userPasswordInput.value = ""
    basePanelMode.value = "edit"
    userPanelMode.value = "reset"
  }

  const cancelPanel = () => {
    userErrorMessage.value = ""
    userPasswordInput.value = ""

    if (userPanelMode.value === "reset") {
      if (selectedUser.value) {
        resetPanelActive.value = false
        basePanelMode.value = "edit"
        return
      }

      if (options.canCreate.value) {
        resetPanelActive.value = false
        basePanelMode.value = "create"
        return
      }

      resetPanelActive.value = false
      basePanelMode.value = "detail"
      return
    }

    userWorkspace.cancelPanel()
  }

  const submitForm = async (values: UserFormValues) => {
    userPasswordInput.value =
      userPanelMode.value === "create"
        ? normalizeUserText(userPasswordInput.value)
        : ""

    await userWorkspace.submitForm(values)
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
      resetPanelActive.value = false
      basePanelMode.value = "edit"
      await reloadUsers()
    } catch (error) {
      options.onRecoverableAuthError(error)
      userErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.resetUserPassword")
    } finally {
      userLoading.value = false
    }
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const user = filteredUserItems.value.find((item) => item.id === rowId)

    if (!user) {
      return
    }

    resetPanelActive.value = false
    userPasswordInput.value = ""
    await userWorkspace.openRecordForEdit(user)
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
    userCreateForm,
    userEditForm,
    userErrorMessage,
    userItems,
    userLoading,
    userPanelMode,
    userPasswordInput,
    userQueryValues,
  }
}
