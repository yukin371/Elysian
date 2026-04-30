<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
</script>

<template>
  <TButton size="small" v-bind="$attrs">
    <slot />
  </TButton>
</template>
