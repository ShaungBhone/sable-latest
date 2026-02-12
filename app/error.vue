<script setup lang="ts">
import type { NuxtError } from "#app";
import { ArrowLeft } from "lucide-vue-next";

const props = defineProps<{ error: NuxtError }>();
</script>

<template>
  <div class="grid min-h-dvh xl:grid-cols-2">
    <div class="flex flex-col p-16">
      <div class="mb-8 flex items-center justify-center gap-2 xl:justify-start">
        <div
          class="bg-primary flex size-8 items-center justify-center rounded-lg"
        >
          <svg
            class="text-primary-foreground size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="{2}"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span class="text-xl font-bold">Sable</span>
      </div>

      <div
        class="mt-8 flex flex-1 flex-col items-center justify-center text-center xl:items-start xl:text-start"
      >
        <h1 class="mb-2 text-4xl font-bold">{{ error.status }}</h1>
        <p>Oops! The page you're trying to access doesn't exist.</p>
        <Button class="mt-8 flex cursor-pointer items-center gap-2">
          <ArrowLeft class="size-4"></ArrowLeft>
          <NuxtLink to="/">Go back home</NuxtLink>
        </Button>
      </div>
    </div>
    <img
      src="https://ui.shadcn.com/placeholder.svg"
      alt="placeholder image"
      class="hidden min-h-dvh object-cover xl:inline dark:brightness-[0.95] dark:invert"
    />
  </div>
</template>
