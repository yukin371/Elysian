<script setup lang="ts">
import { computed } from "vue"

import { formatFileSize } from "../../../lib/file-workspace"
import type { FileRecord } from "../../../lib/platform-api"
import type { FilePanelMode } from "../../../workspaces/use-file-workspace"

interface FileWorkspacePanelProps {
  t: (key: string, params?: Record<string, unknown>) => string
  locale: string
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  canDownloadFiles: boolean
  canDeleteFiles: boolean
  loading: boolean
  detailLoading: boolean
  actionLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: FilePanelMode
  selectedFile: FileRecord | null
  pendingUploadFile: File | null
}

const props = defineProps<FileWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "set-upload-file", file: File | null): void
  (e: "submit-upload"): void
  (e: "download-selected"): void
  (e: "open-delete"): void
  (e: "confirm-delete"): void
  (e: "cancel-panel"): void
}>()

const selectedFileCreatedAtLabel = computed(() =>
  props.selectedFile
    ? new Date(props.selectedFile.createdAt).toLocaleString(props.locale)
    : "",
)

const panelHeading = computed(() => {
  if (props.panelMode === "upload") {
    return props.t("app.file.panelTitle.upload")
  }

  if (props.panelMode === "delete") {
    return props.t("app.file.panelTitle.delete")
  }

  return (
    props.selectedFile?.originalName ??
    props.t("app.file.panelTitle.detailFallback")
  )
})

const panelCopy = computed(() => {
  if (props.panelMode === "upload") {
    return props.t("app.file.panelDesc.upload")
  }

  if (props.panelMode === "delete") {
    return props.t("app.file.panelDesc.delete")
  }

  return props.selectedFile
    ? props.t("app.file.panelDesc.detail")
    : props.t("app.file.detailEmptyDescription")
})

const selectedFileSizeLabel = computed(() =>
  props.selectedFile ? formatFileSize(props.selectedFile.size) : "",
)

