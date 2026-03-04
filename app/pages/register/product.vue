<script setup lang="ts">
import RegisterPlanSelector from "@/components/register/RegisterPlanSelector.vue";
import { useRegisterStore } from "@/stores/register";

const registerStore = useRegisterStore();
const localePath = useLocalePath();

definePageMeta({
  layout: "guest",
  auth: "guest",
  path: "/register/product",
});

if (!registerStore.hasRegistrationCredentials) {
  await navigateTo(localePath("/register"));
}
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-5xl p-6">
    <RegisterPlanSelector />
  </div>
</template>
