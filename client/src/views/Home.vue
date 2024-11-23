<template>
  <div v-if="self" class="h-screen flex flex-row mx-5">
    <div class="w-1/3 flex flex-col text-center gap-y-4 transition-all duration-500 ease-in-out"
         :class="moveSide?'mt-4':'translate-x-full mt-14'"
    >
      <h1 class=" text-4xl font-semibold">Search with <span
          class="underline decoration-primary">
      Wallace!</span>
      </h1>

      <div class="flex gap-x-4 mx-auto">
        <FloatLabel variant="on">
          <InputText id="search_label" v-model="search"
                     @keyup.enter="submitSearch()"
                     class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
          <label for="search_label">Query</label>
        </FloatLabel>

        <Button label="Search" @click="submitSearch()"/>
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

      <div class="space-y-4 h-full overflow-y-scroll hide-scrollbar py-1 px-1 mb-2">
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

      <!--      User Object      -->
      <div
          class="flex text-left gap-x-4 mb-6 transition-all duration-500 ease-in-out delay-500 rounded-xl align-middle"
          :class="moveSide?'bg-gray-200 px-5 py-1 my-auto':''">
        <div class="flex-grow mt-1">
          <h2 class="text-xl font-semibold">{{ self.user_metadata.display_name }}</h2>
          <p class="text-gray-500">{{ self.email }}</p>
        </div>
        <Button class="my-2" label="Settings" @click="openSettings"/>
        <Button class="my-2" label="Logout" @click="Logout"/>
      </div>
    </div>
    <div v-if="showChat" class="w-2/3 p-4 h-full">
      <FadeIn v-if="showChat && selectedPaper != null" :delay="0.5" class="h-full">
        <Chat :paper="selectedPaper" :messages="getMessages(selectedCard)" @add-msg="handleMsgEmit"/>
      </FadeIn>
    </div>
  </div>

  <Modal title="User Settings" :visible="settingsModal" @close="settingsModal = false"
         :footer="`User ID: ${getUserId()}`">
    <div v-if="self" class="space-y-4">
      <div>
        <p class="text-sm text-gray-600">Display Name:</p>
        <h2 class="text-xl text-semibold">{{ self.user_metadata.display_name }}</h2>
      </div>
      <div>
        <p class="text-sm text-gray-600">Email:</p>
        <h2 class="text-xl text-semibold">{{ self.user_metadata.email }}</h2>
      </div>
      <div>
        <p class="text-sm text-gray-600">Preferences:</p>
        <div class="flex flex-wrap gap-4 w-full">
          <Chip v-for="pref in preferences" :key="pref.id" :label="pref.preference"
                class="cursor-pointer transition duration-200"
          />
        </div>
      </div>
    </div>
    <div v-else>
      <p>Not signed in!</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {GetPreferences, GetUser, mockGetPreferredPapers, mockSearchPapers, SignOut} from "@/lib/supabase";
import {useRouter} from 'vue-router';

import Chat from "../components/Chat.vue";
import FadeIn from '../components/FadeIn.vue';
import Modal from "../components/Modal.vue";
import {Button, Card, Chip, FloatLabel, InputText} from "primevue";
import {User} from "@supabase/supabase-js";
import {Message, PaperCard, Preference} from "@/types";

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

const getUserId = (): string => {
  if (self.value) {
    return self.value.id;
  }

  return 'unknown';
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

const messages = reactive<Record<string, Message[]>>({
  '2': [
    {
      message: 'Hello, I am interested in your research paper.',
      author: 'User',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'Wallace',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'User',
    },
    {
      message: 'Hello, I am interested in your research paper.',
      author: 'User',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'Wallace',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'User',
    },
    {
      message: 'Hello, I am interested in your research paper.',
      author: 'User',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'Wallace',
    },
    {
      message: 'Hello, I am interested in your research paper',
      author: 'User',
    },
  ]
});

const getMessages = (id: string | null): Message[] => {
  if (!id) {
    return [];
  }
  return messages[id] || [];
}

const handleMsgEmit = (id: string, msg: Message): void => {
  if (!messages[id]) {
    messages[id] = [];
  }
  messages[id].push(msg);
}

const settingsModal = ref<boolean>(false);
const preferences = ref<Preference[]>([]);

const openSettings = async (): Promise<void> => {
  const {data, error} = await GetPreferences(self.value!.id);
  if (error !== null) {
    console.error("Error fetching preferences: ", error);
  } else {
    preferences.value = data;
    settingsModal.value = true;
  }
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

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
  scrollbar-width: none; /* For Firefox */
}
</style>