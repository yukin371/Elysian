<script setup lang="ts">
type AuthSessionWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface AuthSessionWorkspacePanelProps {
  t: AuthSessionWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  loading: boolean
  actionLoading: boolean
  errorMessage: string
  selectedSession: Record<string, unknown> | null
}

defineProps<AuthSessionWorkspacePanelProps>()

defineEmits<(e: "revoke-selected-session") => void>()
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">
      {{
        selectedSession
          ? String(selectedSession.device ?? t("app.onlineSession.panelTitle.detailFallback"))
          : t("app.onlineSession.panelTitle.detailFallback")
      }}
    </h3>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.onlineSessionModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.onlineSessionSignInToLoad") }}
    </div>

    <div v-else-if="!canEnterWorkspace" class="enterprise-inline-warning">
      {{ t("app.message.onlineSessionNoAccess") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <template v-else-if="selectedSession">
      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="loading || actionLoading"
          @click="$emit('revoke-selected-session')"
        >
          {{
            selectedSession.isCurrent
              ? t("app.onlineSession.action.revokeCurrent")
              : t("app.onlineSession.action.revoke")
          }}
        </button>
      </div>

      <dl class="enterprise-meta-grid">
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.device") }}</dt>
          <dd>{{ selectedSession.device }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.state") }}</dt>
          <dd>{{ selectedSession.state }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.ip") }}</dt>
          <dd>{{ selectedSession.ip || "—" }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.lastUsedAt") }}</dt>
          <dd>{{ selectedSession.lastUsedAt || "—" }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.expiresAt") }}</dt>
          <dd>{{ selectedSession.expiresAt }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.createdAt") }}</dt>
          <dd>{{ selectedSession.createdAt }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.updatedAt") }}</dt>
          <dd>{{ selectedSession.updatedAt }}</dd>
        </div>
        <div class="enterprise-meta-item">
          <dt>{{ t("app.onlineSession.field.userAgent") }}</dt>
          <dd>{{ selectedSession.userAgent || "—" }}</dd>
        </div>
      </dl>
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.onlineSession.detailEmptyDescription") }}
    </div>
  </section>
</template>

<style scoped>
.enterprise-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 1.2rem;
}

.enterprise-meta-item {
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.92);
  padding: 0.85rem 0.95rem;
}

.enterprise-meta-item dt {
  font-size: 0.78rem;
  color: #64748b;
}

.enterprise-meta-item dd {
  margin: 0.4rem 0 0;
  line-height: 1.6;
  word-break: break-word;
  color: #0f172a;
}
</style>