const pendingUploadFileSizeLabel = computed(() =>
  props.pendingUploadFile ? formatFileSize(props.pendingUploadFile.size) : "",
)

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null
  emit("set-upload-file", file)

  if (input) {
    input.value = ""
  }
}
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.file.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelHeading }}</h3>
    <p class="enterprise-copy">{{ panelCopy }}</p>

    <div
      v-if="!moduleReady"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.fileModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-inline-warning enterprise-inline-info"
    >
      {{ t("app.message.fileSignInToLoad") }}
    </div>

    <div
      v-else-if="!canViewFiles && !canUploadFiles"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.fileNoListPermission") }}
    </div>
    <template v-else>
      <div
        v-if="errorMessage"
        class="enterprise-inline-warning enterprise-inline-danger"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="detailErrorMessage"
        class="enterprise-inline-warning enterprise-inline-danger"
      >
        {{ detailErrorMessage }}
      </div>

      <div
        v-if="panelMode === 'upload' && canUploadFiles"
        class="panel-stack"
      >
      <label class="upload-dropzone">
        <span class="enterprise-subheading">
          {{ t("app.file.uploadFieldLabel") }}
        </span>
        <input
          class="upload-input"
          type="file"
          @change="handleFileInput"
        />
        <span class="upload-copy">
          {{
            pendingUploadFile
              ? pendingUploadFile.name
              : t("app.file.uploadPrompt")
          }}
        </span>
      </label>

      <div v-if="pendingUploadFile" class="enterprise-metadata">
        <div>
          <span>{{ t("app.file.meta.mimeType") }}</span>
          <strong>
            {{ pendingUploadFile.type || t("app.file.mimeTypeEmpty") }}
          </strong>
        </div>
        <div>
          <span>{{ t("app.file.meta.size") }}</span>
          <strong>{{ pendingUploadFileSizeLabel }}</strong>
        </div>
      </div>

      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-primary"
          :disabled="actionLoading || loading"
          @click="emit('submit-upload')"
        >
          {{ t("app.file.action.submitUpload") }}
        </button>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="actionLoading"
          @click="emit('cancel-panel')"
        >
          {{ t("copy.form.cancel") }}
        </button>
      </div>
      </div>

      <div
        v-else-if="panelMode === 'delete' && selectedFile"
        class="panel-stack"
      >
        <div class="enterprise-inline-warning">
          {{
            t("app.file.deleteConfirm", {
              name: selectedFile.originalName,
            })
          }}
        </div>

        <div class="enterprise-button-row">
          <button
            type="button"
            class="enterprise-button enterprise-button-danger"
            :disabled="actionLoading"
            @click="emit('confirm-delete')"
          >
            {{ t("app.file.action.confirmDelete") }}
          </button>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="actionLoading"
            @click="emit('cancel-panel')"
          >
            {{ t("app.file.action.cancelDelete") }}
          </button>
        </div>
      </div>

      <div
        v-else-if="selectedFile"
        class="panel-stack"
      >
        <div
          v-if="detailLoading"
          class="enterprise-inline-warning enterprise-inline-info"
        >
          {{ t("app.file.detailLoading") }}
        </div>

        <div class="enterprise-button-row">
          <button
            type="button"
            class="enterprise-button enterprise-button-primary"
            :disabled="!canDownloadFiles || actionLoading"
            @click="emit('download-selected')"
          >
            {{ t("app.file.action.download") }}
          </button>
          <button
            v-if="canDeleteFiles"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="actionLoading"
            @click="emit('open-delete')"
          >
            {{ t("app.file.action.delete") }}
          </button>
        </div>

        <div class="enterprise-metadata">
          <div>
            <span>{{ t("app.file.meta.id") }}</span>
            <strong>{{ selectedFile.id }}</strong>
          </div>
          <div>
            <span>{{ t("app.file.meta.mimeType") }}</span>
            <strong>{{ selectedFile.mimeType || t("app.file.mimeTypeEmpty") }}</strong>
          </div>
          <div>
            <span>{{ t("app.file.meta.size") }}</span>
            <strong>{{ selectedFileSizeLabel }}</strong>
          </div>
          <div>
            <span>{{ t("app.file.meta.uploaderUserId") }}</span>
            <strong>
              {{ selectedFile.uploaderUserId || t("app.file.uploaderEmpty") }}
            </strong>
          </div>
          <div>
            <span>{{ t("app.file.meta.createdAt") }}</span>
            <strong>{{ selectedFileCreatedAtLabel }}</strong>
          </div>
        </div>
      </div>

      <div v-else class="enterprise-empty-state">
        <strong>{{ t("app.file.detailEmptyTitle") }}</strong>
        <p>{{ t("app.file.detailEmptyDescription") }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-metadata span {
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
.enterprise-empty-state p {
  margin: 0.75rem 0 0;
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

.enterprise-inline-info {
  border-color: rgba(14, 165, 233, 0.16);
  background: rgba(240, 249, 255, 0.96);
  color: #0c4a6e;
}

.enterprise-inline-danger {
  border-color: rgba(239, 68, 68, 0.16);
  background: rgba(254, 242, 242, 0.96);
  color: #991b1b;
}

.panel-stack {
  display: grid;
  gap: 1.1rem;
  margin-top: 1.2rem;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
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

.enterprise-button-danger {
  background: #b91c1c;
  color: #fff1f2;
}

.enterprise-button:disabled {
  opacity: 0.55;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.92);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
  word-break: break-word;
}

.upload-dropzone {
  display: grid;
  gap: 0.85rem;
  border-radius: 16px;
  border: 1px dashed rgba(36, 87, 214, 0.28);
  background: rgba(239, 246, 255, 0.82);
  padding: 1rem;
}

.upload-input {
  color: #0f172a;
}

.upload-copy {
  color: #173ea6;
}

.enterprise-empty-state {
  margin-top: 1.2rem;
  border-radius: 16px;
  border: 1px dashed rgba(15, 23, 42, 0.12);
  padding: 1rem;
  color: #0f172a;
}
</style>
