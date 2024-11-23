<template>
  <div
      ref="viewableTarget"
      class="w-full"
      :class="[
      'transition-opacity duration-500 ease-in',
      isViewable ? 'opacity-100' : 'opacity-0',
    ]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";

interface Props {
  threshold?: number;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 0.25,
  delay: 0,
});

const isViewable = ref(false);
const viewableTarget = ref<HTMLElement | null>(null);

const onIntersection: IntersectionObserverCallback = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setTimeout(
          () => {
            isViewable.value = true;
          },
          (props.delay + 0.05) * 1000,
      );
    }
  });
};

const setupObserver = (): void => {
  const options: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: props.threshold, // Adjust this value based on your desired visibility threshold
  };

  const observer = new IntersectionObserver(onIntersection, options);
  if (viewableTarget.value) {
    observer.observe(viewableTarget.value);
  }
};

onMounted(() => {
  setupObserver();
});
</script>
