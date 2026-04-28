<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableAction,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"

import type { CustomerRecord } from "../../../lib/platform-api"

type CustomerWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface SelectOption {
  label: string
  value: string | number
}

interface CustomerWorkspaceMainProps {
  t: CustomerWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewCustomers: boolean
  loading: boolean
  errorMessage: string
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  items: CustomerRecord[]
  tableActions: ElyTableAction[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  footerStatusLabel: string
  paginationSummary: string
  pageSizeValue: string | number
  sortValue: string | number
  pageInputValue: string
  pageSizeOptions: SelectOption[]
  sortOptions: SelectOption[]
  canGoToPreviousPage: boolean
  canGoToNextPage: boolean
  canJumpToPage: boolean
}

defineProps<CustomerWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "action", key: string, row: CustomerRecord): void
  (e: "row-click", row: CustomerRecord): void
  (e: "change-page-size", value: string | number): void
  (e: "change-sort", value: string | number): void
  (e: "go-first-page"): void
  (e: "go-previous-page"): void
  (e: "go-next-page"): void
  (e: "go-last-page"): void
  (e: "update-page-input", value: string | number): void
  (e: "submit-page-jump"): void
}>()
</script>

<template>
  <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
    {{ t("app.message.customerModuleOffline") }}
  </div>

  <div
    v-else-if="authModuleReady && !isAuthenticated"
    class="enterprise-message enterprise-message-info"
  >
    {{ t("app.message.signInToLoad") }}
  </div>

  <div
    v-else-if="canEnterWorkspace && !canViewCustomers"
    class="enterprise-message enterprise-message-warning"
  >
    {{ t("app.message.workspaceNoListPermission") }}
  </div>

  <div v-else-if="errorMessage" class="enterprise-message enterprise-message-danger">
    {{ errorMessage }}
  </div>

  <ElyCrudWorkspace
    v-else
    :eyebrow="t('app.workspace.eyebrow')"
    :title="t('app.workspace.title')"
    :description="t('app.workspace.description')"
    :query-fields="queryFields"
    :query-loading="loading"
    :table-columns="tableColumns"
    :items="items"
    :table-loading="loading"
    :table-actions="tableActions"
    :item-count-label="itemCountLabel"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    @search="emit('search', $event)"
    @reset="emit('reset')"
    @action="(key, row) => emit('action', key, row as CustomerRecord)"
    @row-click="emit('row-click', $event as CustomerRecord)"
  >
    <template #toolbar>
      <span class="enterprise-toolbar-pill">
        {{ currentQuerySummary }}
      </span>
    </template>

    <template #footer>
      <div class="enterprise-footer-grid">
        <div class="enterprise-footer-note">
          <span>{{ t("app.workspace.footerStatus") }}</span>
          <strong>{{ footerStatusLabel }}</strong>
          <p>
            {{ t("app.workspace.footerCopy") }}
          </p>
        </div>

        <div class="enterprise-footer-note enterprise-footer-pagination">
          <span>{{ t("app.workspace.paginationLabel") }}</span>
          <strong>{{ paginationSummary }}</strong>

          <div class="enterprise-footer-controls">
            <label class="enterprise-footer-control">
              <small>{{ t("app.workspace.paginationPageSizeLabel") }}</small>
              <TSelect
                :model-value="pageSizeValue"
                :options="pageSizeOptions"
                size="small"
                @update:model-value="emit('change-page-size', $event)"
              />
            </label>

            <label class="enterprise-footer-control">
              <small>{{ t("app.workspace.paginationSortLabel") }}</small>
              <TSelect
                :model-value="sortValue"
                :options="sortOptions"
                size="small"
                @update:model-value="emit('change-sort', $event)"
              />
            </label>
          </div>

          <div class="enterprise-footer-actions">
            <TButton
              variant="outline"
              size="small"
              :disabled="loading || !canGoToPreviousPage"
              @click="emit('go-first-page')"
            >
              {{ t("app.workspace.paginationFirst") }}
            </TButton>
            <TButton
              variant="outline"
              size="small"
              :disabled="loading || !canGoToPreviousPage"
              @click="emit('go-previous-page')"
            >
              {{ t("app.workspace.paginationPrev") }}
            </TButton>
            <TButton
              variant="outline"
              size="small"
              :disabled="loading || !canGoToNextPage"
              @click="emit('go-next-page')"
            >
              {{ t("app.workspace.paginationNext") }}
            </TButton>
            <TButton
              variant="outline"
              size="small"
              :disabled="loading || !canGoToNextPage"
              @click="emit('go-last-page')"
            >
              {{ t("app.workspace.paginationLast") }}
            </TButton>
          </div>

          <div class="enterprise-footer-jump">
            <label class="enterprise-footer-control">
              <small>{{ t("app.workspace.paginationJumpLabel") }}</small>
              <div class="enterprise-footer-jump-row">
                <TInput
                  :model-value="pageInputValue"
                  size="small"
                  :placeholder="t('app.workspace.paginationJumpPlaceholder')"
                  @update:model-value="emit('update-page-input', $event)"
                  @enter="emit('submit-page-jump')"
                />
                <TButton
                  size="small"
                  theme="primary"
                  :disabled="loading || !canJumpToPage"
                  @click="emit('submit-page-jump')"
                >
                  {{ t("app.workspace.paginationJumpSubmit") }}
                </TButton>
              </div>
            </label>
          </div>
        </div>
      </div>
    </template>
  </ElyCrudWorkspace>
</template>

<style scoped>
.enterprise-message {
  border-radius: 12px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.enterprise-footer-grid {
  display: grid;
  gap: 1rem;
}

.enterprise-footer-note span,
.enterprise-footer-control small {
  display: block;
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-footer-note strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-footer-note p {
  margin: 0.7rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.enterprise-footer-pagination,
.enterprise-footer-controls,
.enterprise-footer-actions,
.enterprise-footer-jump-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.enterprise-footer-control {
  display: grid;
  gap: 0.45rem;
  min-width: 160px;
}

@media (max-width: 900px) {
  .enterprise-footer-pagination,
  .enterprise-footer-controls,
  .enterprise-footer-actions,
  .enterprise-footer-jump-row {
    flex-direction: column;
  }
}
</style>
