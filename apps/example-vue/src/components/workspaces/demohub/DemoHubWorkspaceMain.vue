<script setup lang="ts">
import { computed, reactive, ref } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"

type DemoHubPrototypeKey =
  | "generator-start"
  | "generator-review"
  | "generator-apply-checklist"

type StartMode = "reference" | "template" | "manual"
type ReviewState = "blocking" | "review-ready" | "failed"
type ApplyState = "ready" | "missing-checks" | "stale"

interface PrototypeCard {
  key: DemoHubPrototypeKey
  title: string
  summary: string
  stage: string
}

interface ReviewFileCard {
  name: string
  path: string
  action: "block" | "overwrite" | "create" | "skip"
  reason: string
  diff: string
  hasChanges: boolean
}

interface CoverageItem {
  id: string
  stage: string
  state: string
  expected: string
  owner: string
  status: "covered" | "partial" | "pending"
}

const props = defineProps<{
  t: AppTranslate
}>()

const prototypeCards = computed<PrototypeCard[]>(() => [
  {
    key: "generator-start",
    title: props.t("app.demoHub.prototype.start.title"),
    summary: props.t("app.demoHub.prototype.start.summary"),
    stage: props.t("app.demoHub.prototype.stage.start"),
  },
  {
    key: "generator-review",
    title: props.t("app.demoHub.prototype.review.title"),
    summary: props.t("app.demoHub.prototype.review.summary"),
    stage: props.t("app.demoHub.prototype.stage.review"),
  },
  {
    key: "generator-apply-checklist",
    title: props.t("app.demoHub.prototype.apply.title"),
    summary: props.t("app.demoHub.prototype.apply.summary"),
    stage: props.t("app.demoHub.prototype.stage.apply"),
  },
])

const activePrototypeKey = ref<DemoHubPrototypeKey>("generator-start")

const startDraft = reactive({
  moduleCode: "supplier",
  moduleLabel: "供应商",
  pageGoal: props.t("app.demoHub.start.goal.default"),
  frontendTarget: "Vue",
  startMode: "reference" as StartMode,
})

const reviewState = ref<ReviewState>("blocking")
const applyState = ref<ApplyState>("ready")

const reviewFiles = computed<ReviewFileCard[]>(() => {
  if (reviewState.value === "blocking") {
    return [
      {
        name: "supplier.page.vue",
        path: "apps/example-vue/src/modules/supplier/supplier.page.vue",
        action: "block",
        reason: props.t("app.demoHub.review.reason.blocked"),
        diff: props.t("app.demoHub.review.diff.blocked"),
        hasChanges: true,
      },
      {
        name: "supplier.schema.ts",
        path: "packages/schema/src/modules/supplier.schema.ts",
        action: "overwrite",
        reason: props.t("app.demoHub.review.reason.overwrite"),
        diff: props.t("app.demoHub.review.diff.overwrite"),
        hasChanges: true,
      },
      {
        name: "supplier.frontend.generated.ts",
        path: "apps/example-vue/src/app/workspace-registry/generated/supplier.frontend.generated.ts",
        action: "create",
        reason: props.t("app.demoHub.review.reason.create"),
        diff: props.t("app.demoHub.review.diff.create"),
        hasChanges: true,
      },
    ]
  }

  if (reviewState.value === "review-ready") {
    return [
      {
        name: "supplier.frontend.generated.ts",
        path: "apps/example-vue/src/app/workspace-registry/generated/supplier.frontend.generated.ts",
        action: "create",
        reason: props.t("app.demoHub.review.reason.create"),
        diff: props.t("app.demoHub.review.diff.create"),
        hasChanges: true,
      },
      {
        name: "supplier.page.vue",
        path: "apps/example-vue/src/modules/supplier/supplier.page.vue",
        action: "overwrite",
        reason: props.t("app.demoHub.review.reason.overwrite"),
        diff: props.t("app.demoHub.review.diff.overwrite"),
        hasChanges: true,
      },
      {
        name: "supplier.dictionary.ts",
        path: "apps/example-vue/src/i18n/modules/zh-CN.supplier.ts",
        action: "skip",
        reason: props.t("app.demoHub.review.reason.skip"),
        diff: props.t("app.demoHub.review.diff.skip"),
        hasChanges: false,
      },
    ]
  }

  return [
    {
      name: "supplier.schema.ts",
      path: "packages/schema/src/modules/supplier.schema.ts",
      action: "skip",
      reason: props.t("app.demoHub.review.reason.retry"),
      diff: props.t("app.demoHub.review.diff.retry"),
      hasChanges: false,
    },
  ]
})

