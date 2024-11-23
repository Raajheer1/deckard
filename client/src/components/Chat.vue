<template>
  <div class="rounded-xl border border-primary h-full flex flex-col">
    <div class="py-4 px-10 flex border-b rounded-t-xl justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Wallace Chat</h2>
        <p class="text-gray-700">Converse on <span class="text-black font-semibold">{{ props.paper.title }}</span></p>
      </div>
      <div class="flex gap-x-2">
        <Button @click="downloadPaper" icon="pi pi-download" variant="text" rounded aria-label="Download"/>
        <Button v-if="!props.paper.starred" icon="pi pi-star text-yellow-500" variant="text" rounded aria-label="Star"/>
        <Button v-else icon="pi pi-star-fill text-yellow-500" variant="text" rounded aria-label="Filter"/>
      </div>
    </div>
    <div class="flex-grow overflow-y-auto" id="chatWindow">
      <div v-for="(msg, idx) in props.messages" :key="idx" class="px-10">
        <div v-if="msg.author == 'Wallace'">
          <div class="flex w-1/2 gap-x-2  py-4">
            <img src="https://avatars.dicebear.com/api/avataaars/1.svg" alt="avatar"
                 class="w-10 h-10 mt-2 rounded-full"/>
            <div class="flex-grow bg-gray-100 rounded-b-xl rounded-r-xl p-4">
              <h5 class="font-semibold mb-2">{{ msg.author }}</h5>
              <p>{{ msg.message }}</p>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="flex w-1/2 gap-x-2 ml-auto py-4 justify-end">
            <div class="flex-grow bg-primary text-white rounded-b-xl rounded-l-xl p-4">
              <h5 class="font-semibold mb-2">You</h5>
              <p>{{ msg.message }}</p>
            </div>
            <img src="https://avatars.dicebear.com/api/avataaars/2.svg" alt="avatar"
                 class="w-10 h-10 mt-2 rounded-full"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flex border-t py-4 px-10 gap-x-4">
      <InputText class="flex-grow bg-gray-100 border-0 focus:border-0" v-model="chatPrompt" type="text"
                 placeholder="Chat with the latest research..."/>
      <Button @click="sendMessage()" icon="pi pi-send" aria-label="Send"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
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

const downloadPaper = (): void => {
  window.open(props.paper.link, '_blank');
};

onMounted(() => {
  const chatWindow = document.getElementById('chatWindow');
  chatWindow?.scrollTo(0, chatWindow.scrollHeight);
});
</script>

<style scoped>

</style>