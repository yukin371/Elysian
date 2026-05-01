import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import {
  type PostRecord,
  createPost,
  fetchPostById,
  fetchPosts,
  updatePost,
} from "../lib/platform-api"
import {
  createDefaultPostDraft,
  createPostTableItems,
  filterPosts,
  normalizeOptionalPostText,
  normalizePostSort,
  normalizePostStatus,
  normalizePostText,
  resolvePostSelection,
} from "../lib/post-workspace"
import { createCrudWorkspace } from "./create-crud-workspace"

export type PostPanelMode = "detail" | "create" | "edit"
type PostFormValues = Record<string, unknown>

type PostPageColumn = {
  key: string
  label?: string
  width?: string
}

interface PostPageContract {
  tableColumns: ComputedRef<PostPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UsePostWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: PostPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: PostRecord["status"]) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const usePostWorkspace = (options: UsePostWorkspaceOptions) => {
  const postWorkspace = createCrudWorkspace({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultPostDraft,
    createRecord: createPost,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchPostById,
    fetchList: fetchPosts,
    getCreateErrorMessage: () => options.t("app.error.createPost"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadPostDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadPosts"),
    getUpdateErrorMessage: () => options.t("app.error.updatePost"),
    normalizePayload: (values) => {
      const payload = {
        code: normalizePostText(values.code),
        name: normalizePostText(values.name),
        sort: normalizePostSort(values.sort),
        status: normalizePostStatus(values.status),
        remark: normalizeOptionalPostText(values.remark),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.postCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.postNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolvePostSelection,
    toEditDraft: (post) => ({
      code: post.code,
      name: post.name,
      sort: post.sort,
      status: post.status,
      remark: post.remark ?? "",
    }),
    updateRecord: updatePost,
  })

  const postItems = postWorkspace.items
  const postDetail = postWorkspace.detail
  const postLoading = postWorkspace.loading
  const postDetailLoading = postWorkspace.detailLoading
  const postErrorMessage = postWorkspace.errorMessage
  const postDetailErrorMessage = postWorkspace.detailErrorMessage
  const selectedPostId = postWorkspace.selectedId
  const postPanelMode = postWorkspace.panelMode
  const postQueryValues = postWorkspace.queryValues
  const postCreateForm = postWorkspace.createForm
  const postEditForm = postWorkspace.editForm

  const filteredPostItems = computed(() =>
    filterPosts(postItems.value, {
      code:
        typeof postQueryValues.value.code === "string"
          ? postQueryValues.value.code
          : undefined,
      name:
        typeof postQueryValues.value.name === "string"
          ? postQueryValues.value.name
          : undefined,
      remark:
        typeof postQueryValues.value.remark === "string"
          ? postQueryValues.value.remark
          : undefined,
      status:
        postQueryValues.value.status === "active" ||
        postQueryValues.value.status === "disabled"
          ? postQueryValues.value.status
          : "",
    }),
  )

  const selectedPost = postWorkspace.selectedRecord

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      label: options.localizeFieldLabel(column.key),
      width:
        column.key === "id"
          ? "240"
          : column.key === "status"
            ? "120"
            : column.key === "remark"
              ? "220"
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
        field.key === "code"
          ? options.t("app.post.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.post.query.namePlaceholder")
            : field.key === "remark"
              ? options.t("app.post.query.remarkPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createPostTableItems(filteredPostItems.value, {
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.post.countLabel", {
      visible: filteredPostItems.value.length,
      total: postItems.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      input: field.key === "remark" ? ("textarea" as const) : field.input,
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
        field.key === "code"
          ? options.t("app.post.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.post.query.namePlaceholder")
            : field.key === "remark"
              ? options.t("app.post.query.remarkPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    }))

    if (postPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.post.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.post.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<PostFormValues>(() => {
    if (postPanelMode.value === "edit") {
      return {
        ...postEditForm.value,
        remark: postEditForm.value.remark ?? "",
      }
    }

    if (postPanelMode.value === "detail" && selectedPost.value) {
      return {
        code: selectedPost.value.code,
        name: selectedPost.value.name,
        sort: selectedPost.value.sort,
        status: selectedPost.value.status,
        remark: selectedPost.value.remark ?? "",
        createdAt: selectedPost.value.createdAt,
        updatedAt: selectedPost.value.updatedAt,
      }
    }

    return {
      ...postCreateForm.value,
      remark: postCreateForm.value.remark ?? "",
    }
  })

  const panelTitle = computed(() => {
    if (postPanelMode.value === "edit") {
      return options.t("app.post.panelTitle.edit")
    }

    if (postPanelMode.value === "create") {
      return options.t("app.post.panelTitle.create")
    }

    return (
      selectedPost.value?.name ??
      options.t("app.post.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (postPanelMode.value === "edit") {
      return options.t("app.post.panelDesc.edit")
    }

    if (postPanelMode.value === "create") {
      return options.t("app.post.panelDesc.create")
    }

    return selectedPost.value
      ? options.t("app.post.panelDesc.detail")
      : options.t("app.post.detailEmptyDescription")
  })

  const cancelPanel = postWorkspace.cancelPanel
  const clearWorkspace = postWorkspace.clearWorkspace
  const handleReset = postWorkspace.handleReset
  const handleSearch = postWorkspace.handleSearch
  const openCreatePanel = postWorkspace.openCreatePanel
  const reloadPosts = postWorkspace.reloadRecords
  const resetQuery = postWorkspace.resetQuery
  const selectPost = postWorkspace.selectRecord
  const startEdit = postWorkspace.startEdit
  const submitForm = postWorkspace.submitForm

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const post = filteredPostItems.value.find((item) => item.id === rowId)

    if (!post) {
      return
    }

    await selectPost(post)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredPostItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    postDetail,
    postDetailErrorMessage,
    postDetailLoading,
    postErrorMessage,
    postLoading,
    postPanelMode,
    postQueryValues,
    queryFields,
    reloadPosts,
    resetQuery,
    selectedPost,
    selectedPostId,
    selectPost,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