const selectedReviewFilePath = ref<string | null>(null)

const sortedReviewFiles = computed(() => {
  const actionRank: Record<ReviewFileCard["action"], number> = {
    block: 0,
    overwrite: 1,
    create: 2,
    skip: 3,
  }

  return [...reviewFiles.value].sort(
    (left, right) => actionRank[left.action] - actionRank[right.action],
  )
})

const selectedReviewFile = computed(() => {
  const selectedPath = selectedReviewFilePath.value

  if (selectedPath) {
    const matchedFile = sortedReviewFiles.value.find(
      (file) => file.path === selectedPath,
    )

    if (matchedFile) {
      return matchedFile
    }
  }

  return sortedReviewFiles.value[0] ?? null
})

const reviewSummary = computed(() => {
  if (reviewState.value === "blocking") {
    return {
      title: props.t("app.demoHub.review.summary.blocking.title"),
      description: props.t("app.demoHub.review.summary.blocking.description"),
      next: props.t("app.demoHub.review.summary.blocking.next"),
      primaryAction: props.t("app.demoHub.review.action.inspectBlocked"),
    }
  }

  if (reviewState.value === "review-ready") {
    return {
      title: props.t("app.demoHub.review.summary.ready.title"),
      description: props.t("app.demoHub.review.summary.ready.description"),
      next: props.t("app.demoHub.review.summary.ready.next"),
      primaryAction: props.t("app.demoHub.review.action.enterReview"),
    }
  }

  return {
    title: props.t("app.demoHub.review.summary.failed.title"),
    description: props.t("app.demoHub.review.summary.failed.description"),
    next: props.t("app.demoHub.review.summary.failed.next"),
    primaryAction: props.t("app.demoHub.review.action.retry"),
  }
})

const applySummary = computed(() => {
  if (applyState.value === "ready") {
    return {
      title: props.t("app.demoHub.apply.summary.ready.title"),
      description: props.t("app.demoHub.apply.summary.ready.description"),
      primaryAction: props.t("app.demoHub.apply.action.confirm"),
    }
  }

  if (applyState.value === "missing-checks") {
    return {
      title: props.t("app.demoHub.apply.summary.missing.title"),
      description: props.t("app.demoHub.apply.summary.missing.description"),
      primaryAction: props.t("app.demoHub.apply.action.backToReview"),
    }
  }

  return {
    title: props.t("app.demoHub.apply.summary.stale.title"),
    description: props.t("app.demoHub.apply.summary.stale.description"),
    primaryAction: props.t("app.demoHub.apply.action.regenerate"),
  }
})

const startModeCards = computed(() => [
  {
    value: "reference" as const,
    title: props.t("app.demoHub.formVariant.reference"),
    description: props.t("app.demoHub.start.mode.reference"),
  },
  {
    value: "template" as const,
    title: props.t("app.demoHub.formVariant.template"),
    description: props.t("app.demoHub.start.mode.template"),
  },
  {
    value: "manual" as const,
    title: props.t("app.demoHub.formVariant.manual"),
    description: props.t("app.demoHub.start.mode.manual"),
  },
])

const startHighlights = computed(() => [
  props.t("app.demoHub.start.highlight.first"),
  props.t("app.demoHub.start.highlight.second"),
  props.t("app.demoHub.start.highlight.third"),
])

const reviewChecklist = computed(() => [
  props.t("app.demoHub.review.checklist.first"),
  props.t("app.demoHub.review.checklist.second"),
  props.t("app.demoHub.review.checklist.third"),
])

const applyChecklist = computed(() => [
  {
    label: props.t("app.demoHub.apply.item.files"),
    checked: applyState.value === "ready",
  },
  {
    label: props.t("app.demoHub.apply.item.blocking"),
    checked: applyState.value === "ready",
  },
  {
    label: props.t("app.demoHub.apply.item.staging"),
    checked: true,
  },
  {
    label: props.t("app.demoHub.apply.item.sql"),
    checked: applyState.value !== "stale",
  },
  {
    label: props.t("app.demoHub.apply.item.permission"),
    checked: applyState.value === "ready",
  },
  {
    label: props.t("app.demoHub.apply.item.fresh"),
    checked: applyState.value !== "stale",
  },
])

