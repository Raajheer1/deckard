<template>
  <div class="flex items-center justify-center mt-[100px]">
    <div
        class="flex flex-col justify-center items-center p-[30px]"
    >
      <h1 class=" text-4xl font-semibold flex mx-auto mb-4">Login to
        <span class="flex mx-auto border-b-4 border-b-primary ml-2">
          <img src="@/assets/wallace_lighter.png" alt="Logo"
               class="w-12 h-12 -mt-2 -z-10 -mr-1.5"/>
          allace!
        </span>
      </h1>

      <!-- Login Form -->
      <form
          @submit="submit"
          class="flex flex-col gap-4 w-[400px]"
      >
        <div class="flex flex-col gap-2">
          <FloatLabel variant="on">
            <InputText
                v-model="credentials.email"
                name="email"
                type="text"
                autocomplete="email"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="username">Email</label>
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
            label="Login"
            class="h-[40px]"
            :loading="isLoading"
        />

        <router-link class="text-center" to="register">Signup</router-link>
        <div v-if="errorMessage" class="text-center text-red-500">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {LoginReq} from '../types';
import {SignIn} from "@/lib/supabase";

import {Button, FloatLabel, InputText} from "primevue";
import {useRouter} from 'vue-router';

const router = useRouter();

const credentials = ref<LoginReq>({
  email: '',
  password: '',
});

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");

const submit = async (e: Event) => {
  e.preventDefault();
  isLoading.value = true;

  const {error} = await SignIn(
      credentials.value.email,
      credentials.value.password
  );
  if (error !== null) {
    errorMessage.value = error.message;
    console.log("Login Error: ", error)
  }
  isLoading.value = false;

  console.log("Pushing to home page.")
  await router.push({name: "Home"});
};
</script>

<style scoped>

</style>