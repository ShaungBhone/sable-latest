<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <p
    data-slot="typography-p"
    :class="cn('leading-7 [&:not(:first-child)]:mt-6', props.class)"
  >
    <slot />
  </p>
</template>
