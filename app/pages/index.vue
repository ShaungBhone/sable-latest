<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  layout: "default",
  auth: "protected",
});

const authStore = useAuthStore();

const displayName = computed(
  () => authStore.user?.displayName || authStore.user?.email || "User",
);
</script>

<template>
  <section class="space-y-2 py-4">
    <h1 class="text-2xl font-semibold">Dashboard</h1>
    <p class="text-muted-foreground">Welcome back, {{ displayName }}.</p>
  </section>
</template>
