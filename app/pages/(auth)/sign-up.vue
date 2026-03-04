<script setup lang="ts">
const localePath = useLocalePath();

definePageMeta({
  layout: "guest",
  path: "/sign-up",
  auth: "guest",
});

await navigateTo(localePath("/register"), {
  replace: true,
});
</script>

<template>
  <div />
</template>
