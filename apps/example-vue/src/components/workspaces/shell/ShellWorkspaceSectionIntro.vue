<script setup lang="ts">
import type { AppTranslate } from "../../../app/app-shell-helpers"

defineProps<{
  t: AppTranslate
  title: string
  copy: string
}>()
</script>

<template>
  <div class="px-3 py-4 lg:px-4">
    <p class="eyebrow text-amber-300">{{ t("app.section.workspace") }}</p>
    <div class="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-3xl text-white">{{ title }}</h2>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
          {{ copy }}
        </p>
      </div>
      <div
        class="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300"
      >
        {{ t("app.shell.presetLabel") }}
      </div>
    </div>
  </div>
</template>
