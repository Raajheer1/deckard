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
                     @keyup.enter="submitSearch()"
                     class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
          <label for="search_label">Search for Research</label>
        </FloatLabel>

        <Button label="Search" @click="submitSearch()"/>
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

      <div class="space-y-4 max-h-full overflow-y-hidden py-1 px-1">
        <transition-group
            name="fade-out"
            tag="div"
            class="space-y-4"
        >
          <Card
              v-for="card in realCards"
              :key="card.link"
              class="text-left cursor-pointer hover:bg-gray-50 transition duration-200"
              @click="selectCard(card.id)"
              :class="selectedCard === card.id ? 'outline outline-primary':''"
          >
            <template #content>
              <div class="flex">
                <div class="flex-1 space-y-6 py-1">
                  <div class="flex justify-between items-center">
                    <h4 class="text-xl font-bold">{{ card.title }}</h4>
                    <i v-if="!card.starred" class="pi pi-star text-yellow-500"></i>
                    <i v-else class="pi pi-star-fill text-yellow-500"></i>
                  </div>
                  <p class="space-y-3 text-wrap  text-gray-400">
                    {{ card.summary }}
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
        <!--        TODO: if realCards and fakeCards are both empty render nothing found. -->
      </div>
    </div>
    <div v-if="showChat" class="w-2/3 p-4 h-full">
      <FadeIn v-if="showChat && selectedPaper != null" :delay="0.5" class="h-full">
        <Chat :paper="selectedPaper" :messages="getMessages" @add-msg="handleMsgEmit"/>
      </FadeIn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {GetUser, mockGetPreferredPapers, mockSearchPapers, SignOut} from "@/lib/supabase";
import {useRouter} from 'vue-router';

import Chat from "../components/Chat.vue";
import FadeIn from '../components/FadeIn.vue';
import {Button, Card, FloatLabel, InputText} from "primevue";
import {User} from "@supabase/supabase-js";
import {Message, PaperCard} from "@/types";

const router = useRouter();
const self = ref<User | null>(null);

const search = ref<string>('');

const moveSide = ref<boolean>(false);
const showChat = ref<boolean>(false);
const fakeCardCount = ref<number>(4);
const realCards = ref<PaperCard[]>([]);
const selectedCard = ref<string | null>(null);
const selectedPaper = ref<PaperCard | null>(null);

const clearFakes = async (): Promise<void> => {
  return new Promise((resolve) => {
    let totalTime = 1100; // Total time needed for all setTimeouts to complete

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

    // Resolve the promise after the longest timeout
    setTimeout(() => {
      resolve();
    }, totalTime);
  });
};

const slideLeft = (): void => {
  moveSide.value = true
  clearFakes();
  showChat.value = true;
}

const selectCard = (id: string): void => {
  if (!moveSide.value) {
    slideLeft();
  }
  selectedCard.value = id;
  selectedPaper.value = realCards.value.find(card => card.id === id) || null;
}

const Logout = async (): Promise<void> => {
  await SignOut();
  await router.push({name: 'Login'});
}

const addReal = async (data: PaperCard[]): Promise<void> => {
  return new Promise((resolve) => {
    let totalTime = data.length * 150

    data.forEach((card, index) => {
      setTimeout(() => {
        realCards.value.push(card);
      }, index * 150);
    });

    // Resolve the promise after the longest timeout
    setTimeout(() => {
      resolve();
    }, totalTime);
  });
};

const removeReal = async (data: PaperCard[]): Promise<void> => {
  return new Promise((resolve) => {
    let totalTime = data.length * 150 + 500

    data.forEach((card, index) => {
      setTimeout(() => {
        realCards.value.pop();
      }, index * 150);
    });

    // Resolve the promise after the longest timeout
    setTimeout(() => {
      resolve();
    }, totalTime);
  });
};


const submitSearch = async (): Promise<void> => {
  if (search.value === '') {
    return;
  }
  await removeReal(realCards.value);
  const {data, error} = await mockSearchPapers(search.value);
  if (error) {
    console.error("Error fetching preferred papers: ", error);
  } else {
    await addReal(data);
  }
}

const messages = reactive<Record<string, Message[]>>({});

const getMessages = (id: string): Message[] => {
  return messages[id] || [];
}

const handleMsgEmit = (id: string, msg: Message): void => {
  if (!messages[id]) {
    messages[id] = [];
  }
  messages[id].push(msg);
}

onMounted(async () => {
  const user: User | null = await GetUser();
  self.value = user;

  if (!user) {
    await router.push({name: 'Login'});
  }

  // Fetch real cards
  const {data, error} = await mockGetPreferredPapers();
  if (error) {
    console.error("Error fetching preferred papers: ", error);
  } else {
    await clearFakes()
    await addReal(data);
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