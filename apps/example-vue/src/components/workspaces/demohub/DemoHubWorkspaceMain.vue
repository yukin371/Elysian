<script setup lang="ts">
import { computed, reactive, ref } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"

interface DemoHubScenario {
  key: string
  title: string
  summary: string
  audience: string
  entry: string
  goal: string
  primaryAction: string
  fields: string[]
  feedback: string[]
  checklist: string[]
}

const props = defineProps<{
  t: AppTranslate
}>()

const scenarios: DemoHubScenario[] = [
  {
    key: "generator-start",
    title: "生成起稿简化流",
    summary: "先用表单收敛模块目标，再进入字段确认与预览。",
    audience: "配置生成页面的产品或开发同学",
    entry: "从 Studio 进入，默认落在主表单，不直接展示高级 JSON。",
    goal: "一次把模块名、页面目标和起稿方式交代清楚。",
    primaryAction: "继续到字段确认",
    fields: ["模块标识", "模块名称", "页面目标", "起稿方式"],
    feedback: ["立即显示下一步去哪", "说明不会触发真实生成", "保留再开高级 JSON 的入口"],
    checklist: ["是否减少首屏术语", "是否避免强制看 JSON", "是否明确下一步"],
  },
  {
    key: "list-detail",
    title: "列表进入详情简化流",
    summary: "用单页主列表 + 次级详情面板，减少多跳转。",
    audience: "高频查看和调整记录的后台操作员",
    entry: "从导航进入列表后，先给搜索和主动作，再给详情。",
    goal: "快速找到记录并在同页完成判断。",
    primaryAction: "查看详情并继续编辑",
    fields: ["搜索关键词", "状态筛选", "主动作按钮"],
    feedback: ["空态说明下一步", "选中后面板聚焦详情", "无权限时直接给原因"],
    checklist: ["列表列是否过多", "详情是否复读主区", "空态是否指导操作"],
  },
  {
    key: "submit-confirm",
    title: "提交前确认流",
    summary: "把风险确认收成一张清单，不打断主任务。",
    audience: "需要在提交前做人工复核的管理员",
    entry: "主流程完成后才展开确认卡，不抢首屏注意力。",
    goal: "让用户清楚知道自己确认了什么。",
    primaryAction: "确认并提交",
    fields: ["目标范围", "影响项摘要", "人工确认项"],
    feedback: ["确认后展示简短成功反馈", "保留回看证据入口", "避免二次解释大段规则"],
    checklist: ["清单是否够短", "风险词是否易懂", "确认动作是否唯一明确"],
  },
]

const activeScenarioKey = ref<DemoHubScenario["key"]>(scenarios[0].key)

const draftForm = reactive({
  moduleCode: "supplier",
  moduleLabel: "供应商",
  pageGoal: "新模块起稿",
  startMode: "reference",
})

const activeScenario = computed(
  () =>
    scenarios.find((scenario) => scenario.key === activeScenarioKey.value) ??
    scenarios[0],
)

const startModeOptions = computed(() => [
  {
    value: "reference",
    label: props.t("app.demoHub.formVariant.reference"),
  },
  {
    value: "template",
    label: props.t("app.demoHub.formVariant.template"),
  },
  {
    value: "manual",
    label: props.t("app.demoHub.formVariant.manual"),
  },
])
</script>