const coverageItems = computed<CoverageItem[]>(() => [
  {
    id: "start-reference",
    stage: props.t("app.demoHub.coverage.stage.start"),
    state: props.t("app.demoHub.coverage.state.reference"),
    expected: props.t("app.demoHub.coverage.expected.reference"),
    owner: props.t("app.demoHub.coverage.owner.start"),
    status: "covered",
  },
  {
    id: "start-template",
    stage: props.t("app.demoHub.coverage.stage.start"),
    state: props.t("app.demoHub.coverage.state.template"),
    expected: props.t("app.demoHub.coverage.expected.template"),
    owner: props.t("app.demoHub.coverage.owner.start"),
    status: "covered",
  },
  {
    id: "review-blocking",
    stage: props.t("app.demoHub.coverage.stage.review"),
    state: props.t("app.demoHub.coverage.state.blocking"),
    expected: props.t("app.demoHub.coverage.expected.blocking"),
    owner: props.t("app.demoHub.coverage.owner.review"),
    status: "covered",
  },
  {
    id: "review-ready",
    stage: props.t("app.demoHub.coverage.stage.review"),
    state: props.t("app.demoHub.coverage.state.ready"),
    expected: props.t("app.demoHub.coverage.expected.ready"),
    owner: props.t("app.demoHub.coverage.owner.review"),
    status: "covered",
  },
  {
    id: "review-file-detail",
    stage: props.t("app.demoHub.coverage.stage.review"),
    state: props.t("app.demoHub.coverage.state.fileDetail"),
    expected: props.t("app.demoHub.coverage.expected.fileDetail"),
    owner: props.t("app.demoHub.coverage.owner.detail"),
    status: "partial",
  },
  {
    id: "apply-ready",
    stage: props.t("app.demoHub.coverage.stage.apply"),
    state: props.t("app.demoHub.coverage.state.applyReady"),
    expected: props.t("app.demoHub.coverage.expected.applyReady"),
    owner: props.t("app.demoHub.coverage.owner.apply"),
    status: "covered",
  },
  {
    id: "apply-missing",
    stage: props.t("app.demoHub.coverage.stage.apply"),
    state: props.t("app.demoHub.coverage.state.applyMissing"),
    expected: props.t("app.demoHub.coverage.expected.applyMissing"),
    owner: props.t("app.demoHub.coverage.owner.apply"),
    status: "covered",
  },
  {
    id: "runtime-hash-reload",
    stage: props.t("app.demoHub.coverage.stage.shell"),
    state: props.t("app.demoHub.coverage.state.hashReload"),
    expected: props.t("app.demoHub.coverage.expected.hashReload"),
    owner: props.t("app.demoHub.coverage.owner.shell"),
    status: "covered",
  },
])

const currentPrototypeCard = computed(
  () =>
    prototypeCards.value.find(
      (card) => card.key === activePrototypeKey.value,
    ) ?? prototypeCards.value[0],
)

const coverageCounts = computed(() => ({
  covered: coverageItems.value.filter((item) => item.status === "covered")
    .length,
  partial: coverageItems.value.filter((item) => item.status === "partial")
    .length,
  pending: coverageItems.value.filter((item) => item.status === "pending")
    .length,
}))

const coverageStatusLabel = (status: CoverageItem["status"]) =>
  props.t(`app.demoHub.coverage.status.${status}`)

