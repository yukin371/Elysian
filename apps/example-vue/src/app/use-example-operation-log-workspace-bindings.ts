import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"

export type ExampleOperationLogWorkspace = ReturnType<
  typeof useOperationLogWorkspace
>

export const useExampleOperationLogWorkspaceBindings = (
  operationLogWorkspace: ExampleOperationLogWorkspace,
) => {
  const {
    clearWorkspace: clearOperationLogWorkspace,
    countLabel: operationLogCountLabel,
    detailFields: enterpriseOperationLogDetailFields,
    detailValues: enterpriseOperationLogDetailValues,
    detailsText: operationLogDetailsText,
    filteredOperationLogItems,
    handleReset: handleOperationLogReset,
    handleRowClick: handleOperationLogRowClick,
    handleSearch: handleOperationLogSearch,
    operationLogDetail,
    operationLogDetailErrorMessage,
    operationLogDetailLoading,
    operationLogErrorMessage,
    operationLogLoading,
    operationLogQueryValues,
    panelDescription: operationLogPanelDescription,
    panelTitle: operationLogPanelTitle,
    queryFields: enterpriseOperationLogQueryFields,
    reloadOperationLogs,
    resetQuery: resetOperationLogQuery,
    selectedOperationLog,
    selectedOperationLogId,
    selectOperationLog,
    tableColumns: enterpriseOperationLogTableColumns,
    tableItems: enterpriseOperationLogTableItems,
  } = operationLogWorkspace

  return {
    clearOperationLogWorkspace,
    operationLogCountLabel,
    enterpriseOperationLogDetailFields,
    enterpriseOperationLogDetailValues,
    operationLogDetailsText,
    filteredOperationLogItems,
    handleOperationLogReset,
    handleOperationLogRowClick,
    handleOperationLogSearch,
    operationLogDetail,
    operationLogDetailErrorMessage,
    operationLogDetailLoading,
    operationLogErrorMessage,
    operationLogLoading,
    operationLogQueryValues,
    operationLogPanelDescription,
    operationLogPanelTitle,
    enterpriseOperationLogQueryFields,
    reloadOperationLogs,
    resetOperationLogQuery,
    selectedOperationLog,
    selectedOperationLogId,
    selectOperationLog,
    enterpriseOperationLogTableColumns,
    enterpriseOperationLogTableItems,
  }
}
