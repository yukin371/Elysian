<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed } from "vue"

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
  selectedOperationLog: OperationLogRecord | null
  detailFields: ElyFormField[]
  detailValues: ElyFormValues
  detailsText: string
  formCopy: ElyFormCopy
}

const props = defineProps<OperationLogWorkspacePanelProps>()

const diagnosisCards = computed(() => {
  if (!props.selectedOperationLog) {
    return []
  }

  return [
    {
      key: "requestId",
      label: props.t("app.operationLog.field.requestId"),
      value:
        String(props.selectedOperationLog.requestId ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
    {
      key: "actorUserId",
      label: props.t("app.operationLog.field.actorUserId"),
      value:
        String(props.selectedOperationLog.actorUserId ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
    {
      key: "result",
      label: props.t("app.operationLog.field.result"),
      value:
        String(props.selectedOperationLog.result ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
    {
      key: "target",
      label: props.t("app.operationLog.meta.target"),
      value:
        String(props.selectedOperationLog.targetType ?? "").trim() &&
        String(props.selectedOperationLog.targetId ?? "").trim()
          ? `${props.selectedOperationLog.targetType} / ${props.selectedOperationLog.targetId}`
          : props.t("app.operationLog.meta.missing"),
    },
    {
      key: "ip",
      label: props.t("app.operationLog.field.ip"),
      value:
        String(props.selectedOperationLog.ip ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
    {
      key: "createdAt",
      label: props.t("app.operationLog.field.createdAt"),
      value:
        String(props.selectedOperationLog.createdAt ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
    {
      key: "userAgent",
      label: props.t("app.operationLog.field.userAgent"),
      value:
        String(props.selectedOperationLog.userAgent ?? "").trim() ||
        props.t("app.operationLog.meta.missing"),
    },
  ]
})
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="operation-log-panel-description">
      {{ panelDescription }}
    </p>

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
      <div class="operation-log-diagnosis-grid">
        <div
          v-for="item in diagnosisCards"
          :key="item.key"
          class="operation-log-diagnosis-card"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>

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

    <div v-else class="operation-log-empty-state mt-5">
      <strong>{{ t("app.operationLog.detailEmptyTitle") }}</strong>
      <p>{{ t("app.operationLog.detailEmptyDescription") }}</p>
      <p class="operation-log-empty-state__hint">
        {{ t("app.operationLog.detailEmptyNextStep") }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.operation-log-panel-description {
  margin: 0.55rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.operation-log-diagnosis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}

.operation-log-diagnosis-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.92);
}

.operation-log-diagnosis-card span {
  color: #64748b;
  font-size: 0.78rem;
}

.operation-log-diagnosis-card strong {
  color: #0f172a;
  line-height: 1.5;
  word-break: break-word;
}

.operation-log-empty-state {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.92);
}

.operation-log-empty-state p {
  margin: 0.55rem 0 0;
  color: #475569;
  line-height: 1.6;
}

.operation-log-empty-state__hint {
  color: #64748b;
  font-size: 0.82rem;
}
</style>
