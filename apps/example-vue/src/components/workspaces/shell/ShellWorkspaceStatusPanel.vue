<script setup lang="ts">
interface ShellWorkspaceStatusPanelProps {
  title: string
  currentPage: string
  currentPath: string
  authStatusLabel: string
  moduleCodeLabel: string
}

defineProps<ShellWorkspaceStatusPanelProps>()
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ title }}</h3>
    <p class="enterprise-copy">{{ currentPath }}</p>

    <div class="enterprise-metadata mt-5">
      <div>
        <span>当前页面</span>
        <strong>{{ currentPage }}</strong>
      </div>
      <div>
        <span>当前路径</span>
        <strong>{{ currentPath }}</strong>
      </div>
      <div>
        <span>鉴权状态</span>
        <strong>{{ authStatusLabel }}</strong>
      </div>
      <div>
        <span>模块编码</span>
        <strong>{{ moduleCodeLabel }}</strong>
      </div>
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

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
</style>
