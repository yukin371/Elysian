<script setup lang="ts">
import { computed, useId } from "vue"
import type { ElyPublicAccordionItem } from "./contracts"

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    idBase?: string
    items: ElyPublicAccordionItem[]
    modelValue?: string[]
    multiple?: boolean
  }>(),
  {
    ariaLabel: "Disclosure sections",
    idBase: undefined,
    modelValue: () => [],
    multiple: false,
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string[]]
}>()

const componentId = useId()
const resolvedIdBase = computed(
  () => props.idBase ?? `ely-public-accordion-${componentId}`,
)

const isOpen = (key: string) => props.modelValue.includes(key)

const getTriggerId = (key: string) => `${resolvedIdBase.value}-trigger-${key}`
const getPanelId = (key: string) => `${resolvedIdBase.value}-panel-${key}`

const toggleItem = (key: string) => {
  if (isOpen(key)) {
    emit(
      "update:modelValue",
      props.modelValue.filter((openKey) => openKey !== key),
    )
    return
  }

  emit("update:modelValue", props.multiple ? [...props.modelValue, key] : [key])
}
</script>

<template>
  <div class="ely-public-accordion" :aria-label="ariaLabel">
    <section
      v-for="item in items"
      :key="item.key"
      class="ely-public-accordion__item"
      :data-open="isOpen(item.key) ? 'true' : 'false'"
    >
      <h3 class="ely-public-accordion__heading">
        <button
          :id="getTriggerId(item.key)"
          :aria-controls="getPanelId(item.key)"
          :aria-expanded="isOpen(item.key)"
          class="ely-public-accordion__trigger"
          type="button"
          @click="toggleItem(item.key)"
        >
          <span class="ely-public-accordion__copy">
            <span v-if="item.eyebrow" class="ely-public-accordion__eyebrow">
              {{ item.eyebrow }}
            </span>
            <span class="ely-public-accordion__title">{{ item.title }}</span>
          </span>
          <span class="ely-public-accordion__mark" aria-hidden="true">+</span>
        </button>
      </h3>

      <div
        v-show="isOpen(item.key)"
        :id="getPanelId(item.key)"
        :aria-labelledby="getTriggerId(item.key)"
        class="ely-public-accordion__panel"
        role="region"
      >
        {{ item.content }}
      </div>
    </section>
  </div>
</template>
