<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

import type { OperationLogRecord } from "../../../lib/platform-api"

type OperationLogWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface OperationLogWorkspacePanelProps {
  t: OperationLogWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewOperationLogs: boolean
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelTitle: string
  panelDescription: string
  selectedOperationLog: OperationLogRecord | null
  detailFields: ElyFormField[]
  detailValues: ElyFormValues
  detailsText: string
  formCopy: ElyFormCopy
}

defineProps<OperationLogWorkspacePanelProps>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.operationLog.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.operationLogModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.operationLogSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewOperationLogs"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.operationLogNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="detailLoading && selectedOperationLog"
      class="enterprise-inline-warning"
    >
      {{ t("app.operationLog.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="selectedOperationLog">
      <ElyForm
        class="mt-5"
        :fields="detailFields"
        :values="detailValues"
        readonly
        :loading="loading || detailLoading"
        :copy="formCopy"
      />

      <div class="mt-5">
        <p class="enterprise-subheading">
          {{ t("app.operationLog.meta.details") }}
        </p>
        <pre class="enterprise-copy enterprise-pre">{{ detailsText }}</pre>
      </div>
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.operationLog.detailEmptyDescription") }}
    </div>
  </section>
</template>
