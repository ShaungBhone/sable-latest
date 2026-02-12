<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <blockquote
    data-slot="typography-blockquote"
    :class="cn('mt-6 border-l-2 pl-6 italic', props.class)"
  >
    <slot />
  </blockquote>
</template>
