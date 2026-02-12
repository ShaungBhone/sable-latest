<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <p
    data-slot="typography-lead"
    :class="cn('text-muted-foreground text-xl', props.class)"
  >
    <slot />
  </p>
</template>
