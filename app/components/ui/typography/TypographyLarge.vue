<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="typography-large"
    :class="cn('text-lg font-semibold', props.class)"
  >
    <slot />
  </div>
</template>
