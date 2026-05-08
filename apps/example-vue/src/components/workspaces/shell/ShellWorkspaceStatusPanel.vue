<script setup lang="ts">
interface ShellWorkspaceStatusPanelProps {
  title: string
  currentPath: string
  authStatusLabel: string
  moduleCodeLabel: string
}

defineProps<ShellWorkspaceStatusPanelProps>()
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ title }}</h3>
    <code class="enterprise-path">{{ currentPath }}</code>

    <div class="enterprise-facts">
      <span>{{ moduleCodeLabel }}</span>
      <span>{{ authStatusLabel }}</span>
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

.enterprise-heading {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-path {
  display: block;
  margin-top: 0.55rem;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  overflow-x: auto;
  white-space: nowrap;
}

.enterprise-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.82rem;
}
</style>
