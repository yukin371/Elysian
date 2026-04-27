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

<style scoped>
.enterprise-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  padding: 1.2rem;
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-heading,
.enterprise-copy,
.enterprise-inline-warning {
  margin: 0;
}

.enterprise-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-subheading {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin-top: 0.7rem;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin-top: 0.75rem;
  line-height: 1.75;
  color: #475569;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-pre {
  margin-top: 0.75rem;
  white-space: pre-wrap;
}
</style>
