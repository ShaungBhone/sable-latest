<script setup lang="ts">
import { watch } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterStore } from "@/stores/register";

const { t } = useI18n();
const localePath = useLocalePath();
const registerStore = useRegisterStore();
const checkingEmail = ref(false);

const schema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, t("register.credentials.emailRequired"))
      .email(t("register.credentials.emailInvalid")),
    password: z
      .string()
      .min(8, t("register.credentials.passwordMinLength")),
  }),
);

const { defineField, errors, handleSubmit, setFieldError, values } = useForm({
  validationSchema: schema,
  initialValues: {
    email: registerStore.email,
    password: registerStore.password,
  },
});

const [email, emailProps] = defineField("email");
const [password, passwordProps] = defineField("password");

let emailCheckTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => values.email,
  (value) => {
    if (emailCheckTimer) {
      clearTimeout(emailCheckTimer);
      emailCheckTimer = null;
    }

    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return;
    }

    emailCheckTimer = setTimeout(async () => {
      checkingEmail.value = true;

      try {
        await $fetch("/api/register/email-checker", {
          query: { email: value },
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t("register.credentials.emailAlreadyExists");
        setFieldError("email", message);
      } finally {
        checkingEmail.value = false;
      }
    }, 500);
  },
);

const submit = handleSubmit(async (formValues) => {
  registerStore.setCredentials(formValues.email, formValues.password);
  await navigateTo(localePath("/register/product"));
});
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="submit">
    <FieldGroup>
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">{{ $t("register.credentials.title") }}</h1>
        <p class="text-muted-foreground text-sm">
          {{ $t("register.credentials.description") }}
        </p>
      </div>

      <Field :data-invalid="Boolean(errors.email)">
        <FieldLabel for="register-email">
          {{ $t("register.credentials.emailLabel") }}
        </FieldLabel>
        <Input
          id="register-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="$t('register.credentials.emailPlaceholder')"
          v-bind="emailProps"
        />
        <FieldDescription v-if="checkingEmail">
          {{ $t("register.credentials.checkingEmail") }}
        </FieldDescription>
        <FieldError :errors="errors.email ? [errors.email] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.password)">
        <FieldLabel for="register-password">
          {{ $t("register.credentials.passwordLabel") }}
        </FieldLabel>
        <Input
          id="register-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          :placeholder="$t('register.credentials.passwordPlaceholder')"
          v-bind="passwordProps"
        />
        <FieldError :errors="errors.password ? [errors.password] : []" />
      </Field>

      <Field>
        <Button type="submit" class="w-full">
          {{ $t("register.credentials.continue") }}
        </Button>
      </Field>

      <Field class="text-center text-sm">
        <NuxtLink :to="localePath('/login')" class="underline underline-offset-4">
          {{ $t("register.credentials.backToLogin") }}
        </NuxtLink>
      </Field>
    </FieldGroup>
  </form>
</template>
