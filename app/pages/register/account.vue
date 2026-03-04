<script setup lang="ts">
import RegisterAccountForm from "@/components/register/RegisterAccountForm.vue";

definePageMeta({
  layout: "guest",
  auth: "guest",
  path: "/register/account",
});
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-4xl p-6">
    <div class="rounded-xl border p-6">
      <RegisterAccountForm />
    </div>
  </div>
</template>