<template>
  <section class="enterprise-card demo-hub-main">
    <header class="demo-hub-hero">
      <div class="demo-hub-hero-copy">
        <p class="demo-hub-eyebrow">{{ t("app.demoHub.heroEyebrow") }}</p>
        <h2 class="demo-hub-title">{{ t("app.demoHub.heroTitle") }}</h2>
        <p class="demo-hub-description">
          {{ t("app.demoHub.heroDescription") }}
        </p>
      </div>
      <div class="demo-hub-badges">
        <span class="demo-hub-badge">{{ t("app.demoHub.badge.prototypeOnly") }}</span>
        <span class="demo-hub-badge">{{ t("app.demoHub.badge.formFirst") }}</span>
        <span class="demo-hub-badge">{{ t("app.demoHub.badge.noApi") }}</span>
      </div>
    </header>

    <section class="demo-hub-scenario-grid">
      <aside class="demo-hub-scenario-list">
        <p class="demo-hub-section-label">{{ t("app.demoHub.scenarioLabel") }}</p>
        <button
          v-for="scenario in scenarios"
          :key="scenario.key"
          type="button"
          class="demo-hub-scenario-card"
          :class="{
            'demo-hub-scenario-card-active': scenario.key === activeScenarioKey,
          }"
          @click="activeScenarioKey = scenario.key"
        >
          <strong>{{ scenario.title }}</strong>
          <span>{{ scenario.summary }}</span>
        </button>
      </aside>

      <div class="demo-hub-stage">
        <section class="demo-hub-surface">
          <div class="demo-hub-surface-header">
            <div>
              <p class="demo-hub-section-label">
                {{ t("app.demoHub.prototypeTitle") }}
              </p>
              <h3>{{ activeScenario.title }}</h3>
            </div>
            <p class="demo-hub-surface-description">
              {{ t("app.demoHub.prototypeDescription") }}
            </p>
          </div>

          <div class="demo-hub-summary-grid">
            <article class="demo-hub-summary-card">
              <span>{{ t("app.demoHub.prototypeAudience") }}</span>
              <strong>{{ activeScenario.audience }}</strong>
            </article>
            <article class="demo-hub-summary-card">
              <span>{{ t("app.demoHub.prototypeEntry") }}</span>
              <strong>{{ activeScenario.entry }}</strong>
            </article>
            <article class="demo-hub-summary-card">
              <span>{{ t("app.demoHub.prototypeGoal") }}</span>
              <strong>{{ activeScenario.goal }}</strong>
            </article>
            <article class="demo-hub-summary-card">
              <span>{{ t("app.demoHub.prototypePrimaryAction") }}</span>
              <strong>{{ activeScenario.primaryAction }}</strong>
            </article>
          </div>
        </section>

        <section class="demo-hub-form-section">
          <div class="demo-hub-form-copy">
            <p class="demo-hub-section-label">
              {{ t("app.demoHub.formSectionTitle") }}
            </p>
            <h3>{{ t("app.demoHub.formSectionDescription") }}</h3>
          </div>

          <div class="demo-hub-form-grid">
            <label class="demo-hub-field">
              <span>{{ t("app.demoHub.formModuleCode") }}</span>
              <input v-model="draftForm.moduleCode" type="text" />
            </label>
            <label class="demo-hub-field">
              <span>{{ t("app.demoHub.formModuleLabel") }}</span>
              <input v-model="draftForm.moduleLabel" type="text" />
            </label>
            <label class="demo-hub-field">
              <span>{{ t("app.demoHub.formScenario") }}</span>
              <input v-model="draftForm.pageGoal" type="text" />
            </label>
            <label class="demo-hub-field">
              <span>{{ t("app.demoHub.formVariant") }}</span>
              <select v-model="draftForm.startMode">
                <option
                  v-for="option in startModeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="demo-hub-next-step">
            <strong>{{ t("app.demoHub.formNextAction") }}</strong>
            <p>{{ t("app.demoHub.formNextActionValue") }}</p>
            <span>{{ t("app.demoHub.formLocalHint") }}</span>
          </div>
        </section>

        <section class="demo-hub-lists">
          <article class="demo-hub-list-card">
            <p class="demo-hub-section-label">
              {{ t("app.demoHub.prototypeFields") }}
            </p>
            <ul>
              <li v-for="field in activeScenario.fields" :key="field">{{ field }}</li>
            </ul>
          </article>
          <article class="demo-hub-list-card">
            <p class="demo-hub-section-label">
              {{ t("app.demoHub.prototypeFeedback") }}
            </p>
            <ul>
              <li v-for="feedback in activeScenario.feedback" :key="feedback">
                {{ feedback }}
              </li>
            </ul>
          </article>
          <article class="demo-hub-list-card">
            <p class="demo-hub-section-label">
              {{ t("app.demoHub.prototypeChecklist") }}
            </p>
            <ul>
              <li
                v-for="check in activeScenario.checklist"
                :key="check"
              >
                {{ check }}
              </li>
            </ul>
          </article>
        </section>
      </div>
    </section>
  </section>
</template>

<style scoped>
.demo-hub-main {
  display: grid;
  gap: 1.25rem;
}

.demo-hub-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 252, 0.98));
}

.demo-hub-hero-copy {
  max-width: 48rem;
}

.demo-hub-eyebrow,
.demo-hub-section-label {
  margin: 0;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-hub-title {
  margin: 0.4rem 0 0;
  color: #0f172a;
  font-size: 1.8rem;
  line-height: 1.2;
}

.demo-hub-description,
.demo-hub-surface-description,
.demo-hub-next-step span,
.demo-hub-scenario-card span {
  color: #475569;
  line-height: 1.65;
}

.demo-hub-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-content: flex-start;
}

.demo-hub-badge {
  padding: 0.45rem 0.8rem;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: 600;
}

.demo-hub-scenario-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
}

.demo-hub-scenario-list,
.demo-hub-stage {
  display: grid;
  gap: 0.9rem;
}

.demo-hub-scenario-card,
.demo-hub-summary-card,
.demo-hub-form-section,
.demo-hub-list-card,
.demo-hub-surface {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: #fff;
}

.demo-hub-scenario-card {
  display: grid;
  gap: 0.35rem;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.demo-hub-scenario-card:hover,
.demo-hub-scenario-card-active {
  border-color: #93c5fd;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.demo-hub-surface-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem;
}

.demo-hub-surface-header h3,
.demo-hub-form-copy h3 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 1.2rem;
}

.demo-hub-summary-grid,
.demo-hub-lists,
.demo-hub-form-grid {
  display: grid;
  gap: 0.85rem;
}

.demo-hub-summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.demo-hub-summary-card span,
.demo-hub-field span,
.demo-hub-next-step strong {
  color: #64748b;
  font-size: 0.85rem;
}

.demo-hub-summary-card strong,
.demo-hub-next-step p {
  color: #0f172a;
}

.demo-hub-form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.demo-hub-field {
  display: grid;
  gap: 0.45rem;
}

.demo-hub-field input,
.demo-hub-field select {
  min-height: 2.75rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  color: #0f172a;
  background: #fff;
}

.demo-hub-next-step {
  display: grid;
  gap: 0.25rem;
  padding: 0.95rem 1rem;
  border: 1px dashed #93c5fd;
  border-radius: 0.9rem;
  background: #f8fbff;
}

.demo-hub-list-card ul {
  margin: 0.65rem 0 0;
  padding-left: 1rem;
  color: #0f172a;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .demo-hub-scenario-grid,
  .demo-hub-summary-grid,
  .demo-hub-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
