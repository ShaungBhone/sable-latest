<script setup lang="ts">
// import SignUpForm from "@/components/auth/SignUpForm.vue";

definePageMeta({
  layout: "guest",
  path: "/sign-up",
});
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <!-- <SignUpForm /> -->
        </div>
      </div>
    </div>
    <div class="bg-muted relative hidden lg:block">
      <img
        src="https://ui.shadcn.com/placeholder.svg"
        alt="Image"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
