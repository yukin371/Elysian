<script setup lang="ts">
import type { AppTranslate } from "../../../app/app-shell-helpers"

defineProps<{
  t: AppTranslate
  currentPath: string
  moduleCodeLabel: string
}>()
</script>

<template>
  <section class="enterprise-card demo-hub-panel">
    <header class="demo-hub-panel-header">
      <p class="demo-hub-panel-eyebrow">{{ t("app.demoHub.panelTitle") }}</p>
      <h3>{{ t("app.demoHub.ruleTitle") }}</h3>
      <p>{{ t("app.demoHub.panelDescription") }}</p>
    </header>

    <article class="demo-hub-panel-block">
      <h4>{{ t("app.demoHub.ruleDescription") }}</h4>
      <ul>
        <li>{{ t("app.demoHub.rule1") }}</li>
        <li>{{ t("app.demoHub.rule2") }}</li>
        <li>{{ t("app.demoHub.rule3") }}</li>
      </ul>
    </article>

    <article class="demo-hub-panel-block">
      <h4>{{ t("app.demoHub.handoffTitle") }}</h4>
      <p>{{ t("app.demoHub.handoffDescription") }}</p>
      <ol>
        <li>{{ t("app.demoHub.handoffStep1") }}</li>
        <li>{{ t("app.demoHub.handoffStep2") }}</li>
        <li>{{ t("app.demoHub.handoffStep3") }}</li>
      </ol>
    </article>

    <article class="demo-hub-panel-block">
      <h4>{{ t("app.placeholder.route") }}</h4>
      <p>{{ currentPath }}</p>
      <h4>{{ t("app.placeholder.moduleCode") }}</h4>
      <p>{{ moduleCodeLabel }}</p>
    </article>
  </section>
</template>

<style scoped>
.demo-hub-panel {
  display: grid;
  gap: 1rem;
}

.demo-hub-panel-header h3,
.demo-hub-panel-block h4 {
  margin: 0;
  color: #0f172a;
}

.demo-hub-panel-eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-hub-panel-header p,
.demo-hub-panel-block p {
  margin: 0.4rem 0 0;
  color: #475569;
  line-height: 1.65;
}

.demo-hub-panel-block {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: #fff;
}

.demo-hub-panel-block ul,
.demo-hub-panel-block ol {
  margin: 0.7rem 0 0;
  padding-left: 1.1rem;
  color: #0f172a;
  line-height: 1.7;
}
</style>
