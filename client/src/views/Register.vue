<template>
  <div class="flex items-center justify-center mt-[100px]">
    <div
        v-if="page == 1"
        class="flex flex-col justify-center items-center p-[30px]"
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
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {RegisterReq} from "../types";
import {SignUp} from "@/lib/supabase";
import router from "@/router";

import {Button, FloatLabel, InputText} from "primevue";

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
  await router.push({to: "Home"});
};
</script>

<style scoped>

</style>