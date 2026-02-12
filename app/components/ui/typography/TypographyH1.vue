<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h1
    data-slot="typography-h1"
    :class="
      cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance',
        props.class,
      )
    "
  >
    <slot />
  </h1>
</template>
