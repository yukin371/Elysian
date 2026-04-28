<script setup lang="ts">
import { computed } from "vue"

import {
  type ShellWorkspaceMainSwitchEmitFn,
  type ShellWorkspaceMainSwitchProps,
  resolveShellWorkspaceMainDescriptor,
} from "./shell-workspace-main-descriptor"

const props = defineProps<ShellWorkspaceMainSwitchProps>()
const emit = defineEmits<ShellWorkspaceMainSwitchEmitFn>()

const activeWorkspace = computed(() =>
  resolveShellWorkspaceMainDescriptor(props, emit),
)
</script>

<template>
  <component
    :is="activeWorkspace.component"
    v-bind="activeWorkspace.props"
    v-on="activeWorkspace.listeners"
  />
</template>
