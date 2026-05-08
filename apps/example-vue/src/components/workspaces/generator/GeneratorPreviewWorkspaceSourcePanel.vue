<script setup lang="ts">
import { computed, ref, watch } from "vue"

import type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewFileCard,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewTranslation,
} from "./types"

type SourceViewKey = "diff" | "generated" | "current" | "sql"
type SourcePanelPresentation = "panel" | "overlay"

interface GeneratorPreviewWorkspaceSourcePanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard
  sqlPreview: GeneratorPreviewSqlPreview | null
  generatedSourceCopyLabel: string
  currentSourceCopyLabel: string
  sqlPreviewCopyLabel: string
  presentation?: SourcePanelPresentation
}

const props = defineProps<GeneratorPreviewWorkspaceSourcePanelProps>()

const emit = defineEmits<{
  (event: "copy-generated-source"): void
  (event: "copy-current-source"): void
  (event: "copy-sql-preview"): void
}>()

const activeView = ref<SourceViewKey>("diff")
const isOverlayPresentation = computed(() => props.presentation === "overlay")

const availableViews = computed(() => {
  const views: Array<{
    key: SourceViewKey
    copyLabel: string | null
    label: string
  }> = [
    {
      key: "diff",
      label: props.t("app.generatorPreview.lineDiffTitle"),
      copyLabel: null,
    },
    {
      key: "generated",
      label: props.t("app.generatorPreview.sourceTitle"),
      copyLabel: props.generatedSourceCopyLabel,
    },
  ]

  if (props.selectedFile.currentContents !== null) {
    views.push({
      key: "current",
      label: props.t("app.generatorPreview.currentSourceTitle"),
      copyLabel: props.currentSourceCopyLabel,
    })
  }

  if ((props.sqlPreview?.contents ?? "").trim().length > 0) {
    views.push({
      key: "sql",
      label: props.t("app.generatorPreview.sqlTitle"),
      copyLabel: props.sqlPreviewCopyLabel,
    })
  }

  return views
})

const currentView = computed(
  () =>
    availableViews.value.find((view) => view.key === activeView.value) ??
    availableViews.value[0],
)

watch(
  () => [
    props.selectedFile.path,
    props.selectedFile.currentContents,
    props.sqlPreview?.contents ?? "",
  ],
  () => {
    if (availableViews.value.some((view) => view.key === activeView.value)) {
      return
    }

    activeView.value = availableViews.value[0]?.key ?? "diff"
  },
  { immediate: true },
)

const handleCopy = () => {
  if (activeView.value === "generated") {
    emit("copy-generated-source")
    return
  }

  if (activeView.value === "current") {
    emit("copy-current-source")
    return
  }

  if (activeView.value === "sql") {
    emit("copy-sql-preview")
  }
}

const resolveDiffLineClass = (line: GeneratorPreviewDiffLine) =>
  `generator-diff-line generator-diff-line-${line.kind} ${
    line.kind === "unchanged"
      ? "generator-diff-line-two-sided"
      : "generator-diff-line-single-sided"
  }`

const resolveDiffLinePrefix = (line: GeneratorPreviewDiffLine) => {
  if (line.kind === "added") {
    return "+"
  }

  if (line.kind === "removed") {
    return "-"
  }

  return " "
}

const resolveDiffLineNumber = (line: GeneratorPreviewDiffLine) =>
  line.kind === "added"
    ? line.newLineNumber
    : line.kind === "removed"
      ? line.oldLineNumber
      : null
</script>

