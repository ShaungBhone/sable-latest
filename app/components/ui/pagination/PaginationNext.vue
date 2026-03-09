<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import PaginationLink from "./PaginationLink.vue";
</script>

<template>
  <PaginationLink size="default" class="gap-1 px-2.5">
    <span>Next</span>
    <ChevronRight class="size-4" />
  </PaginationLink>
</template>
