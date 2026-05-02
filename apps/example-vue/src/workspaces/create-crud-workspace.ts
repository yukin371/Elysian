import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

type CrudPanelMode = "detail" | "create" | "edit"
type FormValues = Record<string, unknown>

interface CrudRecord {
  id: string
}

type PayloadResult<TPayload> =
  | {
      payload: TPayload
      status: "valid"
    }
  | {
      message: string
      status: "invalid"
    }

interface CreateCrudWorkspaceOptions<
  TRecord extends CrudRecord,
  TDraft extends object,
  TPayload extends object,
  TDetailRecord extends TRecord = TRecord,
> {
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  canView: ComputedRef<boolean>
  createDefaultDraft: () => TDraft
  createRecord: (payload: TPayload) => Promise<TDetailRecord>
  currentShellTabKey: Ref<string>
  fetchDetail: (id: string) => Promise<TDetailRecord>
  fetchList: () => Promise<{ items: TRecord[] }>
  getCreateErrorMessage: () => string
  getLoadDetailErrorMessage: () => string
  getLoadListErrorMessage: () => string
  getUpdateErrorMessage: () => string
  normalizePayload: (values: FormValues) => PayloadResult<TPayload>
  onRecoverableAuthError: (error: unknown) => void
  resolveSelection: (
    items: Array<Pick<TRecord, "id">>,
    selectedId: string | null,
  ) => string | null
  toEditDraft: (record: TRecord | TDetailRecord) => TDraft
  updateRecord: (id: string, payload: TPayload) => Promise<TDetailRecord>
}

export const createCrudWorkspace = <
  TRecord extends CrudRecord,
  TDraft extends object,
  TPayload extends object,
  TDetailRecord extends TRecord = TRecord,
>(
  options: CreateCrudWorkspaceOptions<TRecord, TDraft, TPayload, TDetailRecord>,
) => {
  const items = ref<TRecord[]>([]) as Ref<TRecord[]>
  const detail = ref<TDetailRecord | null>(null) as Ref<TDetailRecord | null>
  const loading = ref(false)
  const detailLoading = ref(false)
  const errorMessage = ref("")
  const detailErrorMessage = ref("")
  const selectedId = ref<string | null>(null)
  const panelMode = ref<CrudPanelMode>("detail")
  const queryValues = ref<ElyQueryValues>({})
  const createForm = ref(options.createDefaultDraft()) as Ref<TDraft>
  const editForm = ref(options.createDefaultDraft()) as Ref<TDraft>

  const selectedListItem = computed(
    () => items.value.find((item) => item.id === selectedId.value) ?? null,
  )

  const selectedRecord = computed(
    () =>
      (detail.value && detail.value.id === selectedId.value
        ? detail.value
        : selectedListItem.value) ?? null,
  )

  const resetPanelInputs = () => {
    createForm.value = options.createDefaultDraft()
    editForm.value = options.createDefaultDraft()
  }

  const resetQuery = () => {
    queryValues.value = {}
  }

  const clearWorkspace = () => {
    items.value = []
    detail.value = null
    selectedId.value = null
    errorMessage.value = ""
    detailErrorMessage.value = ""
    panelMode.value = "detail"
    resetPanelInputs()
  }

  const selectRecord = async (record: TRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedId.value = record.id
    panelMode.value = "detail"
    detail.value = null
    detailLoading.value = true
    detailErrorMessage.value = ""

    try {
      detail.value = await options.fetchDetail(record.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      detailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.getLoadDetailErrorMessage()
    } finally {
      detailLoading.value = false
    }
  }

  const reloadRecords = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    loading.value = true
    errorMessage.value = ""

    try {
      const payload = await options.fetchList()
      items.value = payload.items

      if (payload.items.length === 0) {
        selectedId.value = null
        detail.value = null

        if (options.canCreate.value) {
          panelMode.value = "create"
        }

        return
      }

      selectedId.value = options.resolveSelection(
        payload.items,
        selectedId.value,
      )

      if (panelMode.value !== "detail") {
        return
      }

      const nextRecord = payload.items.find(
        (item) => item.id === selectedId.value,
      )

      if (nextRecord) {
        await selectRecord(nextRecord)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      errorMessage.value =
        error instanceof Error
          ? error.message
          : options.getLoadListErrorMessage()
    } finally {
      loading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    queryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedId.value = null
    detail.value = null
    errorMessage.value = ""
    detailErrorMessage.value = ""
    resetPanelInputs()
    panelMode.value = "create"
  }

  const startEdit = (record: TRecord | TDetailRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedId.value = record.id
    errorMessage.value = ""
    detailErrorMessage.value = ""
    editForm.value = options.toEditDraft(record)
    panelMode.value = "edit"
  }

  const cancelPanel = () => {
    errorMessage.value = ""

    if (selectedRecord.value) {
      panelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      panelMode.value = "create"
      return
    }

    panelMode.value = "detail"
  }

  const submitForm = async (values: FormValues) => {
    if (loading.value || detailLoading.value) {
      return
    }

    const payloadResult = options.normalizePayload(values)

    if (payloadResult.status === "invalid") {
      errorMessage.value = payloadResult.message
      return
    }

    loading.value = true
    errorMessage.value = ""

    try {
      if (panelMode.value === "edit" && selectedId.value) {
        const updated = await options.updateRecord(
          selectedId.value,
          payloadResult.payload,
        )
        selectedId.value = updated.id
        detail.value = updated
        panelMode.value = "detail"
        await reloadRecords()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await options.createRecord(payloadResult.payload)
      selectedId.value = created.id
      detail.value = created
      panelMode.value = "detail"
      resetPanelInputs()
      await reloadRecords()
    } catch (error) {
      options.onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error
          ? error.message
          : panelMode.value === "edit"
            ? options.getUpdateErrorMessage()
            : options.getCreateErrorMessage()
    } finally {
      loading.value = false
    }
  }

  return {
    cancelPanel,
    clearWorkspace,
    createForm,
    detail,
    detailErrorMessage,
    detailLoading,
    editForm,
    errorMessage,
    handleReset,
    handleSearch,
    items,
    loading,
    openCreatePanel,
    panelMode,
    queryValues,
    reloadRecords,
    resetQuery,
    selectRecord,
    selectedId,
    selectedRecord,
    startEdit,
    submitForm,
  }
}
