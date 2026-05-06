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
        <div
          class="ely-nav-title"
          @click.stop="emit('directory-toggle', item.id)"
        >
          <span>{{ item.name }}</span>
        </div>
      </template>
      <ElyNavNodes
        :items="item.children"
        @directory-toggle="emit('directory-toggle', $event)"
      />
    </TSubmenu>

    <TMenuItem v-else :value="item.id">
      <div class="ely-nav-title">
        <span>{{ item.name }}</span>
      </div>
    </TMenuItem>
  </template>
</template>

<style scoped>
.ely-nav-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  line-height: 1.35;
}

.ely-nav-title span {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.35;
  color: #132238;
  overflow-wrap: anywhere;
}
</style>