const setReviewState = (nextState: ReviewState) => {
  reviewState.value = nextState
  selectedReviewFilePath.value = null
}
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
        <span class="demo-hub-badge">{{
          t("app.demoHub.badge.prototypeOnly")
        }}</span>
        <span class="demo-hub-badge">{{
          t("app.demoHub.badge.formFirst")
        }}</span>
        <span class="demo-hub-badge">{{ t("app.demoHub.badge.noApi") }}</span>
      </div>
    </header>

    <section class="demo-hub-coverage">
      <div class="demo-hub-coverage-header">
        <div>
          <p class="demo-hub-section-label">
            {{ t("app.demoHub.coverage.label") }}
          </p>
          <h3>{{ t("app.demoHub.coverage.title") }}</h3>
          <p>{{ t("app.demoHub.coverage.description") }}</p>
        </div>
        <div class="demo-hub-coverage-counts">
          <span>
            {{
              t("app.demoHub.coverage.count.covered", {
                count: coverageCounts.covered,
              })
            }}
          </span>
          <span>
            {{
              t("app.demoHub.coverage.count.partial", {
                count: coverageCounts.partial,
              })
            }}
          </span>
          <span>
            {{
              t("app.demoHub.coverage.count.pending", {
                count: coverageCounts.pending,
              })
            }}
          </span>
        </div>
      </div>

      <div class="demo-hub-coverage-grid">
        <article
          v-for="item in coverageItems"
          :key="item.id"
          class="demo-hub-coverage-card"
          :class="`demo-hub-coverage-card-${item.status}`"
        >
          <div class="demo-hub-coverage-card-head">
            <span>{{ item.stage }}</span>
            <strong>{{ coverageStatusLabel(item.status) }}</strong>
          </div>
          <h4>{{ item.state }}</h4>
          <p>{{ item.expected }}</p>
          <small>{{ item.owner }}</small>
        </article>
      </div>
    </section>

    <section class="demo-hub-layout">
      <aside class="demo-hub-prototype-nav">
        <p class="demo-hub-section-label">
          {{ t("app.demoHub.scenarioLabel") }}
        </p>
        <button
          v-for="card in prototypeCards"
          :key="card.key"
          type="button"
          class="demo-hub-prototype-card"
          :class="{
            'demo-hub-prototype-card-active': card.key === activePrototypeKey,
          }"
          @click="activePrototypeKey = card.key"
        >
          <span class="demo-hub-prototype-stage">{{ card.stage }}</span>
          <strong>{{ card.title }}</strong>
          <span>{{ card.summary }}</span>
        </button>
      </aside>

      <div class="demo-hub-stage">
        <section class="demo-hub-surface">
          <div class="demo-hub-surface-header">
            <div>
              <p class="demo-hub-section-label">
                {{ t("app.demoHub.prototypeTitle") }}
              </p>
              <h3>{{ currentPrototypeCard.title }}</h3>
            </div>
            <p class="demo-hub-surface-description">
              {{ currentPrototypeCard.summary }}
            </p>
          </div>

          <article
            v-if="activePrototypeKey === 'generator-start'"
            class="demo-hub-flow"
          >
            <div class="demo-hub-flow-copy">
              <p class="demo-hub-section-label">
                {{ t("app.demoHub.formSectionTitle") }}
              </p>
              <h4>{{ t("app.demoHub.start.headline") }}</h4>
              <p>{{ t("app.demoHub.formSectionDescription") }}</p>
            </div>

            <div class="demo-hub-mode-grid">
              <button
                v-for="mode in startModeCards"
                :key="mode.value"
                type="button"
                class="demo-hub-mode-card"
                :class="{
                  'demo-hub-mode-card-active': startDraft.startMode === mode.value,
                }"
                @click="startDraft.startMode = mode.value"
              >
                <strong>{{ mode.title }}</strong>
                <span>{{ mode.description }}</span>
              </button>
            </div>

            <div class="demo-hub-form-grid">
              <label class="demo-hub-field">
                <span>{{ t("app.demoHub.formModuleCode") }}</span>
                <input v-model="startDraft.moduleCode" type="text" />
              </label>
              <label class="demo-hub-field">
                <span>{{ t("app.demoHub.formModuleLabel") }}</span>
                <input v-model="startDraft.moduleLabel" type="text" />
              </label>
              <label class="demo-hub-field">
                <span>{{ t("app.demoHub.formScenario") }}</span>
                <input v-model="startDraft.pageGoal" type="text" />
              </label>
              <label class="demo-hub-field">
                <span>{{ t("app.demoHub.formFrontendTarget") }}</span>
                <select v-model="startDraft.frontendTarget">
                  <option value="Vue">Vue</option>
                  <option value="React">React</option>
                </select>
              </label>
            </div>

            <div class="demo-hub-next-step">
              <div>
                <strong>{{ t("app.demoHub.formNextAction") }}</strong>
                <p>{{ t("app.demoHub.formNextActionValue") }}</p>
              </div>
              <button type="button" class="enterprise-button">
                {{ t("app.demoHub.start.primaryAction") }}
              </button>
            </div>

            <section class="demo-hub-fact-grid">
              <article class="demo-hub-fact-card">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.prototypeFields") }}
                </p>
                <ul>
                  <li
                    v-for="fact in startHighlights"
                    :key="fact"
                  >
                    {{ fact }}
                  </li>
                </ul>
              </article>
              <article class="demo-hub-fact-card">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.prototypeChecklist") }}
                </p>
                <ul>
                  <li>{{ t("app.demoHub.start.checklist.first") }}</li>
                  <li>{{ t("app.demoHub.start.checklist.second") }}</li>
                  <li>{{ t("app.demoHub.start.checklist.third") }}</li>
                </ul>
              </article>
            </section>
          </article>

          <article
            v-else-if="activePrototypeKey === 'generator-review'"
            class="demo-hub-flow"
          >
            <div class="demo-hub-flow-copy">
              <p class="demo-hub-section-label">
                {{ t("app.demoHub.review.stateLabel") }}
              </p>
              <h4>{{ t("app.demoHub.review.headline") }}</h4>
              <p>{{ t("app.demoHub.review.description") }}</p>
            </div>

            <div class="demo-hub-toggle-row">
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{ 'demo-hub-toggle-active': reviewState === 'blocking' }"
                @click="setReviewState('blocking')"
              >
                {{ t("app.demoHub.review.toggle.blocking") }}
              </button>
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{
                  'demo-hub-toggle-active': reviewState === 'review-ready',
                }"
                @click="setReviewState('review-ready')"
              >
                {{ t("app.demoHub.review.toggle.ready") }}
              </button>
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{ 'demo-hub-toggle-active': reviewState === 'failed' }"
                @click="setReviewState('failed')"
              >
                {{ t("app.demoHub.review.toggle.failed") }}
              </button>
            </div>

            <section class="demo-hub-summary-banner">
              <div>
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.review.summaryLabel") }}
                </p>
                <h4>{{ reviewSummary.title }}</h4>
                <p>{{ reviewSummary.description }}</p>
              </div>
              <div class="demo-hub-summary-actions">
                <strong>{{ reviewSummary.next }}</strong>
                <button type="button" class="enterprise-button">
                  {{ reviewSummary.primaryAction }}
                </button>
              </div>
            </section>

            <div class="demo-hub-review-grid">
              <section class="demo-hub-review-list">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.review.listTitle") }}
                </p>
                <button
                  v-for="file in sortedReviewFiles"
                  :key="file.path"
                  type="button"
                  class="demo-hub-review-item"
                  :class="{
                    'demo-hub-review-item-active':
                      selectedReviewFile?.path === file.path,
                  }"
                  @click="selectedReviewFilePath = file.path"
                >
                  <div class="demo-hub-review-item-header">
                    <strong>{{ file.name }}</strong>
                    <span class="demo-hub-review-chip">{{
                      t(`app.demoHub.review.actionLabel.${file.action}`)
                    }}</span>
                  </div>
                  <span>{{ file.path }}</span>
                </button>
              </section>

              <section class="demo-hub-review-detail">
                <template v-if="selectedReviewFile">
                  <p class="demo-hub-section-label">
                    {{ t("app.demoHub.review.detailTitle") }}
                  </p>
                  <h4>{{ selectedReviewFile.name }}</h4>
                  <p>{{ selectedReviewFile.reason }}</p>
                  <div class="demo-hub-detail-meta">
                    <span>{{ selectedReviewFile.path }}</span>
                    <span>{{
                      selectedReviewFile.hasChanges
                        ? t("app.demoHub.review.hasChanges")
                        : t("app.demoHub.review.noChanges")
                    }}</span>
                  </div>
                  <div class="demo-hub-code-card">
                    <strong>{{ t("app.demoHub.review.diffTitle") }}</strong>
                    <pre>{{ selectedReviewFile.diff }}</pre>
                  </div>
                </template>
              </section>
            </div>

            <section class="demo-hub-fact-grid">
              <article class="demo-hub-fact-card">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.prototypeChecklist") }}
                </p>
                <ul>
                  <li
                    v-for="item in reviewChecklist"
                    :key="item"
                  >
                    {{ item }}
                  </li>
                </ul>
              </article>
            </section>
          </article>

          <article v-else class="demo-hub-flow">
            <div class="demo-hub-flow-copy">
              <p class="demo-hub-section-label">
                {{ t("app.demoHub.apply.stateLabel") }}
              </p>
              <h4>{{ t("app.demoHub.apply.headline") }}</h4>
              <p>{{ t("app.demoHub.apply.description") }}</p>
            </div>

            <div class="demo-hub-toggle-row">
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{ 'demo-hub-toggle-active': applyState === 'ready' }"
                @click="applyState = 'ready'"
              >
                {{ t("app.demoHub.apply.toggle.ready") }}
              </button>
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{
                  'demo-hub-toggle-active': applyState === 'missing-checks',
                }"
                @click="applyState = 'missing-checks'"
              >
                {{ t("app.demoHub.apply.toggle.missing") }}
              </button>
              <button
                type="button"
                class="demo-hub-toggle"
                :class="{ 'demo-hub-toggle-active': applyState === 'stale' }"
                @click="applyState = 'stale'"
              >
                {{ t("app.demoHub.apply.toggle.stale") }}
              </button>
            </div>

            <section class="demo-hub-summary-banner">
              <div>
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.apply.summaryLabel") }}
                </p>
                <h4>{{ applySummary.title }}</h4>
                <p>{{ applySummary.description }}</p>
              </div>
              <div class="demo-hub-summary-actions">
                <strong>{{ t("app.demoHub.apply.summaryHint") }}</strong>
                <button type="button" class="enterprise-button">
                  {{ applySummary.primaryAction }}
                </button>
              </div>
            </section>

            <div class="demo-hub-apply-grid">
              <section class="demo-hub-fact-card">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.apply.checklistTitle") }}
                </p>
                <ul class="demo-hub-check-list">
                  <li
                    v-for="item in applyChecklist"
                    :key="item.label"
                    :class="{
                      'demo-hub-check-list-item-checked': item.checked,
                      'demo-hub-check-list-item-missing': !item.checked,
                    }"
                  >
                    <span class="demo-hub-check-icon">
                      {{ item.checked ? "✓" : "!" }}
                    </span>
                    <span>{{ item.label }}</span>
                  </li>
                </ul>
              </section>

              <section class="demo-hub-fact-card">
                <p class="demo-hub-section-label">
                  {{ t("app.demoHub.apply.riskTitle") }}
                </p>
                <ul>
                  <li>{{ t("app.demoHub.apply.risk.first") }}</li>
                  <li>{{ t("app.demoHub.apply.risk.second") }}</li>
                  <li>{{ t("app.demoHub.apply.risk.third") }}</li>
                </ul>
              </section>
            </div>
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
.demo-hub-prototype-card span,
.demo-hub-mode-card span,
.demo-hub-flow-copy p,
.demo-hub-review-item span {
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

.demo-hub-coverage {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #fff;
}

.demo-hub-coverage-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.85rem 1rem;
}

