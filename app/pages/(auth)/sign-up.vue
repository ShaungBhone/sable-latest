<script setup lang="ts">
const localePath = useLocalePath();

definePageMeta({
  layout: "guest",
  path: "/sign-up",
  auth: "guest",
});
</script>

<template>
  <div class="grid min-h-svh place-items-center p-6">
    <div class="w-full max-w-md rounded-xl border p-6">
      <h1 class="text-xl font-semibold">{{ $t("signUp.title") }}</h1>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t("signUp.description") }}
      </p>
      <p class="text-muted-foreground mt-4 text-sm">
        Sign-up flow will be added in the next phase.
      </p>
      <NuxtLink
        :to="localePath('/login')"
        class="mt-6 inline-block text-sm underline"
      >
        {{ $t("signUp.login") }}
      </NuxtLink>
    </div>
  </div>
</template>
