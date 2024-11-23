<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">
        Development Testing Panel
      </h1>
  
      <div class="space-y-4">
        <!-- Auth Section -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Authentication</h2>
          <button @click="testGetUser" class="btn">
            Get User
          </button>
          <div class="flex space-x-2 items-center my-2">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="input-field"
            />
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="input-field"
            />
            <button @click="testSignIn" class="btn">
              Sign In
            </button>
          </div>
          <div class="flex space-x-2 items-center my-2">
            <input
              v-model="signUpName"
              type="text"
              placeholder="Name"
              class="input-field"
            />
            <input
              v-model="signUpEmail"
              type="email"
              placeholder="Email"
              class="input-field"
            />
            <input
              v-model="signUpPassword"
              type="password"
              placeholder="Password"
              class="input-field"
            />
            <button @click="testSignUp" class="btn">
              Sign Up
            </button>
          </div>
          <button @click="testSignOut" class="btn">
            Sign Out
          </button>
        </div>
  
        <!-- Preferences Section -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Preferences</h2>
          <div class="flex space-x-2 items-center my-2">
            <input
              v-model="preferencesInput"
              type="text"
              placeholder="Preferences (comma-separated)"
              class="input-field flex-grow"
            />
            <button @click="testSetPreferences" class="btn">
              Set Preferences
            </button>
          </div>
          <button @click="testRemovePreference" class="btn">
            Remove Preference
          </button>
        </div>
  
        <!-- Papers Section -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Papers</h2>
          <button @click="testGetPreferredPapers" class="btn">
            Get Preferred Papers
          </button>
          <div class="flex space-x-2 items-center my-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search query"
              class="input-field flex-grow"
            />
            <button @click="testSearchPapers" class="btn">
              Search Papers
            </button>
          </div>
        </div>
  
        <!-- Favorites Section -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Favorites</h2>
          <div class="flex space-x-2 items-center my-2">
            <input
              v-model="favoriteId"
              type="text"
              placeholder="Paper ID"
              class="input-field flex-grow"
            />
            <button @click="testAddFavorite" class="btn">
              Add Favorite
            </button>
          </div>
        </div>
  
        <!-- Results Display -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold mb-2">Results:</h2>
          <pre
            class="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96"
            >{{ results }}</pre
          >
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import {
    GetUser,
    SignIn,
    SignUp,
    SignOut,
    SetPreferences,
    RemovePreference,
    GetPreferredPapers,
    SearchPapers,
    AddFavorite,
  } from "../lib/supabase";
  
  const results = ref("");
  const email = ref("");
  const password = ref("");
  const signUpName = ref("");
  const signUpEmail = ref("");
  const signUpPassword = ref("");
  const preferencesInput = ref("");
  const searchQuery = ref("");
  const favoriteId = ref("");
  
  const logResult = (label: string, result: any) => {
    results.value = `${label}:\n${JSON.stringify(result, null, 2)}`;
  };
  
  async function testGetUser() {
    const result = await GetUser();
    logResult("Get User", result);
  }
  
  async function testSignIn() {
    const result = await SignIn(email.value, password.value);
    logResult("Sign In", result);
  }
  
  async function testSignUp() {
    const result = await SignUp(
      signUpName.value,
      signUpEmail.value,
      signUpPassword.value
    );
    logResult("Sign Up", result);
  }
  
  async function testSignOut() {
    const result = await SignOut();
    logResult("Sign Out", result);
  }
  
  async function testSetPreferences() {
    const preferences = preferencesInput.value
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    const result = await SetPreferences(preferences);
    logResult("Set Preferences", result);
  }
  
  async function testRemovePreference() {
    const result = await RemovePreference({ id: 1, name: "AI" });
    logResult("Remove Preference", result);
  }
  
  async function testGetPreferredPapers() {
    const result = await GetPreferredPapers();
    logResult("Get Preferred Papers", result);
  }
  
  async function testSearchPapers() {
    const result = await SearchPapers(searchQuery.value);
    logResult("Search Papers", result);
  }
  
  async function testAddFavorite() {
    const result = await AddFavorite(favoriteId.value);
    logResult("Add Favorite", result);
  }
  </script>
  
  <style scoped>
  .btn {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-2;
  }
  
  .input-field {
    @apply px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
  </style>
  