<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    isActive?: boolean;
    size?: "default" | "sm" | "icon";
  }>(),
  {
    size: "icon",
  },
);
</script>

<template>
  <button
    type="button"
    data-slot="pagination-link"
    :aria-current="isActive ? 'page' : undefined"
    :class="
      cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        props.class,
      )
    "
  >
    <slot />
  </button>
</template>
