<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    alt?: string
    aspect?: "landscape" | "portrait" | "square" | "wide"
    fit?: "contain" | "cover"
    showSkeleton?: boolean
    shape?: "soft" | "square"
    src?: string
  }>(),
  {
    alt: "",
    aspect: "landscape",
    fit: "cover",
    showSkeleton: true,
    shape: "soft",
  },
)

const imageLoaded = ref(false)
const imageFailed = ref(false)

watch(
  () => props.src,
  () => {
    imageLoaded.value = false
    imageFailed.value = false
  },
)

const fallbackLabel = computed(() => props.alt || "Image unavailable")
const showSkeletonState = computed(
  () =>
    Boolean(props.src) &&
    props.showSkeleton &&
    !imageLoaded.value &&
    !imageFailed.value,
)
</script>

<template>
  <figure
    class="ely-public-image"
    :data-aspect="aspect"
    :data-fit="fit"
    :data-shape="shape"
    :data-status="imageFailed ? 'error' : imageLoaded ? 'loaded' : 'loading'"
  >
    <img
      v-if="src && !imageFailed"
      class="ely-public-image__media"
      :alt="alt"
      :src="src"
      :data-loaded="imageLoaded ? 'true' : 'false'"
      @error="imageFailed = true"
      @load="imageLoaded = true"
    />

    <div
      v-if="showSkeletonState"
      class="ely-public-image__skeleton"
      aria-hidden="true"
    />

    <div
      v-if="!src || imageFailed"
      class="ely-public-image__fallback"
      role="img"
      :aria-label="fallbackLabel"
    >
      <span class="ely-public-image__fallback-mark">E</span>
      <span class="ely-public-image__fallback-copy">
        {{ imageFailed ? "Preview unavailable" : "Awaiting image" }}
      </span>
    </div>
  </figure>
</template>
