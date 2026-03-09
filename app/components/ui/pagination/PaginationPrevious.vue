<script setup lang="ts">
import { ChevronLeft } from "lucide-vue-next";
import PaginationLink from "./PaginationLink.vue";
</script>

<template>
  <PaginationLink size="default" class="gap-1 px-2.5">
    <ChevronLeft class="size-4" />
    <span>Previous</span>
  </PaginationLink>
</template>
