<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <small
    data-slot="typography-small"
    :class="cn('text-sm leading-none font-medium', props.class)"
  >
    <slot />
  </small>
</template>
