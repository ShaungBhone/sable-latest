<script setup lang="ts">
import { computed } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import { useRegisterStore } from "@/stores/register";
import type { OnboardingMeResponse } from "@/types/auth";

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const registerStore = useRegisterStore();
const loadingProfile = ref(true);
const onboardingEmail = ref<string | null>(registerStore.onboardingEmail);
const logoFile = ref<File | null>(null);
const uploadingLogo = ref(false);

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, t("register.account.required")),
    lastName: z.string().min(1, t("register.account.required")),
    companyName: z.string().min(1, t("register.account.required")),
    phoneNumber: z
      .string()
      .min(10, t("register.account.phoneInvalid"))
      .max(10, t("register.account.phoneInvalid")),
    brandName: z.string().min(1, t("register.account.required")),
    webUrl: z.string().min(1, t("register.account.required")),
    webFormat: z.string().min(1, t("register.account.required")),
    webMaintainer: z.string().min(1, t("register.account.required")),
  }),
);

const { defineField, errors, handleSubmit, setFieldError, isSubmitting } =
  useForm({
    validationSchema: schema,
    initialValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      phoneNumber: "",
      brandName: "",
      webUrl: "",
      webFormat: "",
      webMaintainer: "",
    },
  });

const [firstName, firstNameProps] = defineField("firstName");
const [lastName, lastNameProps] = defineField("lastName");
const [companyName, companyNameProps] = defineField("companyName");
const [phoneNumber, phoneNumberProps] = defineField("phoneNumber");
const [brandName, brandNameProps] = defineField("brandName");
const [webUrl, webUrlProps] = defineField("webUrl");
const [webFormat, webFormatProps] = defineField("webFormat");
const [webMaintainer, webMaintainerProps] = defineField("webMaintainer");

const canSubmit = computed(() => Boolean(logoFile.value) && !uploadingLogo.value);

function handleLogoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  logoFile.value = target.files?.[0] ?? null;
}

async function loadOnboardingProfile() {
  loadingProfile.value = true;

  try {
    const response = await $fetch<OnboardingMeResponse>("/api/auth/onboarding/me", {
      credentials: "include",
    });

    onboardingEmail.value = response.email;
    registerStore.setOnboardingEmail(response.email);
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : t("register.account.submitError"),
    );
    await navigateTo(localePath("/login"));
  } finally {
    loadingProfile.value = false;
  }
}

async function uploadLogo() {
  if (!logoFile.value) {
    throw new Error(t("register.account.logoRequired"));
  }

  const formData = new FormData();
  formData.append("image", logoFile.value);
  uploadingLogo.value = true;

  try {
    const response = await $fetch<{ imageUrl: string | null }>(
      "/api/register/upload-logo",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.imageUrl) {
      throw new Error(t("register.account.logoUploadError"));
    }

    return response.imageUrl;
  } finally {
    uploadingLogo.value = false;
  }
}

const submit = handleSubmit(async (values) => {
  if (!onboardingEmail.value) {
    toast.error(t("register.account.missingEmail"));
    return;
  }

  try {
    const brandLogoUrl = await uploadLogo();

    await $fetch("/api/register/update-user-info", {
      method: "POST",
      body: {
        ...values,
        email: onboardingEmail.value,
        brandLogoUrl,
      },
    });

    registerStore.reset();
    await authStore.fetchMe({ force: true });
    await navigateTo(localePath("/"));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : t("register.account.submitError");
    toast.error(message);
    setFieldError("brandName", message);
  }
});

onMounted(loadOnboardingProfile);
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-bold">{{ $t("register.account.title") }}</h1>
      <p class="text-muted-foreground text-sm">
        {{ $t("register.account.description") }}
      </p>
      <p v-if="loadingProfile" class="text-muted-foreground text-xs">
        {{ $t("register.account.loading") }}
      </p>
      <p v-else-if="onboardingEmail" class="text-sm font-medium">
        {{ onboardingEmail }}
      </p>
    </div>

    <FieldGroup class="grid gap-4 md:grid-cols-2">
      <Field :data-invalid="Boolean(errors.firstName)">
        <FieldLabel for="firstName">{{ $t("register.account.firstName") }}</FieldLabel>
        <Input id="firstName" v-model="firstName" v-bind="firstNameProps" />
        <FieldError :errors="errors.firstName ? [errors.firstName] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.lastName)">
        <FieldLabel for="lastName">{{ $t("register.account.lastName") }}</FieldLabel>
        <Input id="lastName" v-model="lastName" v-bind="lastNameProps" />
        <FieldError :errors="errors.lastName ? [errors.lastName] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.companyName)">
        <FieldLabel for="companyName">{{ $t("register.account.companyName") }}</FieldLabel>
        <Input id="companyName" v-model="companyName" v-bind="companyNameProps" />
        <FieldError :errors="errors.companyName ? [errors.companyName] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.phoneNumber)">
        <FieldLabel for="phoneNumber">{{ $t("register.account.phoneNumber") }}</FieldLabel>
        <Input id="phoneNumber" v-model="phoneNumber" v-bind="phoneNumberProps" />
        <FieldError :errors="errors.phoneNumber ? [errors.phoneNumber] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.brandName)">
        <FieldLabel for="brandName">{{ $t("register.account.brandName") }}</FieldLabel>
        <Input id="brandName" v-model="brandName" v-bind="brandNameProps" />
        <FieldError :errors="errors.brandName ? [errors.brandName] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.webUrl)">
        <FieldLabel for="webUrl">{{ $t("register.account.webUrl") }}</FieldLabel>
        <Input id="webUrl" v-model="webUrl" v-bind="webUrlProps" />
        <FieldError :errors="errors.webUrl ? [errors.webUrl] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.webFormat)">
        <FieldLabel for="webFormat">{{ $t("register.account.webFormat") }}</FieldLabel>
        <Input id="webFormat" v-model="webFormat" v-bind="webFormatProps" />
        <FieldError :errors="errors.webFormat ? [errors.webFormat] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.webMaintainer)">
        <FieldLabel for="webMaintainer">
          {{ $t("register.account.webMaintainer") }}
        </FieldLabel>
        <Input
          id="webMaintainer"
          v-model="webMaintainer"
          v-bind="webMaintainerProps"
        />
        <FieldError :errors="errors.webMaintainer ? [errors.webMaintainer] : []" />
      </Field>
    </FieldGroup>

    <Field>
      <FieldLabel for="brand-logo">{{ $t("register.account.logo") }}</FieldLabel>
      <Input
        id="brand-logo"
        type="file"
        accept="image/*"
        @change="handleLogoChange"
      />
    </Field>

    <Button type="submit" class="w-full" :disabled="isSubmitting || !canSubmit">
      {{
        isSubmitting || uploadingLogo
          ? $t("register.account.submitting")
          : $t("register.account.submit")
      }}
    </Button>
  </form>
</template>
