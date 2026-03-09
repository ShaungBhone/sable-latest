<script setup lang="ts">
import { MoreHorizontal } from "lucide-vue-next";
</script>

<template>
  <span
    data-slot="pagination-ellipsis"
    aria-hidden="true"
    class="flex size-9 items-center justify-center"
  >
    <MoreHorizontal class="size-4" />
    <span class="sr-only">More pages</span>
  </span>
</template>
