<script setup lang="ts">
import RegisterSummary from "@/components/register/RegisterSummary.vue";
import { useRegisterStore } from "@/stores/register";

const registerStore = useRegisterStore();
const localePath = useLocalePath();

definePageMeta({
  layout: "guest",
  auth: "guest",
  path: "/register/summary",
});

if (!registerStore.hasRegistrationCredentials || !registerStore.selectedPackage) {
  await navigateTo(localePath("/register"));
}
</script>

<template>
  <div class="grid min-h-svh place-items-center p-6">
    <div class="w-full max-w-xl">
      <RegisterSummary />
    </div>
  </div>
</template>
