<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h3
    data-slot="typography-h3"
    :class="
      cn('scroll-m-20 text-2xl font-semibold tracking-tight', props.class)
    "
  >
    <slot />
  </h3>
</template>
