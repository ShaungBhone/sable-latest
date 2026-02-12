<script setup lang="ts">
import ThemeToggle from "@/components/ThemeToggle.vue";
</script>

<template>
  <div class="relative">
    <div class="absolute top-4 right-4 z-10">
      <ClientOnly>
        <ThemeToggle />
      </ClientOnly>
    </div>
    <slot />
  </div>
</template>
