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
    <h3 class="enterprise-heading">{{ panelHeading }}</h3>

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
        class="enterprise-panel-stack"
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
            class="enterprise-button"
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
        class="enterprise-panel-stack"
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
        class="enterprise-panel-stack"
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
            class="enterprise-button"
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

      <div v-else class="file-empty-state">
        <strong>{{ t("app.file.detailEmptyTitle") }}</strong>
        <p>{{ t("app.file.detailEmptyDescription") }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.file-empty-state p {
  margin-top: 0.75rem;
}

.upload-dropzone {
  display: grid;
  gap: 0.85rem;
  border-radius: 6px;
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

.file-empty-state {
  margin-top: 1.2rem;
  border-radius: 6px;
  border: 1px dashed rgba(15, 23, 42, 0.12);
  padding: 1rem;
  color: #0f172a;
}
</style>
