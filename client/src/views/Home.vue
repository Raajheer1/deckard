<template>
  <div v-if="self" class="h-screen flex mx-10 justify-center">
    <div class="w-full md:w-1/2 lg:w-1/3  flex flex-col text-center gap-y-4 transition-all duration-500 ease-in-out"
         :class="swap?'-translate-x-full -translate-y-16':''"
    >
      <h1 class="mt-24 text-4xl font-semibold">Welcome back, <span
          class="underline decoration-primary">
      {{ self.user_metadata.display_name }}!</span>
      </h1>

      <div class="flex gap-x-4 mx-auto">
        <FloatLabel variant="on">
          <InputText id="search_label" v-model="search"
                     class="w-full bg-surface-0 text-black placeholder:text-gray-500"/>
          <label for="search_label">Search for Research</label>
        </FloatLabel>

        <Button label="Search" @click="swap = !swap"/>
      </div>

      <div class="space-y-4">
        <Card class="text-left">
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

        <Card class="text-left">
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

        <Card class="text-left">
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
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {GetUser} from "@/lib/supabase";
import {useRouter} from 'vue-router';

import {Button, Card, FloatLabel, InputText} from "primevue";
import {User} from "@supabase/supabase-js";

const router = useRouter();
const self = ref<User | null>(null);

const search = ref<string>('');

const swap = ref<boolean>(false);

onMounted(async () => {
  const user: User | null = await GetUser();
  self.value = user;

  if (!user) {
    await router.push({name: 'Login'});
  }
});
</script>

<style scoped>

</style>