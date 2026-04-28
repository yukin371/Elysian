<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"

import type { PostRecord } from "../../../lib/platform-api"

type PostWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface PostWorkspaceMainProps {
  t: PostWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewPosts: boolean
  loading: boolean
  errorMessage: string
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  items: PostRecord[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
}

defineProps<PostWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: PostRecord): void
}>()
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.postModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.postSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewPosts"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.postNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-message enterprise-message-danger">
      {{ errorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.post.workspaceEyebrow')"
      :title="t('app.post.workspaceTitle')"
      :description="t('app.post.workspaceDescription')"
      :query-fields="queryFields"
      :query-loading="loading"
      :table-columns="tableColumns"
      :items="items"
      :table-loading="loading"
      :table-actions="[]"
      :item-count-label="itemCountLabel"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :copy="copy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
      @row-click="emit('row-click', $event as PostRecord)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
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
</style>
