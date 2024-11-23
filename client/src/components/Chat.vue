<template>
  <div class="rounded-xl border border-primary h-full flex flex-col">
    <div class="py-4 px-10 flex border-b rounded-t-xl justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Wallace Chat</h2>
        <p class="text-gray-700">Converse on <span class="text-black font-semibold">{{ props.paper.title }}</span></p>
      </div>
      <div class="flex gap-x-2">
        <Button @click="downloadPaper" icon="pi pi-download" variant="text" rounded aria-label="Download"/>
        <Button v-if="!props.paper.starred" @click="addFavorite()" icon="pi pi-star text-yellow-500"
                variant="text" rounded aria-label="Star"/>
        <Button v-else icon="pi pi-star-fill text-yellow-500" variant="text" rounded aria-label="Filter"/>
      </div>
    </div>
    <div class="flex-grow overflow-y-auto" id="chatWindow">
      <div v-for="(msg, idx) in props.messages" :key="idx" class="px-10">
        <div v-if="msg.role === 'assistant'" :id="msg.content">
          <div class="flex w-2/3 gap-x-2  py-4">
            <img src="@/assets/avatars/wallace_headshot.png" alt="avatar"
                 class="w-10 h-10 mt-2 rounded-full"/>
            <div class="flex-grow bg-gray-100 rounded-b-xl rounded-r-xl p-4">
              <h5 class="font-semibold mb-2">Wallace</h5>
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="flex w-1/2 gap-x-2 ml-auto py-4 justify-end">
            <div class="flex-grow bg-primary text-white rounded-b-xl rounded-l-xl p-4">
              <h5 class="font-semibold mb-2">You</h5>
              <p>{{ msg.content }}</p>
            </div>
            <img src="@/assets/avatars/user_headshot.png" alt="avatar"
                 class="w-10 h-10 mt-2 rounded-full"/>
          </div>
        </div>
      </div>
      <div v-if="queryingLLM">
        <div class="flex w-1/3 ml-24 py-4">
          <div class="flex-grow bg-gray-100 rounded-xl p-4">
            <h5 class="font-semibold mb-2">Thinking...</h5>
          </div>
        </div>
      </div>
    </div>
    <div class="flex border-t py-4 px-10 gap-x-4">
      <InputText class="flex-grow bg-gray-100 border-0 focus:border-0" v-model="chatPrompt" type="text"
                 placeholder="Chat with the latest research..." @keyup.enter="sendMessage()"/>
      <Button :loading="queryingLLM" @click="sendMessage()" icon="pi pi-send" aria-label="Send"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ChatMessage, PaperCard} from "@/types";
import {Button, InputText} from "primevue";
import {AddFavorite, ChatPaper} from "@/lib/supabase";

const emit = defineEmits<{
  addMsg: [id: string, msg: ChatMessage];
}>();

const props = defineProps<{
  paper: PaperCard,
  messages: ChatMessage[],
}>();

const queryingLLM = ref<boolean>(false);
const chatPrompt = ref<string>('');
const sendMessage = async (): Promise<void> => {
  const msg: ChatMessage = {
    content: chatPrompt.value,
    role: "user",
  };
  emit('addMsg', props.paper.id, msg);
  chatPrompt.value = '';
};

const downloadPaper = (): void => {
  window.open(props.paper.link, '_blank');
};

const addFavorite = async (): Promise<void> => {
  const error = await AddFavorite(props.paper.id);

  if (error) {
    console.error(error);
  } else {
    props.paper.starred = true;
  }
};


watch(
    () => props.messages, async (newMsg: ChatMessage[], oldMsg) => {
      // If last message is from user then send a message to assistant
      if (newMsg[newMsg.length - 1].role === 'user') {
        queryingLLM.value = true;
        const {message, error} = await ChatPaper(props.paper.id, newMsg)
        if (error) {
          console.error(error);
        } else {
          const msg: ChatMessage = {
            content: message,
            role: "assistant",
          };
          emit('addMsg', props.paper.id, msg);
        }
        queryingLLM.value = false;
      }
    },
    {deep: true}
);

const chatWindowRef = ref<HTMLElement | null>(null);
let intervalId: NodeJS.Timeout | null = null;

const scrollDown = () => {
  const chatWindow = chatWindowRef.value;
  if (chatWindow !== null) {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
};

onMounted(() => {
  intervalId = setInterval(scrollDown, 500);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>

</style>