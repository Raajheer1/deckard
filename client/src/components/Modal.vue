<template>
  <div v-if="props.visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-10 rounded shadow-lg relative w-4/5 lg:w-1/2">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ props.title }}</h2>
        <Button icon="pi pi-times" aria-label="Close" @click="close"/>
      </div>
      <slot></slot>
      <div v-if="props.footer" class="justify-end text-xs text-gray-500 mt-6">
        {{ props.footer }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Button} from "primevue";

const props = defineProps<{
  visible: boolean;
  title: string;
  footer?: string;
}>();
const emit = defineEmits<{
  close: [];
}>();

const close = (): void => {
  emit("close");
};
</script>

<style scoped></style>