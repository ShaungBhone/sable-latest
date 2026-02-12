<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h4
    data-slot="typography-h4"
    :class="cn('scroll-m-20 text-xl font-semibold tracking-tight', props.class)"
  >
    <slot />
  </h4>
</template>
