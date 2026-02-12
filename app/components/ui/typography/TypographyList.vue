<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <ul
    data-slot="typography-list"
    :class="cn('my-6 ml-6 list-disc [&>li]:mt-2', props.class)"
  >
    <slot />
  </ul>
</template>
