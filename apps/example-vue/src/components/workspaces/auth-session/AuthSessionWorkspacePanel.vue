<script setup lang="ts">
import { ref, watch } from "vue"

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

const props = defineProps<AuthSessionWorkspacePanelProps>()

defineEmits<(e: "revoke-selected-session") => void>()

const confirmRevocation = ref(false)

watch(
  () => props.selectedSession,
  () => {
    confirmRevocation.value = false
  },
)
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
      <div
        :class="
          selectedSession.isCurrent
            ? 'session-callout session-callout-current'
            : 'session-callout'
        "
      >
        <div class="session-callout__header">
          <span
            v-if="selectedSession.isCurrent"
            class="session-callout__badge"
          >
            {{ t("app.onlineSession.currentBadge") }}
          </span>
          <strong>
            {{
              selectedSession.isCurrent
                ? t("app.onlineSession.currentSessionTitle")
                : t("app.onlineSession.otherSessionTitle")
            }}
          </strong>
        </div>
        <p>
          {{
            selectedSession.isCurrent
              ? t("app.onlineSession.currentSessionDescription")
              : t("app.onlineSession.otherSessionDescription")
          }}
        </p>
      </div>

      <div class="enterprise-button-row">
        <button
          v-if="!selectedSession.isCurrent && !confirmRevocation"
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="loading || actionLoading"
          @click="confirmRevocation = true"
        >
          {{ t("app.onlineSession.action.revoke") }}
        </button>

        <button
          v-else-if="selectedSession.isCurrent"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          disabled
        >
          {{ t("app.onlineSession.action.revokeCurrentDisabled") }}
        </button>
      </div>

      <div
        v-if="!selectedSession.isCurrent && confirmRevocation"
        class="session-confirmation"
      >
        <strong>{{ t("app.onlineSession.confirmationTitle") }}</strong>
        <p>
          {{
            t("app.onlineSession.confirmationDescription", {
              device: String(selectedSession.device ?? "—"),
              ip: String(selectedSession.ip || "—"),
            })
          }}
        </p>
        <div class="enterprise-button-row">
          <button
            type="button"
            class="enterprise-button enterprise-button-danger"
            :disabled="loading || actionLoading"
            @click="$emit('revoke-selected-session')"
          >
            {{ t("app.onlineSession.action.confirmRevoke") }}
          </button>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="loading || actionLoading"
            @click="confirmRevocation = false"
          >
            {{ t("app.onlineSession.action.cancelRevoke") }}
          </button>
        </div>
      </div>

      <p class="session-action-hint">
        {{
          selectedSession.isCurrent
            ? t("app.onlineSession.revokeCurrentHint")
            : confirmRevocation
              ? t("app.onlineSession.revokeOtherConfirmHint")
              : t("app.onlineSession.revokeOtherHint")
        }}
      </p>

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

    <div v-else class="session-empty-state mt-5">
      <strong>{{ t("app.onlineSession.detailEmptyTitle") }}</strong>
      <p>{{ t("app.onlineSession.detailEmptyDescription") }}</p>
      <p class="session-empty-state__hint">
        {{ t("app.onlineSession.detailEmptyNextStep") }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.session-callout {
  margin-top: 1rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(36, 87, 214, 0.12);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.95);
}

.session-callout-current {
  border-color: rgba(36, 87, 214, 0.2);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.96), rgba(248, 250, 252, 0.96));
}

.session-callout__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #0f172a;
}

.session-callout__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: rgba(36, 87, 214, 0.12);
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 600;
}

.session-callout p,
.session-action-hint,
.session-empty-state p {
  margin: 0.55rem 0 0;
  color: #475569;
  line-height: 1.6;
}

.session-action-hint {
  font-size: 0.82rem;
}

.session-confirmation {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.95rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(185, 28, 28, 0.16);
  border-radius: 14px;
  background: rgba(254, 242, 242, 0.92);
}

.session-confirmation strong {
  color: #7f1d1d;
}

.session-confirmation p {
  margin: 0;
  color: #7f1d1d;
  line-height: 1.6;
}

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

.session-empty-state {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.92);
}

.session-empty-state__hint {
  color: #64748b;
  font-size: 0.82rem;
}
</style>
