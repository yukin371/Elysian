<script setup lang="ts">
import type { UiNavigationNode } from "@elysian/ui-core"
import {
  MenuItem as TMenuItem,
  Submenu as TSubmenu,
} from "tdesign-vue-next/es/menu"
import { computed } from "vue"

defineOptions({
  name: "ElyNavNodes",
})

const emit = defineEmits<{
  "directory-toggle": [menuKey: string]
}>()

const props = defineProps<{
  items: UiNavigationNode[]
  expandedValues?: string[]
}>()

const visibleItems = computed(() =>
  props.items.filter((item) => item.type !== "button"),
)

const expandedValueSet = computed(() => new Set(props.expandedValues ?? []))

const isExpanded = (menuKey: string) => expandedValueSet.value.has(menuKey)
</script>

<template>
  <template v-for="item in visibleItems" :key="item.id">
    <TSubmenu
      v-if="item.children.length > 0 || item.type === 'directory'"
      :value="item.id"
    >
      <template #title>
        <div
          class="ely-nav-title ely-nav-title--directory"
          :class="{ 'ely-nav-title--expanded': isExpanded(item.id) }"
          @click.stop="emit('directory-toggle', item.id)"
        >
          <span class="ely-nav-title__label">{{ item.name }}</span>
          <span
            class="ely-nav-title__chevron"
            :class="{ 'ely-nav-title__chevron--expanded': isExpanded(item.id) }"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              class="ely-nav-title__chevron-icon"
            >
              <path
                d="M6 4 10 8 6 12"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
          </span>
        </div>
      </template>
      <ElyNavNodes
        :items="item.children"
        :expanded-values="expandedValues"
        @directory-toggle="emit('directory-toggle', $event)"
      />
    </TSubmenu>

    <TMenuItem v-else :value="item.id">
      <div class="ely-nav-title">
        <span class="ely-nav-title__label">{{ item.name }}</span>
      </div>
    </TMenuItem>
  </template>
</template>

<style scoped>
.ely-nav-title {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  line-height: 1.35;
}

.ely-nav-title__label {
  flex: 1;
  min-width: 0;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.35;
  color: #132238;
  overflow-wrap: anywhere;
}

.ely-nav-title--directory {
  position: relative;
  padding-right: 2.35rem;
}

.ely-nav-title__chevron {
  position: absolute;
  top: 50%;
  right: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: #334155;
  transform: translateY(-50%);
  transition: color 0.18s ease;
}

.ely-nav-title__chevron-icon {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.18s ease;
}

.ely-nav-title__chevron--expanded .ely-nav-title__chevron-icon {
  transform: rotate(90deg);
}

:deep(.t-submenu:hover) .ely-nav-title__chevron,
.ely-nav-title--expanded .ely-nav-title__chevron {
  color: #2457d6;
}

</style>
