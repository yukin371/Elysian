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

const props = defineProps<{
  items: UiNavigationNode[]
}>()

const visibleItems = computed(() =>
  props.items.filter((item) => item.type !== "button"),
)
</script>

<template>
  <template v-for="item in visibleItems" :key="item.id">
    <TSubmenu
      v-if="item.children.length > 0 || item.type === 'directory'"
      :value="item.id"
    >
      <template #title>
        <div class="ely-nav-title">
          <span>{{ item.name }}</span>
          <small>{{ item.code }}</small>
        </div>
      </template>
      <ElyNavNodes :items="item.children" />
    </TSubmenu>

    <TMenuItem v-else :value="item.id">
      <div class="ely-nav-title">
        <span>{{ item.name }}</span>
        <small>{{ item.path ?? item.code }}</small>
      </div>
    </TMenuItem>
  </template>
</template>

<style scoped>
.ely-nav-title {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  line-height: 1.25;
}

.ely-nav-title span {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.3;
  color: #132238;
}

.ely-nav-title small {
  font-size: 0.66rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}
</style>
