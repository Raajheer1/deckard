<template>
  <div v-if="self" class="h-screen flex flex-row mx-5">
    <div class="w-1/3 flex flex-col text-center gap-y-4 transition-all duration-500 ease-in-out"
         :class="moveSide?'-translate-y-16':'translate-x-full'"
    >
      <h1 class="mt-20 text-4xl font-semibold">Welcome back, <span
          class="underline decoration-primary">
      {{ self.user_metadata.display_name }}!</span>
      </h1>

      <div class="flex gap-x-4 mx-auto">
        <FloatLabel variant="on">
          <InputText id="search_label" v-model="search"
                     class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
          <label for="search_label">Search for Research</label>
        </FloatLabel>

        <Button label="Search" @click="slideLeft()"/>
        <Button label="Logout" @click="Logout"/>
      </div>

      <div class="space-y-4 max-h-full overflow-y-hidden px-1">
        <transition-group
            name="fade-out"
            tag="div"
            class="space-y-4"
        >
          <Card
              v-for="i in fakeCardCount"
              :key="i"
              class="text-left"
          >
            <template #content>
              <div class="animate-pulse flex">
                <div class="flex-1 space-y-6 py-1">
                  <div class="h-4 bg-slate-200 rounded"></div>
                  <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-4">
                      <div class="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div class="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div class="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
      </div>

      <div class="space-y-4 max-h-full overflow-y-hidden px-1">
        <transition-group
            name="fade-out"
            tag="div"
            class="space-y-4"
        >
          <Card
              v-for="card in realCards"
              :key="card.link"
              class="text-left"
          >
            <template #content>
              <div class="animate-pulse flex">
                <div class="flex-1 space-y-6 py-1">
                  <div class="h-4 bg-slate-200 rounded"></div>
                  <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-4">
                      <div class="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div class="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div class="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
      </div>
    </div>
    <div v-if="showChat" class="w-2/3 p-4 h-full">
      <FadeIn v-if="showChat" :delay="0.5" class="h-full">
        <div class="rounded-xl border border-primary h-full flex flex-col">
          <div class="py-4 px-10 flex border-b rounded-t-xl justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold">Wallace AI</h2>
              <p>Chatting over... (insert title here)</p>
            </div>
            <Button icon="pi pi-download" variant="text" rounded aria-label="Filter"/>
          </div>
          <div class="flex-grow">
            Body
          </div>
          <div class="flex border-t py-4 px-10 gap-x-4">
            <InputText class="flex-grow bg-gray-100 border-0 focus:border-0" v-model="chatPrompt" type="text"
                       placeholder="Chat with the latest research..."/>
            <Button icon="pi pi-send" aria-label="Send"/>
          </div>
        </div>
      </FadeIn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {GetUser, SignOut} from "@/lib/supabase";
import {useRouter} from 'vue-router';

import FadeIn from '../components/FadeIn.vue';
import {Button, Card, FloatLabel, InputText} from "primevue";
import {User} from "@supabase/supabase-js";
import {PaperCard} from "@/types";

const router = useRouter();
const self = ref<User | null>(null);

const search = ref<string>('');

const moveSide = ref<boolean>(false);
const showChat = ref<boolean>(false);
const fakeCardCount = ref<number>(4);
const realCards = ref<PaperCard[]>([]);

const clearFakes = (): void => {
  setTimeout(() => {
    showChat.value = true;
  }, 500);

  setTimeout(() => {
    fakeCardCount.value -= 1;
  }, 150);

  setTimeout(() => {
    fakeCardCount.value -= 1;
  }, 300);

  setTimeout(() => {
    fakeCardCount.value -= 1;
  }, 450);

  setTimeout(() => {
    fakeCardCount.value -= 1;
  }, 600);
}

const slideLeft = (): void => {
  moveSide.value = true
  clearFakes();
}

const chatPrompt = ref<string>('');
const sendMessage = (): void => {
  console.log(chatPrompt.value);
  chatPrompt.value = '';
}

const Logout = async (): Promise<void> => {
  await SignOut();
  await router.push({name: 'Login'});
}

onMounted(async () => {
  const user: User | null = await GetUser();
  self.value = user;

  if (!user) {
    await router.push({name: 'Login'});
  }
});
</script>

<style scoped>
.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-out-enter-to,
.fade-out-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>