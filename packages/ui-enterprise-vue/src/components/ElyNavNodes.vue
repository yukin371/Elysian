<script setup lang="ts">
import {
  MenuItem as AMenuItem,
  SubMenu as ASubMenu,
} from "@arco-design/web-vue"
import type { UiNavigationNode } from "@elysian/ui-core"
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
    <a-sub-menu
      v-if="item.children.length > 0 || item.type === 'directory'"
      :key="item.id"
    >
      <template #title>
        <div class="ely-nav-title">
          <span>{{ item.name }}</span>
          <small>{{ item.code }}</small>
        </div>
      </template>
      <ElyNavNodes :items="item.children" />
    </a-sub-menu>

    <a-menu-item v-else :key="item.id">
      <div class="ely-nav-title">
        <span>{{ item.name }}</span>
        <small>{{ item.path ?? item.code }}</small>
      </div>
    </a-menu-item>
  </template>
</template>

<style scoped>
.ely-nav-title {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.ely-nav-title span {
  font-size: 0.92rem;
  font-weight: 600;
  color: #132238;
}

.ely-nav-title small {
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}
</style>
