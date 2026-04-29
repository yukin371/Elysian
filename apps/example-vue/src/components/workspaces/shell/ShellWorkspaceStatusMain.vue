<script setup lang="ts">
interface ShellWorkspaceStatusMainProps {
  mode: "runtime" | "placeholder"
  title: string
  subtitle: string
  badge: string
  currentPage: string
  currentPath: string
  moduleStatusLabel: string
  authStatusLabel: string
  permissionCount: number
  moduleCodeLabel: string
  backButtonLabel: string
  showBackButton: boolean
}

defineProps<ShellWorkspaceStatusMainProps>()

const emit = defineEmits<(e: "back-to-customer") => void>()
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div class="enterprise-status-header">
      <div>
        <h3 class="enterprise-heading">{{ title }}</h3>
        <p class="enterprise-copy">{{ subtitle }}</p>
      </div>

      <span class="enterprise-toolbar-pill">
        {{ badge }}
      </span>
    </div>

    <div class="enterprise-metadata mt-5">
      <div>
        <span>{{ mode === "runtime" ? "当前页面" : "路由" }}</span>
        <strong>{{ mode === "runtime" ? currentPage : currentPath }}</strong>
      </div>
      <div>
        <span>{{ mode === "runtime" ? "当前路径" : "模块编码" }}</span>
        <strong>{{ mode === "runtime" ? currentPath : moduleCodeLabel }}</strong>
      </div>
      <div>
        <span>模块状态</span>
        <strong>{{ moduleStatusLabel }}</strong>
      </div>
      <div v-if="mode === 'runtime'">
        <span>鉴权状态</span>
        <strong>{{ authStatusLabel }}</strong>
      </div>
      <div v-if="mode === 'runtime'">
        <span>权限数</span>
        <strong>{{ permissionCount }}</strong>
      </div>
    </div>

    <div v-if="showBackButton" class="enterprise-button-row">
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="emit('back-to-customer')"
      >
        {{ backButtonLabel }}
      </button>
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

.enterprise-main-card,
.enterprise-status-header,
.enterprise-button-row,
.enterprise-metadata {
  margin: 0;
}

.enterprise-status-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.enterprise-heading {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.55rem 0 0;
  line-height: 1.75;
  color: #475569;
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

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-top: 1rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.58);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata span {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, #2457d6, #173ea6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.65rem 1rem;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}

@media (max-width: 900px) {
  .enterprise-status-header {
    flex-direction: column;
  }
}
</style>
