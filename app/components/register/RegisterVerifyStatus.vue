<script setup lang="ts">
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegisterStore } from "@/stores/register";
import type { RegisterVerifyTransactionResponse } from "@/types/register";

const props = defineProps<{
  transactionId: string;
}>();

const { t } = useI18n();
const localePath = useLocalePath();
const registerStore = useRegisterStore();
const loading = ref(true);
const isValid = ref(false);
const message = ref<string | null>(null);
const resending = ref(false);

async function validateTransaction() {
  loading.value = true;

  try {
    const response = await $fetch<RegisterVerifyTransactionResponse>(
      `/api/register/verify/${encodeURIComponent(props.transactionId)}`,
      {
        method: "PATCH",
      },
    );

    isValid.value = response.valid;
    message.value = response.message ?? null;
    if (response.email) {
      registerStore.setOnboardingEmail(response.email);
    }
  } catch (error) {
    isValid.value = false;
    message.value =
      error instanceof Error ? error.message : t("register.verify.invalid");
  } finally {
    loading.value = false;
  }
}

async function resendEmail() {
  const email = registerStore.onboardingEmail;

  if (!email) {
    toast.error(t("register.verify.noEmail"));
    return;
  }

  resending.value = true;

  try {
    await $fetch("/api/register/verify-email", {
      method: "POST",
      body: { email },
    });
    toast.success(t("register.verify.resendSuccess"));
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : t("register.verify.resendError"),
    );
  } finally {
    resending.value = false;
  }
}

onMounted(validateTransaction);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ $t("register.verify.title") }}</CardTitle>
      <CardDescription>
        {{
          loading
            ? $t("register.verify.loading")
            : isValid
              ? $t("register.verify.success")
              : $t("register.verify.invalid")
        }}
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <p v-if="message" class="text-sm text-muted-foreground">{{ message }}</p>
      <p v-if="registerStore.onboardingEmail" class="text-sm">
        {{ registerStore.onboardingEmail }}
      </p>
    </CardContent>
    <CardFooter class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button as-child>
        <NuxtLink :to="localePath('/login')">
          {{ $t("register.verify.goToLogin") }}
        </NuxtLink>
      </Button>
      <Button
        type="button"
        variant="outline"
        :disabled="resending || !registerStore.onboardingEmail"
        @click="resendEmail"
      >
        {{
          resending
            ? $t("register.verify.resending")
            : $t("register.verify.resend")
        }}
      </Button>
    </CardFooter>
  </Card>
</template>