<template>
  <section
    class="panel-section"
    :class="{
      'panel-section-overlay': isOverlayPresentation,
    }"
  >
    <div class="generator-source-toolbar">
      <div class="generator-source-switches">
        <button
          v-for="view in availableViews"
          :key="view.key"
          type="button"
          class="generator-source-switch"
          :class="
            currentView?.key === view.key
              ? 'generator-source-switch-active'
              : ''
          "
          @click="activeView = view.key"
        >
          {{ view.label }}
        </button>
      </div>

      <button
        v-if="currentView?.copyLabel"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="handleCopy"
      >
        {{ currentView.copyLabel }}
      </button>
    </div>

    <div
      v-if="currentView?.key === 'diff'"
      class="generator-diff-block"
    >
      <div
        v-for="(line, index) in selectedFile.diffLines"
        :key="`${selectedFile.path}:${index}:${line.kind}`"
        :class="resolveDiffLineClass(line)"
      >
        <template v-if="line.kind === 'unchanged'">
          <span class="generator-diff-line-number">
            {{ line.oldLineNumber ?? "" }}
          </span>
          <span class="generator-diff-line-number">
            {{ line.newLineNumber ?? "" }}
          </span>
        </template>
        <span
          v-else
          class="generator-diff-line-change-number"
        >
          {{ resolveDiffLineNumber(line) ?? "" }}
        </span>
        <span class="generator-diff-line-prefix">
          {{ resolveDiffLinePrefix(line) }}
        </span>
        <code class="generator-diff-line-value">{{ line.value }}</code>
      </div>
    </div>

    <pre
      v-else-if="currentView?.key === 'generated'"
      class="generator-code-block"
    ><code>{{ selectedFile.contents }}</code></pre>

    <pre
      v-else-if="currentView?.key === 'current'"
      class="generator-code-block"
    ><code>{{ selectedFile.currentContents ?? "" }}</code></pre>

    <pre
      v-else
      class="generator-code-block"
    ><code>{{ sqlPreview?.contents ?? "" }}</code></pre>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.panel-section-overlay {
  gap: 1rem;
  padding-top: 0;
  border-top: 0;
}

.generator-source-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.panel-section-overlay .generator-source-toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.25rem 0 0.4rem;
  background: rgba(241, 245, 249, 0.96);
  backdrop-filter: blur(12px);
}

.generator-source-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generator-source-switch {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.85);
  color: #334155;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.generator-source-switch-active {
  border-color: rgba(36, 87, 214, 0.36);
  background: rgba(36, 87, 214, 0.08);
  color: #173ea6;
}

.generator-diff-block {
  overflow: auto;
  max-height: 28rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0f172a;
}

.panel-section-overlay .generator-diff-block {
  min-height: 60vh;
  max-height: 72vh;
}

.generator-diff-line {
  display: grid;
  grid-template-columns: 56px 56px 20px minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-left: 3px solid transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.78rem;
  line-height: 1.7;
}

.panel-section-overlay .generator-diff-line {
  grid-template-columns: 72px 72px 28px max-content;
  min-width: max-content;
}

.generator-diff-line-single-sided {
  grid-template-columns: 112px 20px minmax(0, 1fr);
}

.panel-section-overlay .generator-diff-line-single-sided {
  grid-template-columns: 144px 28px max-content;
}

.generator-diff-line-added {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.16);
}

.generator-diff-line-removed {
  border-left-color: #f87171;
  background: rgba(248, 113, 113, 0.14);
}

.generator-diff-line-unchanged {
  color: rgba(226, 232, 240, 0.72);
}

.generator-diff-line-number,
.generator-diff-line-change-number,
.generator-diff-line-prefix {
  color: rgba(148, 163, 184, 0.9);
  font-variant-numeric: tabular-nums;
}

.generator-diff-line-change-number {
  display: inline-flex;
  align-items: center;
  grid-column: 1 / 2;
}

.generator-diff-line-added .generator-diff-line-change-number,
.generator-diff-line-added .generator-diff-line-prefix {
  color: #86efac;
}

.generator-diff-line-removed .generator-diff-line-change-number,
.generator-diff-line-removed .generator-diff-line-prefix {
  color: #fca5a5;
}

.generator-diff-line-value {
  color: #dbeafe;
  white-space: pre-wrap;
  word-break: break-word;
}

.generator-diff-line-added .generator-diff-line-value {
  color: #dcfce7;
}

.generator-diff-line-removed .generator-diff-line-value {
  color: #fee2e2;
}

.panel-section-overlay .generator-diff-line-value {
  white-space: pre;
  word-break: normal;
}

.generator-code-block {
  overflow: auto;
  max-height: 28rem;
  margin: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0f172a;
  padding: 1rem;
  color: #dbeafe;
  font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  white-space: pre;
}

.panel-section-overlay .generator-code-block {
  min-height: 60vh;
  max-height: 72vh;
}
</style>
