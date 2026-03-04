<script setup lang="ts">
import RegisterCredentialsForm from "@/components/register/RegisterCredentialsForm.vue";

definePageMeta({
  layout: "guest",
  auth: "guest",
  path: "/register",
});
</script>

<template>
  <div class="grid min-h-svh place-items-center p-6">
    <div class="w-full max-w-md rounded-xl border p-6">
      <RegisterCredentialsForm />
    </div>
  </div>
</template>
