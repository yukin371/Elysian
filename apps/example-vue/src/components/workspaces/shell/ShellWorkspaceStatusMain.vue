<script setup lang="ts">
interface ShellWorkspaceStatusMainProps {
  mode: "runtime" | "placeholder"
  title: string
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
    <div class="enterprise-status-bar">
      <div class="enterprise-status-copy">
        <h3 class="enterprise-heading">{{ title }}</h3>
        <code class="enterprise-path">{{ currentPath }}</code>
      </div>

      <button
        v-if="showBackButton"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="emit('back-to-customer')"
      >
        {{ backButtonLabel }}
      </button>
    </div>

    <div class="enterprise-facts">
      <span v-if="mode === 'placeholder'">{{ moduleCodeLabel }}</span>
      <span>{{ moduleStatusLabel }}</span>
      <span v-if="mode === 'runtime'">{{ authStatusLabel }}</span>
      <span v-if="mode === 'runtime' && permissionCount > 0">
        {{ permissionCount }} 权限
      </span>
    </div>
  </section>
</template>

<style scoped>
.enterprise-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: #ffffff;
  padding: 1rem;
  color: #0f172a;
}

.enterprise-main-card,
.enterprise-status-bar,
.enterprise-facts {
  margin: 0;
}

.enterprise-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.enterprise-status-copy {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

.enterprise-heading {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-path {
  overflow-x: auto;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}

.enterprise-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.82rem;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 4px;
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
  .enterprise-status-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
