<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";

const showToast = () =>
  toast("Event has been created", {
    description: "Sunday, December 03, 2023 at 9:00 AM",
    position: "bottom-center",
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  });
</script>

<template>
  <Button variant="outline" @click="showToast"> Show Toast </Button>
</template>