.demo-hub-coverage-header h3 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 1.12rem;
}

.demo-hub-coverage-header p {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.6;
}

.demo-hub-coverage-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-content: flex-start;
}

.demo-hub-coverage-counts span {
  padding: 0.35rem 0.55rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  color: #334155;
  background: #f8fafc;
  font-size: 0.78rem;
  font-weight: 700;
}

.demo-hub-coverage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.5rem, 1fr));
  gap: 0.7rem;
}

.demo-hub-coverage-card {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}

.demo-hub-coverage-card-covered {
  border-color: #99f6e4;
  background: #f0fdfa;
}

.demo-hub-coverage-card-partial {
  border-color: #fde68a;
  background: #fffbeb;
}

.demo-hub-coverage-card-pending {
  border-color: #fecaca;
  background: #fef2f2;
}

.demo-hub-coverage-card-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.demo-hub-coverage-card h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.88rem;
}

.demo-hub-coverage-card p {
  margin: 0;
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.5;
}

.demo-hub-coverage-card small {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.45;
}

.demo-hub-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
}

.demo-hub-stage,
.demo-hub-prototype-nav,
.demo-hub-flow {
  display: grid;
  gap: 1rem;
}

.demo-hub-prototype-card,
.demo-hub-surface,
.demo-hub-mode-card,
.demo-hub-fact-card,
.demo-hub-review-list,
.demo-hub-review-detail {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #fff;
}

