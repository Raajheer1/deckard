<template>
  <div class="flex items-center justify-center mt-[100px]">
    <div
        v-if="page == 1"
        class="flex flex-col w-full justify-center items-center p-[30px]"
    >
      <!-- Title -->
      <div class="flex flex-col items-center mb-[20px]">
        <h1 class="text-[50px] font-bold">
          Sign Up for Deckard
        </h1>
      </div>

      <!-- Signup Form -->
      <form
          @submit="submit"
          class="flex flex-col gap-4 w-[400px]"
      >
        <div class="flex flex-col gap-2">
          <FloatLabel variant="on">
            <InputText
                v-model="credentials.displayName"
                name="displayName"
                type="text"
                autocomplete="displayName"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="displayName">Display Name</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputText
                v-model="credentials.email"
                name="email"
                type="text"
                autocomplete="email"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="email">Email</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <InputText
                v-model="credentials.password"
                name="password"
                type="password"
                autocomplete="current-password"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="password">Password</label>
          </FloatLabel>
        </div>

        <Button
            type="submit"
            label="Sign up"
            class="h-[40px]"
            :loading="isLoading"
        />

        <router-link class="text-center" to="login">Login</router-link>
        <div v-if="errorMessage" class="text-center text-red-500">
          {{ errorMessage }}
        </div>
      </form>
    </div>
    <div
        v-if="page == 2"
        class="flex flex-col justify-center items-center p-[30px] gap-y-4 w-full"
    >
      <!-- Title -->
      <div class="items-center mb-[20px]">
        <h1 class="text-[50px] font-bold">
          Select Your Preferences
        </h1>
      </div>

      <!-- Preferences -->
      <form
          @submit="addPreference"
          class="flex flex-col gap-4 w-1/2"
      >
        <div class="flex flex-col gap-2">
          <FloatLabel variant="on">
            <InputText
                v-model="enteredPreference"
                name="Enter a preference"
                type="text"
                autocomplete="Enter a preference"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="Enter a preference">Enter a Preference</label>
          </FloatLabel>
        </div>
      </form>

      <div class="flex flex-wrap gap-4 w-1/2">
        <Chip v-for="(opt, idx) in preferenceOptions" :key="idx" :label="opt"
              @click="clickPreference(opt)"
              class="cursor-pointer hover:-translate-y-1 transition duration-200"
              :class="selectedPrefs.includes(opt) ? 'bg-primary text-white':''"
        />
      </div>

      <Button
          label="Next"
          @click="submitPreferences()"
          class="h-[40px] w-1/2"
          :loading="isLoading"
      />

      <div v-if="errorMessage" class="text-center text-red-500">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {RegisterReq} from "../types";
import {SetPreferences, SignUp} from "@/lib/supabase";
import router from "@/router";

import {Button, Chip, FloatLabel, InputText} from "primevue";

const credentials = ref<RegisterReq>({
  email: '',
  password: '',
  displayName: '',
});

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");

const page = ref<number>(1);

const submit = async (e: Event) => {
  e.preventDefault();
  isLoading.value = true;

  const {error} = await SignUp(
      credentials.value.displayName,
      credentials.value.email,
      credentials.value.password
  );
  if (error !== null) {
    errorMessage.value = error.message;
    console.log("Registration Error: ", error)
  }
  isLoading.value = false;
  page.value = 2;
};

const enteredPreference = ref<string>('');
const preferenceOptions = ref<string[]>(["RAG", "Language Models", "Quantum Computing", "Cryptography"]);
const selectedPrefs = ref<string[]>([]);
const addPreference = async (e: Event) => {
  e.preventDefault();
  preferenceOptions.value.push(enteredPreference.value);
  selectedPrefs.value.push(enteredPreference.value);
  enteredPreference.value = '';
}
const clickPreference = (preference: string): void => {
  const index = selectedPrefs.value.indexOf(preference);

  if (index > -1) {
    selectedPrefs.value.splice(index, 1);
  } else {
    selectedPrefs.value.push(preference);
  }
}
const submitPreferences = async () => {
  isLoading.value = true;
  const {error} = await SetPreferences(selectedPrefs.value);
  isLoading.value = false;

  if (error != null) {
    errorMessage.value = error.message;
    console.log("Preference Error: ", error);
  } else {
    await router.push({name: 'Home'});
  }
}
</script>

<style scoped>

</style>