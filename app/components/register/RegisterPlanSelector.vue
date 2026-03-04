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
import { Input } from "@/components/ui/input";
import { useRegisterStore } from "@/stores/register";

const { t } = useI18n();
const localePath = useLocalePath();
const registerStore = useRegisterStore();
const loading = ref(false);
const redeemCodeInput = ref(registerStore.redeemCode ?? "");
const validatingRedeem = ref(false);

const currencyFormatter = new Intl.NumberFormat("en-US");

const selectedPackage = computed(() => registerStore.selectedPackage);

async function loadPackages() {
  if (registerStore.packageList.length > 0) {
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch<{ packages: typeof registerStore.packageList }>(
      "/api/register/packages",
    );
    registerStore.setPackageList(response.packages);
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : t("register.plan.loadError"),
    );
  } finally {
    loading.value = false;
  }
}

async function applyRedeemCode() {
  const code = redeemCodeInput.value.trim();

  if (!code) {
    return;
  }

  validatingRedeem.value = true;

  try {
    const response = await $fetch("/api/register/redeem-code", {
      method: "POST",
      body: { redeemCode: code },
    });
    registerStore.applyRedeemCode(response);
    toast.success(t("register.plan.redeemSuccess"));
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : t("register.plan.redeemError"),
    );
  } finally {
    validatingRedeem.value = false;
  }
}

function priceLabel(price: number | null) {
  if (price === null) {
    return t("register.plan.notAvailable");
  }

  return `${currencyFormatter.format(price)} ${t("register.common.currency")}`;
}

onMounted(loadPackages);
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-bold">{{ $t("register.plan.title") }}</h1>
      <p class="text-muted-foreground text-sm">
        {{ $t("register.plan.description") }}
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ $t("register.plan.redeemTitle") }}</CardTitle>
        <CardDescription>
          {{ $t("register.plan.redeemDescription") }}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3 sm:flex-row">
        <Input
          v-model="redeemCodeInput"
          :placeholder="$t('register.plan.redeemPlaceholder')"
        />
        <Button
          type="button"
          variant="outline"
          :disabled="validatingRedeem"
          @click="applyRedeemCode"
        >
          {{
            validatingRedeem
              ? $t("register.plan.redeemChecking")
              : $t("register.plan.redeemApply")
          }}
        </Button>
      </CardContent>
    </Card>

    <div class="flex justify-center gap-2">
      <Button
        type="button"
        :variant="registerStore.subscriptionPlan === 'MONTHLY' ? 'default' : 'outline'"
        @click="registerStore.setSubscriptionPlan('MONTHLY')"
      >
        {{ $t("register.plan.monthly") }}
      </Button>
      <Button
        type="button"
        :variant="registerStore.subscriptionPlan === 'ANNUAL' ? 'default' : 'outline'"
        @click="registerStore.setSubscriptionPlan('ANNUAL')"
      >
        {{ $t("register.plan.annual") }}
      </Button>
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm text-center">
      {{ $t("register.plan.loading") }}
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card
        v-for="pkg in registerStore.packageList"
        :key="pkg.id"
        class="border-border"
      >
        <CardHeader>
          <CardTitle>{{ pkg.groupName }}</CardTitle>
          <CardDescription>{{ pkg.description }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-1">
            <p class="text-sm font-medium">
              {{ $t("register.plan.monthly") }}: {{ priceLabel(pkg.monthly.price) }}
            </p>
            <p class="text-sm font-medium">
              {{ $t("register.plan.annual") }}: {{ priceLabel(pkg.annual.price) }}
            </p>
          </div>
          <ul class="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            <li v-for="feature in pkg.features" :key="feature">
              {{ feature }}
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            class="w-full"
            :variant="selectedPackage?.id === pkg.id ? 'default' : 'outline'"
            @click="registerStore.selectPackage(pkg.id)"
          >
            {{
              selectedPackage?.id === pkg.id
                ? $t("register.plan.selected")
                : $t("register.plan.select")
            }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button as-child variant="ghost">
        <NuxtLink :to="localePath('/register')">
          {{ $t("register.common.back") }}
        </NuxtLink>
      </Button>
      <Button
        :disabled="!registerStore.selectedPackage"
        @click="navigateTo(localePath('/register/summary'))"
      >
        {{ $t("register.plan.continue") }}
      </Button>
    </div>
  </div>
</template>
