<script setup lang="ts">
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegisterStore } from "@/stores/register";
import type { RegisterCreateUserResponse } from "@/types/register";

const { t } = useI18n();
const localePath = useLocalePath();
const registerStore = useRegisterStore();
const isSubmitting = ref(false);
const accepted = ref(false);
const currencyFormatter = new Intl.NumberFormat("en-US");

const selectedPackage = computed(() => registerStore.selectedPackage);
const summary = computed(() => registerStore.paymentSummary);

async function submitPayment() {
  if (!accepted.value || !selectedPackage.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch<RegisterCreateUserResponse>("/api/register/user", {
      method: "POST",
      body: {
        email: registerStore.email,
        password: registerStore.password,
        packageId: registerStore.redeemCode ? null : selectedPackage.value.id,
        subscriptionPlan: registerStore.subscriptionPlan,
        redeemCode: registerStore.redeemCode,
      },
    });

    if (!response.paymentLink) {
      toast.error(t("register.summary.missingPaymentLink"));
      return;
    }

    await navigateTo(response.paymentLink, {
      external: true,
    });
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : t("register.summary.submitError"),
    );
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ $t("register.summary.title") }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">{{ $t("register.summary.email") }}</span>
        <span>{{ registerStore.email }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">{{ $t("register.summary.package") }}</span>
        <span>{{ selectedPackage?.groupName }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">{{ $t("register.summary.price") }}</span>
        <span>{{ currencyFormatter.format(summary?.oldPrice ?? 0) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">{{ $t("register.summary.discount") }}</span>
        <span>{{ currencyFormatter.format(summary?.discountPrice ?? 0) }}</span>
      </div>
      <div class="flex justify-between text-base font-semibold">
        <span>{{ $t("register.summary.total") }}</span>
        <span>{{ currencyFormatter.format(summary?.totalPrice ?? 0) }}</span>
      </div>

      <label class="flex items-start gap-3 text-sm">
        <input v-model="accepted" type="checkbox" class="mt-0.5" />
        <span>{{ $t("register.summary.acceptTerms") }}</span>
      </label>
    </CardContent>
    <CardFooter class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button as-child variant="ghost">
        <NuxtLink :to="localePath('/register/product')">
          {{ $t("register.common.back") }}
        </NuxtLink>
      </Button>
      <Button :disabled="!accepted || isSubmitting" @click="submitPayment">
        {{
          isSubmitting
            ? $t("register.summary.processing")
            : $t("register.summary.submit")
        }}
      </Button>
    </CardFooter>
  </Card>
</template>
