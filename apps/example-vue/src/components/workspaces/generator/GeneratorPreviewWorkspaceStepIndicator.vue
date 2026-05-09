<script setup lang="ts">
import { computed } from "vue"

import type { GeneratorPreviewStep, GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceStepIndicatorProps {
  currentStep: GeneratorPreviewStep
  t: GeneratorPreviewTranslation
}

const props = defineProps<GeneratorPreviewWorkspaceStepIndicatorProps>()

const steps = [
  { key: "configure", labelKey: "app.generatorPreview.flow.configure" },
  { key: "review", labelKey: "app.generatorPreview.flow.review" },
  { key: "confirm", labelKey: "app.generatorPreview.flow.confirm" },
  { key: "apply", labelKey: "app.generatorPreview.flow.apply" },
  { key: "done", labelKey: "app.generatorPreview.flow.done" },
] as const satisfies ReadonlyArray<{
  key: GeneratorPreviewStep
  labelKey: string
}>

const stepOrder: Record<GeneratorPreviewStep, number> = {
  configure: 0,
  review: 1,
  confirm: 2,
  apply: 3,
  done: 4,
}

const currentStepIndex = computed(() => stepOrder[props.currentStep])

const isStepActive = (step: GeneratorPreviewStep) => step === props.currentStep

const isStepCompleted = (step: GeneratorPreviewStep) =>
  stepOrder[step] < currentStepIndex.value
</script>

<template>
  <nav class="generator-step-indicator" aria-label="Generator flow steps">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="generator-step"
      :class="{
        'generator-step-active': isStepActive(step.key),
        'generator-step-completed': isStepCompleted(step.key),
      }"
    >
      <span class="generator-step-index">{{ index + 1 }}</span>
      <span class="generator-step-label">{{ t(step.labelKey) }}</span>
      <span
        v-if="index < steps.length - 1"
        class="generator-step-connector"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>

<style scoped>
.generator-step-indicator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 0;
  padding: 0.2rem 0 0.95rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-step {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.generator-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.55rem;
  height: 1.55rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.92);
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  flex-shrink: 0;
}

.generator-step-label {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.generator-step-connector {
  width: 1.4rem;
  height: 1px;
  margin: 0 0.35rem;
  background: rgba(15, 23, 42, 0.1);
}

.generator-step-active .generator-step-index {
  border-color: #2457d6;
  background: #2457d6;
  color: #ffffff;
}

.generator-step-active .generator-step-label {
  color: #173ea6;
}

.generator-step-completed .generator-step-index {
  border-color: #0f8a5f;
  background: #0f8a5f;
  color: #ffffff;
}

.generator-step-completed .generator-step-label {
  color: #0f766e;
}

.generator-step-completed .generator-step-connector {
  background: rgba(15, 138, 95, 0.28);
}

@media (max-width: 640px) {
  .generator-step-indicator {
    gap: 0.7rem;
  }

  .generator-step {
    flex-wrap: wrap;
  }

  .generator-step-connector {
    display: none;
  }
}
</style>
