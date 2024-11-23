<template>
  <div v-if="self" class="h-screen flex flex-row mx-5">
    <div class="w-1/3 flex flex-col text-center gap-y-4 transition-all duration-500 ease-in-out"
         :class="moveSide?'mt-4':'translate-x-full mt-14'"
    >
      <h1 class=" text-4xl font-semibold flex mx-auto">Search with
        <span class="flex mx-auto border-b-4 border-b-primary ml-2">
          <img src="@/assets/wallace_lighter.png" alt="Logo"
               class="w-12 h-12 -mt-2 -z-10 -mr-1.5"/>
          allace!
        </span>
      </h1>

      <div class="flex gap-x-4 mx-auto">
        <FloatLabel variant="on">
          <InputText id="search_label" v-model="search"
                     @keyup.enter="submitSearch()"
                     class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
          <label for="search_label">Query</label>
        </FloatLabel>

        <Button :loading="searchLoading" label="Search" @click="submitSearch()"/>
      </div>

      <div class="space-y-4 max-h-full overflow-y-hidden px-1">
        <transition-group
            name="fade-out"
            tag="div"
            class="space-y-4"
        >
          <Card
              v-if="fakeCardCount > 0"
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

      <div class="space-y-4 max-h-full overflow-y-scroll hide-scrollbar py-1 px-1 mb-2 relative">
        <transition-group
            name="fade-out"
            tag="div"
            class="space-y-4"
        >
          <Card
              v-if="realCards.length > 0"
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
                    {{ truncateSummary(card.summary) }}
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
        <div
            class="sticky bottom-0 mx-auto  w-10 h-10 justify-center align-middle animate-bounce rounded-full bg-white drop-shadow z-10 transition duration-200 delay-200"
            :class="realCards.length > 3 ? 'opacity-100':'opacity-0'">
          <span class="pi pi-arrow-down text-primary mt-3"></span>
        </div>
      </div>

      <div
          class="space-y-4 max-h-full overflow-y-scroll hide-scrollbar py-1 px-1 mb-2 transition duration-200 delay-500"
          :class="realCards.length === 0 && fakeCardCount === 0 && !swapCondition && !searchLoading ? 'opacity-100' :'opacity-0'">
        <h5>No articles found based on your preferences.</h5>
      </div>

      <!--      User Object      -->
      <div
          class="flex mt-auto text-left gap-x-4 mb-6 transition-all duration-500 ease-in-out delay-500 rounded-xl align-middle"
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
        <Chat :paper="selectedPaper" :messages="getMessages" @add-msg="handleMsgEmit"/>
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
          <Chip v-for="pref in preferences" :key="pref.id"
                :label="pref.preference.substring(0, pref.preference.length-9)"
                class="cursor-pointer transition duration-200 hover:bg-gray-200"
                v-show="pref.preference.length < 100"
                icon="pi pi-times"
                @click="removePreference(pref.id)"
          />
        </div>
        <div class="flex gap-x-4 mx-auto my-2">
          <FloatLabel variant="on">
            <InputText id="pref_label" v-model="newPreference"
                       @keyup.enter="addPreference()"
                       class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
            <label for="pref_label">New Preference</label>
          </FloatLabel>

          <Button label="Add" @click="addPreference()" :loading="prefLoading"/>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Not signed in!</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';
import {
  GetPreferences,
  GetPreferredPapers,
  GetUser,
  RemovePreference,
  SearchPapers,
  SetPreferences,
  SignOut
} from "@/lib/supabase";
import {useRouter} from 'vue-router';

import Chat from "../components/Chat.vue";
import FadeIn from '../components/FadeIn.vue';
import Modal from "../components/Modal.vue";
import {Button, Card, Chip, FloatLabel, InputText} from "primevue";
import {User} from "@supabase/supabase-js";
import {ChatMessage, PaperCard, Preference} from "@/types";

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

const swapCondition = ref<boolean>(false);

const selectCard = (id: string): void => {
  if (!moveSide.value) {
    slideLeft();
  }
  selectedCard.value = id;
  selectedPaper.value = realCards.value.find(card => card.id === id) || null;
  const chatWindow = document.getElementById('chatWindow');
  chatWindow?.scrollTo(0, chatWindow.scrollHeight);
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

const truncateSummary = (summary: string): string => {
  if (summary.length > 200) {
    return summary.substring(0, 200) + '...';
  }
  return summary;
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

const searchLoading = ref<boolean>(false);
const submitSearch = async (): Promise<void> => {
  searchLoading.value = true;
  if (search.value === '') {
    const {data, error} = await GetPreferredPapers();
    if (error) {
      console.error("Error fetching preferred papers: ", error);
    } else {
      await removeReal(realCards.value);
      await addReal(data);
    }
    searchLoading.value = false;
    return;
  }
  await removeReal(realCards.value);
  const {data, error} = await SearchPapers(search.value);
  if (error) {
    console.error("Error fetching preferred papers: ", error);
  } else {
    await addReal(data);
  }
  searchLoading.value = false;
}

const messages = reactive<Record<string, ChatMessage[]>>({});

const getMessages = computed(() => {
  return messages[selectedCard.value || -1] || [];
});

const handleMsgEmit = (id: string, msg: ChatMessage): void => {
  if (!messages[id]) {
    messages[id] = [];
  }
  messages[id].push(msg);
}

const settingsModal = ref<boolean>(false);
const preferences = ref<Preference[]>([]);
const prefLoading = ref<boolean>(false);

const openSettings = async (): Promise<void> => {
  const {data, error} = await GetPreferences(self.value!.id);
  if (error !== null) {
    console.error("Error fetching preferences: ", error);
  } else {
    preferences.value = data;
    settingsModal.value = true;
  }
}

const removePreference = async (id: string): Promise<void> => {
  swapCondition.value = true;
  const error = await RemovePreference(id);
  if (error !== null) {
    console.error("Error removing preference: ", error);
  } else {
    preferences.value = preferences.value.filter(pref => pref.id !== id);
    const {data, error} = await GetPreferredPapers();
    if (error) {
      console.error("Error fetching preferred papers: ", error);
    } else {
      await removeReal(realCards.value);
      await addReal(data);
    }
  }
  swapCondition.value = false;
}

const newPreference = ref<string>('');
const addPreference = async (): Promise<void> => {
  prefLoading.value = true;
  swapCondition.value = true;
  const {error} = await SetPreferences([newPreference.value]);
  if (error) {
    console.error("Error setting preference: ", error);
  } else {
    let {data, error} = await GetPreferences(self.value!.id);
    if (error !== null) {
      console.error("Error fetching preferences: ", error);
    } else {
      preferences.value = data;
    }

    newPreference.value = '';
    prefLoading.value = false;

    let {data: prefData, error: prefError} = await GetPreferredPapers();
    if (prefError) {
      console.error("Error fetching preferred papers: ", prefError);
    } else {
      await removeReal(realCards.value);
      await addReal(prefData);
    }
  }

  swapCondition.value = false;
}

onMounted(async () => {
  const user: User | null = await GetUser();
  self.value = user;

  if (!user) {
    await router.push({name: 'Login'});
  }

  // Fetch real cards
  const {data, error} = await GetPreferredPapers();
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