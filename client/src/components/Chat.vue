<template>
  <div class="rounded-xl border border-primary h-full flex flex-col">
    <div class="py-4 px-10 flex border-b rounded-t-xl justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold">Wallace AI</h2>
        <p>Chatting over {{ props.paper.title }}</p>
      </div>
      <div class="flex gap-x-2">
        <Button icon="pi pi-download" variant="text" rounded aria-label="Download"/>
        <Button v-if="!props.paper.starred" icon="pi pi-star text-yellow-500" variant="text" rounded aria-label="Star"/>
        <Button v-else icon="pi pi-star-fill text-yellow-500" variant="text" rounded aria-label="Filter"/>
      </div>
    </div>
    <div class="flex-grow">
      Body
    </div>
    <div class="flex border-t py-4 px-10 gap-x-4">
      <InputText class="flex-grow bg-gray-100 border-0 focus:border-0" v-model="chatPrompt" type="text"
                 placeholder="Chat with the latest research..."/>
      <Button @click="sendMessage()" icon="pi pi-send" aria-label="Send"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Message, PaperCard} from "@/types";
import {Button, InputText} from "primevue";

const emit = defineEmits<{
  addMsg: [id: string, msg: Message];
}>();

const props = defineProps<{
  paper: PaperCard,
  messages: Message[],
}>();

const chatPrompt = ref<string>('');
const sendMessage = (): void => {
  console.log(chatPrompt.value);
  chatPrompt.value = '';
  const msg: Message = {
    message: chatPrompt.value,
    author: "User",
  };
  emit('addMsg', props.paper.id, msg);
};
</script>

<style scoped>

</style>