import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

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

export type PostPanelMode = "detail" | "create" | "edit"
type PostFormValues = Record<string, unknown>

type PostPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

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
  const postItems = ref<PostRecord[]>([])
  const postDetail = ref<PostRecord | null>(null)
  const postLoading = ref(false)
  const postDetailLoading = ref(false)
  const postErrorMessage = ref("")
  const postDetailErrorMessage = ref("")
  const selectedPostId = ref<string | null>(null)
  const postPanelMode = ref<PostPanelMode>("detail")
  const postQueryValues = ref<ElyQueryValues>({})
  const postCreateForm = ref(createDefaultPostDraft())
  const postEditForm = ref(createDefaultPostDraft())

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

  const selectedPostListItem = computed(
    () =>
      postItems.value.find(
        (post: PostRecord) => post.id === selectedPostId.value,
      ) ?? null,
  )

  const selectedPost = computed(
    () =>
      (postDetail.value && postDetail.value.id === selectedPostId.value
        ? postDetail.value
        : selectedPostListItem.value) ?? null,
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

  const resetPanelInputs = () => {
    postCreateForm.value = createDefaultPostDraft()
    postEditForm.value = createDefaultPostDraft()
  }

  const resetQuery = () => {
    postQueryValues.value = {}
  }

  const clearWorkspace = () => {
    postItems.value = []
    postDetail.value = null
    selectedPostId.value = null
    postErrorMessage.value = ""
    postDetailErrorMessage.value = ""
    postPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectPost = async (post: PostRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedPostId.value = post.id
    postPanelMode.value = "detail"
    postDetail.value = null
    postDetailLoading.value = true
    postDetailErrorMessage.value = ""

    try {
      postDetail.value = await fetchPostById(post.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      postDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadPostDetail")
    } finally {
      postDetailLoading.value = false
    }
  }

  const reloadPosts = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    postLoading.value = true
    postErrorMessage.value = ""

    try {
      const payload = await fetchPosts()
      postItems.value = payload.items

      if (payload.items.length === 0) {
        selectedPostId.value = null
        postDetail.value = null

        if (options.canCreate.value) {
          postPanelMode.value = "create"
        }

        return
      }

      selectedPostId.value = resolvePostSelection(
        payload.items,
        selectedPostId.value,
      )

      if (postPanelMode.value !== "detail") {
        return
      }

      const nextPost = payload.items.find(
        (item) => item.id === selectedPostId.value,
      )

      if (nextPost) {
        await selectPost(nextPost)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      postErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadPosts")
    } finally {
      postLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    postQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedPostId.value = null
    postDetail.value = null
    postErrorMessage.value = ""
    postDetailErrorMessage.value = ""
    resetPanelInputs()
    postPanelMode.value = "create"
  }

  const startEdit = (post: PostRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedPostId.value = post.id
    postErrorMessage.value = ""
    postDetailErrorMessage.value = ""
    postEditForm.value = {
      code: post.code,
      name: post.name,
      sort: post.sort,
      status: post.status,
      remark: post.remark ?? "",
    }
    postPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    postErrorMessage.value = ""

    if (selectedPost.value) {
      postPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      postPanelMode.value = "create"
      return
    }

    postPanelMode.value = "detail"
  }

  const submitForm = async (values: PostFormValues) => {
    if (postLoading.value || postDetailLoading.value) {
      return
    }

    const payload = {
      code: normalizePostText(values.code),
      name: normalizePostText(values.name),
      sort: normalizePostSort(values.sort),
      status: normalizePostStatus(values.status),
      remark: normalizeOptionalPostText(values.remark),
    }

    if (payload.code.length === 0) {
      postErrorMessage.value = options.t("app.error.postCodeRequired")
      return
    }

    if (payload.name.length === 0) {
      postErrorMessage.value = options.t("app.error.postNameRequired")
      return
    }

    postLoading.value = true
    postErrorMessage.value = ""

    try {
      if (postPanelMode.value === "edit" && selectedPostId.value) {
        const updated = await updatePost(selectedPostId.value, payload)
        selectedPostId.value = updated.id
        postDetail.value = updated
        postPanelMode.value = "detail"
        await reloadPosts()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createPost(payload)
      selectedPostId.value = created.id
      postDetail.value = created
      postPanelMode.value = "detail"
      resetPanelInputs()
      await reloadPosts()
    } catch (error) {
      postErrorMessage.value =
        error instanceof Error
          ? error.message
          : postPanelMode.value === "edit"
            ? options.t("app.error.updatePost")
            : options.t("app.error.createPost")
    } finally {
      postLoading.value = false
    }
  }

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
