<script setup lang="ts">
import RegisterVerifyStatus from "@/components/register/RegisterVerifyStatus.vue";

definePageMeta({
  layout: "guest",
  auth: "guest",
  path: "/register/verifyEmail/:transactionId",
});

const route = useRoute();
const transactionId = computed(() =>
  typeof route.params.transactionId === "string" ? route.params.transactionId : "",
);
</script>

<template>
  <div class="grid min-h-svh place-items-center p-6">
    <div class="w-full max-w-xl">
      <RegisterVerifyStatus :transaction-id="transactionId" />
    </div>
  </div>
</template>
