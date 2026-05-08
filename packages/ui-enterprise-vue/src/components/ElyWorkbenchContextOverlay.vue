<script setup lang="ts">
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<(e: "close") => void>()
</script>

<template>
  <Teleport to="body">
    <Transition name="ely-workbench-overlay">
      <div
        v-if="props.visible"
        class="ely-workbench-overlay"
        @click.self="emit('close')"
      >
        <div class="ely-workbench-overlay__frame" @click.self="emit('close')">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ely-workbench-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(10px);
}

.ely-workbench-overlay__frame {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

.ely-workbench-overlay-enter-active,
.ely-workbench-overlay-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.ely-workbench-overlay-enter-from,
.ely-workbench-overlay-leave-to {
  opacity: 0;
}

.ely-workbench-overlay-enter-from .ely-workbench-overlay__frame,
.ely-workbench-overlay-leave-to .ely-workbench-overlay__frame {
  transform: translateY(8px) scale(0.985);
}

@media (max-width: 860px) {
  .ely-workbench-overlay {
    padding: 0.75rem;
  }
}
</style>
