<script setup lang="ts">
import { computed } from "vue"

import { Input as TInput } from "tdesign-vue-next/es/input"

import type {
  FileTableItem,
  FileWorkspaceQuery,
} from "../../../lib/file-workspace"

interface FileWorkspaceMainProps {
  t: (key: string, params?: Record<string, unknown>) => string
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  errorMessage: string
  loading: boolean
  query: FileWorkspaceQuery
  filterSummary: string
  countLabel: string
  tableItems: FileTableItem[]
  selectedFileId: string | null
}

const props = defineProps<FileWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:query", value: FileWorkspaceQuery): void
  (e: "reset-filters"): void
  (e: "select-file", fileId: string): void
  (e: "open-upload"): void
}>()

const hasActiveFilters = computed(() =>
  Boolean(
    props.query.originalName?.trim() ||
      props.query.mimeType?.trim() ||
      props.query.uploaderUserId?.trim(),
  ),
)

const updateQuery = (key: keyof FileWorkspaceQuery, value: string | number) => {
  emit("update:query", {
    ...props.query,
    [key]: String(value),
  })
}
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div class="workspace-header">
      <div>
        <p class="enterprise-eyebrow">{{ t("app.file.workspaceEyebrow") }}</p>
        <h3 class="enterprise-heading">{{ t("app.file.workspaceTitle") }}</h3>
        <p class="enterprise-copy">{{ t("app.file.workspaceDescription") }}</p>
      </div>

      <button
        v-if="canUploadFiles"
        type="button"
        class="enterprise-button enterprise-button-primary"
        @click="emit('open-upload')"
      >
        {{ t("app.file.action.upload") }}
      </button>
    </div>

    <div
      v-if="!moduleReady"
      class="enterprise-message enterprise-message-warning section-gap"
    >
      {{ t("app.message.fileModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info section-gap"
    >
      {{ t("app.message.fileSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewFiles"
      class="enterprise-message enterprise-message-warning section-gap"
    >
      {{ t("app.message.fileNoListPermission") }}
    </div>

    <div
      v-else-if="errorMessage"
      class="enterprise-message enterprise-message-danger section-gap"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="loading"
      class="enterprise-message enterprise-message-info section-gap"
    >
      {{ t("app.file.loading") }}
    </div>

    <div v-else class="workspace-stack">
      <div class="file-toolbar">
        <label class="enterprise-field">
          <span>{{ t("app.file.field.originalName") }}</span>
          <TInput
            :model-value="query.originalName ?? ''"
            :placeholder="t('app.file.query.originalNamePlaceholder')"
            clearable
            @update:model-value="updateQuery('originalName', $event)"
          />
        </label>

        <label class="enterprise-field">
          <span>{{ t("app.file.field.mimeType") }}</span>
          <TInput
            :model-value="query.mimeType ?? ''"
            :placeholder="t('app.file.query.mimeTypePlaceholder')"
            clearable
            @update:model-value="updateQuery('mimeType', $event)"
          />
        </label>

        <label class="enterprise-field">
          <span>{{ t("app.file.field.uploaderUserId") }}</span>
          <TInput
            :model-value="query.uploaderUserId ?? ''"
            :placeholder="t('app.file.query.uploaderUserIdPlaceholder')"
            clearable
            @update:model-value="updateQuery('uploaderUserId', $event)"
          />
        </label>
      </div>

      <div class="file-summary-row">
        <span class="enterprise-toolbar-pill">{{ filterSummary }}</span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('reset-filters')"
        >
          {{ t("app.file.filter.reset") }}
        </button>
      </div>

      <div
        v-if="tableItems.length === 0"
        class="enterprise-message enterprise-message-info"
      >
        <strong>{{ t("app.file.emptyTitle") }}</strong>
        <p class="empty-copy">{{ t("app.file.emptyDescription") }}</p>
      </div>

      <div v-else class="file-table-shell">
        <table class="file-table">
          <thead>
            <tr>
              <th>{{ t("app.file.field.originalName") }}</th>
              <th>{{ t("app.file.field.mimeType") }}</th>
              <th>{{ t("app.file.field.size") }}</th>
              <th>{{ t("app.file.field.uploaderUserId") }}</th>
              <th>{{ t("app.file.field.createdAt") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in tableItems"
              :key="file.id"
              class="file-table-row"
              :class="selectedFileId === file.id ? 'file-table-row-active' : ''"
              @click="emit('select-file', file.id)"
            >
              <td>
                <strong>{{ file.originalName }}</strong>
              </td>
              <td>{{ file.mimeType }}</td>
              <td>{{ file.sizeLabel }}</td>
              <td>{{ file.uploaderUserId }}</td>
              <td>{{ file.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="file-footer">
        <span class="enterprise-copy file-count">{{ countLabel }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy,
.empty-copy {
  margin: 0.75rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.empty-copy {
  margin-top: 0.45rem;
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-message {
  border-radius: 14px;
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

.enterprise-button {
  border: none;
  border-radius: 999px;
  padding: 0.72rem 1.2rem;
  font-size: 0.86rem;
  font-weight: 600;
}

.enterprise-button-primary {
  background: #2457d6;
  color: #eff6ff;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.92);
  color: #173ea6;
}

.section-gap {
  margin-top: 1.25rem;
}

.workspace-header,
.file-summary-row,
.file-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.workspace-stack {
  display: grid;
  gap: 1.25rem;
}

.file-toolbar {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.file-table-shell {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th,
.file-table td {
  padding: 0.9rem 1rem;
  text-align: left;
  vertical-align: middle;
}

.file-table thead {
  background: rgba(248, 250, 252, 0.96);
}

.file-table th {
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
}

.file-table td {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.file-table-row {
  cursor: pointer;
}

.file-table-row-active {
  background: rgba(36, 87, 214, 0.08);
}

.file-count {
  margin: 0;
}

@media (max-width: 900px) {
  .workspace-header,
  .file-summary-row,
  .file-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .file-table-shell {
    overflow-x: auto;
  }
}
</style>
