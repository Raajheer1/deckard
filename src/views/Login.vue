<template>
  <div class="flex items-center justify-center mt-[100px]">
    <div
        class="flex flex-col justify-center items-center p-[30px]"
    >
      <!-- Title -->
      <div class="flex flex-col items-center mb-[20px]">
        <h1 class="text-[50px] font-bold">Login to Deckard</h1>
      </div>

      <!-- Login Form -->
      <form
          @submit="submit"
          class="flex flex-col gap-4 w-[400px]"
      >
        <div class="flex flex-col gap-2">
          <FloatLabel variant="on" class="text-white">
            <InputText
                v-model="credentials.email"
                name="email"
                type="text"
                placeholder="Username"
                autocomplete="username"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="username">Username</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <InputText
                v-model="credentials.password"
                name="password"
                type="password"
                placeholder="Password"
                autocomplete="current-password"
                class="w-full bg-surface-0 text-black placeholder:text-gray-500"
            />
            <label for="password">Password</label>
          </FloatLabel>
        </div>

        <Button
            type="submit"
            label="Login"
            class="h-[40px] text-white bg-black"
            :loading="isLoading"
        />

        <a class="text-center" href="/signup">Signup</a>
        <div v-if="errorMessage" class="text-red-500">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {Login} from '../types';

const credentials = ref<Login>({
  email: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref("");

const submit = async (e: Event) => {
  e.preventDefault();
  isLoading.value = true;
  try {
    const {error} = await signInUser(
        username.value,
        password.value
    );

    if (error) {
      throw error;
    }

    await router.push("/game");
    window.location.reload();
  } catch (error) {
    errorMessage.value = "Invalid username or password";
    console.error("Login error:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

</style>