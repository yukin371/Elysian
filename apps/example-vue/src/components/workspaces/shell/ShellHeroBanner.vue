<script setup lang="ts">
import type { AppTranslate } from "../../../app/app-shell-helpers"

interface LocaleOption {
  key: string
  labelKey: string
}

defineProps<{
  t: AppTranslate
  locale: string
  localeOptions: ReadonlyArray<LocaleOption>
  runtimeLabel: string
  enterpriseStatusLabel: string
  authStatusLabel: string
  authStatusTone: string
  workspaceItemCount: string
}>()

defineEmits<{
  (event: "select-locale", localeKey: string): void
}>()
</script>

<template>
  <section class="hero-panel overflow-hidden px-6 py-8 lg:px-10">
    <div class="hero-grid grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="eyebrow text-cyan-300">{{ t("app.hero.eyebrow") }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-[0.24em] text-stone-400">
              {{ t("app.locale.label") }}
            </span>
            <button
              v-for="option in localeOptions"
              :key="option.key"
              type="button"
              class="token-pill cursor-pointer appearance-none"
              :class="locale === option.key ? 'token-pill-active' : ''"
              @click="$emit('select-locale', option.key)"
            >
              {{ t(option.labelKey) }}
            </button>
          </div>
        </div>
        <h1 class="hero-title mt-4 max-w-3xl text-4xl leading-tight lg:text-6xl">
          {{ t("app.hero.title") }}
        </h1>
        <p class="hero-copy mt-5 max-w-2xl text-base leading-8 text-stone-300">
          {{ t("app.hero.copy") }}
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <span class="token-pill">{{ t("app.badge.custom") }}</span>
          <span class="token-pill token-pill-active">
            {{ t("app.badge.enterprise") }}
          </span>
          <span class="token-pill">{{ t("app.shell.presetLabel") }}</span>
        </div>
      </div>

      <div class="hero-stats grid gap-4 sm:grid-cols-2">
        <article class="stat-card p-5">
          <p class="stat-label">{{ t("app.badge.runtime") }}</p>
          <p class="stat-value">{{ runtimeLabel }}</p>
        </article>
        <article class="stat-card p-5">
          <p class="stat-label">{{ t("app.badge.enterprise") }}</p>
          <p class="stat-value">{{ enterpriseStatusLabel }}</p>
        </article>
        <article class="stat-card p-5">
          <p class="stat-label">{{ t("app.badge.auth") }}</p>
          <p class="stat-value" :class="authStatusTone">
            {{ authStatusLabel }}
          </p>
        </article>
        <article class="stat-card p-5">
          <p class="stat-label">{{ t("app.badge.rows") }}</p>
          <p class="stat-value">{{ workspaceItemCount }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