.demo-hub-prototype-card,
.demo-hub-mode-card,
.demo-hub-review-item,
.demo-hub-toggle {
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.demo-hub-prototype-card {
  display: grid;
  gap: 0.35rem;
}

.demo-hub-prototype-card:hover,
.demo-hub-prototype-card-active,
.demo-hub-mode-card:hover,
.demo-hub-mode-card-active,
.demo-hub-review-item:hover,
.demo-hub-review-item-active,
.demo-hub-toggle:hover,
.demo-hub-toggle-active {
  border-color: #93c5fd;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.demo-hub-prototype-stage {
  color: #64748b;
  font-size: 0.78rem;
}

.demo-hub-surface {
  display: grid;
  gap: 1rem;
}

.demo-hub-surface-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem;
}

.demo-hub-surface-header h3,
.demo-hub-flow-copy h4,
.demo-hub-summary-banner h4,
.demo-hub-review-detail h4 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 1.2rem;
}

.demo-hub-mode-grid,
.demo-hub-form-grid,
.demo-hub-fact-grid,
.demo-hub-apply-grid,
.demo-hub-review-grid,
.demo-hub-summary-actions {
  display: grid;
  gap: 0.9rem;
}

.demo-hub-mode-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.demo-hub-mode-card {
  display: grid;
  gap: 0.35rem;
}

