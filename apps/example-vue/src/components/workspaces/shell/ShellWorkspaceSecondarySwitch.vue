<script setup lang="ts">
import { computed } from "vue"

import ShellWorkspaceSessionCard from "./ShellWorkspaceSessionCard.vue"
import {
  type ShellWorkspaceSecondarySwitchEmitFn,
  type ShellWorkspaceSecondarySwitchProps,
  resolveShellWorkspaceSecondaryDescriptor,
} from "./shell-workspace-secondary-descriptor"

const props = defineProps<ShellWorkspaceSecondarySwitchProps>()
const emit = defineEmits<ShellWorkspaceSecondarySwitchEmitFn>()

const activeWorkspace = computed(() =>
  resolveShellWorkspaceSecondaryDescriptor(props, emit),
)
</script>

<template>
  <component
    :is="activeWorkspace.component"
    v-bind="activeWorkspace.props"
    v-on="activeWorkspace.listeners"
  />

  <ShellWorkspaceSessionCard
    :t="t"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :platform-display-name="platformDisplayName"
    :platform-version="platformVersion"
    :platform-status-label="platformStatusLabel"
    :auth-display-name="authDisplayName"
    :auth-username="authUsername"
    :auth-roles-label="authRolesLabel"
    :env-name="envName"
    :permission-count="permissionCount"
    :auth-loading="authLoading"
    :login-username="loginUsername"
    v-bind="{ loginPassword }"
    :auth-error-message="authErrorMessage"
    @submit-logout="$emit('submit-logout')"
    @update:login-username="$emit('update:login-username', $event)"
    @update:login-password="$emit('update:login-password', $event)"
    @submit-login="$emit('submit-login')"
  />
</template>