.demo-hub-form-grid,
.demo-hub-fact-grid,
.demo-hub-apply-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.demo-hub-field {
  display: grid;
  gap: 0.45rem;
}

.demo-hub-field span,
.demo-hub-summary-actions strong,
.demo-hub-review-detail p,
.demo-hub-detail-meta span {
  color: #64748b;
  font-size: 0.85rem;
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

.demo-hub-next-step,
.demo-hub-summary-banner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.85rem 1rem;
  padding: 1rem 1.05rem;
  border: 1px dashed #93c5fd;
  border-radius: 0.95rem;
  background: #f8fbff;
}

.demo-hub-next-step p,
.demo-hub-summary-banner p {
  margin: 0.3rem 0 0;
  color: #0f172a;
}

.demo-hub-toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.demo-hub-toggle {
  padding: 0.7rem 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  color: #1e293b;
  background: #fff;
  font-weight: 600;
}

.demo-hub-review-grid {
  grid-template-columns: minmax(16rem, 20rem) minmax(0, 1fr);
}

.demo-hub-review-list,
.demo-hub-review-detail {
  display: grid;
  gap: 0.8rem;
}

.demo-hub-review-item {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  background: #fff;
}

.demo-hub-review-item-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
}

.demo-hub-review-chip {
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.74rem;
  font-weight: 700;
}

.demo-hub-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
}

.demo-hub-code-card {
  display: grid;
  gap: 0.5rem;
  padding: 0.9rem;
  border-radius: 0.85rem;
  background: #eff6ff;
}

.demo-hub-code-card strong {
  color: #1e3a8a;
}

.demo-hub-code-card pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #0f172a;
  font-family: Consolas, "Liberation Mono", monospace;
  font-size: 0.83rem;
  line-height: 1.6;
}

.demo-hub-fact-card ul,
.demo-hub-check-list {
  margin: 0.65rem 0 0;
  padding-left: 1rem;
  color: #0f172a;
  line-height: 1.7;
}

.demo-hub-check-list {
  list-style: none;
  padding-left: 0;
}

.demo-hub-check-list li {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.55rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.demo-hub-check-list li:last-child {
  border-bottom: none;
}

.demo-hub-check-list-item-checked {
  color: #0f766e;
}

.demo-hub-check-list-item-missing {
  color: #b45309;
}

.demo-hub-check-icon {
  min-width: 1.2rem;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .demo-hub-layout,
  .demo-hub-review-grid,
  .demo-hub-mode-grid,
  .demo-hub-form-grid,
  .demo-hub-fact-grid,
  .demo-hub-apply-grid {
    grid-template-columns: 1fr;
  }
}
</style>
